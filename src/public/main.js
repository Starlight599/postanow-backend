const productId = window.location.pathname.split("/").pop();

async function loadProduct() {
  const res = await fetch("/product/" + productId);
  const data = await res.json();

  document.getElementById("name").innerText = data.name;
  document.getElementById("price").innerText = "GMD " + data.price;
  document.getElementById("stock").innerText = "Stock: " + data.stock;
}

async function order() {
  const phone = document.getElementById("phone").value;

  const res = await fetch("/quick-order/" + productId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyer_phone: phone })
  });

  const text = await res.text();
  document.getElementById("msg").innerHTML = text;
}

window.order = order;
loadProduct();