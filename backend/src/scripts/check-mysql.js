require('dotenv').config();
const mysqlOdm = require('../config/mysql-odm');

(async () => {
  try {
    await mysqlOdm.connect();
    const [rows] = await mysqlOdm.getPool().query('SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion');
    console.log('MySQL connection successful:', rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('MySQL check failed:', error.message);
    process.exit(1);
  }
})();
