const path = require('path');

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  dbFile:
    process.env.SQLITE_DB_FILE ||
    path.join(__dirname, '..', '..', 'data', 'careflow.db'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
