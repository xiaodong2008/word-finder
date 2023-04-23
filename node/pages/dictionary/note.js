// api page - /dictionary/note

// Method: POST
// Path: /dictionary/note
// Data: { word, newNote }

const {response} = require('../../modules/http.js');

async function edit(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  // update dictionary
  await mysql.query(req, res,
    "UPDATE `dictionary` SET `note` = ? WHERE `user` = ? AND `word` = ?",
    [req.body.newNote, user.username, req.body.word])

  response(req, res, 200, "Success")
}

module.exports = edit;