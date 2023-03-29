// api page - /user/activate

// Method: GET
// Path: /user/activate
// Data: { start }

const {response} = require('../../modules/http.js');
const url = require('url');

async function activate(req, res, mysql) {
  // check request method
  if (req.method !== 'GET') return response(req, res, 405, "Error 405: Method Not Allowed");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  let page = Number(url.parse(req.url, true).query.page)
  // if page is not a number, set it to 0
  if (isNaN(page)) page = 1
  page = page - 1

  const result = await mysql.query(req, res,
    "SELECT * FROM `redeem-history` WHERE `userid` = ? ORDER BY `time` DESC LIMIT ?, 10",
    [user.userid, page * 10])

  response(req, res, 200, result)
}

module.exports = activate;