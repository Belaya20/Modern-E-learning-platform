
require('dotenv').config();

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DEMO_PASSWORD = process.env.DEMO_PASSWORD;

if (!DEMO_PASSWORD || DEMO_PASSWORD.length < 8) {
    throw new Error(
        'Set DEMO_PASSWORD in your backend .env file. Use at least 8 characters.'
    );
}

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'elearning_db',
};

const demoUsers = [
    {
        username: 'admin_belay',
        email: 'ermiasderbew5@gmail.com',
        role: 'admin',
    },
    {
        username: 'instructor_belay',
        email: 'ermiasderbew8@gmail.com',
        role: 'instructor',
    },
    {
        username: 'student_belay1',
        email: 'ermiasderbew9@gmail.com',
        role: 'student',
    },
    {
        username: 'student_belay2',
        email: 'ermiasderbew3@gmail.com',
        role: 'student',
    },
];

const demoCourses = [
    {
        title: 'Full-Stack Web Development with React',
        description:
            'Learn HTML, CSS, JavaScript, React, Node.js, Express, and database integration through practical projects.',
        category: 'Web Development',
        thumbnail_url:
            'https://placehold.co/800x450/1d4ed8/ffffff?text=Full-Stack+Development',
        lessons: [
            {
                title: 'Introduction to Full-Stack Development',
                video_url:
                    'https://example.com/videos/fullstack-intro.mp4',
            },
            {
                title: 'Building Your First React Application',
                video_url:
                    'https://example.com/videos/react-intro.mp4',
            },
        ],
        assessment: {
            title: 'Full-Stack Development Fundamentals',
            questions: [
                {
                    question_text:
                        'Which technology is commonly used to build React user interfaces?',
                    correct_answer: 'JavaScript',
                    type: 'multiple-choice',
                    choices: [
                        'JavaScript',
                        'MySQL',
                        'Apache',
                        'Nginx',
                    ],
                },
                {
                    question_text:
                        'What is the primary purpose of a backend API?',
                    correct_answer:
                        'To allow clients to communicate with server-side functionality and data.',
                    type: 'short-answer',
                    choices: null,
                },
            ],
        },
    },
    {
        title: 'Python Programming for Beginners',
        description:
            'Start learning Python fundamentals, variables, data structures, functions, and problem-solving.',
        category: 'Programming',
        thumbnail_url:
            'https://placehold.co/800x450/047857/ffffff?text=Python+Programming',
        lessons: [
            {
                title: 'Python Syntax and Variables',
                video_url:
                    'https://example.com/videos/python-basics.mp4',
            },
            {
                title: 'Functions and Data Structures',
                video_url:
                    'https://example.com/videos/python-functions.mp4',
            },
        ],
        assessment: {
            title: 'Python Fundamentals Assessment',
            questions: [
                {
                    question_text:
                        'Which keyword is used to define a function in Python?',
                    correct_answer: 'def',
                    type: 'multiple-choice',
                    choices: [
                        'function',
                        'def',
                        'func',
                        'method',
                    ],
                },
                {
                    question_text:
                        'What data type stores key-value pairs in Python?',
                    correct_answer: 'Dictionary',
                    type: 'short-answer',
                    choices: null,
                },
            ],
        },
    },
    {
        title: 'UI/UX Design Fundamentals with Figma',
        description:
            'Explore user research, wireframes, visual hierarchy, prototyping, and interface design using Figma.',
        category: 'Design',
        thumbnail_url:
            'https://placehold.co/800x450/7c3aed/ffffff?text=UI+UX+Design',
        lessons: [
            {
                title: 'Introduction to UI and UX Design',
                video_url:
                    'https://example.com/videos/uiux-intro.mp4',
            },
            {
                title: 'Wireframing and Prototyping in Figma',
                video_url:
                    'https://example.com/videos/figma-wireframes.mp4',
            },
        ],
        assessment: {
            title: 'UI/UX Design Fundamentals Assessment',
            questions: [
                {
                    question_text:
                        'What is the primary purpose of a wireframe?',
                    correct_answer:
                        'To represent the basic structure and layout of an interface.',
                    type: 'multiple-choice',
                    choices: [
                        'To define the basic structure and layout of an interface',
                        'To store user passwords',
                        'To deploy a backend server',
                        'To manage a database',
                    ],
                },
                {
                    question_text: 'What does UX stand for?',
                    correct_answer: 'User Experience',
                    type: 'short-answer',
                    choices: null,
                },
            ],
        },
    },
];

// --------------------------------------------------
// USER HELPERS
// --------------------------------------------------

