// api page - /paragraph/edit

// Method: POST
// Path: /paragraph/edit
// Data: { date, newParagraph }

const {response} = require('../../modules/http.js');

async function edit(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  // count word
  let word = req.body.newParagraph.split(' ').length

  // \n to &nbsp;
  req.body.newParagraph = req.body.newParagraph.replace(/\n/g, ' ')

  // update paragraph
  await mysql.query(req, res,
    "UPDATE `paragraph-history` SET `paragraph` = ?, `word` = ? WHERE `user` = ? AND `date` = ?",
    [req.body.newParagraph, word, user.username, req.body.date])

  response(req, res, 200, "Success")
}

module.exports = edit;