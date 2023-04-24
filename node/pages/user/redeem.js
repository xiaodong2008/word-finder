// api page - /user/redeem

// Method: POST
// Path: /user/redeem
// Data: { code }

const {response} = require('../../modules/http.js');
const {getUTCDate} = require('../../modules/date.js');
const {serverError} = require('../../modules/http.js');

async function data(req, res, mysql) {
  // check request method
  if (req.method !== 'POST') return response(req, res, 405, "Error 405: Method Not Allowed");

  const code = req.body.code, format = /^([A-Z\d]{5}-){3}[A-Z\d]{5}$/;
  if (!code || !format.test(code)) return response(req, res, 400, "Error 400: Bad Request");

  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) return response(req, res, 401, "Error 401: Unauthorized");
  const user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  // update the redeem code
  // 执行事务, 保证数据原子性
  await mysql.beginTransaction(async () => {
    // if error, rollback
    const rollback = async (err) => {
      await mysql.rollback();
      serverError("Mysql - redeem transaction", err)
      response(req, res, 500, {
        msg: "Error when redeeming the code"
      });
    }

    const _response = response

    try {
      const response = function () {
        mysql.commit();
        _response(...arguments)
      }

      // check the redeem code
      const redeem = (await mysql.query(req, res, "SELECT * FROM `redeem` WHERE `code` = ?", [code], true))?.[0];

      if (!redeem) return response(req, res, 400, "Activation code is invalid");
      if (redeem.quantity <= 0) return response(req, res, 400, "Activation code already used");
      if (redeem.repeat === 0) {
        // check if the user has already used this code before
        const used = (await mysql.query(req, res, "SELECT COUNT(*) AS `count` FROM `redeem-history` WHERE `code` = ? AND `userid` = ?", [code, user.userid], true))?.[0];
        if (used.count > 0) return response(req, res, 400, "You have already used this activation code");
      } else if (redeem.repeat === 2) {
        // check if the user has already used the id of this code type before
        const used = (await mysql.query(req, res, "SELECT COUNT(*) AS `count` FROM `redeem-history` WHERE `type` = ? AND `userid` = ?", [redeem.itemid, user.userid], true))?.[0];
        if (used.count > 0) return response(req, res, 400, "You have already used this activation type before");
      }

      // update the redeem code
      await mysql.query(res, req, "UPDATE `redeem` SET `quantity` = `quantity` - 1 WHERE `code` = ?", [code], true);

      let userid = String(user.userid);
      // rand 5 digits letter and number
      const rand = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 5; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
      const randRes = rand();
      // if no 19 digits, add 0 to the front
      while (userid.length < 19) userid = "0" + userid;
      const redeemId = `${getUTCDate().replace(/\D/g, "")}${userid}${randRes}`;

      // update to redeem history and user data
      await mysql.query(res, req, "INSERT INTO `redeem-history` (`redeemId`, `code`, `userid`, `word`, `time`, `type`) VALUES (?, ?, ?, ?, ?, ?)", [redeemId, code, user.userid, redeem.word, getUTCDate(), redeem.itemid], true);
      await mysql.query(res, req, "INSERT INTO `word-history` (`target`, `word`, `date`, `reason`, `newWord`) VALUES (?, ?, ?, ?, ?)", [user.username, redeem.word, getUTCDate(), "Activate code", user.word + redeem.word], true);

      return response(req, res, 200, {
        msg: "Redeem successfully",
        word: redeem.word,
        newWord: user.word + redeem.word
      })
    } catch (err) {
      // rollback and unlock
      await rollback(err);
    }
  })
}

module.exports = data;