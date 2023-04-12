// main node server
const {createServer, serverCrash} = require('./modules/http.js');
const {connect} = require('./sql/connect.js');

const mysql = connect()

const pages = {
  "/user/register": require('./pages/user/register.js'),
  "/user/login": require('./pages/user/login.js'),
  "/user/data": require('./pages/user/data.js'),
  "/user/logout": require('./pages/user/logout.js'),
  "/user/redeem": require('./pages/user/redeem.js'),
  "/user/word": require('./pages/user/word.js'),
  "/user/word-count": require('./pages/user/word-count.js'),
  "/user/activate": require('./pages/user/activate.js'),
  "/user/activate-count": require('./pages/user/activate-count.js'),
  "/paragraph/generate": require('./pages/paragraph/generate.js'),
  "/paragraph/history": require('./pages/paragraph/history.js'),
  "/paragraph/edit": require('./pages/paragraph/edit.js'),
  "/dictionary/count": require('./pages/dictionary/count.js'),
  "/dictionary/get": require('./pages/dictionary/get.js'),
  "/dictionary/add": require('./pages/dictionary/add.js'),
  "/dictionary/delete": require('./pages/dictionary/delete.js'),
}

const response = createServer(2946, (req, res) => {
  let url = req.url.split('?')[0]
  if (url in pages) {
    pages[url](req, res, mysql)
  } else {
    response(req, res, 404, `404 Not Found: ${req.url}`);
  }
})

// catch uncaughtException
process.on('uncaughtException', (err) => {
  serverCrash(err)
})