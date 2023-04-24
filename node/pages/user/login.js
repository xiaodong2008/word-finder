// api page - /user/login

// Method: POST
// Path: /user/login
// Data: { username, password }

const {response} = require('../../modules/http.js');
const {getUTCDate, getUTCTime} = require('../../modules/date.js');
const {getConfig} = require('../../modules/config.js');
const crypto = require('crypto');
const config = getConfig();

async function login(req, res, mysql) {
  if (!config.user.canLogin) return response(req, res, 423, "Error 423: Login is closed, please contact the administrator");

  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");
  // check username and password format
  const usernameFormat = /^[a-zA-Z0-9_-]{2,50}$/,
    passwordFormat = /^[a-zA-Z0-9-_]{5,50}$/,
    username = req.body?.username,
    password = req.body?.password;
  if (!usernameFormat.test(username) || username.length > 50) return response(req, res, 400, "Error 400: Invalid username format");
  if (!passwordFormat.test(password)) return response(req, res, 400, "Error 400: Invalid password format")

  if (await mysql.user.islogin(req, res, mysql.query)) return response(req, res, 400, "Error 400: You are already logged in");

  // insert into database
  // success: respond with 200
  // error - unknown: respond with 500

  const userinfo = await mysql.user.userdata(req, res, mysql.query, username);
  if (!userinfo) return response(req, res, 400, "User not exists");
  if (userinfo.password !== password) return response(req, res, 400, "Username or password incorrect");

  // generate token: timestamp + userid + 50 random characters
  const hash = crypto.createHash('sha256');
  const seed = getUTCTime() + userinfo.userid + crypto.randomBytes(50).toString('hex');
  // 100 character token
  const token = hash.update(seed).digest('hex');

  // get ip address (careful of proxy)
  let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

  ip = ip.match(/(\d{1,3}\.){3}\d{1,3}/)[0];

  mysql.query(req, res,
    'INSERT INTO `userlogin` (userid, username, token, ip, time, expireTime) VALUES (?, ?, ?, ?, ?, ?)',
    [userinfo.userid, username, token, ip, getUTCDate(), getUTCDate()], true)
    .then(async () => {
      await mysql.query(req, res, "CALL update_expire_time(?)", [token])
      response(req, res, 200, {
        msg: 'User logged in',
        token: token
      })
    })
    .catch((err) => {
      // if key exists, respond with 500
      if (err.code === 'ER_DUP_ENTRY')
        response(req, res, 500, {
          msg: 'Oops, something went wrong, please submit again',
        });
      else
        response(req, res, 500, {
          msg: 'Error executing query',
        });
    })
}

module.exports = login;