const mysql = require("mysql2");

// Single Connection ki jagah Connection Pool use karein
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 26831,
    ssl: {
        rejectUnauthorized: false // Aiven MySQL SSL ke liye zaroori hai
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on startup
db.getConnection((err, connection) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
        return;
    }
    console.log("MySQL connected successfully to Aiven Cloud!");
    connection.release(); // Connection check karke pool me wapas bhej dein
});

module.exports = db;