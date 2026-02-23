async function loadOrders() {
    const container = document.getElementById("orders");
  
    // Get seller token from localStorage
    const token = localStorage.getItem("token");
  
    if (!token) {
      container.innerText = "Please login as seller";
      return;
    }
  
    try {
      const res = await fetch("/seller/orders", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
  
      if (!res.ok) {
        container.innerText = "Unable to load orders";
        return;
      }
  
      const data = await res.json();
  
      if (!data.orders || data.orders.length === 0) {
        container.innerText = "No orders yet";
        return;
      }
  
      container.innerHTML = data.orders
      .map((o) => {
        const location =
          o.buyer_latitude && o.buyer_longitude
            ? `<div>📍 <a href="https://maps.google.com/?q=${o.buyer_latitude},${o.buyer_longitude}" target="_blank">View location</a></div>`
            : "";
    
            const distance =
            o.distance_km !== null
              ? `<div>Distance: ${o.distance_km < 1
                  ? Math.round(o.distance_km * 1000) + " m"
                  : o.distance_km + " km"}</div>`
              : "";
    
        return `
          <div class="order">
            <div class="name">${o.product_name}</div>
            <div>Qty: ${o.quantity}</div>
            <div>Amount: GMD ${o.total_amount}</div>
            <div>Status: <span class="status">${o.status}</span></div>
            ${distance}
            ${location}
          </div>
        `;
      })
      .join("");
    } catch (err) {
      container.innerText = "Network error. Please refresh.";
    }
  }
  
  // Load orders when page opens
  loadOrders();