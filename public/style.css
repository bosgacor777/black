/* ============================================================
   style.css — Latihan 77 CBT
   Design: Clean Government-Grade, ANBK-style
   ============================================================ */

/* ─── CSS VARIABLES ─── */
:root {
  --blue-primary   : #1976D2;
  --blue-light     : #1E88E5;
  --blue-pale      : #E3F2FD;
  --blue-xpale     : #F0F7FF;
  --green          : #4CAF50;
  --green-pale     : #E8F5E9;
  --yellow         : #FFD600;
  --yellow-pale    : #FFFDE7;
  --red            : #d32f2f;
  --red-pale       : #FFEBEE;
  --gray-dark      : #757575;
  --gray-mid       : #9E9E9E;
  --gray-light     : #E0E0E0;
  --gray-bg        : #f0f2f5;
  --white          : #FFFFFF;
  --text-primary   : #212121;
  --text-secondary : #616161;
  --shadow-sm      : 0 1px 4px rgba(0,0,0,0.10);
  --shadow-md      : 0 4px 16px rgba(0,0,0,0.10);
  --shadow-lg      : 0 8px 32px rgba(0,0,0,0.12);
  --radius-sm      : 6px;
  --radius-md      : 10px;
  --radius-lg      : 16px;
  --header-h       : 56px;
  --infobar-h      : 52px;
  --navbottom-h    : 64px;
  --font           : 'Roboto', 'Segoe UI', Arial, Helvetica, sans-serif;
}

/* ─── RESET & BASE ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; -webkit-tap-highlight-color: transparent; }

body {
  font-family: var(--font);
  background: var(--gray-bg);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  font-size: 14px;
  line-height: 1.6;
}

/* ─── UTILITY ─── */
.hidden { display: none !important; }
.active { display: flex !important; }

/* ─── PAGES ─── */
.page {
  display: none;
  min-height: 100vh;
  flex-direction: column;
}

/* ══════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════ */
#main-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-h);
  background: var(--blue-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.header-title {
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-right { display: flex; align-items: center; }

.peserta-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.15);
  border-radius: 24px;
  padding: 4px 12px 4px 4px;
}

