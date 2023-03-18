// api page - /dictionary/add

// Method: POST
// Path: /dictionary/add
// Data: { word }

const { response } = require('../../modules/http.js');
const { getUTCDate } = require('../../modules/date.js');

async function add(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  let word = req.body.word.toLowerCase()
  if (word === undefined) return response(req, res, 400, "Error 400: Bad Request")
  if (/^[a-zA-Z]{1, 50}$/g.test(word)) return response(req, res, 400, "Error 400: Bad Request")

  // check if word already exists
  const check = await mysql.query(req, res,
    "SELECT * FROM `dictionary` WHERE `word` = ? AND `user` = ?",
    [word, user.username])
  if (check.length > 0) return response(req, res, 400, "You already have this word in your dictionary")

  const result = await mysql.query(req, res,
    "INSERT INTO `dictionary` (`word`, `user`, `date`) VALUES (?, ?, ?)",
    [word, user.username, getUTCDate()])

  response(req, res, 200, result)
}

module.exports = add;