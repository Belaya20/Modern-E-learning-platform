const db = require('./config/db');

db.query('DESCRIBE assessments', (err, results) => {
  if (err) console.error('No assessments table');
  else console.log('assessments table exists');

  db.query('DESCRIBE questions', (err, results) => {
    if (err) console.error('No questions table:', err.message);
    else console.log('questions table exists');
    process.exit();
  });
});
