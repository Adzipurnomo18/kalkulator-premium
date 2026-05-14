const result = document.getElementById("result");
const historyText = document.getElementById("history");

const paymentModal = document.getElementById("paymentModal");
const successModal = document.getElementById("successModal");
const finalResult = document.getElementById("finalResult");
const qrisImage = document.getElementById("qrisImage");
const downloadQris = document.getElementById("downloadQris");
const qrisNoteText = document.getElementById("qrisNoteText");
const requestCodeText = document.getElementById("requestCode");
const paidWhatsapp = document.getElementById("paidWhatsapp");
const accessCodeInput = document.getElementById("accessCodeInput");
const accessError = document.getElementById("accessError");
const adminWhatsappNumber = "6282281388718";

const plans = {
  single: {
    amount: "Rp2.000",
    image: "assets/2000.jpeg",
    filename: "qris-rp2000.jpeg",
  },
  premium: {
    amount: "Rp50.000",
    image: "assets/50000.jpeg",
    filename: "qris-paket-terbaik-rp50000.jpeg",
  },
};

let expression = "";
let selectedPlan = "single";
let requestCode = "000000";

document.querySelectorAll(".buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.innerText;

    if (value === "AC") {
      expression = "";
      result.innerText = "0";
      historyText.innerText = "";
      return;
    }

    if (value === "=") {
      if (!expression) return;
      selectPlan("single", false);
      preparePaymentRequest();
      paymentModal.classList.remove("hidden");
      return;
    }

    if (value === "\u00b1" || value === "%") return;

    expression += value
      .replace("\u00d7", "*")
      .replace("\u00f7", "/")
      .replace("\u2212", "-");

    historyText.innerText = expression;
    result.innerText = expression;
  });
});

function selectPlan(planName, scrollToQris = true) {
  selectedPlan = planName;
  const plan = plans[selectedPlan];

  document.querySelector(".single-plan").classList.toggle("selected", selectedPlan === "single");
  document.querySelector(".premium-plan").classList.toggle("selected", selectedPlan === "premium");

  qrisImage.src = plan.image;
  qrisImage.alt = `Kode QRIS pembayaran ${plan.amount}`;
  downloadQris.href = plan.image;
  downloadQris.download = plan.filename;
  qrisNoteText.innerText = `Pastikan nominal ${plan.amount} sesuai agar pembayaran dapat terverifikasi.`;
  accessCodeInput.value = "";
  accessError.innerText = "";
  updateWhatsappLink();

  if (scrollToQris) {
    document.querySelector(".qris-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function preparePaymentRequest() {
  requestCode = generateRequestCode();
  requestCodeText.innerText = requestCode;
  accessCodeInput.value = "";
  accessError.innerText = "";
  updateWhatsappLink();
}

function generateRequestCode() {
  if (window.crypto && window.crypto.getRandomValues) {
    const numbers = new Uint32Array(1);
    window.crypto.getRandomValues(numbers);
    return String((numbers[0] % 900000) + 100000);
  }

  return String(Math.floor(Math.random() * 900000) + 100000);
}

function makeAccessCode(code, planName) {
  const salt = planName === "premium" ? "ADZ50K" : "ADZ2K";
  const text = `${code}:${salt}:manual-approve-2026`;
  let hash = 2166136261;

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const mixed = (hash >>> 0) ^ Math.imul(Number(code), planName === "premium" ? 73 : 41);
  return String((mixed >>> 0) % 1000000).padStart(6, "0");
}

function updateWhatsappLink() {
  const plan = plans[selectedPlan];
  const message = [
    "Halo admin, saya sudah bayar.",
    "",
    `Paket: ${selectedPlan === "premium" ? "Akses Selamanya" : "Satu Kali Bayar"}`,
    `Nominal: ${plan.amount}`,
    `Kode Request: ${requestCode}`,
    `Perhitungan: ${expression}`,
    "",
    "Mohon dicek dan kirim kode akses 6 digit."
  ].join("\n");

  paidWhatsapp.href = `https://wa.me/${adminWhatsappNumber}?text=${encodeURIComponent(message)}`;
}

function unlockWithAccessCode() {
  const submittedCode = accessCodeInput.value.trim();
  const validCode = makeAccessCode(requestCode, selectedPlan);

  if (!/^\d{6}$/.test(submittedCode)) {
    accessError.innerText = "Masukkan kode akses 6 digit.";
    return;
  }

  if (submittedCode !== validCode) {
    accessError.innerText = "Kode akses salah. Pastikan paket dan kode request sesuai.";
    return;
  }

  accessError.innerText = "";
  showSuccessResult();
}

function showSuccessResult() {
  paymentModal.classList.add("hidden");

  let calculated = 0;

  try {
    calculated = eval(expression);
  } catch {
    calculated = "Error";
  }

  finalResult.innerText = calculated;
  document.querySelector(".mini").innerText = expression;

  successModal.classList.remove("hidden");
}

function simulatePayment() {
  showSuccessResult();
}

function closeSuccess() {
  successModal.classList.add("hidden");
  expression = "";
  result.innerText = "0";
  historyText.innerText = "";
}