.peserta-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  color: var(--blue-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.peserta-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.peserta-nama {
  color: white;
  font-size: 12px;
  font-weight: 600;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════
   PAGE LOGIN
══════════════════════════════════════════════ */
#page-login {
  background: linear-gradient(150deg, #1565C0 0%, #1976D2 35%, #42A5F5 70%, #90CAF9 100%);
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

.login-bg-decor {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 40% 50% at 10% 80%, rgba(0,0,0,0.08) 0%, transparent 60%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px;
}

.login-brand svg {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}

.brand-name {
  color: white;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.brand-sub {
  color: rgba(255,255,255,0.8);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Card */
.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.card-header-stripe {
  height: 4px;
  background: linear-gradient(90deg, var(--blue-primary), var(--blue-light), #42A5F5);
}

.card-body { padding: 24px; }

.card-title {
  color: var(--blue-primary);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.card-subtitle {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* Form */
.form-grid { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Required star */
.required-star {
  color: var(--red);
  font-weight: 700;
  text-transform: none;
}

.form-input {
  height: 42px;
  border: 1.5px solid var(--gray-light);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  font-size: 14px;
  font-family: var(--font);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  background: var(--white);
}

.form-input:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 3px rgba(25,118,210,0.12);
}

/* Select dropdown */
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 32px;
  cursor: pointer;
  background: var(--white);
}

.form-select:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 3px rgba(25,118,210,0.12);
}

.select-arrow {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  flex-shrink: 0;
}

/* Token input */
.token-group { margin-top: 4px; }

.token-hint {
  display: block;
  font-weight: 400;
  font-size: 11px;
  color: var(--gray-mid);
  text-transform: none;
  letter-spacing: 0;
  margin-top: 2px;
}

.token-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.token-icon {
  position: absolute;
  left: 11px;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.token-input {
  padding-left: 36px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: var(--white);
  border: 2px solid var(--blue-light);
  border-radius: var(--radius-sm);
}

.token-input:focus {
  border-color: var(--blue-primary);
  box-shadow: 0 0 0 3px rgba(25,118,210,0.15);
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-top: 12px;
}

.alert svg { width: 18px; height: 18px; flex-shrink: 0; }

.alert-error {
  background: var(--red-pale);
  border: 1px solid #FFCDD2;
  color: var(--red);
}

/* Card Actions */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  gap: 12px;
}

.action-note {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  flex: 1;
}

.action-note svg { width: 16px; height: 16px; flex-shrink: 0; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font);
  font-weight: 600;
  font-size: 13px;
  transition: background 0.18s, transform 0.1s, box-shadow 0.18s, opacity 0.18s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  white-space: nowrap;
}

.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn svg { width: 18px; height: 18px; flex-shrink: 0; }

.btn-primary {
  background: var(--blue-primary);
  color: white;
  padding: 10px 20px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.3);
}
.btn-primary:hover { background: #1565C0; box-shadow: 0 4px 14px rgba(25,118,210,0.4); }

.btn-mulai {
  padding: 11px 24px;
  font-size: 14px;
  border-radius: var(--radius-md);
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.btn-outline-blue {
  background: transparent;
  color: var(--blue-primary);
  border: 1.5px solid var(--blue-primary);
  padding: 7px 14px;
}
.btn-outline-blue:hover { background: var(--blue-xpale); }

.btn-outline-gray {
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--gray-light);
  padding: 10px 20px;
}
.btn-outline-gray:hover { background: var(--gray-bg); }

.btn-danger {
  background: var(--red);
  color: white;
  padding: 10px 20px;
  box-shadow: 0 2px 8px rgba(211,47,47,0.3);
}
.btn-danger:hover { background: #c62828; }

.btn-sm { font-size: 12px; padding: 6px 12px; }

.login-footer {
  text-align: center;
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  padding: 4px 0;
}

/* ══════════════════════════════════════════════
   PAGE UJIAN
══════════════════════════════════════════════ */
#page-ujian {
  flex-direction: column;
  padding-top: 0;
  min-height: 100vh;
}

/* Info Bar */
.info-bar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-light);
  height: var(--infobar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  position: sticky;
  top: var(--header-h);
  z-index: 50;
  box-shadow: var(--shadow-sm);
}

.info-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.info-icon { width: 18px; height: 18px; flex-shrink: 0; }
.info-mapel { font-weight: 700; font-size: 13px; color: var(--text-primary); }
.info-sep { color: var(--gray-mid); }
.info-total { font-size: 12px; color: var(--text-secondary); }

.info-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--blue-pale);
  color: var(--blue-primary);
  border: 1.5px solid rgba(25,118,210,0.25);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.timer-box.warning { background: var(--yellow-pale); color: #F57F17; border-color: var(--yellow); }
.timer-box.danger  { background: var(--red-pale); color: var(--red); border-color: #EF9A9A; animation: pulse-timer 1s infinite; }

.timer-icon { width: 16px; height: 16px; }

@keyframes pulse-timer {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* Ujian Body */
.ujian-body {
  flex: 1;
  padding: 16px 14px calc(var(--navbottom-h) + 20px);
  overflow-y: auto;
}

.soal-card {
  padding: 0;
  border: 1px solid var(--gray-light);
}

.soal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--gray-light);
  background: var(--blue-xpale);
}

.soal-nomor-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--blue-primary);
  color: white;
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  min-width: 44px;
  flex-shrink: 0;
}

.soal-nomor-label { font-size: 9px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.5px; }
.soal-nomor-value { font-size: 18px; font-weight: 800; line-height: 1.1; }

.soal-progress-bar {
  flex: 1;
  height: 6px;
  background: var(--gray-light);
  border-radius: 99px;
  overflow: hidden;
}

.soal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-primary), var(--blue-light));
  border-radius: 99px;
  transition: width 0.3s ease;
  width: 10%;
}

.soal-total-label { font-size: 12px; color: var(--text-secondary); flex-shrink: 0; }

