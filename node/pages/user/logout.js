// api page - /user/logout

// Method: POST
// Path: /user/logout

const {response} = require('../../modules/http.js');

async function logout(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  await mysql.query(req, res,
    // set expire time to time(createTime)
    "UPDATE `userlogin` SET `expireTime` = `time` WHERE `token` = ?",
    [req.headers?.authorization])

  response(req, res, 200, {
    msg: 'User logged out'
  })
}

module.exports = logout;