const mysql = require('mysql2/promise');

// In a real application, you would use environment variables for this (.env)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Default XAMPP/MySQL user
    password: 'Karthik@2007', // Updated user password
    database: 'novamart',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
