// backend/src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool kullanmak hackathon'da bile olsa bağlantı kopmalarını engeller
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Bağlantıyı test edelim
pool.getConnection()
    .then((connection) => {
        console.log('MySQL Veritabanına başarıyla bağlanıldı! 🗄️');
        connection.release(); // Test bağlantısını serbest bırak
    })
    .catch((error) => {
        console.error('Veritabanı bağlantı hatası:', error.message);
    });

module.exports = pool;