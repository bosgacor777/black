// ============================================================
//  server.js — Latihan 77 CBT Backend
//  Node.js + Express
// ============================================================

const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  TOKEN VALID (satu token untuk semua peserta)
// ─────────────────────────────────────────────
const TOKEN_VALID = 'XIBNCF';

// ─────────────────────────────────────────────
//  BANK SOAL (kunci jawaban HANYA di server)
// ─────────────────────────────────────────────
const SOAL_BANK = [
  {
    id      : 1,
    soal    : 'Hasil dari 2³ × 5² − 4² ÷ 2 adalah …',
    opsi    : { A: '188', B: '192', C: '192', D: '190', E: '200' },
    jawaban : 'B'
  },
  {
    id      : 2,
    soal    : 'Diketahui fungsi f(x) = 3x² − 2x + 5. Nilai f(−2) adalah …',
    opsi    : { A: '17', B: '21', C: '21', D: '25', E: '13' },
    jawaban : 'B'
  },
  {
    id      : 3,
    soal    : 'Sebuah persegi panjang memiliki panjang (2x + 3) cm dan lebar (x − 1) cm. Jika kelilingnya 26 cm, maka luas persegi panjang tersebut adalah …',
    opsi    : { A: '24 cm²', B: '28 cm²', C: '30 cm²', D: '32 cm²', E: '36 cm²' },
    jawaban : 'C'
  },
  {
    id      : 4,
    soal    : 'Deret aritmetika 3, 7, 11, 15, … Suku ke-20 dari deret tersebut adalah …',
    opsi    : { A: '75', B: '79', C: '79', D: '83', E: '71' },
    jawaban : 'B'
  },
  {
    id      : 5,
    soal    : 'Jika log 2 = 0,301 dan log 3 = 0,477, maka nilai log 72 adalah …',
    opsi    : { A: '1,756', B: '1,857', C: '1,954', D: '1,857', E: '2,000' },
    jawaban : 'B'
  },
  {
    id      : 6,
    soal    : 'Persamaan kuadrat x² − 5x + 6 = 0 memiliki akar-akar x₁ dan x₂. Nilai x₁² + x₂² adalah …',
    opsi    : { A: '11', B: '13', C: '13', D: '17', E: '25' },
    jawaban : 'B'
  },
  {
    id      : 7,
    soal    : 'Rata-rata nilai ulangan 8 siswa adalah 72. Jika seorang siswa baru masuk dengan nilai 80, maka rata-rata nilai seluruh siswa menjadi …',
    opsi    : { A: '72,5', B: '72,9', C: '73,0', D: '72,89', E: '74,0' },
    jawaban : 'D'
  },
  {
    id      : 8,
    soal    : 'Dalam sebuah kantong terdapat 5 bola merah dan 3 bola putih. Peluang terambilnya 2 bola merah sekaligus adalah …',
    opsi    : { A: '5/14', B: '10/28', C: '5/14', D: '3/28', E: '15/56' },
    jawaban : 'A'
  },
  {
    id      : 9,
    soal    : 'Nilai sin 30° + cos 60° − tan 45° adalah …',
    opsi    : { A: '0', B: '1', C: '½', D: '−1', E: '2' },
    jawaban : 'A'
  },
  {
    id      : 10,
    soal    : 'Bentuk sederhana dari √48 + √75 − √27 adalah …',
    opsi    : { A: '4√3', B: '5√3', C: '6√3', D: '3√3', E: '7√3' },
    jawaban : 'C'
  }
];

// ─────────────────────────────────────────────
//  ENDPOINT 1 — POST /api/login
//  Body: { token, nama, jk, mataUjian }
// ─────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { token, nama, jk, mataUjian } = req.body;

  // Validasi token
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Token tidak boleh kosong.' });
  }
  if (token.trim().toUpperCase() !== TOKEN_VALID) {
    return res.status(401).json({ success: false, message: 'Token tidak valid. Periksa kembali token Anda.' });
  }

  // Validasi data peserta wajib diisi
  if (!nama || nama.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama peserta tidak boleh kosong.' });
  }
  if (!jk || jk.trim() === '') {
    return res.status(400).json({ success: false, message: 'Jenis kelamin tidak boleh kosong.' });
  }
  if (!mataUjian || mataUjian.trim() === '') {
    return res.status(400).json({ success: false, message: 'Mata ujian tidak boleh kosong.' });
  }

  // Login berhasil — kembalikan data yang diinput user
  return res.json({
    success : true,
    message : 'Login berhasil.',
    peserta : {
      nama      : nama.trim().toUpperCase(),
      jk        : jk.trim(),
      mataUjian : mataUjian.trim()
    }
  });
});

// ─────────────────────────────────────────────
//  ENDPOINT 2 — GET /api/questions
//  Kunci jawaban TIDAK dikirim ke client
// ─────────────────────────────────────────────
app.get('/api/questions', (req, res) => {
  const soalTanpaKunci = SOAL_BANK.map(({ jawaban, ...soal }) => soal);
  return res.json({ success: true, data: soalTanpaKunci });
});

// ─────────────────────────────────────────────
//  ENDPOINT 3 — POST /api/submit
//  Body: { jawaban: { "1": "B", "2": "A", ... } }
// ─────────────────────────────────────────────
app.post('/api/submit', (req, res) => {
  const { jawaban } = req.body;

  if (!jawaban || typeof jawaban !== 'object') {
    return res.status(400).json({ success: false, message: 'Format jawaban tidak valid.' });
  }

  let benar  = 0;
  let salah  = 0;
  let kosong = 0;
  const detail = [];

  SOAL_BANK.forEach(soal => {
    const jawabanUser = jawaban[soal.id] || null;
    let status = 'kosong';

    if (!jawabanUser || jawabanUser === '') {
      kosong++;
      status = 'kosong';
    } else if (jawabanUser === soal.jawaban) {
      benar++;
      status = 'benar';
    } else {
      salah++;
      status = 'salah';
    }

    detail.push({
      nomorSoal    : soal.id,
      jawabanUser  : jawabanUser,
      jawabanBenar : soal.jawaban,
      status       : status
    });
  });

  const totalSoal = SOAL_BANK.length;
  const skor      = Math.round((benar / totalSoal) * 100);

  return res.json({
    success   : true,
    skor      : skor,
    benar     : benar,
    salah     : salah,
    kosong    : kosong,
    totalSoal : totalSoal,
    detail    : detail
  });
});

// ─────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   LATIHAN 77 — CBT Server Running      ║');
  console.log(`║   http://localhost:${PORT}                 ║`);
  console.log('╚════════════════════════════════════════╝');
});
