const mysql = require('mysql');
const secret = require('../secret.json').mysql;
const { getDate } = require('../modules/date');

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const connection = mysql.createConnection({
  host: "localhost",
  user: secret[env].username,
  password: secret[env].password,
  database: "word-finder",
  // auto handle reconnect
  reconnect: true
})

function connect() {
  const query = require('./query')(connection);
  console.log("Connected to database at " + getDate());
  return {
    query,
    user: require('./user.js')
  }
}

module.exports = {
  connect,
}