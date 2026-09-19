const mysql = require("mysql2");

const db = mysql.createConnection({
    host: localStorage,
    port: locel,
    user: root,
    password: 123456,
    database:click,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
    } else {
        console.log("MySQL connected successfully");
    }
});

module.exports = db;
