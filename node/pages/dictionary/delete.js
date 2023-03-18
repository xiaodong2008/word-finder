// api page - /dictionary/delete

// Method: POST
// Path: /dictionary/delete
// Data: { word }

const { response } = require('../../modules/http.js');

async function get(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  let word = req.body.word

  if (/^[a-zA-Z]{1, 50}$/g.test(word)) return response(req, res, 400, "Error 400: Bad Request")

  const result = await mysql.query(req, res,
    "DELETE FROM `dictionary` WHERE `word` = ? AND `user` = ?",
    [word, user.username])

  response(req, res, 200, result)
}

module.exports = get;