const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

// Multer setup for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `lesson-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mkv|avi|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only video files are allowed'));
  },
});

router.get('/', authMiddleware, (req, res) => {
  const { courseId } = req.query;
  db.query('SELECT * FROM lessons WHERE course_id = ?', [courseId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Upload new lesson video (admin/instructor)
router.post('/', authMiddleware, upload.single('video'), (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
    return res.status(403).json({ error: 'Admin or Instructor access required' });
  }

  const { courseId, title, externalVideoUrl } = req.body;
  const file = req.file;

  if (!courseId || !title) {
    return res.status(400).json({ error: 'Course ID and title are required' });
  }

  if (!file && !externalVideoUrl) {
    return res.status(400).json({ error: 'Either a video file or a video URL must be provided' });
  }

  const videoUrl = file ? `http://localhost:5000/uploads/${file.filename}` : externalVideoUrl;

  db.query(
    'INSERT INTO lessons (course_id, title, video_url) VALUES (?, ?, ?)',
    [courseId, title, videoUrl],
    (err, result) => {
      if (err) {
        console.error('Create lesson error:', err);
        return res.status(500).json({ error: 'Failed to create lesson' });
      }
      res.status(201).json({ message: 'Lesson uploaded successfully', lessonId: result.insertId });
    }
  );
});

module.exports = router;