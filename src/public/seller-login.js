let currentPhone = null;

async function requestOTP() {
  const phone = document.getElementById("phone").value.trim();

  if (!phone) {
    document.getElementById("msg").innerText = "Enter phone number";
    return;
  }

  currentPhone = phone;

  document.getElementById("otpSection").style.display = "block";
  document.getElementById("msg").innerText = "Code sent (check server logs)";

  try {
    await fetch("/auth/request-otp", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ phone })
    });
  } catch {}
}

async function verifyOTP() {
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    document.getElementById("msg").innerText = "Enter code";
    return;
  }

  document.getElementById("msg").innerText = "Verifying...";

  try {
    const res = await fetch("/auth/verify-otp", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        phone: currentPhone,
        code: otp
      })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("msg").innerText =
        data.error || "Invalid code";
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "/seller-orders.html";

  } catch {
    document.getElementById("msg").innerText = "Network error";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("sendCodeBtn")
    .addEventListener("click", requestOTP);

  document
    .getElementById("verifyBtn")
    .addEventListener("click", verifyOTP);
});