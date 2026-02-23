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

  if (!phone) {
    document.getElementById("msg").innerText = "Please enter your phone number";
    return;
  }

  document.getElementById("msg").innerText = "Placing order…";

  try {
    const res = await fetch("/quick-order/" + productId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyer_phone: phone })
    });

    if (!res.ok) {
      throw new Error("Order failed");
    }

    document.getElementById("msg").innerHTML =
      "✅ Order received<br>We will contact you on WhatsApp shortly";
  } catch (err) {
    document.getElementById("msg").innerText =
      "Network error. Please try again.";
  }
}

document.getElementById("orderBtn").addEventListener("click", order);

loadProduct();