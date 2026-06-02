# 🤖 Konfigurator Dimensi Robot Humanoid

Web interaktif untuk **merancang dimensi robot humanoid** sesuai dengan
spesifikasi lomba (berdasarkan dokumen *Spesifikasi Robot*).

Aplikasi ini membantu Anda:

- Memasukkan parameter input: `Htop`, `Hhead`, `Hleg`, dan `kcom`.
- Memvalidasi input terhadap aturan (rentang nilai yang diizinkan).
- Menghitung parameter turunan:
  - `Hcom` (titik berat)
  - `Wspread` dan `Wdown` (lebar maksimum robot)
  - Luas telapak kaki maksimum
  - Panjang tangan minimum
  - Berat robot maksimum
- Menampilkan **pratinjau skematik** robot yang ukurannya mengikuti
  input dan hasil perhitungan (kepala, badan, kaki, dan tangan).

---

## 📂 Struktur File

```
.
├── index.html   # Seluruh program (HTML + CSS + JS dalam satu file)
└── README.md    # File ini
```

Karena semua kode ada di dalam `index.html`, tidak ada proses build
atau instalasi paket tambahan. Cukup buka file tersebut di browser
modern apa pun (Chrome, Edge, Firefox, Safari).

---

## 🚀 Cara Menjalankan

### Opsi 1 — Buka langsung

1. Download / clone repository ini.
2. Klik dua kali `index.html`, atau buka dengan cara:
   - **Klik kanan → Open with → Browser pilihan Anda**, atau
   - Drag & drop file `index.html` ke jendela browser.
3. Tidak butuh server lokal. Web langsung bisa dipakai.

### Opsi 2 — Menggunakan server lokal (opsional)

Jika Anda ingin efek *hot reload* saat mengubah kode, bisa pakai
server statis sederhana, misalnya:

```bash
# Menggunakan Python 3
python -m http.server 8000

# Atau menggunakan Node.js + http-server
npx http-server .
```

Lalu buka di browser:

```
http://localhost:8000/index.html
```

---

## 🧮 Panduan Penggunaan

1. Isi parameter input di **panel kiri**:
   - **H<sub>top</sub>** &mdash; Tinggi total robot (cm).  
     Batas: `40 ≤ Htop ≤ 100`.
   - **H<sub>head</sub>** &mdash; Tinggi kepala (cm).  
     Batas: `0.05·Htop ≤ Hhead ≤ 0.25·Htop`.
   - **H<sub>leg</sub>** &mdash; Tinggi kaki (cm).  
     Diukur dari telapak kaki sampai batas pinggang.
   - **k<sub>com</sub>** &mdash; Rasio titik berat (tanpa satuan).  
     Dipakai untuk menghitung `Hcom = kcom·Htop`.  
     Disarankan nilai antara `0.1` dan `0.9` (default `0.55`).
2. Klik tombol **Hitung Dimensi**.
   - Jika ada input yang tidak valid, kolom input akan berwarna merah
     dan muncul pesan kesalahan; pratinjau robot tidak akan tampil.
   - Jika valid, tabel **Ringkasan Hasil Perhitungan** akan terisi,
     dan **pratinjau skematik** robot akan muncul di panel kanan.
3. (Opsional) Klik **Reset** untuk membersihkan form dan menyembunyikan
   ulang pratinjau robot.

---

## 📐 Rumus yang Digunakan

| Parameter | Rumus | Keterangan |
|---|---|---|
| Batas H<sub>top</sub> | `40 ≤ Htop ≤ 100` | Tinggi total robot (cm) |
| Batas H<sub>head</sub> | `0.05·Htop ≤ Hhead ≤ 0.25·Htop` | Tinggi kepala (cm) |
| Titik berat | `Hcom = kcom·Htop` | kcom dipilih desainer (default 0.55) |
| Lebar tangan membentang | `Wspread ≤ 1.5·Htop` | Batas lebar maksimum |
| Lebar tangan turun | `Wdown ≤ 0.55·Htop` | Batas lebar maksimum |
| Fungsi dasar | `F = (2.2·Hcom)² / 32` | Besaran turunan (cm²) |
| Luas telapak kaki maks. | `Afoot,max = F` | cm² |
| Panjang tangan minimum | `Larm,min = √F` | cm |
| Berat robot maksimum | `Mmax = F · 0.017` | kg (skala dikalibrasi ≈ 4–6 kg untuk Htop 80 cm) |

