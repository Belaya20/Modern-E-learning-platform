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
    console.log(results);
    const hasThumbnailUrl = results.some(r => r.Field === 'thumbnail_url');
    if (!hasThumbnailUrl) {
      console.log('thumbnail_url is missing. Adding it...');
      db.query('ALTER TABLE courses ADD COLUMN thumbnail_url VARCHAR(255) NULL', (err) => {
        if (err) console.error('Alter error:', err);
        else console.log('thumbnail_url added successfully');
        process.exit();
      });
    } else {
      console.log('thumbnail_url exists');
      process.exit();
    }
  }
});
