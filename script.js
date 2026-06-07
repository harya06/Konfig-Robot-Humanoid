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
  const F = (base * base) / 32;          // besaran dasar dari aturan

  // Interpretasi satuan:
  const AfootMax = F;                    // cm²
  const LarmMin  = Math.sqrt(F);         // cm
  const MASS_SCALE = 0.017;              // skala massa
  const MmaxKg   = F * MASS_SCALE;       // kg

  // Simpan data untuk export CSV
  calculatedData = {
    htop: htop,
    hhead: hhead,
    hleg: hleg,
    kcom: kcom,
    hcom: hcom,
    wspreadMax: WspreadMax,
    wdownMax: WdownMax,
    afootMax: AfootMax,
    larmMin: LarmMin,
    mmaxKg: MmaxKg,
    timestamp: new Date().toLocaleString('id-ID')
  };

  // Update visual robot (termasuk tangan)
  setRobotVisual(htop, hhead, hleg, LarmMin);
  robotEl.classList.remove("robot-hidden");

  // Tampilkan hasil ke tabel
  outHtop.textContent    = fmt(htop, 2, " cm");
  outHhead.textContent   = fmt(hhead, 2, " cm");
  outHleg.textContent    = fmt(hleg, 2, " cm");
  outHcom.textContent    = fmt(hcom, 2, " cm");
  outWspread.textContent = fmt(WspreadMax, 2, " cm (maks.)");
  outWdown.textContent   = fmt(WdownMax, 2, " cm (maks.)");
  outAfoot.textContent   = fmt(AfootMax, 2, " cm²");
  outLarm.textContent    = fmt(LarmMin, 2, " cm");
  outMmax.textContent    = fmt(MmaxKg, 2, " kg");
  chipKcom.innerHTML     = `k<sub>com</sub> = ${kcom.toFixed(2)}`;

  // Update tag di visual
  tagHtop.textContent  = fmt(htop, 1, "");
  tagHhead.textContent = fmt(hhead, 1, "");
  tagHleg.textContent  = fmt(hleg, 1, "");

  // Ringkasan kanan
  summaryHtop.textContent = fmt(htop, 2, " cm");
  summaryKcom.textContent = `${kcom.toFixed(2)} × Htop`;
  summaryHleg.textContent = fmt(hleg, 2, " cm");

  const headRatio = hhead / htop;
  summaryHeadRatio.textContent =
    `${fmt(headRatio * 100, 1, "%")} dari Htop`;

  // Enable download button
  btnDownloadCSV.disabled = false;
}

// Mengatur tinggi visual robot + tangan berdasarkan hasil
function setRobotVisual(htop, hhead, hleg, LarmMin) {
  const ROBOT_PX = 260;            // tinggi robot di kanvas
  const scale = ROBOT_PX / htop;   // px per cm

  const headHeightPx  = hhead * scale;
  const legHeightPx   = hleg * scale;
  const torsoHeightPx = (htop - hleg - hhead) * scale;

  const thighHeightPx = legHeightPx / 2;
  const shinHeightPx  = legHeightPx / 2;

  // Panjang tangan total dari LarmMin
  const armTotalPx = LarmMin * scale;
  const upperArmPx = armTotalPx * 0.55;
  const foreArmPx  = armTotalPx * 0.45;

  const root = document.documentElement;

  root.style.setProperty("--robot-height",  ROBOT_PX + "px");
  root.style.setProperty("--head-height",   headHeightPx + "px");
  root.style.setProperty("--torso-height",  torsoHeightPx + "px");
  root.style.setProperty("--leg-height",    legHeightPx + "px");
  root.style.setProperty("--thigh-height",  thighHeightPx + "px");
  root.style.setProperty("--shin-height",   shinHeightPx + "px");

  root.style.setProperty("--arm-total-height",  armTotalPx + "px");
  root.style.setProperty("--upper-arm-height",  upperArmPx + "px");
  root.style.setProperty("--forearm-height",    foreArmPx + "px");
}

function resetForm() {
  document.getElementById("robotForm").reset();
  kcomInput.value = "0.55";
  resetErrors();

  const outputs = [
    outHtop, outHhead, outHleg, outHcom,
    outWspread, outWdown, outAfoot, outLarm, outMmax,
    summaryHtop, summaryKcom, summaryHeadRatio, summaryHleg
  ];
  outputs.forEach(el => el.textContent = "–");
  chipKcom.innerHTML = "k<sub>com</sub> = –";
  tagHtop.textContent  = "–";
  tagHhead.textContent = "–";
  tagHleg.textContent  = "–";

  // sembunyikan robot lagi
  robotEl.classList.add("robot-hidden");
  
  // Disable download button
  btnDownloadCSV.disabled = true;
  calculatedData = null;
}

// ====== FUNGSI DOWNLOAD CSV ======
function downloadCSV() {
  if (!calculatedData) {
    alert("Silakan hitung dimensi robot terlebih dahulu!");
    return;
  }

  // Header CSV
  const headers = [
    "Parameter",
    "Nilai",
    "Satuan",
    "Waktu Perhitungan"
  ];

  // Data rows
  const rows = [
    ["Tinggi Robot (Htop)", calculatedData.htop.toFixed(2), "cm", calculatedData.timestamp],
    ["Tinggi Kepala (Hhead)", calculatedData.hhead.toFixed(2), "cm", ""],
    ["Tinggi Kaki (Hleg)", calculatedData.hleg.toFixed(2), "cm", ""],
    ["Rasio Titik Berat (kcom)", calculatedData.kcom.toFixed(2), "-", ""],
    ["Titik Berat (Hcom)", calculatedData.hcom.toFixed(2), "cm", ""],
    ["Lebar Tangan Membentang Maks (Wspread)", calculatedData.wspreadMax.toFixed(2), "cm", ""],
    ["Lebar Tangan Turun Maks (Wdown)", calculatedData.wdownMax.toFixed(2), "cm", ""],
    ["Luas Telapak Kaki Maks (Afoot)", calculatedData.afootMax.toFixed(2), "cm²", ""],
    ["Panjang Tangan Minimum (Larm)", calculatedData.larmMin.toFixed(2), "cm", ""],
    ["Berat Robot Maksimum (Mmax)", calculatedData.mmaxKg.toFixed(2), "kg", ""]
  ];

  // Konversi ke format CSV
  let csvContent = headers.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
  });

  // Buat blob dan download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // Format nama file dengan timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `robot-humanoid-dimensi-${timestamp}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ====== EVENT LISTENERS ======
btnHitung.addEventListener("click", hitung);
btnReset.addEventListener("click", resetForm);
btnDownloadCSV.addEventListener("click", downloadCSV);

// Perhitungan otomatis saat tekan Enter
document.getElementById("robotForm").addEventListener("submit", e => {
  e.preventDefault();
  hitung();
});

// Disable download button pada awal load
btnDownloadCSV.disabled = true;