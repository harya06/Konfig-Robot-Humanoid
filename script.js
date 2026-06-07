// ====== UTILITAS FORMAT ======
function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function fmt(x, digits = 2, suffix = "") {
  if (x === null || Number.isNaN(x)) return "–";
  return x.toFixed(digits) + (suffix || "");
}

// ====== VARIABEL GLOBAL UNTUK MENYIMPAN DATA ======
let calculatedData = null;

// ====== INISIALISASI SETELAH DOM LOADED ======
document.addEventListener('DOMContentLoaded', function() {
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

  // Disable download button pada awal load
  if (btnDownloadCSV) {
    btnDownloadCSV.disabled = true;
  }

  // ====== VALIDASI INPUT ======
  function resetErrors() {
    [htopShell, hheadShell, hlegShell, kcomShell].forEach(el => {
      if (el) el.classList.remove("invalid");
    });
    [htopError, hheadError, hlegError, kcomError].forEach(el => {
      if (el) el.textContent = "";
    });
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
      if (robotEl) robotEl.classList.add("robot-hidden");
      if (btnDownloadCSV) btnDownloadCSV.disabled = true;
      calculatedData = null;
      return;
    }

    // Hcom = kcom * Htop
    const hcom = kcom * htop;

    // Lebar maksimum
    const WspreadMax = 1.5 * htop;
    const WdownMax   = 0.55 * htop;

    const base = 2.2 * hcom;
    const F = (base * base) / 32;

    // Interpretasi satuan:
    const AfootMax = F;
    const LarmMin  = Math.sqrt(F);
    const MASS_SCALE = 0.017;
    const MmaxKg   = F * MASS_SCALE;

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

    // Update visual robot
    setRobotVisual(htop, hhead, hleg, LarmMin);
    if (robotEl) robotEl.classList.remove("robot-hidden");

    // Tampilkan hasil ke tabel
    if (outHtop) outHtop.textContent = fmt(htop, 2, " cm");
    if (outHhead) outHhead.textContent = fmt(hhead, 2, " cm");
    if (outHleg) outHleg.textContent = fmt(hleg, 2, " cm");
    if (outHcom) outHcom.textContent = fmt(hcom, 2, " cm");
    if (outWspread) outWspread.textContent = fmt(WspreadMax, 2, " cm (maks.)");
    if (outWdown) outWdown.textContent = fmt(WdownMax, 2, " cm (maks.)");
    if (outAfoot) outAfoot.textContent = fmt(AfootMax, 2, " cm²");
    if (outLarm) outLarm.textContent = fmt(LarmMin, 2, " cm");
    if (outMmax) outMmax.textContent = fmt(MmaxKg, 2, " kg");
    if (chipKcom) chipKcom.innerHTML = `k<sub>com</sub> = ${kcom.toFixed(2)}`;

    // Update tag di visual
    if (tagHtop) tagHtop.textContent = fmt(htop, 1, "");
    if (tagHhead) tagHhead.textContent = fmt(hhead, 1, "");
    if (tagHleg) tagHleg.textContent = fmt(hleg, 1, "");

    // Ringkasan kanan
    if (summaryHtop) summaryHtop.textContent = fmt(htop, 2, " cm");
    if (summaryKcom) summaryKcom.textContent = `${kcom.toFixed(2)} × Htop`;
    if (summaryHleg) summaryHleg.textContent = fmt(hleg, 2, " cm");

    const headRatio = hhead / htop;
    if (summaryHeadRatio) {
      summaryHeadRatio.textContent = `${fmt(headRatio * 100, 1, "%")} dari Htop`;
    }

    // Enable download button
    if (btnDownloadCSV) btnDownloadCSV.disabled = false;

    console.log("Perhitungan berhasil!", calculatedData);
  }

  // Mengatur tinggi visual robot
  function setRobotVisual(htop, hhead, hleg, LarmMin) {
    const ROBOT_PX = 260;
    const scale = ROBOT_PX / htop;

    const headHeightPx  = hhead * scale;
    const legHeightPx   = hleg * scale;
    const torsoHeightPx = (htop - hleg - hhead) * scale;

    const thighHeightPx = legHeightPx / 2;
    const shinHeightPx  = legHeightPx / 2;

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
    const form = document.getElementById("robotForm");
    if (form) form.reset();
    if (kcomInput) kcomInput.value = "0.55";
    resetErrors();

    const outputs = [
      outHtop, outHhead, outHleg, outHcom,
      outWspread, outWdown, outAfoot, outLarm, outMmax,
      summaryHtop, summaryKcom, summaryHeadRatio, summaryHleg
    ];
    outputs.forEach(el => {
      if (el) el.textContent = "–";
    });
    
    if (chipKcom) chipKcom.innerHTML = "k<sub>com</sub> = –";
    if (tagHtop) tagHtop.textContent = "–";
    if (tagHhead) tagHhead.textContent = "–";
    if (tagHleg) tagHleg.textContent = "–";

    if (robotEl) robotEl.classList.add("robot-hidden");
    if (btnDownloadCSV) btnDownloadCSV.disabled = true;
    calculatedData = null;
  }

  // ====== FUNGSI DOWNLOAD CSV (DIPERBAIKI) ======
  function downloadCSV() {
    console.log("Download CSV clicked", calculatedData);
    
    if (!calculatedData) {
      alert("Silakan hitung dimensi robot terlebih dahulu!");
      return;
    }

    try {
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

      // Konversi ke format CSV dengan encoding yang benar
      let csvContent = "\uFEFF"; // BOM untuk UTF-8
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      // Format nama file dengan timestamp
      const now = new Date();
      const timestamp = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + '-' +
                       String(now.getHours()).padStart(2, '0') + 
                       String(now.getMinutes()).padStart(2, '0') + 
                       String(now.getSeconds()).padStart(2, '0');
      
      const filename = `robot-humanoid-dimensi-${timestamp}.csv`;

      // Metode 1: Menggunakan Blob (lebih kompatibel)
      if (window.Blob && window.URL) {
        const blob = new Blob([csvContent], { 
          type: 'text/csv;charset=utf-8;' 
        });
        
        const link = document.createElement("a");
        
        if (navigator.msSaveBlob) { 
          // IE 10+
          navigator.msSaveBlob(blob, filename);
        } else {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = filename;
          link.style.visibility = 'hidden';
          
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          setTimeout(function() {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }
        
        console.log("CSV downloaded successfully");
      } else {
        // Fallback untuk browser lama
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.href = dataUri;
        link.download = filename;
        link.click();
      }
      
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Terjadi kesalahan saat mengunduh file CSV. Silakan coba lagi.");
    }
  }

  // ====== EVENT LISTENERS ======
  if (btnHitung) {
    btnHitung.addEventListener("click", function(e) {
      e.preventDefault();
      hitung();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", function(e) {
      e.preventDefault();
      resetForm();
    });
  }

  if (btnDownloadCSV) {
    btnDownloadCSV.addEventListener("click", function(e) {
      e.preventDefault();
      downloadCSV();
    });
  }

  // Form submit handler
  const form = document.getElementById("robotForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      hitung();
    });
  }

  console.log("Script loaded successfully");
});