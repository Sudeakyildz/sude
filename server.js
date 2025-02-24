const express = require('express'); // Express framework'ü dahil edilir.
const mysql = require('mysql2/promise'); // MySQL bağlantısı için mysql2 kütüphanesi kullanılır (Promise destekli).
const path = require('path'); // Dosya yollarını işlemek için path modülü kullanılır.
const app = express(); // Express uygulaması oluşturulur.
const port = 3000; // Sunucu için kullanılacak port numarası tanımlanır.

// JSON verilerini almak için middleware
app.use(express.json()); // Gelen isteklerde JSON verisini otomatik olarak ayrıştırır.

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, 'public'))); 
// 'public' dizinindeki statik dosyaları sunar. Örneğin, CSS, JS veya HTML dosyaları buradan alınır.

// MySQL bağlantısı için bağlantı havuzu oluşturulur
const pool = mysql.createPool({
    host: 'localhost', // Veritabanı sunucusunun adresi.
    port: 3306, // Veritabanı sunucusunun portu.
    user: 'user', // Veritabanı kullanıcı adı.
    password: 'password', // Veritabanı şifresi.
    database: 'dbname', // Kullanılacak veritabanı adı.
    waitForConnections: true, // Bağlantı havuzunda bekleme etkin.
    connectionLimit: 10, // Maksimum bağlantı sayısı.
    queueLimit: 0, // Kuyrukta bekleme sınırı (0 = sınırsız).
});

// API endpointleri

// Veritabanından tüm verileri döndüren GET endpoint
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM your_table'); 
        // Veritabanından tüm veriler sorgulanır.
        res.json(rows); // Sonuçlar JSON formatında istemciye gönderilir.
    } catch (err) {
        console.error('GET isteği hatası:', err); // Hata konsola yazılır.
        res.status(500).send('Sunucu hatası'); // Sunucu hatası mesajı döndürülür.
    }
});

// Sipariş gönderme endpoint'i
app.post('/api/orders', async (req, res) => {
    console.log('Gelen veri:', req.body); // Gelen veri konsola yazdırılır.

    const { orderItems, totalAmount } = req.body; // İstek gövdesinden sipariş bilgileri alınır.

    if (!orderItems || orderItems.length === 0 || !totalAmount) {
        // Eğer sipariş verisi eksikse hata döndürülür.
        return res.status(400).send('Geçersiz sipariş verisi');
    }

    try {
        const connection = await pool.getConnection(); // Veritabanı bağlantısı alınır.

        // Sipariş toplamını 'orders' tablosuna kaydet
        const [orderResult] = await connection.query(
            'INSERT INTO orders (totalAmount) VALUES (?)',
            [totalAmount]
        );
        const orderId = orderResult.insertId; // Yeni eklenen siparişin ID'si alınır.

        // Sipariş ürünlerini 'order_items' tablosuna kaydet
        for (let item of orderItems) {
            const { itemName, quantity, totalPrice } = item;
            await connection.query(
                'INSERT INTO order_items (orderId, itemName, quantity, totalPrice) VALUES (?, ?, ?, ?)',
                [orderId, itemName, quantity, totalPrice]
            );
        }

        connection.release(); // Veritabanı bağlantısı serbest bırakılır.

        res.status(201).json({ message: 'Sipariş başarıyla kaydedildi!' }); 
        // Başarı mesajı döndürülür.

    } catch (err) {
        console.error('POST isteği hatası:', err); // Hata konsola yazılır.
        res.status(500).send('Sunucu hatası'); // Sunucu hatası mesajı döndürülür.
    }
});

// Root endpoint: index.html dosyasını sunar
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
    // 'public' dizinindeki 'index.html' dosyası istemciye gönderilir.
});

// Sunucu başlatma
app.listen(port, '172.20.10.10'  , () => {
    console.log(`Sunucu http://172.20.10.10:${port} adresinde çalışıyor`); 
    // Sunucunun hangi adreste çalıştığı konsola yazılır.
});
