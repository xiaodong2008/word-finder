// api page - /user/activate-count

// Method: GET
// Path: /user/activate-count
// Data: { }

const { response } = require('../../modules/http.js');

async function count(req, res, mysql) {
  // check request method
  if (req.method !== 'GET') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  const result = await mysql.query(req, res,
    "SELECT COUNT(*) FROM `redeem-history` WHERE `userid` = ?",
    [user.userid])

  response(req, res, 200, {
    count: result[0]['COUNT(*)']
  })
}

module.exports = count;