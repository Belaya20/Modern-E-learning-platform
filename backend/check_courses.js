require('dotenv').config({ path: './.env' });
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.query('SELECT * FROM courses', (err, results) => {
  if (err) {
    console.error('Error on courses table:', err.message);
  } else {
    console.log('Courses table exists, found', results.length, 'records.');
  }
  process.exit();
});
