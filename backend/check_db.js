require('dotenv').config({ path: './.env' });
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.query('DESCRIBE users', (err, results) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log(results);
    const hasProfileImage = results.some(r => r.Field === 'profile_image');
    if (!hasProfileImage) {
      console.log('profile_image is missing. Adding it...');
      db.query('ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL', (err) => {
        if (err) console.error('Alter error:', err);
        else console.log('profile_image added successfully');
        process.exit();
      });
    } else {
      console.log('profile_image exists');
      process.exit();
    }
  }
});