.soal-content { padding: 18px 16px 14px; }

.soal-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Opsi */
.opsi-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 16px 16px;
}

.opsi-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--gray-light);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.18s;
  background: var(--white);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.opsi-item:hover { border-color: var(--blue-light); background: var(--blue-xpale); }

.opsi-item.selected {
  border-color: var(--blue-primary);
  background: var(--blue-pale);
}

.opsi-item.selected .opsi-huruf {
  background: var(--blue-primary);
  color: white;
  border-color: var(--blue-primary);
}

.opsi-item.selected .opsi-teks { color: var(--blue-primary); font-weight: 600; }

.opsi-huruf {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--gray-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.18s;
}

.opsi-teks {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  padding-top: 3px;
  flex: 1;
}

/* Nav Bottom */
.nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--navbottom-h);
  background: var(--white);
  border-top: 1.5px solid var(--gray-light);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  z-index: 90;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
}

.btn-prev {
  flex: 1;
  background: var(--gray-dark);
  color: white;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.btn-prev:hover { background: #616161; }
.btn-prev svg { width: 16px; height: 16px; }

.btn-ragu {
  flex: 1.2;
  background: var(--yellow);
  color: #5D4037;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  position: relative;
}
.btn-ragu:hover { background: #FFC400; }

.ragu-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #795548;
  border-radius: 3px;
  background: transparent;
  display: inline-block;
  flex-shrink: 0;
  position: relative;
  transition: all 0.15s;
}

.ragu-checkbox.checked {
  background: #795548;
  border-color: #795548;
}

.ragu-checkbox.checked::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.btn-next {
  flex: 1;
  background: var(--blue-primary);
  color: white;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}
.btn-next:hover { background: #1565C0; }
.btn-next svg { width: 16px; height: 16px; }

.btn-next.btn-selesai { background: var(--green); }
.btn-next.btn-selesai:hover { background: #388E3C; }

/* ══════════════════════════════════════════════
   MODAL DAFTAR SOAL
══════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-daftar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 20px 20px 0 0;
  z-index: 210;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s ease;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--gray-light);
  flex-shrink: 0;
}

.modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); }

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--gray-bg);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: var(--gray-light); }
.modal-close svg { width: 16px; height: 16px; }

.modal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 10px 18px;
  background: var(--gray-bg);
  border-bottom: 1px solid var(--gray-light);
  flex-shrink: 0;
}

.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-secondary); }

.legend-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-putih { background: white; border: 1.5px solid var(--gray-light); }
.legend-hijau { background: var(--green); }
.legend-kuning { background: var(--yellow); }
.legend-aktif { background: white; border: 2.5px solid var(--blue-primary); }

.modal-grid {
  padding: 14px 18px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  overflow-y: auto;
  flex: 1;
}

.grid-soal-btn {
  aspect-ratio: 1;
  border: 2px solid var(--gray-light);
  border-radius: var(--radius-sm);
  background: var(--white);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-family: var(--font);
}

.grid-soal-btn:hover { transform: scale(1.05); box-shadow: var(--shadow-sm); }
.grid-soal-btn.gs-dijawab { background: var(--green); color: white; border-color: var(--green); }
.grid-soal-btn.gs-ragu    { background: var(--yellow); color: #5D4037; border-color: var(--yellow); }
.grid-soal-btn.gs-aktif   { border-color: var(--blue-primary); border-width: 3px; color: var(--blue-primary); }

.modal-footer {
  padding: 12px 18px;
  border-top: 1px solid var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: var(--white);
}

.modal-progress-text {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ══════════════════════════════════════════════
   CONFIRM MODAL
══════════════════════════════════════════════ */
.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 340px;
  background: var(--white);
  border-radius: var(--radius-lg);
  z-index: 300;
  padding: 24px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.2s ease;
}

.confirm-icon {
  width: 56px;
  height: 56px;
  background: var(--yellow-pale);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.confirm-icon svg { width: 28px; height: 28px; }
.confirm-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.confirm-text { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6; }

.confirm-actions { display: flex; gap: 10px; }
.confirm-actions .btn { flex: 1; justify-content: center; }

/* ══════════════════════════════════════════════
   PAGE HASIL
══════════════════════════════════════════════ */
#page-hasil {
  flex-direction: column;
  padding: 16px 14px;
  min-height: 100vh;
  overflow-y: auto;
}

.hasil-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-bottom: 24px;
}

.hasil-card {
  width: 100%;
  max-width: 480px;
  padding: 0;
  overflow: hidden;
}

.hasil-header {
  background: linear-gradient(135deg, var(--blue-primary), var(--blue-light));
  padding: 28px 20px 20px;
  text-align: center;
}

.hasil-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.hasil-icon-wrap svg { width: 32px; height: 32px; }
.hasil-title { color: white; font-size: 20px; font-weight: 800; }
.hasil-subtitle { color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 4px; }

/* Skor circle */
.skor-display {
  display: flex;
  justify-content: center;
  padding: 24px 20px 16px;
}

.skor-circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 5px solid var(--blue-pale);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(25,118,210,0.15);
}

.skor-angka {
  font-size: 38px;
  font-weight: 900;
  color: var(--blue-primary);
  line-height: 1;
}

.skor-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Hasil stats */
.hasil-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px 20px;
  gap: 0;
  border-bottom: 1px solid var(--gray-light);
}

