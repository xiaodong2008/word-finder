// api page - /paragraph/history

// Method: GET
// Path: /paragraph/history
// Data: { start }

const {response} = require('../../modules/http.js');
const url = require('url');

async function history(req, res, mysql) {
  // check request method
  if (req.method !== 'GET') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  let start = url.parse(req.url, true).query.start
  // if start is not a number, set it to 0
  if (isNaN(start)) start = 0
  else start = parseInt(start)

  const result = await mysql.query(req, res,
    "SELECT * FROM `paragraph-history` WHERE `user` = ? LIMIT ?, 10",
    [user.username, start])

  response(req, res, 200, result)
}

module.exports = history;