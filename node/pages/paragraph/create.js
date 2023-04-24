// api page - /paragraph/create

// Method: POST
// Path: /paragraph/create
// Data: { index }

const {response} = require('../../modules/http.js');
const {getUTCDate} = require('../../modules/date.js');

async function edit(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  // count word
  let word = req.body.index.split(" ").length
  // br -> \n
  req.body.index = req.body.index.replace(/<br>/g, '\n')

  // update paragraph
  await mysql.query(req, res,
    "INSERT INTO `paragraph-history` (`user`, `paragraph`, `word`, `date`) VALUES (?, ?, ?, ?)",
    [user.username, req.body.index, word, getUTCDate()])

  response(req, res, 200, "Success")
}

module.exports = edit;