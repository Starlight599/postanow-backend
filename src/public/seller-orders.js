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
        .map(
          (o) => `
          <div class="order">
            <div class="name">${o.product_name}</div>
            <div>Amount: GMD ${o.total_amount}</div>
            <div>Status: <span class="status">${o.status}</span></div>
          </div>
        `
        )
        .join("");
    } catch (err) {
      container.innerText = "Network error. Please refresh.";
    }
  }
  
  // Load orders when page opens
  loadOrders();