async function findOrCreateUser(connection, user, passwordHash) {
    const [existing] = await connection.execute(
        `SELECT id, username, email, role
         FROM users
         WHERE email = ? OR username = ?
         LIMIT 1`,
        [user.email, user.username]
    );

    if (existing.length > 0) {
        const record = existing[0];

        if (
            record.email !== user.email ||
            record.username !== user.username ||
            record.role !== user.role
        ) {
            throw new Error(
                `A conflicting account already exists for ${user.username}.`
            );
        }

        console.log(`User already exists: ${user.username}`);
        return record.id;
    }

    const [result] = await connection.execute(
        `INSERT INTO users (username, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [user.username, user.email, passwordHash, user.role]
    );

    console.log(`Created user: ${user.username}`);
    return result.insertId;
}

// --------------------------------------------------
// COURSE HELPERS
// --------------------------------------------------

async function findOrCreateCourse(connection, course, instructorId) {
    if (!instructorId) {
        throw new Error(
            `Cannot create course "${course.title}": instructor ID is missing.`
        );
    }

    const [existing] = await connection.execute(
        `SELECT id
         FROM courses
         WHERE title = ?
         LIMIT 1`,
        [course.title]
    );

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [result] = await connection.execute(
        `INSERT INTO courses
            (title, description, instructor_id, thumbnail_url, category)
         VALUES (?, ?, ?, ?, ?)`,
        [
            course.title,
            course.description,
            instructorId,
            course.thumbnail_url ?? null,
            course.category ?? null,
        ]
    );

    console.log(`Created course: ${course.title}`);
    return result.insertId;
}

// --------------------------------------------------
// LESSON HELPERS
// --------------------------------------------------

async function findOrCreateLesson(connection, courseId, lesson) {
    const [existing] = await connection.execute(
        `SELECT id
         FROM lessons
         WHERE course_id = ? AND title = ?
         LIMIT 1`,
        [courseId, lesson.title]
    );

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [result] = await connection.execute(
        `INSERT INTO lessons (course_id, title, video_url)
         VALUES (?, ?, ?)`,
        [courseId, lesson.title, lesson.video_url]
    );

    console.log(`Created lesson: ${lesson.title}`);
    return result.insertId;
}

// --------------------------------------------------
// ASSESSMENT HELPERS
// --------------------------------------------------

async function findOrCreateAssessment(
    connection,
    courseId,
    assessment
) {
    const [existing] = await connection.execute(
        `SELECT id
         FROM assessments
         WHERE course_id = ? AND title = ?
         LIMIT 1`,
        [courseId, assessment.title]
    );

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [result] = await connection.execute(
        `INSERT INTO assessments (course_id, title)
         VALUES (?, ?)`,
        [courseId, assessment.title]
    );

    console.log(`Created assessment: ${assessment.title}`);
    return result.insertId;
}

// --------------------------------------------------
// QUESTION HELPERS
// --------------------------------------------------

async function findOrCreateQuestion(
    connection,
    assessmentId,
    question
) {
    const [existing] = await connection.execute(
        `SELECT id
         FROM questions
         WHERE assessment_id = ? AND question_text = ?
         LIMIT 1`,
        [assessmentId, question.question_text]
    );

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [result] = await connection.execute(
        `INSERT INTO questions
            (assessment_id, question_text, correct_answer, type, choices)
         VALUES (?, ?, ?, ?, ?)`,
        [
            assessmentId,
            question.question_text,
            question.correct_answer,
            question.type,
            question.choices === null
                ? null
                : JSON.stringify(question.choices),
        ]
    );

    console.log(
        `Created question: ${question.question_text}`
    );

    return result.insertId;
}

// --------------------------------------------------
// PROGRESS HELPERS
// --------------------------------------------------

async function seedProgress(
    connection,
    userId,
    lessonId,
    completed
) {
    if (!userId || !lessonId) {
        throw new Error(
            'Cannot seed progress: user ID or lesson ID is missing.'
        );
    }

    const [existing] = await connection.execute(
        `SELECT id
         FROM progress
         WHERE user_id = ? AND lesson_id = ?
         LIMIT 1`,
        [userId, lessonId]
    );

    if (existing.length > 0) {
        return;
    }

    await connection.execute(
        `INSERT INTO progress (user_id, lesson_id, completed)
         VALUES (?, ?, ?)`,
        [userId, lessonId, completed]
    );
}

// --------------------------------------------------
// CART HELPERS
// --------------------------------------------------

async function seedCart(connection, userId, course) {
    if (!userId) {
        throw new Error(
            'Cannot seed cart: user ID is missing.'
        );
    }

    const [rows] = await connection.execute(
        `SELECT id
         FROM courses
         WHERE title = ?
         LIMIT 1`,
        [course.title]
    );

    if (rows.length === 0) {
        throw new Error(`Course not found: ${course.title}`);
    }

    await connection.execute(
        `INSERT IGNORE INTO cart
            (user_id, course_id, title, thumbnail_url, category)
         VALUES (?, ?, ?, ?, ?)`,
        [
            userId,
            rows[0].id,
            course.title,
            course.thumbnail_url ?? null,
            course.category ?? null,
        ]
    );
}

// --------------------------------------------------
// CAROUSEL HELPERS
// --------------------------------------------------

async function seedCarouselImage(connection, imageUrl) {
    const [existing] = await connection.execute(
        `SELECT id
         FROM carousel_images
         WHERE image_url = ?
         LIMIT 1`,
        [imageUrl]
    );

    if (existing.length > 0) {
        return;
    }

    await connection.execute(
        `INSERT INTO carousel_images (image_url)
         VALUES (?)`,
        [imageUrl]
    );
}

// --------------------------------------------------
// VIDEO HELPERS
// --------------------------------------------------

async function seedVideo(connection, courseId, lesson, category) {
    const [existing] = await connection.execute(
        `SELECT id
         FROM videos
         WHERE course_id = ? AND title = ?
         LIMIT 1`,
        [courseId, lesson.title]
    );

    if (existing.length > 0) {
        return;
    }

    await connection.execute(
        `INSERT INTO videos (course_id, title, url, category, tags)
         VALUES (?, ?, ?, ?, ?)`,
        [
            courseId,
            lesson.title,
            lesson.video_url,
            category,
            JSON.stringify([category.toLowerCase(), 'demo']),
        ]
    );
}

// --------------------------------------------------
// MAIN SEEDING FUNCTION
// --------------------------------------------------

async function main() {
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

        // Create or retrieve demo users.
        const userIds = {};

        for (const user of demoUsers) {
            userIds[user.username] = await findOrCreateUser(
                connection,
                user,
                passwordHash
            );
        }

        // Correct user ID mappings.
        const instructorId = userIds.instructor_belay;
        const student1Id = userIds.student_belay1;
        const student2Id = userIds.student_belay2;

        if (!instructorId || !student1Id || !student2Id) {
            throw new Error(
                'Failed to retrieve the instructor or student IDs.'
            );
        }

        const courseIds = {};
        const lessonIds = {};

        // Create courses, lessons, videos, and assessments.
        for (const course of demoCourses) {
            const courseId = await findOrCreateCourse(
                connection,
                course,
                instructorId
            );

            courseIds[course.title] = courseId;
            lessonIds[course.title] = [];

            for (const lesson of course.lessons) {
                const lessonId = await findOrCreateLesson(
                    connection,
                    courseId,
                    lesson
                );

                lessonIds[course.title].push(lessonId);

                await seedVideo(
                    connection,
                    courseId,
                    lesson,
                    course.category
                );
            }

            const assessmentId = await findOrCreateAssessment(
                connection,
                courseId,
                course.assessment
            );

            for (const question of course.assessment.questions) {
                await findOrCreateQuestion(
                    connection,
                    assessmentId,
                    question
                );
            }
        }

        // Add sample progress for the first student.
        await seedProgress(
            connection,
            student1Id,
            lessonIds[demoCourses[0].title][0],
            true
        );

        await seedProgress(
            connection,
            student1Id,
            lessonIds[demoCourses[0].title][1],
            false
        );

        await seedProgress(
            connection,
            student1Id,
            lessonIds[demoCourses[1].title][0],
            true
        );

        // Add sample progress for the second student.
        await seedProgress(
            connection,
            student2Id,
            lessonIds[demoCourses[2].title][0],
            true
        );

        // Add sample cart entries.
        await seedCart(
            connection,
            student1Id,
            demoCourses[1]
        );

        await seedCart(
            connection,
            student2Id,
            demoCourses[2]
        );

        // Add sample carousel images.
        const carouselImages = [
            'https://placehold.co/1600x600/1d4ed8/ffffff?text=Learn+New+Skills',
            'https://placehold.co/1600x600/047857/ffffff?text=Build+Your+Future',
            'https://placehold.co/1600x600/7c3aed/ffffff?text=Explore+Courses',
        ];

        for (const imageUrl of carouselImages) {
            await seedCarouselImage(connection, imageUrl);
        }

        // Commit all changes.
        await connection.commit();

        console.log('\nDemo data seeded successfully.');
        console.log('Demo accounts:');

        for (const user of demoUsers) {
            console.log(
                `${user.username} | ${user.email} | ${user.role}`
            );
        }

        console.log(
            '\nUse the DEMO_PASSWORD environment variable for the demo accounts.'
        );
    } catch (error) {
        await connection.rollback();

        console.error(
            'Demo data seeding failed. Changes were rolled back.'
        );

        console.error('Error details:', error);

        throw error;
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});