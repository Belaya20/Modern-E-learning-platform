const db = require('./config/db');

db.query('DESCRIBE lessons', (err, results) => {
  if (err) {
    console.error('Error describing lessons:', err.message);
  } else {
    console.log('Lessons schema:', results);
  }
  process.exit();
});
