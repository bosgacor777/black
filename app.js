/* ============================================================
   app.js — Latihan 77 CBT Frontend Logic
   Vanilla JavaScript SPA
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
//  STATE APLIKASI
// ─────────────────────────────────────────────
const STATE = {
  peserta      : null,
  soalList     : [],
  jawabanUser  : {},
  raguan       : new Set(),
  currentIndex : 0,
  timer        : null,
  sisaDetik    : 90 * 60,
  sudahSubmit  : false
};

// ─────────────────────────────────────────────
//  DOM HELPERS
// ─────────────────────────────────────────────
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

function showPage(id) {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const page = $(id);
  if (!page) return;
  page.style.display = 'flex';
  page.classList.add('active');
}

function showLoading(text = 'Memproses...') {
  const el = $('#loading-text');
  if (el) el.textContent = text;
  const overlay = $('#loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = $('#loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function showError(msg) {
  const el = $('#login-error-text');
  if (el) el.textContent = msg;
  const box = $('#login-error');
  if (box) box.classList.remove('hidden');
}

function hideError() {
  const box = $('#login-error');
  if (box) box.classList.add('hidden');
}

function enableBtn() {
  const btn = $('#btn-mulai');
  if (btn) btn.disabled = false;
}

function disableBtn() {
  const btn = $('#btn-mulai');
  if (btn) btn.disabled = true;
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showPage('#page-login');
  enableBtn(); // pastikan tombol aktif dari awal
  bindLoginEvents();
});

// ─────────────────────────────────────────────
//  HALAMAN 1: LOGIN
// ─────────────────────────────────────────────
function bindLoginEvents() {
  const btnMulai   = $('#btn-mulai');
  const tokenInput = $('#f-token');
  const namaInput  = $('#f-nama');

  if (!btnMulai) {
    console.error('Tombol #btn-mulai tidak ditemukan!');
    return;
  }

  // Pakai onclick agar tidak terjadi double-binding
  btnMulai.onclick = handleLogin;

  if (tokenInput) {
    tokenInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
    tokenInput.addEventListener('input', () => {
      const pos = tokenInput.selectionStart;
      tokenInput.value = tokenInput.value.toUpperCase();
      tokenInput.setSelectionRange(pos, pos);
    });
  }

  if (namaInput) {
    namaInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
    namaInput.addEventListener('blur', () => {
      namaInput.value = namaInput.value.trim().toUpperCase();
    });
  }
}

async function handleLogin() {
  const namaEl  = $('#f-nama');
  const jkEl    = $('#f-jk');
  const mapelEl = $('#f-mapel');
  const tokenEl = $('#f-token');

  if (!namaEl || !jkEl || !mapelEl || !tokenEl) {
    showError('Terjadi kesalahan form. Coba refresh halaman.');
    return;
  }

  const nama      = namaEl.value.trim();
  const jk        = jkEl.value;
  const mataUjian = mapelEl.value;
  const token     = tokenEl.value.trim();

  if (!nama) {
    showError('Nama lengkap tidak boleh kosong.');
    namaEl.focus();
    return;
  }
  if (!jk) {
    showError('Pilih jenis kelamin terlebih dahulu.');
    jkEl.focus();
    return;
  }
  if (!mataUjian) {
    showError('Pilih mata ujian terlebih dahulu.');
    mapelEl.focus();
    return;
  }
  if (!token) {
    showError('Masukkan token ujian terlebih dahulu.');
    tokenEl.focus();
    return;
  }

  hideError();
  disableBtn();
  showLoading('Memverifikasi token...');

  try {
    const res  = await fetch('/api/login', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ token, nama, jk, mataUjian })
    });

    const data = await res.json();

    if (!data.success) {
      hideLoading();
      enableBtn();
      showError(data.message || 'Token tidak valid. Periksa kembali.');
      return;
    }

    STATE.peserta = data.peserta;
    await loadSoal();

  } catch (err) {
    hideLoading();
    enableBtn();
    showError('Gagal terhubung ke server. Periksa koneksi Anda.');
    console.error('Login error:', err);
  }
}

async function loadSoal() {
  showLoading('Memuat soal...');

  try {
    const res  = await fetch('/api/questions');
    const data = await res.json();

    if (!data.success || !data.data || !data.data.length) {
      hideLoading();
      enableBtn();
      showError('Gagal memuat soal. Coba lagi.');
      return;
    }

    STATE.soalList = data.data;
    initUjianPage();
    hideLoading();

  } catch (err) {
    hideLoading();
    enableBtn();
    showError('Gagal mengambil soal dari server.');
    console.error('Load soal error:', err);
  }
}

// ─────────────────────────────────────────────
//  HALAMAN 2: UJIAN
// ─────────────────────────────────────────────
function initUjianPage() {
  const p = STATE.peserta;

  const header = $('#main-header');
  if (header) {
    header.classList.remove('hidden');
    header.style.display = 'flex';
  }

  const headerNama   = $('#header-nama');
  const headerAvatar = $('#header-avatar');
  if (headerNama)   headerNama.textContent   = p.nama;
  if (headerAvatar) headerAvatar.textContent = p.nama.charAt(0).toUpperCase();

  const infoMapel = $('#info-mapel-text');
  const infoTotal = $('#info-total-text');
  const soalTotal = $('#soal-total-label');
  if (infoMapel) infoMapel.textContent = p.mataUjian;
  if (infoTotal) infoTotal.textContent = STATE.soalList.length + ' Soal';
  if (soalTotal) soalTotal.textContent = 'dari ' + STATE.soalList.length;

  renderSoal(0);
  bindUjianEvents();
  startTimer();
  showPage('#page-ujian');
}

function renderSoal(index) {
  const soal       = STATE.soalList[index];
  const total      = STATE.soalList.length;
  const jawabanIni = STATE.jawabanUser[soal.id] || null;
  const isRagu     = STATE.raguan.has(soal.id);

  STATE.currentIndex = index;

  const nomorEl = $('#soal-nomor-display');
  if (nomorEl) nomorEl.textContent = index + 1;

  const fillEl = $('#soal-progress-fill');
  if (fillEl)  fillEl.style.width = ((index + 1) / total * 100).toFixed(1) + '%';

  const soalText = $('#soal-text');
  if (soalText) soalText.textContent = soal.soal;

  const opsiList = $('#opsi-list');
  if (opsiList) {
    opsiList.innerHTML = '';
    Object.entries(soal.opsi).forEach(([key, val]) => {
      const item = document.createElement('div');
      item.className = 'opsi-item' + (jawabanIni === key ? ' selected' : '');
      item.dataset.key = key;
      item.innerHTML = `
        <div class="opsi-huruf">${key}</div>
        <div class="opsi-teks">${escapeHtml(val)}</div>
      `;
      item.addEventListener('click', () => pilihJawaban(soal.id, key));
      opsiList.appendChild(item);
    });
  }

  const ragsCheck = $('#ragu-checkbox');
  if (ragsCheck) {
    if (isRagu) ragsCheck.classList.add('checked');
    else        ragsCheck.classList.remove('checked');
  }

  const btnPrev = $('#btn-prev');
  if (btnPrev) btnPrev.disabled = (index === 0);

  const btnNext = $('#btn-next');
  if (btnNext) {
    if (index === total - 1) {
      btnNext.classList.add('btn-selesai');
      btnNext.innerHTML = `<span>Selesai</span><svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;
    } else {
      btnNext.classList.remove('btn-selesai');
      btnNext.innerHTML = `<span>Selanjutnya</span><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  }

  const modalDaftar = $('#modal-daftar');
  if (modalDaftar && !modalDaftar.classList.contains('hidden')) {
    renderModalGrid();
  }
}

function pilihJawaban(soalId, key) {
  if (STATE.jawabanUser[soalId] === key) delete STATE.jawabanUser[soalId];
  else STATE.jawabanUser[soalId] = key;
  renderSoal(STATE.currentIndex);
}

function toggleRagu() {
  const soalId = STATE.soalList[STATE.currentIndex].id;
  if (STATE.raguan.has(soalId)) STATE.raguan.delete(soalId);
  else STATE.raguan.add(soalId);
  renderSoal(STATE.currentIndex);
}

function bindUjianEvents() {
  const btnPrev          = $('#btn-prev');
  const btnNext          = $('#btn-next');
  const btnRagu          = $('#btn-ragu');
  const btnDaftar        = $('#btn-daftar-soal');
  const btnSelesaiModal  = $('#btn-selesai-modal');
  const btnConfirmCancel = $('#btn-confirm-cancel');
  const btnConfirmOk     = $('#btn-confirm-ok');

  if (btnPrev) btnPrev.onclick = () => {
    if (STATE.currentIndex > 0) renderSoal(STATE.currentIndex - 1);
  };
  if (btnNext) btnNext.onclick = () => {
    const isLast = STATE.currentIndex === STATE.soalList.length - 1;
    if (isLast) openConfirmSelesai();
    else renderSoal(STATE.currentIndex + 1);
  };
  if (btnRagu)          btnRagu.onclick          = toggleRagu;
  if (btnDaftar)        btnDaftar.onclick        = openDaftarSoal;
  if (btnSelesaiModal)  btnSelesaiModal.onclick  = () => { closeDaftarSoal(); setTimeout(openConfirmSelesai, 150); };
  if (btnConfirmCancel) btnConfirmCancel.onclick = closeConfirm;
  if (btnConfirmOk)     btnConfirmOk.onclick     = () => { closeConfirm(); submitUjian(); };
}

// ─────────────────────────────────────────────
//  TIMER
// ─────────────────────────────────────────────
function startTimer() {
  updateTimerDisplay();
  STATE.timer = setInterval(() => {
    STATE.sisaDetik--;
    updateTimerDisplay();
    if (STATE.sisaDetik <= 0) {
      clearInterval(STATE.timer);
      submitUjian(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const s   = STATE.sisaDetik;
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const el  = $('#timer-display');
  const box = $('#timer-box');
  if (el)  el.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
  if (box) {
    box.classList.remove('warning', 'danger');
    if (s <= 300)      box.classList.add('danger');
    else if (s <= 900) box.classList.add('warning');
  }
}

function pad(n) { return String(n).padStart(2, '0'); }

// ─────────────────────────────────────────────
//  MODAL DAFTAR SOAL
// ─────────────────────────────────────────────
function openDaftarSoal() {
  renderModalGrid();
  const overlay = $('#modal-overlay');
  const modal   = $('#modal-daftar');
  if (overlay) overlay.classList.remove('hidden');
  if (modal)   modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDaftarSoal() {
  const overlay = $('#modal-overlay');
  const modal   = $('#modal-daftar');
  if (overlay) overlay.classList.add('hidden');
  if (modal)   modal.classList.add('hidden');
  document.body.style.overflow = '';
}

window.closeDaftarSoal = closeDaftarSoal;

function renderModalGrid() {
  const grid    = $('#modal-grid');
  const total   = STATE.soalList.length;
  const dijawab = Object.keys(STATE.jawabanUser).length;
  if (!grid) return;

  grid.innerHTML = '';
  STATE.soalList.forEach((soal, i) => {
    const btn       = document.createElement('button');
    btn.textContent = i + 1;
    btn.className   = 'grid-soal-btn';

    const isDijawab = !!STATE.jawabanUser[soal.id];
    const isRagu    = STATE.raguan.has(soal.id);
    const isAktif   = i === STATE.currentIndex;

    if (isAktif)        btn.classList.add('gs-aktif');
    else if (isRagu)    btn.classList.add('gs-ragu');
    else if (isDijawab) btn.classList.add('gs-dijawab');

    btn.onclick = () => { closeDaftarSoal(); setTimeout(() => renderSoal(i), 100); };
    grid.appendChild(btn);
  });

  const progressText = $('#modal-progress-text');
  if (progressText) progressText.textContent = `${dijawab} dari ${total} soal dijawab`;
}

// ─────────────────────────────────────────────
//  KONFIRMASI SELESAI
// ─────────────────────────────────────────────
function openConfirmSelesai() {
  const total   = STATE.soalList.length;
  const dijawab = Object.keys(STATE.jawabanUser).length;
  const sisa    = total - dijawab;

  const msg = sisa === 0
    ? `Semua ${total} soal sudah dijawab. Apakah Anda yakin ingin mengakhiri dan mengumpulkan jawaban?`
    : `Masih ada ${sisa} soal yang belum dijawab dari total ${total} soal. Apakah Anda yakin ingin mengakhiri ujian?`;

  const confirmText    = $('#confirm-text');
  const confirmOverlay = $('#confirm-overlay');
  const confirmModal   = $('#confirm-modal');
  if (confirmText)    confirmText.textContent = msg;
  if (confirmOverlay) confirmOverlay.classList.remove('hidden');
  if (confirmModal)   confirmModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeConfirm() {
  const confirmOverlay = $('#confirm-overlay');
  const confirmModal   = $('#confirm-modal');
  if (confirmOverlay) confirmOverlay.classList.add('hidden');
  if (confirmModal)   confirmModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────────
//  SUBMIT UJIAN
// ─────────────────────────────────────────────
async function submitUjian(autoSubmit = false) {
  if (STATE.sudahSubmit) return;
  STATE.sudahSubmit = true;

  clearInterval(STATE.timer);
  showLoading('Mengumpulkan jawaban...');

  const payload = {};
  STATE.soalList.forEach(soal => {
    payload[soal.id] = STATE.jawabanUser[soal.id] || '';
  });

  try {
    const res  = await fetch('/api/submit', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ jawaban: payload })
    });

    const data = await res.json();
    hideLoading();

    if (!data.success) {
      alert('Terjadi kesalahan saat mengumpulkan jawaban.');
      STATE.sudahSubmit = false;
      return;
    }

    renderHasil(data);

  } catch (err) {
    hideLoading();
    alert('Gagal mengirim jawaban. Coba lagi.');
    STATE.sudahSubmit = false;
    console.error('Submit error:', err);
  }
}

// ─────────────────────────────────────────────
//  HALAMAN 3: HASIL
// ─────────────────────────────────────────────
function renderHasil(data) {
  const hasilNama = $('#hasil-nama-display');
  if (hasilNama) hasilNama.textContent = STATE.peserta.nama + ' — ' + STATE.peserta.mataUjian;

  animateNumber('#skor-angka',  0, data.skor,   1200);
  animateNumber('#stat-benar',  0, data.benar,  900);
  animateNumber('#stat-salah',  0, data.salah,  900);
  animateNumber('#stat-kosong', 0, data.kosong, 900);

  const circle    = $('#skor-circle');
  const skorAngka = $('#skor-angka');
  if (circle && skorAngka) {
    if (data.skor >= 75) {
      circle.style.borderColor = 'var(--green)';
      skorAngka.style.color    = 'var(--green)';
    } else if (data.skor >= 50) {
      circle.style.borderColor = 'var(--yellow)';
      skorAngka.style.color    = '#F57F17';
    } else {
      circle.style.borderColor = 'var(--red)';
      skorAngka.style.color    = 'var(--red)';
    }
  }

  const detailList = $('#detail-list');
  if (detailList) {
    detailList.innerHTML = '';
    data.detail.forEach(item => {
      const div         = document.createElement('div');
      div.className     = `detail-item ${item.status}`;
      const jawabanText = item.jawabanUser || '—';
      const badge       = `<span class="detail-badge badge-${item.status}">${item.status.toUpperCase()}</span>`;
      const kunci       = item.status !== 'benar'
        ? `<span class="detail-kunci">Kunci: <strong>${item.jawabanBenar}</strong></span>`
        : '';
      div.innerHTML = `
        <span class="detail-no">No.${item.nomorSoal}</span>
        <span class="detail-jawaban-user">Jawaban: ${escapeHtml(jawabanText)}</span>
        ${badge}${kunci}
      `;
      detailList.appendChild(div);
    });
  }

  showPage('#page-hasil');
}

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function animateNumber(selector, from, to, duration) {
  const el = $(selector);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * easeOut(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─────────────────────────────────────────────
//  KEYBOARD SHORTCUT
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const pageUjian = $('#page-ujian');
  if (!pageUjian || !pageUjian.classList.contains('active')) return;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown':
      if (STATE.currentIndex < STATE.soalList.length - 1) renderSoal(STATE.currentIndex + 1);
      break;
    case 'ArrowLeft': case 'ArrowUp':
      if (STATE.currentIndex > 0) renderSoal(STATE.currentIndex - 1);
      break;
    case '1': case 'a': case 'A': pilihOpsiByKey('A'); break;
    case '2': case 'b': case 'B': pilihOpsiByKey('B'); break;
    case '3': case 'c': case 'C': pilihOpsiByKey('C'); break;
    case '4': case 'd': case 'D': pilihOpsiByKey('D'); break;
    case '5': case 'e': case 'E': pilihOpsiByKey('E'); break;
  }
});

function pilihOpsiByKey(key) {
  const soal = STATE.soalList[STATE.currentIndex];
  if (soal && soal.opsi[key] !== undefined) pilihJawaban(soal.id, key);
}
