const { MongoClient } = require("mongodb");

let dbConnection;
let uri =
  "mongodb+srv://salvinthilak:h5eQbrRBWDCGqVt@saliak.qzzbx7m.mongodb.net/bookstore";

module.exports = {
  connectToDb: (cb) => {
    //MongoClient.connect("mongodb://0.0.0.0:27017/bookstore")
    MongoClient.connect(uri)

      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
