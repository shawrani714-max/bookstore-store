document.addEventListener('DOMContentLoaded', function() {
  const ordersList = document.getElementById('orders-list');
  const token = localStorage.getItem('adminToken');

  // Load orders (for demo, fetch all orders)
  fetch('/api/orders/all', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        data.data.forEach(order => {
          const orderDiv = document.createElement('div');
          orderDiv.className = 'order-block';
          orderDiv.innerHTML = `<h2>Order #${order.orderNumber}</h2>`;
          order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item-block';
            itemDiv.innerHTML = `
              <strong>${item.title}</strong> (x${item.quantity})<br>
              Status: ${item.status || 'pending'}<br>
              <button class="fulfill-btn">Mark Fulfilled</button>
              <button class="refund-btn">Refund</button>
              <input type="number" min="0" placeholder="Extra Payment" class="extra-payment-input" />
              <button class="request-payment-btn">Request Payment</button>
              <span class="action-status"></span>
            `;
            // Fulfill
            itemDiv.querySelector('.fulfill-btn').onclick = function() {
              fetch(`/api/order-admin/${order._id}/items/${item._id}/fulfill`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token }
              })
                .then(res => res.json())
                .then(resp => {
                  itemDiv.querySelector('.action-status').textContent = resp.success ? 'Fulfilled!' : resp.message;
                });
            };
            // Refund
            itemDiv.querySelector('.refund-btn').onclick = function() {
              fetch(`/api/order-admin/${order._id}/items/${item._id}/refund`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ refundAmount: item.price })
              })
                .then(res => res.json())
                .then(resp => {
                  itemDiv.querySelector('.action-status').textContent = resp.success ? 'Refunded!' : resp.message;
                });
            };
            // Request Payment
            itemDiv.querySelector('.request-payment-btn').onclick = function() {
              const extraAmount = itemDiv.querySelector('.extra-payment-input').value;
              fetch(`/api/order-admin/${order._id}/items/${item._id}/request-payment`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ extraAmount })
              })
                .then(res => res.json())
                .then(resp => {
                  itemDiv.querySelector('.action-status').textContent = resp.success ? 'Payment Requested!' : resp.message;
                });
            };
            orderDiv.appendChild(itemDiv);
          });
          ordersList.appendChild(orderDiv);
        });
      }
    });
});
