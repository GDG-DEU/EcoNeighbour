// Çevresel değişkenleri (.env) yükle
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Express uygulamasını başlat
const app = express();

// .env dosyasında PORT yoksa varsayılan olarak 5000 kullan
const PORT = process.env.PORT || 5000;

// --- MİDDLEWARE'LER ---
// Mobil uygulamadan veya frontend'den gelecek isteklere izin ver
app.use(cors());
// Gelen JSON formatındaki verileri (req.body) okuyabilmek için
app.use(express.json());
// Form verilerini okuyabilmek için
app.use(express.urlencoded({ extended: true }));

// --- TEMEL ROTA (Health Check) ---
// Sunucunun ve deploy'un çalışıp çalışmadığını test etmek için
app.get('/', (req, res) => {
    res.json({
        status: "success",
        message: "EcoNeighbour Backend API Sorunsuz Çalışıyor! 🚀"
    });
});

// --- API ROTALARI BURAYA GELECEK ---
// Örnek kullanım (src klasörünü oluşturduktan sonra aktif edebilirsin):
// const userRoutes = require('./src/routes/userRoutes');
// app.use('/api/users', userRoutes);


// --- SUNUCUYU BAŞLAT ---
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda başarıyla ayağa kalktı! 🏃‍♂️`);
});