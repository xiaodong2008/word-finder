// api page - /user/register

// Method: POST
// Path: /user/register
// Data: { username, password }

const {response} = require('../../modules/http.js');
const {getUTCDate} = require('../../modules/date.js');
const {getConfig} = require('../../modules/config.js');
const config = getConfig();

async function register(req, res, mysql) {
  if (!config.user.canRegister) return response(req, res, 423, "Error 423: Registration is closed, please contact the administrator");

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
  // error - key exists: respond with 400 - username already exists
  // error - other: respond with 500

  mysql.query(req, res,
    'INSERT INTO `userdata` (username, password, joinTime) VALUES (?, ?, ?)',
    [username, password, getUTCDate()], true)
    .then(async () => {
      // if config.user.new.gift.enabled is true
      if (config.user.new.gift.enabled) {
        // get gift
        const gift = config.user.new.gift;
        // insert into database
        await mysql.query(req, res,
          'INSERT INTO `word-history` ( `target`, `word`, `reason`, `operate`, `date`, `newWord`)\n' +
          'VALUES (?, ?, ?, "System", ?, ?)',
          [username, gift.word, gift.description, getUTCDate(), gift.word])
      }

      return response(req, res, 200, {
        msg: 'Registration successful',
      });
    })
    .catch((err) => {
      if (err.code === 'ER_DUP_ENTRY') {
        return response(req, res, 400, {
          msg: 'Username already exists',
        });
      } else {
        return response(req, res, 500, {
          msg: 'Error executing query',
        });
      }
    })
}

module.exports = register;