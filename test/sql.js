// This file is for testing the local and remote SQL databases structure.

const start = Date.now()
const secret = require("../node/secret.json")
const mysql = require("mysql")
const pc = require("picocolors")
const fs = require("fs")

const local_conn = mysql.createConnection({
  host: "localhost",
  database: "word-finder",
  user: secret.mysql.dev.username,
  password: secret.mysql.dev.password
})

const local = (sql, event) => {
  return new Promise((resolve, reject) => {
    local_conn.query(sql, (err, result) => {
      event(err, result)
      if (err) reject(err)
      else resolve(result)
    })
  })
}

const remote_conn = mysql.createConnection({
  host: secret.mysql.prod.host,
  database: "word-finder",
  user: secret.mysql.prod.username,
  password: secret.mysql.prod.password
})

const remote = (sql, event) => {
  return new Promise((resolve, reject) => {
    remote_conn.query(sql, (err, result) => {
      event(err, result)
      if (err) reject(err)
      else resolve(result)
    })
  })
}

const reset = (colorText) => {
  // reset color
  colorText = colorText.replace(/\u001b\[.*?m/g, "")
  return colorText
}

let log = {
  index: "",
  addLine: (line) => {
    log.index += `${line}\n`
  },
  add: (line) => {
    log.index += line
  },
  /**
   * @param {string} e
   * @param {string | boolean | null} remote
   */
  print: (e, remote = false) => {
    e = e.toString()
    e.split("\n").forEach((line) => {
      switch (remote) {
        case null:
          console.log(line)
          break
        case true:
          console.log(pc.bgBlue(pc.white(" remote ")), line)
          break
        case false:
          console.log(pc.bgGreen(pc.white(" local ")), line)
          break
        default:
          console.log(pc.bgMagenta(pc.white(` ${remote} `)), line)
      }
    })
  }
}

// register error handler
process.on("uncaughtException", (err) => {
  log.add("[ERROR] " + err.stack)
  // split
  err = err.stack.split("\n")
  err.forEach((line) => {
    console.log(pc.bgRed(pc.white(" error ")), line)
  })
  if (fs.existsSync("./test"))
    fs.writeFileSync("./test/sql.log", log.index)
  else
    fs.writeFileSync("./sql.log", log.index)
  process.exit(1)
})

async function main() {
  log.print("SHOW TABLES")
  log.print("")
  log.addLine("[local] Do command: SHOW TABLES")
  log.addLine("")
  log.addLine("Local tables:")

  const tableDiff = []
  const localTables = []

  await local("SHOW TABLES", (err, result) => {
    if (err) throw err
    result.forEach((table) => {
      table = Object.values(table)[0]
      tableDiff.push(table)
      localTables.push(table)
      log.addLine(`- ${table}`)
      log.print(`Find table - ${table}`)
    })
  })

  log.addLine("")
  log.addLine("[remote] Do command: SHOW TABLES")
  log.addLine("")
  log.addLine("Remote tables:")
  log.print("", null)
  log.print("SHOW TABLES", true)

  const remoteTables = []

  await remote("SHOW TABLES", (err, result) => {
    if (err) throw err
    log.print("", true)
    result.forEach((table) => {
      table = Object.values(table)[0]
      if (tableDiff.includes(table))
        tableDiff.splice(tableDiff.indexOf(table), 1)
      else
        tableDiff.push(table)
      remoteTables.push(table)
      log.addLine(`- ${table}`)
      log.print(`Find table - ${table}`, true)
    })
  })

  log.print("", null)
  log.print("Start comparing tables", "process")
  log.addLine("")

  let existError = 0, structureError = 0, success = 0

  // compare tables
  tableDiff.forEach((table) => {
    existError++
    const inside = localTables.includes(table) ? "local" : "remote"
    const right = " | " + (inside === "local" ? table : "?") + " <-> " + (inside === "remote" ? table : "?")
    log.addLine(`Table ${table} is only found in ${inside}`)
    log.print(pc.red(`Warn - Table ${table} is only found in ${inside}` + right), inside !== "local")
    // remove from table
    if (inside === "local")
      localTables.splice(localTables.indexOf(table), 1)
    else
      remoteTables.splice(remoteTables.indexOf(table), 1)
  })

  // start comparing structure
  log.print("", null)
  log.print("Start comparing structure", "process")
  log.print("", null)
  log.addLine("")

  // compare structure
  for (const table of localTables) {
    let localStructure, remoteStructure

    const format = (structure) => {
      // structure: Array<{Field: string, Type: string, Null: string, Key: string, Default: string, Extra: string}>
      let result = []
      structure.forEach((row) => {
        result.push(`${row.Field} ${row.Type} ${row.Null} ${row.Key || "NO"} ${row.Default} ${row.Extra || "--"}`)
      })
      return result.join("\n")
    }

    log.addLine(`[local] Do command: DESCRIBE ${table}`)
    log.print(`DESCRIBE ${table}`)
    await local(`DESCRIBE \`${table}\``, (err, result) => {
      result = format(result)
      if (err) throw err
      localStructure = result
      log.print(result)
      log.add(result)
    })

    log.addLine("")
    log.addLine(`[remote] Do command: DESCRIBE ${table}`)
    log.print(`DESCRIBE \`${table}\``, true)
    await remote(`DESCRIBE \`${table}\``, (err, result) => {
      result = format(result)
      if (err) throw err
      remoteStructure = result
      log.print(result, true)
      log.add(result)
    })

    const msg = localStructure === remoteStructure ? pc.green("success") : pc.red("failed")
    log.print(`Compare structure of table ${table} - ${msg}`, "process")
    log.addLine("\n")
    log.addLine(`Compare structure of table ${table} - ${reset(msg)}`)
    if (localStructure !== remoteStructure) {
      structureError++
      // each line compare
      const localStructures = localStructure.split("\n"),
        remoteStructures = remoteStructure.split("\n"),
        localStructureList = {}
      localStructures.forEach((line, index) => {
        // get field name
        const field = line.split(" ")[0]
        localStructureList[field] = index
      })
      remoteStructures.forEach((line, index) => {
        // get field name
        const field = line.split(" ")[0]
        if (localStructureList[field] !== undefined) {
          if (localStructures[localStructureList[field]] !== remoteStructures[index]) {
            // - local line
            // + remote line
            log.addLine(`- ${localStructures[localStructureList[field]]}`)
            log.addLine(`+ ${remoteStructures[index]}`)
          }
          // remove from local structure list
          delete localStructureList[field]
        } else {
          // + [remote] remote line
          log.addLine(`+ [remote] ${remoteStructures[index]}`)
        }
      })
      // + [local] local line
      for (const field in localStructureList) {
        log.addLine(`+ [local] ${localStructures[localStructureList[field]]}`)
      }
    } else {
      success++
    }

    log.addLine("")
    log.print("", null)
  }

  // compare data result
  const successMsg = pc.green(`${success} success`),
    structureErrorMsg = pc.yellow(`${structureError} structure error`),
    existErrorMsg = pc.red(`${existError} exist error`)
  log.print(`SQL test result: ${successMsg}, ${structureErrorMsg}, ${existErrorMsg}`, "process")
log.addLine(reset(`SQL test result: ${successMsg}, ${structureErrorMsg}, ${existErrorMsg}`))

  // if ./test/ is exist
  log.print("", null)
  if (fs.existsSync("./test"))
    fs.writeFileSync("./test/sql.log", log.index),
      log.print("Write log to ./test/sql.log", "process")
  else
    fs.writeFileSync("./sql.log", log.index),
      log.print("Write log to ./sql.log", "process")
  log.print("SQL test finish in " + (Date.now() - start) + "ms", "process")
  log.addLine("")
  log.addLine("SQL test finish in " + (Date.now() - start) + "ms")
  process.exit(0)
}

main()