> Catatan: Faktor `0.017` untuk mengubah `F` ke kilogram adalah
> pendekatan empiris agar hasil sesuai dengan berat robot humanoid
> kontes (± 4–6 kg pada tinggi 80 cm). Jika Anda memiliki acuan
> resmi dari panitia, cukup ubah konstanta `MASS_SCALE` di
> dalam fungsi `hitung()`.

---

## 🖼️ Pratinjau Skematik

Pratinjau di panel kanan akan:

- **Tersembunyi** sampai ada perhitungan valid.
- **Muncul** dengan ukuran proporsional terhadap input `Htop`,
  `Hhead`, `Hleg`, dan hasil `LarmMin`:
  - Kepala = `Hhead · scale`
  - Badan = `(Htop - Hleg - Hhead) · scale`
  - Kaki (paha + betis) = `Hleg · scale`
  - Tangan (lengan atas + lengan bawah) = `LarmMin · scale`
- **Berubah mengikuti input** setiap kali tombol **Hitung Dimensi**
  ditekan.

Variabel CSS (`--robot-height`, `--head-height`, `--leg-height`,
`--arm-total-height`, dll.) diatur oleh fungsi `setRobotVisual()`
setiap kali ada perhitungan baru.

---

## 🎨 Tampilan & Desain

- **Tema gelap futuristik** (biru–ungu) menggunakan gradien radial.
- **Tata letak dua panel**:
  - **Kiri** &mdash; form input + tabel hasil.
  - **Kanan** &mdash; pratinjau skematik robot + ringkasan.
- **Responsif** untuk layar kecil: di bawah 900px, panel ditumpuk
  vertikal.
- **Tipografi** menggunakan system font stack agar konsisten
  di semua OS.

---

## 🛠️ Kustomisasi yang Mungkin Anda Butuhkan

| Yang ingin diubah | Lokasi di `index.html` |
|---|---|
| Konstanta kalibrasi berat (kg) | `MASS_SCALE` di fungsi `hitung()` |
| Ukuran gambar robot di kanvas (px) | `ROBOT_PX` di fungsi `setRobotVisual()` |
| Skala paha vs betis | `thighHeightPx` & `shinHeightPx` |
| Skala lengan atas vs lengan bawah | `upperArmPx` & `foreArmPx` |
| Warna tema | Blok CSS `:root` dan gradien di `body` / `panel-right` |

---

## 📋 Daftar Rumus Ringkas (untuk dokumentasi / laporan)

```
Input:
  Htop   : tinggi total robot        (cm)
  Hhead  : tinggi kepala             (cm)
  Hleg   : tinggi kaki               (cm)
  kcom   : rasio titik berat         (–)

Konsistensi:
  40 ≤ Htop ≤ 100
  0.05·Htop ≤ Hhead ≤ 0.25·Htop
  0 < Hleg < Htop
  0 < kcom < 1

Turunan:
  Hcom        = kcom · Htop
  Wspread_max = 1.5 · Htop
  Wdown_max   = 0.55 · Htop
  F           = (2.2·Hcom)² / 32
  Afoot_max   = F               (cm²)
  Larm_min    = √F              (cm)
  Mmax        = F · 0.017       (kg)
```

---

## ✅ Catatan

- Web ini adalah **alat bantu desain**, bukan penentu lolos/tidaknya
  robot di kontes. Nilai akhirnya tetap harus diverifikasi oleh
  panitia ketika pengukuran di lapangan.
- Satuan yang dipakai mengikuti tabel spesifikasi: **cm untuk
  panjang, cm² untuk luas, kg untuk massa**. Konstanta `0.017`
  untuk massa dapat Anda sesuaikan bila perlu.
- Tidak ada data yang dikirim ke server; semua perhitungan terjadi
  di sisi browser (client-side).

---