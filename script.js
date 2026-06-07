// ====== UTILITAS FORMAT ======
function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function fmt(x, digits = 2, suffix = "") {
  if (x === null || Number.isNaN(x)) return "–";
  return x.toFixed(digits) + (suffix || "");
}

// ====== REFERENSI ELEMENT ======
const htopInput  = document.getElementById("htop");
const hheadInput = document.getElementById("hhead");
const hlegInput  = document.getElementById("hleg");
const kcomInput  = document.getElementById("kcom");

const htopShell  = document.getElementById("htopShell");
const hheadShell = document.getElementById("hheadShell");
const hlegShell  = document.getElementById("hlegShell");
const kcomShell  = document.getElementById("kcomShell");

const htopError  = document.getElementById("htopError");
const hheadError = document.getElementById("hheadError");
const hlegError  = document.getElementById("hlegError");
const kcomError  = document.getElementById("kcomError");

const outHtop   = document.getElementById("outHtop");
const outHhead  = document.getElementById("outHhead");
const outHleg   = document.getElementById("outHleg");
const outHcom   = document.getElementById("outHcom");
const outWspread= document.getElementById("outWspread");
const outWdown  = document.getElementById("outWdown");
const outAfoot  = document.getElementById("outAfoot");
const outLarm   = document.getElementById("outLarm");
const outMmax   = document.getElementById("outMmax");
const chipKcom  = document.getElementById("chipKcom");

const tagHtop   = document.getElementById("tagHtop");
const tagHhead  = document.getElementById("tagHhead");
const tagHleg   = document.getElementById("tagHleg");

const summaryHtop      = document.getElementById("summaryHtop");
const summaryKcom      = document.getElementById("summaryKcom");
const summaryHeadRatio = document.getElementById("summaryHeadRatio");
const summaryHleg      = document.getElementById("summaryHleg");

const btnHitung = document.getElementById("btnHitung");
const btnReset  = document.getElementById("btnReset");
const btnDownloadCSV = document.getElementById("btnDownloadCSV");

const robotEl   = document.querySelector(".robot");

// ====== VARIABEL GLOBAL UNTUK MENYIMPAN DATA ======
let calculatedData = null;

// ====== VALIDASI INPUT ======
function resetErrors() {
  [htopShell, hheadShell, hlegShell, kcomShell].forEach(el => el.classList.remove("invalid"));
  [htopError, hheadError, hlegError, kcomError].forEach(el => el.textContent = "");
}

function validateInputs() {
  resetErrors();

  const htop  = toNumber(htopInput.value);
  const hhead = toNumber(hheadInput.value);
  const hleg  = toNumber(hlegInput.value);
  const kcom  = toNumber(kcomInput.value);

  let valid = true;

  // Htop
  if (htop === null) {
    valid = false;
    htopShell.classList.add("invalid");
    htopError.textContent = "Masukkan nilai tinggi robot.";
  } else if (htop < 40 || htop > 100) {
    valid = false;
    htopShell.classList.add("invalid");
    htopError.textContent = "Htop harus berada pada 40–100 cm.";
  }

  // Hhead
  if (hhead === null) {
    valid = false;
    hheadShell.classList.add("invalid");
    hheadError.textContent = "Masukkan tinggi kepala.";
  } else if (htop != null) {
    const minHead = 0.05 * htop;
    const maxHead = 0.25 * htop;
    if (hhead < minHead || hhead > maxHead) {
      valid = false;
      hheadShell.classList.add("invalid");
      hheadError.textContent =
        `Hhead harus di antara ${minHead.toFixed(2)} cm dan ${maxHead.toFixed(2)} cm.`;
    }
  }

  // Hleg
  if (hleg === null) {
    valid = false;
    hlegShell.classList.add("invalid");
    hlegError.textContent = "Masukkan tinggi kaki.";
  } else if (hleg <= 0) {
    valid = false;
    hlegShell.classList.add("invalid");
    hlegError.textContent = "Hleg harus lebih besar dari 0.";
  } else if (htop != null && hleg > htop) {
    valid = false;
    hlegShell.classList.add("invalid");
    hlegError.textContent = "Hleg tidak boleh melebihi Htop.";
  }

  // kcom
  if (kcom === null) {
    valid = false;
    kcomShell.classList.add("invalid");
    kcomError.textContent = "Masukkan nilai rasio kcom.";
  } else if (kcom <= 0 || kcom >= 1) {
    valid = false;
    kcomShell.classList.add("invalid");
    kcomError.textContent = "kcom sebaiknya antara 0.1 dan 0.9.";
  }

  return { valid, htop, hhead, hleg, kcom };
}

// ====== PERHITUNGAN RUMUS ======
function hitung() {
  const { valid, htop, hhead, hleg, kcom } = validateInputs();
  if (!valid) {
    robotEl.classList.add("robot-hidden");
    btnDownloadCSV.disabled = true;
    calculatedData = null;
    return;
  }

  // Hcom = kcom * Htop
  const hcom = kcom * htop;

  // Lebar maksimum
  const WspreadMax = 1.5 * htop;
  const WdownMax   = 0.55 * htop;

  const base = 2.2 * hcom;
  const F = (base * base) / 32;          // besaran dasar dari 