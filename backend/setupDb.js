
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'elearning_db',
            multipleStatements: true
        });

        const schemaPath = path.join(
            __dirname,
            'database',
            'schema.sql'
        );

        const sql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(sql);

        console.log('Database tables created successfully!');
    } catch (err) {
        console.error('Database setup failed:', err.message);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setup();