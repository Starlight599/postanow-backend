const productId = window.location.pathname.split("/").pop();

async function loadProduct() {
  const res = await fetch("/product/" + productId);
  const json = await res.json();
  const data = json.product;

  document.getElementById("name").innerText = data.name;
  document.getElementById("price").innerText = "GMD " + data.price;
  document.getElementById("stock").innerText = "Stock: " + data.stock;
}

async function order() {
  const phone = document.getElementById("phone").value.trim();
  const qtyInput = document.getElementById("qty");
  const qty = qtyInput ? parseInt(qtyInput.value || "1") : 1;

  if (!phone) {
    document.getElementById("msg").innerText = "Please enter your phone number";
    return;
  }

  if (qty <= 0) {
    document.getElementById("msg").innerText = "Invalid quantity";
    return;
  }

  document.getElementById("msg").innerText = "Getting your location…";

  if (!navigator.geolocation) {
    document.getElementById("msg").innerText =
      "Location not supported on this device";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      document.getElementById("msg").innerText = "Placing order…";

      try {
        const res = await fetch("/quick-order/" + productId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer_phone: phone,
            buyer_latitude: lat,
            buyer_longitude: lng,
            quantity: qty
          })
        });

        if (!res.ok) throw new Error();

        document.getElementById("msg").innerHTML =
          "📍 Location received<br>✅ Order placed<br>We will confirm on WhatsApp";
      } catch {
        document.getElementById("msg").innerText =
          "Network error. Please try again.";
      }
    },
    () => {
      document.getElementById("msg").innerText =
        "Please allow location to place order";
    }
  );
}

document.getElementById("orderBtn").addEventListener("click", order);
loadProduct();