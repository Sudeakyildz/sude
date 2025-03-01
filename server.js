const express = require('express'); // Include the Express framework.
const mysql = require('mysql2/promise'); // Use the mysql2 library for MySQL connection (Promise-based).
const path = require('path'); // Use the path module to handle file paths.
const app = express(); // Create an Express application.
const port = 3000; // Define the port number for the server.

// Middleware to parse JSON data
app.use(express.json()); // Automatically parse JSON data from incoming requests.

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); 
// Serve static files from the 'public' directory, such as CSS, JS, or HTML files.

// Create a connection pool for MySQL
const pool = mysql.createPool({
    host: 'localhost', // Database server address.
    port: 3306, // Database server port.
    user: 'user', // Database username.
    password: 'password', // Database password.
    database: 'dbname', // Name of the database.
    waitForConnections: true, // Enable waiting in the connection pool.
    connectionLimit: 10, // Maximum number of connections.
    queueLimit: 0, // Queue limit (0 = unlimited).
});

// API endpoints

// GET endpoint to return all data from the database
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM your_table'); 
        // Query all data from the database.
        res.json(rows); // Send the results to the client in JSON format.
    } catch (err) {
        console.error('GET request error:', err); // Log the error to the console.
        res.status(500).send('Server error'); // Return server error message.
    }
});

// Order submission endpoint
app.post('/api/orders', async (req, res) => {
    console.log('Incoming data:', req.body); // Log incoming data to the console.

    const { orderItems, totalAmount } = req.body; // Extract order information from the request body.

    if (!orderItems || orderItems.length === 0 || !totalAmount) {
        // If order data is missing, return an error.
        return res.status(400).send('Invalid order data');
    }

    try {
        const connection = await pool.getConnection(); // Get a database connection.

        // Save the order total to the 'orders' table
        const [orderResult] = await connection.query(
            'INSERT INTO orders (totalAmount) VALUES (?)',
            [totalAmount]
        );
        const orderId = orderResult.insertId; // Get the ID of the newly added order.

        // Save order items to the 'order_items' table
        for (let item of orderItems) {
            const { itemName, quantity, totalPrice } = item;
            await connection.query(
                'INSERT INTO order_items (orderId, itemName, quantity, totalPrice) VALUES (?, ?, ?, ?)',
                [orderId, itemName, quantity, totalPrice]
            );
        }

        connection.release(); // Release the database connection.

        res.status(201).json({ message: 'Order successfully saved!' }); 
        // Return success message.

    } catch (err) {
        console.error('POST request error:', err); // Log the error to the console.
        res.status(500).send('Server error'); // Return server error message.
    }
});

// Root endpoint: Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
    // Send the 'index.html' file from the 'public' directory to the client.
});

// Start the server
app.listen(port, '172.20.10.10', () => {
    console.log(`Server is running at http://172.20.10.10:${port}`); 
    // Log the address where the server is running.
});
