// api page - /user/login

// Method: POST
// Path: /user/login
// Data: { username, password }

const {response} = require('../../modules/http.js');

async function data(req, res, mysql) {
  // check request method
  if (req.method !== 'GET') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  let user = null
  if (login) user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  response(req, res, 200, {
    login: !!login,
    userid: login ? login.userid : null,
    word: user && user.word,
  })
}

module.exports = data;