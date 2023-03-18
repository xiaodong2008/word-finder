function getDate() {
  // return y-m-d h:m:s
  // get server time
  const date = new Date()
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

function getUTCDate() {
  // return y-m-d h:m:s
  // get server time
  const date = new Date()
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`
}

function getUTCTime() {
  // return timestamp(UTC)
  // get server timestamp
  const date = new Date()
  // convert to UTC
  date.setFullYear(date.getUTCFullYear())
  date.setMonth(date.getUTCMonth())
  date.setDate(date.getUTCDate())
  date.setHours(date.getUTCHours())
  date.setMinutes(date.getUTCMinutes())
  date.setSeconds(date.getUTCSeconds())
  date.setMilliseconds(date.getUTCMilliseconds())
  return date.getTime()
}

module.exports = {
  getDate,
  getUTCDate,
  getUTCTime
}