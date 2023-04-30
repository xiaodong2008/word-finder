// main node server
const {createServer, serverCrash} = require('./modules/http.js');
const {connect} = require('./sql/connect.js');
const axios = require('axios')

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
  "/paragraph/create": require('./pages/paragraph/create.js'),
  "/dictionary/count": require('./pages/dictionary/count.js'),
  "/dictionary/get": require('./pages/dictionary/get.js'),
  "/dictionary/add": require('./pages/dictionary/add.js'),
  "/dictionary/delete": require('./pages/dictionary/delete.js'),
  "/dictionary/note": require('./pages/dictionary/note.js'),
}

const response = createServer(2946, async (req, res) => {
  let url = req.url.split('?')[0]
  if (url.startsWith('/cors/')) {
    url = req.url.split('/cors/')[1]
    if (url.indexOf("https:/t") !== -1) url = url.replace("https:/t", "https://t")
    if (!url.startsWith('https://translate.google.com/translate_a/single')) {
      return response(req, res, 400, "Error 400: Cors is not available for public use")
    }

    const result = await axios.get(url)
    return response(req, res, 200, result.data)
  }
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