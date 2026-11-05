const mysqlOdm = require('./mysql-odm');

const connectDB = async () => {
  await mysqlOdm.connect();
  console.log('MySQL connected and application tables are ready.');
};

module.exports = connectDB;
