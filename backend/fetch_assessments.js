const db = require('./config/db');

db.query('SELECT * FROM assessments', (err, assessments) => {
  if (err) console.error('Error fetching assessments:', err);
  else console.log('Assessments:', assessments);

  db.query('SELECT * FROM questions', (err, questions) => {
    if (err) console.error('Error fetching questions:', err);
    else console.log('Questions:', questions);
    process.exit();
  });
});
