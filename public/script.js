let orders = {}; // An object is defined for orders. It uses the product name as the key and holds price and quantity information as the value.

// Function to add product to the order
function addToOrder(item, price) {
    if (orders[item]) {
        // If the product is already in the order, increase its quantity by one
        orders[item].quantity++;
    } else {
        // If the product is added for the first time, create a new entry
        orders[item] = { price, quantity: 1 };
    }
    renderOrders(); // Rebuild and update the order list on the screen
}

// Function to display orders on the screen
function renderOrders() {
    const orderList = document.getElementById('orderList'); // HTML element where orders will be listed
    const totalPriceSpan = document.getElementById('totalPrice'); // HTML element where the total price will be shown
    let totalPrice = 0; // Initial value to calculate total price

    orderList.innerHTML = ''; // Clear the list

    for (let item in orders) {
        // Loop through each product in the order
        const { price, quantity } = orders[item]; // Get the product's price and quantity information
        totalPrice += price * quantity; // Update the total price

        // Create a list item for each product
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item} - ${price}₺ x ${quantity}
            <button onclick="updateOrder('${item}', -1)">-</button> <!-- Decrease quantity -->
            <button onclick="updateOrder('${item}', 1)">+</button> <!-- Increase quantity -->
        `;
        orderList.appendChild(listItem); // Add the list item to the HTML order list
    }

    if (Object.keys(orders).length === 0) {
        // If the order is empty, display an informative message
        orderList.innerHTML = '<li>Your orders will appear here.</li>';
    }

    totalPriceSpan.textContent = totalPrice; // Update the total price on the screen
}

// Function to update order quantity
function updateOrder(item, change) {
    if (orders[item]) {
        orders[item].quantity += change; // Increase or decrease the product quantity by the given change value
        if (orders[item].quantity <= 0) {
            // If the quantity is zero or less, remove the product from the order
            delete orders[item];
        }
    }
    renderOrders(); // Rebuild and update the order list
}

// Function to clear the entire order list
function clearOrder() {
    orders = {}; // Reset the orders
    renderOrders(); // Update the order list on the screen
}

// Function to send orders to the server
function submitOrder() {
    if (Object.keys(orders).length === 0) {
        // If the order is empty, show a warning
        alert("Add products before placing an order.");
        return;
    }

    // Prepare the order data to be sent
    const orderData = {
        orderItems: Object.keys(orders).map(item => ({
            itemName: item, // Product name
            quantity: orders[item].quantity, // Product quantity
            totalPrice: orders[item].price * orders[item].quantity, // Product total price
        })),
        totalAmount: Object.values(orders).reduce(
            (sum, { price, quantity }) => sum + price * quantity,
            0 // Initial value 0
        ),
    };

    console.log('Order data sent:', orderData); // Log the order data to the console

    // Send the order data to the server
    fetch('http://172.20.10.10:3000/api/orders', {
        method: 'POST', // HTTP POST method
        headers: { 
            'Content-Type': 'application/json' // Indicate that the data will be sent in JSON format
        },
        body: JSON.stringify(orderData), // Convert order data to JSON format and send it
    })
    .then(response => {
        if (!response.ok) {
            // If the server returns an error, get the error message
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json(); // Parse the server response as JSON
    })
    .then(data => {
        console.log('Order response:', data); // Log the server response to the console
        alert('Order successfully submitted!'); // Show a success message
        clearOrder(); // Clear the order list
    })
    .catch(error => {
        console.error('Error:', error); // Log the error message to the console
        alert('An error occurred.'); // Show an error message to the user
    });
}
