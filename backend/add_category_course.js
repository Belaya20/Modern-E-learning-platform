require('dotenv').config({ path: './.env' });
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.query('DESCRIBE courses', (err, results) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit();
  } else {
    const hasCategory = results.some(r => r.Field === 'category');
    if (!hasCategory) {
      console.log('category is missing. Adding it...');
      db.query('ALTER TABLE courses ADD COLUMN category VARCHAR(255) NULL', (err) => {
        if (err) console.error('Alter error:', err);
        else console.log('category added successfully');
        process.exit();
      });
    } else {
      console.log('category exists');
      process.exit();
    }
  }
});
