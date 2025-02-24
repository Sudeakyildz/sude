let orders = {}; // Siparişler için bir nesne tanımlanır. Her ürünün adını anahtar olarak kullanır ve değer olarak fiyat ve miktar bilgilerini tutar.

// Siparişe ürün ekleyen fonksiyon
function addToOrder(item, price) {
    if (orders[item]) {
        // Eğer ürün zaten siparişte varsa, miktarını bir artır
        orders[item].quantity++;
    } else {
        // Eğer ürün ilk defa ekleniyorsa, yeni bir giriş oluştur
        orders[item] = { price, quantity: 1 };
    }
    renderOrders(); // Sipariş listesini yeniden oluştur ve ekranda güncelle
}

// Siparişleri ekranda görüntüleyen fonksiyon
function renderOrders() {
    const orderList = document.getElementById('orderList'); // Siparişlerin listeleneceği HTML öğesi
    const totalPriceSpan = document.getElementById('totalPrice'); // Toplam fiyatın gösterileceği HTML öğesi
    let totalPrice = 0; // Toplam fiyatı hesaplamak için başlangıç değeri

    orderList.innerHTML = ''; // Listeyi temizle

    for (let item in orders) {
        // Siparişteki her ürün için döngü
        const { price, quantity } = orders[item]; // Ürünün fiyat ve miktar bilgilerini al
        totalPrice += price * quantity; // Toplam fiyatı güncelle

        // Her ürün için bir liste öğesi oluştur
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item} - ${price}₺ x ${quantity}
            <button onclick="updateOrder('${item}', -1)">-</button> <!-- Miktarı azalt -->
            <button onclick="updateOrder('${item}', 1)">+</button> <!-- Miktarı artır -->
        `;
        orderList.appendChild(listItem); // Liste öğesini HTML'deki sipariş listesine ekle
    }

    if (Object.keys(orders).length === 0) {
        // Eğer sipariş boşsa, bilgilendirici bir mesaj göster
        orderList.innerHTML = '<li>Siparişleriniz burada görünecek.</li>';
    }

    totalPriceSpan.textContent = totalPrice; // Toplam fiyatı ekranda güncelle
}

// Sipariş miktarını güncelleyen fonksiyon
function updateOrder(item, change) {
    if (orders[item]) {
        orders[item].quantity += change; // Ürünün miktarını verilen değişim değeri kadar artır veya azalt
        if (orders[item].quantity <= 0) {
            // Eğer miktar sıfır veya daha azsa, ürünü siparişten kaldır
            delete orders[item];
        }
    }
    renderOrders(); // Sipariş listesini yeniden oluştur ve güncelle
}

// Sipariş listesini tamamen temizleyen fonksiyon
function clearOrder() {
    orders = {}; // Siparişleri sıfırla
    renderOrders(); // Sipariş listesini ekranda güncelle
}

// Siparişleri sunucuya gönderen fonksiyon
function submitOrder() {
    if (Object.keys(orders).length === 0) {
        // Eğer sipariş boşsa, uyarı göster
        alert("Sipariş vermek için önce ürün ekleyin.");
        return;
    }

    // Gönderilecek sipariş verisini hazırla
    const orderData = {
        orderItems: Object.keys(orders).map(item => ({
            itemName: item, // Ürünün adı
            quantity: orders[item].quantity, // Ürünün miktarı
            totalPrice: orders[item].price * orders[item].quantity, // Ürünün toplam fiyatı
        })),
        totalAmount: Object.values(orders).reduce(
            (sum, { price, quantity }) => sum + price * quantity,
            0 // Başlangıç değeri 0
        ),
    };

    console.log('Gönderilen sipariş verisi:', orderData); // Sipariş verisini konsola yazdır

    // Sipariş verisini sunucuya gönder
    fetch('http://172.20.10.10:3000/api/orders', {
        method: 'POST', // HTTP POST metodu
        headers: { 
            'Content-Type': 'application/json' // JSON formatında veri gönderileceğini belirt
        },
        body: JSON.stringify(orderData), // Sipariş verisini JSON formatına çevir ve gönder
    })
    .then(response => {
        if (!response.ok) {
            // Eğer sunucudan bir hata dönerse, hata mesajını al
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json(); // Sunucudan gelen yanıtı JSON olarak çöz
    })
    .then(data => {
        console.log('Sipariş yanıtı:', data); // Sunucudan gelen yanıtı konsola yazdır
        alert('Sipariş başarıyla kaydedildi!'); // Başarı mesajı göster
        clearOrder(); // Sipariş listesini temizle
    })
    .catch(error => {
        console.error('Hata:', error); // Hata mesajını konsola yazdır
        alert('Bir hata oluştu.'); // Kullanıcıya hata mesajı göster
    });
}
