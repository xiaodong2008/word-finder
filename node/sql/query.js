const { response, serverError } = require('../modules/http.js');

// function factory
function createQuery(connection) {
  /**
   * @param {string} query - The SQL query to be executed
   * @param {Array} params - The parameters to be passed to the query
   * @param {boolean} handleError - Whether to handle the error or not, if true,
   *  it will reject the promise without throwing an error, if false, it will finish the http request with 500
   */
  return function (req, res, query, params, handleError = false) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (err, result) => {
        if (err) {
          if (handleError) {
            serverError('Mysql<handled>', err)
            reject(err);
          } else {
            response(req, res, 500, {
              msg: 'Error executing query',
            }, true, 'Mysql', err);
          }
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = createQuery;