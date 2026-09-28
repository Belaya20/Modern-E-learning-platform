
-- ============================================================
-- E-LEARNING PLATFORM DATABASE SCHEMA
-- Database: elearning_db
-- MySQL 8.4+
--
-- IMPORTANT:
-- This file defines the complete schema for a NEW database.
-- Do not run it directly against an existing database because
-- the CREATE TABLE statements are not all idempotent.
--
-- Migration history:
-- 1. Added users.profile_image.
-- 2. Added users.requires_password_change.
-- 3. Added courses.thumbnail_url.
-- 4. Added courses.category.
-- 5. Created the videos table.
-- ============================================================

-- CREATE DATABASE IF NOT EXISTS elearning_db;
-- USE elearning_db;


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Added during migration:
    -- Stores the user's profile image URL or path.
    profile_image VARCHAR(255) DEFAULT NULL,

    -- Added during migration:
    -- Indicates whether the user must change their password.
    requires_password_change BOOLEAN NOT NULL DEFAULT FALSE
);


-- ============================================================
-- 2. COURSES
-- ============================================================

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT,

    -- Added during migration:
    -- Stores the course thumbnail URL or path.
    thumbnail_url VARCHAR(255) DEFAULT NULL,

    -- Added during migration:
    -- Stores the course category, e.g. Programming or Design.
    category VARCHAR(100) DEFAULT NULL,

    FOREIGN KEY (instructor_id) REFERENCES users(id)
);


-- ============================================================
-- 3. LESSONS
-- ============================================================

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(255),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);


-- ============================================================
-- 4. STUDENT PROGRESS
-- ============================================================

CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    lesson_id INT,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX idx_courses_title ON courses(title);
CREATE INDEX idx_progress_user ON progress(user_id);


-- ============================================================
-- 6. CAROUSEL IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS carousel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL
);


-- ============================================================
-- 7. CART
-- ============================================================

CREATE TABLE IF NOT EXISTS cart (
    user_id INT,
    course_id INT,
    title VARCHAR(255),
    thumbnail_url VARCHAR(255),
    category VARCHAR(100),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);


-- ============================================================
-- 8. ASSESSMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);


-- ============================================================
-- 9. QUESTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'short-answer',
    choices JSON,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);


-- ============================================================
-- 10. STUDENT RESPONSES
-- ============================================================

CREATE TABLE IF NOT EXISTS student_responses (
    user_id INT,
    question_id INT,
    student_answer TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);


-- ============================================================
-- 11. VIDEOS
-- Added in a later migration.
-- Stores video metadata separately from lessons.
-- ============================================================

CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    tags JSON DEFAULT NULL,

    CONSTRAINT fk_videos_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE SET NULL,

    INDEX idx_videos_course (course_id),
    INDEX idx_videos_category (category)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;