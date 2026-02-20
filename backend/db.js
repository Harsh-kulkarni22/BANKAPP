const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

async function setupDatabase() {
  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
  } = process.env;

  if (!DB_HOST || !DB_USER) {
    throw new Error('DB_HOST and DB_USER must be set in environment variables');
  }

  const port = DB_PORT ? Number(DB_PORT) : 3306;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port,
    multipleStatements: true,
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS banking_simulation');
  await connection.query('USE banking_simulation');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS bankuser (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(15),
      password_hash VARCHAR(255) NOT NULL,
      balance DECIMAL(12,2) DEFAULT 0.00
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS bankuserjwt (
      token_id INT AUTO_INCREMENT PRIMARY KEY,
      token_value TEXT NOT NULL,
      customer_id INT,
      expiry DATETIME,
      CONSTRAINT fk_bankuserjwt_customer
        FOREIGN KEY (customer_id)
        REFERENCES bankuser(customer_id)
        ON DELETE CASCADE
    )
  `);

  await connection.end();

  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'banking_simulation',
    port,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Required log message
  // eslint-disable-next-line no-console
  console.log('Database ready');
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call setupDatabase() first.');
  }
  return pool;
}

module.exports = {
  setupDatabase,
  getPool,
};