.stat-item { flex: 1; text-align: center; padding: 10px 0; }
.stat-number { display: block; font-size: 24px; font-weight: 800; }
.stat-label  { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-benar .stat-number { color: var(--green); }
.stat-salah .stat-number { color: var(--red); }
.stat-kosong .stat-number { color: var(--gray-dark); }
.stat-divider { width: 1px; height: 40px; background: var(--gray-light); }

/* Detail jawaban */
.detail-jawaban { padding: 16px 20px; }
.detail-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); }
.detail-list { display: flex; flex-direction: column; gap: 8px; }

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray-light);
  font-size: 13px;
}

.detail-item.benar  { background: var(--green-pale); border-color: #A5D6A7; }
.detail-item.salah  { background: var(--red-pale); border-color: #FFCDD2; }
.detail-item.kosong { background: var(--gray-bg); }

.detail-no { font-weight: 700; color: var(--text-secondary); min-width: 32px; }
.detail-jawaban-user { font-weight: 600; }
.detail-item.benar  .detail-jawaban-user { color: var(--green); }
.detail-item.salah  .detail-jawaban-user { color: var(--red); }
.detail-item.kosong .detail-jawaban-user { color: var(--gray-dark); }

.detail-kunci { margin-left: auto; font-size: 11px; color: var(--text-secondary); }

.detail-badge {
  margin-left: 4px;
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
}

.badge-benar  { background: var(--green); color: white; }
.badge-salah  { background: var(--red); color: white; }
.badge-kosong { background: var(--gray-dark); color: white; }

.hasil-actions {
  padding: 0 20px 20px;
  display: flex;
  justify-content: center;
}

.hasil-actions .btn { width: 100%; justify-content: center; }

/* ══════════════════════════════════════════════
   LOADING OVERLAY
══════════════════════════════════════════════ */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  background: var(--white);
  padding: 28px 36px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gray-light);
  border-top-color: var(--blue-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

#loading-text {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width: 360px) {
  .modal-grid { grid-template-columns: repeat(4, 1fr); }
  .form-row   { grid-template-columns: 1fr; }
  .soal-text  { font-size: 14px; }
  .nav-bottom { gap: 6px; padding: 8px 8px; }
  .btn-prev span:last-child, .btn-next span:last-child { display: none; }
}

@media (min-width: 600px) {
  .modal-daftar {
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: var(--radius-lg);
    width: 420px;
    max-height: 85vh;
    animation: slideUp 0.2s ease;
  }
  .ujian-body { max-width: 600px; margin: 0 auto; width: 100%; }
  .nav-bottom { max-width: 600px; margin: 0 auto; left: 50%; transform: translateX(-50%); width: 100%; }
}
