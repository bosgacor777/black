/* ═══════════════════════════════════════════════════════════
   BLACKJACK UNDERGROUND — STYLE SYSTEM
   Tema: Dark Luxury Underground Casino
   Font: Cinzel Decorative (display) + Rajdhani (body/UI)
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   SECTION 1: CSS CUSTOM PROPERTIES
   ───────────────────────────────────────────── */
:root {
  /* Color Palette */
  --black-deep:    #05050a;
  --black-rich:    #0a0a12;
  --black-table:   #0d1008;
  --felt-dark:     #0b1a0e;
  --felt-mid:      #0f2112;
  --felt-light:    #143018;

  --gold:          #d4a843;
  --gold-bright:   #f5d070;
  --gold-dim:      #8a6820;
  --gold-glow:     rgba(212, 168, 67, 0.35);

  --red-card:      #c0375a;
  --red-glow:      rgba(192, 55, 90, 0.4);

  --white-pure:    #ffffff;
  --white-dim:     rgba(255,255,255,0.85);
  --white-muted:   rgba(255,255,255,0.45);
  --white-ghost:   rgba(255,255,255,0.08);

  --glass-bg:      rgba(15, 20, 30, 0.7);
  --glass-border:  rgba(212, 168, 67, 0.18);
  --glass-blur:    16px;

  --accent-blue:   #4a90d9;
  --accent-green:  #3db87a;
  --accent-red:    #e05050;
  --accent-purple: #9b59b6;
  --accent-orange: #e67e22;

  /* Typography */
  --font-display: 'Cinzel Decorative', serif;
  --font-title:   'Cinzel', serif;
  --font-body:    'Rajdhani', sans-serif;

  /* Spacing */
  --sp-xs:  4px;
  --sp-sm:  8px;
  --sp-md:  16px;
  --sp-lg:  24px;
  --sp-xl:  40px;

  /* Card dimensions */
  --card-w:      68px;
  --card-h:      98px;
  --card-radius: 6px;

  /* Z-index layers */
  --z-bg:        -1;
  --z-table:      1;
  --z-hud:       10;
  --z-panel:     20;
  --z-chat:      30;
  --z-overlay:   50;
  --z-toast:     60;
  --z-celebrate: 70;

  /* Transitions */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─────────────────────────────────────────────
   SECTION 2: RESET & BASE
   ───────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  height: 100%;
}

body {
  font-family: var(--font-body);
  background-color: var(--black-deep);
  color: var(--white-dim);
  min-height: 100dvh;
  height: 100%;
  overflow: hidden;
  position: relative;
  cursor: default;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  font-family: var(--font-body);
  cursor: pointer;
  border: none;
  background: none;
  outline: none;
}

button:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

input {
  font-family: var(--font-body);
  outline: none;
}

/* ─────────────────────────────────────────────
   SECTION 3: BACKGROUND LAYERS
   ───────────────────────────────────────────── */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-bg);
  pointer-events: none;
}

.bg-felt {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 120% 80% at 50% 40%, var(--felt-mid) 0%, var(--felt-dark) 45%, var(--black-rich) 80%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.008) 2px,
      rgba(255,255,255,0.008) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.005) 2px,
      rgba(255,255,255,0.005) 4px
    );
}

.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%);
}

.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

.bg-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0) 0px,
    rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.06) 2px,
    rgba(0,0,0,0.06) 4px
  );
  pointer-events: none;
}

#particles-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
}

/* ─────────────────────────────────────────────
   SECTION 4: SCREEN SYSTEM
   ───────────────────────────────────────────── */
.screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s var(--ease-out-expo);
  z-index: var(--z-table);
}

.screen--active {
  opacity: 1;
  pointer-events: all;
}

/* ─────────────────────────────────────────────
   SECTION 5: LOGIN SCREEN
   ───────────────────────────────────────────── */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-lg);
  width: 100%;
  max-width: 400px;
  padding: var(--sp-md);
  animation: loginEnter 1s var(--ease-out-expo) both;
}

@keyframes loginEnter {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-logo {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
}

.logo-emblem {
  width: 80px;
  height: 80px;
  animation: emblemFloat 4s ease-in-out infinite;
  filter: drop-shadow(0 0 20px var(--gold-glow));
}

@keyframes emblemFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.logo-title {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #c8903a 0%, #fde68a 45%, #c8903a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  text-shadow: none;
}

.logo-title span {
  font-size: 0.55em;
  letter-spacing: 0.25em;
  display: block;
}

.logo-sub {
  font-family: var(--font-title);
  font-size: 0.65rem;
  letter-spacing: 0.3em;
  color: var(--white-muted);
  text-transform: uppercase;
}

/* ── Glass Panel ─── */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.5),
    0 1px 0 rgba(255,255,255,0.05) inset,
    0 0 0 1px rgba(0,0,0,0.3);
}

.login-form.glass-panel {
  width: 100%;
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

/* ── Form Elements ─── */
.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-family: var(--font-title);
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  color: var(--gold-dim);
  margin-bottom: var(--sp-xs);
}

.form-input {
  width: 100%;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  color: var(--white-pure);
  letter-spacing: 0.05em;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input::placeholder { color: var(--white-muted); }

.form-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-glow), 0 0 20px rgba(212,168,67,0.1);
}

.input-border-anim {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  transform: translateX(-50%);
  transition: width 0.4s var(--ease-out-expo);
}

.form-input:focus ~ .input-border-anim { width: 100%; }

/* ── Mode Selector ─── */
.mode-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-sm);
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: var(--white-muted);
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}

.mode-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(212,168,67,0.05));
  opacity: 0;
  transition: opacity 0.3s;
}

.mode-btn:hover { color: var(--white-dim); border-color: rgba(212,168,67,0.3); }
.mode-btn:hover::before { opacity: 1; }

.mode-btn--active {
  background: rgba(212, 168, 67, 0.12);
  border-color: var(--gold);
  color: var(--gold-bright);
  box-shadow: 0 0 20px rgba(212,168,67,0.15);
}

.mode-btn__icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-btn__icon svg { width: 100%; height: 100%; }

.mode-btn__label {
  font-family: var(--font-title);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.mode-btn__sub {
  font-size: 0.65rem;
  font-weight: 300;
  opacity: 0.7;
}

/* ── Connection Status ─── */
.connection-status {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: 0.75rem;
  color: var(--white-muted);
  min-height: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--white-muted);
  flex-shrink: 0;
  transition: background 0.3s, box-shadow 0.3s;
}

.status-dot--online {
  background: var(--accent-green);
  box-shadow: 0 0 8px var(--accent-green), 0 0 16px rgba(61,184,122,0.4);
  animation: pulseDot 2s ease-in-out infinite;
}

.status-dot--offline {
  background: var(--accent-red);
  box-shadow: 0 0 8px var(--accent-red);
}

.status-dot--checking {
  background: var(--gold);
  animation: pulseDot 1s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── Buttons ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 14px 24px;
  background: linear-gradient(135deg, #8a6820 0%, #d4a843 40%, #f5d070 60%, #c8903a 100%);
  border-radius: 6px;
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--black-deep);
  text-transform: uppercase;
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
  box-shadow: 0 4px 20px rgba(212,168,67,0.3), 0 1px 0 rgba(255,255,255,0.2) inset;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(212,168,67,0.5), 0 1px 0 rgba(255,255,255,0.2) inset;
  filter: brightness(1.1);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(212,168,67,0.2);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -60%;
  width: 40%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-15deg);
  transition: left 0.6s;
}

.btn-primary:hover .btn-shine { left: 120%; }

.btn-secondary {
  padding: 10px 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--white-muted);
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  color: var(--white-dim);
  border-color: rgba(255,255,255,0.25);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--white-muted);
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255,255,255,0.1);
  color: var(--white-dim);
  border-color: rgba(255,255,255,0.2);
}

.login-disclaimer {
  font-size: 0.7rem;
  color: var(--white-ghost);
  text-align: center;
  letter-spacing: 0.05em;
}

.login-disclaimer strong { color: var(--gold-dim); }

/* ─────────────────────────────────────────────
   SECTION 6: GAME SCREEN LAYOUT
   ───────────────────────────────────────────── */
#screen-game {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  overflow: hidden;
}

/* ── HUD Top ─── */
.game-hud-top {
  position: relative;
  z-index: var(--z-hud);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  flex-shrink: 0;
  height: 52px;
}

.hud-left, .hud-right {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex: 1;
}

.hud-right { justify-content: flex-end; }

.hud-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hud-logo {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-family: var(--font-title);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: var(--gold-dim);
}

.hud-mode-badge {
  font-family: var(--font-title);
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(212,168,67,0.15);
  border: 1px solid var(--gold-dim);
  color: var(--gold);
}

.hud-round-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.round-label {
  font-family: var(--font-title);
  font-size: 0.5rem;
  letter-spacing: 0.25em;
  color: var(--white-muted);
}

.round-num {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--gold);
  line-height: 1;
}

.hud-phase-badge {
  font-family: var(--font-title);
  font-size: 0.5rem;
  letter-spacing: 0.3em;
  color: var(--white-muted);
}

.hud-room-id {
  font-family: var(--font-title);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  color: var(--gold-dim);
  opacity: 0.7;
}

/* ── Game Table Main ─── */
.game-table {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  min-height: 0;
  overflow: hidden;
}

/* ─────────────────────────────────────────────
   SECTION 7: DEALER ZONE
   ───────────────────────────────────────────── */
.dealer-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-xs);
  flex-shrink: 0;
}

.zone-label {
  font-family: var(--font-title);
  font-size: 0.55rem;
  letter-spacing: 0.35em;
  color: var(--white-muted);
  text-transform: uppercase;
}

.dealer-hand-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: -10px;
  min-height: calc(var(--card-h) + 8px);
  position: relative;
}

.dealer-score-badge {
  min-width: 36px;
  height: 24px;
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--gold-bright);
  padding: 0 10px;
  transition: all 0.3s;
}

.dealer-status-msg {
  font-family: var(--font-title);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--white-muted);
  min-height: 18px;
  transition: all 0.3s;
}

.dealer-status-msg.--bust { color: var(--red-card); animation: statusPulse 0.5s; }
.dealer-status-msg.--blackjack { color: var(--gold-bright); animation: statusPulse 0.5s; }

@keyframes statusPulse {
  0% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ─────────────────────────────────────────────
   SECTION 8: TABLE DIVIDER
   ───────────────────────────────────────────── */
.table-divider {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  gap: var(--sp-sm);
  flex-shrink: 0;
  padding: 4px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent);
}

.divider-emblem { flex-shrink: 0; }
.divider-emblem svg { display: block; }

/* ─────────────────────────────────────────────
   SECTION 9: PLAYER SEATS
   ───────────────────────────────────────────── */
.players-zone {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
}

.seats-grid {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
}

/* ── Player Seat Card ─── */
.player-seat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 90px;
  position: relative;
  transition: all 0.3s;
}

.player-seat--empty {
  opacity: 0.2;
}

.player-seat--self .seat-nameplate {
  border-color: var(--gold);
  background: rgba(212,168,67,0.1);
}

.player-seat--active {
  filter: drop-shadow(0 0 12px rgba(212,168,67,0.4));
}

.player-seat--active .seat-nameplate {
  border-color: var(--gold-bright);
  animation: activePulse 1.5s ease-in-out infinite;
}

@keyframes activePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(212,168,67,0); }
}

.seat-hand-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: calc(var(--card-h) + 4px);
  position: relative;
}

.seat-nameplate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 10px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  transition: all 0.3s;
}

.seat-name {
  font-family: var(--font-title);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--white-dim);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-score {
  font-family: var(--font-title);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--gold-bright);
  min-width: 16px;
  text-align: center;
}

.seat-bet-badge {
  position: absolute;
  top: -10px;
  right: -8px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(0,0,0,0.7);
  border: 1px solid var(--gold-dim);
  border-radius: 10px;
  padding: 2px 6px;
  font-family: var(--font-body);
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--gold);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s var(--ease-spring);
}

.seat-bet-badge.--visible {
  opacity: 1;
  transform: scale(1);
}

.seat-result-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%) scale(0);
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  letter-spacing: 0.05em;
  z-index: 5;
  transition: transform 0.4s var(--ease-spring);
  pointer-events: none;
}

.seat-result-badge.--show { transform: translate(-50%,-50%) scale(1); }
.seat-result-badge.--win { background: rgba(61,184,122,0.9); color: #fff; }
.seat-result-badge.--lose { background: rgba(224,80,80,0.9); color: #fff; }
.seat-result-badge.--push { background: rgba(212,168,67,0.9); color: #000; }
.seat-result-badge.--blackjack {
  background: linear-gradient(135deg, #8a6820, #f5d070, #c8903a);
  color: #000;
  animation: bkjFlash 0.5s alternate infinite;
}
@keyframes bkjFlash {
  from { filter: brightness(1); }
  to   { filter: brightness(1.4); }
}

/* ─────────────────────────────────────────────
   SECTION 10: PLAYING CARDS
   ───────────────────────────────────────────── */
.card {
  position: relative;
  width: var(--card-w);
  height: var(--card-h);
  border-radius: var(--card-radius);
  flex-shrink: 0;
  transform-style: preserve-3d;
  perspective: 400px;
  cursor: default;
  user-select: none;
  /* slide in */
  animation: cardSlideIn 0.35s var(--ease-out-expo) both;
  will-change: transform;
  margin-left: -14px;
}

.card:first-child { margin-left: 0; }

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(-40px) translateX(20px) rotate(8deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0) rotate(0deg);
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.card--flipping .card-inner {
  animation: cardFlip3D 0.6s var(--ease-out-expo) both;
}

@keyframes cardFlip3D {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
}

.card-face, .card-back {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Card Front */
.card-face {
  background: #fefef8;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 4px;
  box-shadow:
    0 4px 12px rgba(0,0,0,0.5),
    0 1px 0 rgba(255,255,255,0.9) inset,
    0 0 0 0.5px rgba(0,0,0,0.2);
  overflow: hidden;
}

.card-face::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
  border-radius: var(--card-radius);
  pointer-events: none;
}

.card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  gap: 1px;
}

.card-corner--bottom {
  transform: rotate(180deg);
  align-self: flex-end;
  justify-self: flex-end;
}

.card-rank {
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
}

.card-suit-sm {
  width: 10px;
  height: 10px;
}

.card-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-center-suit {
  width: 28px;
  height: 28px;
}

.card-face.--red .card-rank,
.card-face.--red .card-suit-sm,
.card-face.--red .card-center-suit { color: var(--red-card); }

.card-face.--black .card-rank,
.card-face.--black .card-suit-sm,
.card-face.--black .card-center-suit { color: #1a1a2e; }

/* Card Back */
.card-back {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%231a1040'/%3E%3Crect x='0' y='0' width='5' height='5' fill='%2322155a' opacity='.6'/%3E%3Crect x='5' y='5' width='5' height='5' fill='%2322155a' opacity='.6'/%3E%3C/svg%3E");
  border: 2px solid #2a1a7a;
  box-shadow:
    0 4px 12px rgba(0,0,0,0.5),
    0 0 0 1px rgba(255,255,255,0.05) inset;
}

.card-back::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(212,168,67,0.3);
  border-radius: 3px;
}

/* ─────────────────────────────────────────────
   SECTION 11: ACTION PANEL (FOOTER)
   ───────────────────────────────────────────── */
.action-panel {
  position: relative;
  z-index: var(--z-panel);
  background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 80%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 10px 12px 16px;
  flex-shrink: 0;
  border-top: 1px solid rgba(212,168,67,0.1);
}

/* ── Player Self Info ─── */
.player-self-info {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}

.self-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(212,168,67,0.1);
  border: 1px solid var(--gold-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-dim);
  flex-shrink: 0;
}

.self-details { flex: 1; min-width: 0; }

.self-name {
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gold-bright);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.self-balance-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.self-balance {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--white-muted);
  transition: color 0.3s;
}

.self-balance.--increased { color: var(--accent-green); animation: balanceFlash 0.6s; }
.self-balance.--decreased { color: var(--accent-red); animation: balanceFlash 0.6s; }

@keyframes balanceFlash {
  0%   { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.self-hand-val {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--gold-bright);
  min-width: 30px;
  text-align: right;
}

.self-hand-val.--bust { color: var(--accent-red); }
.self-hand-val.--blackjack { color: var(--gold-bright); animation: bkjFlash 0.5s alternate 4; }

/* ── Betting Panel ─── */
.betting-panel { display: flex; flex-direction: column; gap: var(--sp-sm); }

.bet-display {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(212,168,67,0.12);
  border-radius: 6px;
}

.bet-display__label {
  font-family: var(--font-title);
  font-size: 0.55rem;
  letter-spacing: 0.3em;
  color: var(--white-muted);
}

.bet-display__amount {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--gold-bright);
  transition: all 0.2s var(--ease-spring);
}

.bet-display__amount.--bump {
  animation: betBump 0.3s var(--ease-spring);
}

@keyframes betBump {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); color: var(--gold-bright); }
  100% { transform: scale(1); }
}

/* ── Chip Selector ─── */
.chip-selector {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.chip-selector::-webkit-scrollbar { display: none; }

.chip-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 6px 8px;
  flex-shrink: 0;
  transition: all 0.2s var(--ease-spring);
  position: relative;
}

.chip-btn span {
  font-family: var(--font-title);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--white-muted);
}

.chip-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.06);
}

.chip-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.chip-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Bet Controls ─── */
.bet-controls {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--sp-sm);
}

/* ── Game Action Buttons ─── */
.game-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 6px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 12px 6px;
  border-radius: 8px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-btn:hover:not(:disabled) { transform: translateY(-2px); }
.action-btn:hover:not(:disabled)::before { opacity: 1; }
.action-btn:active:not(:disabled) { transform: scale(0.96); }
.action-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.action-btn__label {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.action-btn__sub {
  font-size: 0.55rem;
  font-weight: 400;
  opacity: 0.7;
}

/* Hit */
.action-btn--hit {
  border-color: rgba(61,184,122,0.3);
  color: var(--accent-green);
}
.action-btn--hit::before { background: radial-gradient(circle, rgba(61,184,122,0.15), transparent); }
.action-btn--hit:hover:not(:disabled) {
  border-color: var(--accent-green);
  box-shadow: 0 0 20px rgba(61,184,122,0.2);
}

/* Stand */
.action-btn--stand {
  border-color: rgba(224,80,80,0.3);
  color: var(--accent-red);
}
.action-btn--stand::before { background: radial-gradient(circle, rgba(224,80,80,0.15), transparent); }
.action-btn--stand:hover:not(:disabled) {
  border-color: var(--accent-red);
  box-shadow: 0 0 20px rgba(224,80,80,0.2);
}

/* Double */
.action-btn--double {
  border-color: rgba(212,168,67,0.3);
  color: var(--gold);
}
.action-btn--double::before { background: radial-gradient(circle, rgba(212,168,67,0.15), transparent); }
.action-btn--double:hover:not(:disabled) {
  border-color: var(--gold);
  box-shadow: 0 0 20px var(--gold-glow);
}

/* Split */
.action-btn--split {
  border-color: rgba(155,89,182,0.3);
  color: var(--accent-purple);
}
.action-btn--split::before { background: radial-gradient(circle, rgba(155,89,182,0.15), transparent); }
.action-btn--split:hover:not(:disabled) {
  border-color: var(--accent-purple);
  box-shadow: 0 0 20px rgba(155,89,182,0.2);
}

/* ── Waiting Message ─── */
.waiting-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: 16px;
  color: var(--white-muted);
  font-family: var(--font-title);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
}

.waiting-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(212,168,67,0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─────────────────────────────────────────────
   SECTION 12: TURN TIMER BAR
   ───────────────────────────────────────────── */
.turn-timer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255,255,255,0.05);
  z-index: var(--z-hud);
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, var(--accent-green), var(--gold), var(--accent-red));
  transform-origin: left;
  transform: scaleX(1);
  transition: transform linear, background 0.5s;
}

.timer-fill.--urgent {
  animation: timerFlicker 0.3s ease-in-out infinite;
}

@keyframes timerFlicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

/* ─────────────────────────────────────────────
   SECTION 13: CHAT OVERLAY
   ───────────────────────────────────────────── */
.chat-overlay {
  position: fixed;
  bottom: 80px;
  right: 12px;
  width: min(300px, calc(100vw - 24px));
  z-index: var(--z-chat);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  border: 1px solid var(--glass-border);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(10,10,20,0.95);
  cursor: pointer;
  user-select: none;
  gap: var(--sp-sm);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-title);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--gold);
}

.chat-unread-badge {
  background: var(--red-card);
  color: white;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.6rem;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  animation: badgePop 0.3s var(--ease-spring);
}

@keyframes badgePop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

.chat-toggle-icon {
  font-size: 0.6rem;
  color: var(--white-muted);
  transition: transform 0.3s;
  margin-left: auto;
}

.chat-overlay.--collapsed .chat-body { display: none; }
.chat-overlay.--collapsed .chat-toggle-icon { transform: rotate(180deg); }

.chat-body {
  background: rgba(8,8,16,0.97);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  height: 160px;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(212,168,67,0.2) transparent;
}

.chat-msg {
  display: flex;
  flex-direction: column;
  gap: 1px;
  animation: msgFadeIn 0.2s ease;
}

@keyframes msgFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.chat-msg-author {
  font-family: var(--font-title);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gold-dim);
}

.chat-msg-author.--self { color: var(--accent-green); }

.chat-msg-text {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--white-dim);
  word-break: break-word;
  line-height: 1.4;
}

.chat-input-wrap {
  display: flex;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.8rem;
  color: var(--white-dim);
  min-width: 0;
}

.chat-input::placeholder { color: var(--white-muted); font-size: 0.75rem; }
.chat-input:focus { border-color: rgba(212,168,67,0.3); }

.chat-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: rgba(212,168,67,0.15);
  border: 1px solid var(--gold-dim);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.chat-send-btn:hover {
  background: rgba(212,168,67,0.25);
  box-shadow: 0 0 10px var(--gold-glow);
}

/* ─────────────────────────────────────────────
   SECTION 14: RESULT OVERLAY
   ───────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-md);
}

.overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.result-modal {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 320px;
  padding: var(--sp-xl) var(--sp-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  animation: resultReveal 0.5s var(--ease-spring) both;
}

@keyframes resultReveal {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.result-icon {
  font-size: 3rem;
  line-height: 1;
}

.result-headline {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  font-weight: 700;
  color: var(--gold-bright);
  letter-spacing: 0.05em;
  line-height: 1.3;
}

.result-sub {
  font-family: var(--font-title);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: var(--white-muted);
}

.result-amount {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.05em;
}

.result-amount.--win  { color: var(--accent-green); }
.result-amount.--lose { color: var(--accent-red); }
.result-amount.--push { color: var(--gold); }

.result-balance-new {
  font-size: 0.75rem;
  color: var(--white-muted);
  font-family: var(--font-title);
}

/* ─────────────────────────────────────────────
   SECTION 15: TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */
.toast-container {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  width: min(360px, 90vw);
}

.toast {
  width: 100%;
  padding: 10px 16px;
  background: rgba(10,10,20,0.95);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--white-dim);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  animation: toastIn 0.4s var(--ease-spring) both;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast.--leaving {
  animation: toastOut 0.3s ease-in both;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(-16px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-8px) scale(0.95); }
}

.toast::before {
  content: '';
  width: 3px;
  height: 100%;
  border-radius: 2px;
  flex-shrink: 0;
}

.toast.--info::before    { background: var(--accent-blue); }
.toast.--success::before { background: var(--accent-green); }
.toast.--error::before   { background: var(--accent-red); }
.toast.--warn::before    { background: var(--gold); }

/* ─────────────────────────────────────────────
   SECTION 16: CELEBRATION CANVAS
   ───────────────────────────────────────────── */
.celebration-canvas {
  position: fixed;
  inset: 0;
  z-index: var(--z-celebrate);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.celebration-canvas.--active { opacity: 1; }

/* ─────────────────────────────────────────────
   SECTION 17: SCREEN SHAKE EFFECT
   ───────────────────────────────────────────── */
.screen-shake {
  animation: screenShake 0.4s var(--ease-out-expo);
}

@keyframes screenShake {
  0%   { transform: translate(0,0) rotate(0deg); }
  15%  { transform: translate(-4px, 2px) rotate(-0.5deg); }
  30%  { transform: translate(4px, -2px) rotate(0.5deg); }
  45%  { transform: translate(-3px, 1px) rotate(-0.3deg); }
  60%  { transform: translate(3px, -1px) rotate(0.3deg); }
  75%  { transform: translate(-1px, 1px) rotate(-0.1deg); }
  100% { transform: translate(0,0) rotate(0deg); }
}

/* ─────────────────────────────────────────────
   SECTION 18: CHIP ANIMATION (flying)
   ───────────────────────────────────────────── */
.chip-flying {
  position: fixed;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: chipFly 0.6s var(--ease-out-expo) both;
  will-change: transform, opacity;
}

@keyframes chipFly {
  from { opacity: 1; }
  to   { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.4); }
}

/* ─────────────────────────────────────────────
   SECTION 19: GLOW EFFECTS
   ───────────────────────────────────────────── */
.glow-gold {
  box-shadow: 0 0 20px var(--gold-glow), 0 0 60px rgba(212,168,67,0.1);
}

.glow-green {
  box-shadow: 0 0 20px rgba(61,184,122,0.3), 0 0 60px rgba(61,184,122,0.1);
}

.text-glow-gold {
  text-shadow: 0 0 20px var(--gold-glow), 0 0 40px rgba(212,168,67,0.2);
}

/* ─────────────────────────────────────────────
   SECTION 20: TABLE POT AREA
   ───────────────────────────────────────────── */
.table-pot-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
  width: 120px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pot-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

/* ─────────────────────────────────────────────
   SECTION 21: RESPONSIVE — MOBILE
   ───────────────────────────────────────────── */
@media screen and (max-width: 480px) {
  :root {
    --card-w: 56px;
    --card-h: 80px;
    --card-radius: 5px;
  }

  .game-hud-top { height: 46px; padding: 8px 12px; }
  .hud-logo span { display: none; }
  .logo-title { font-size: 1.2rem; }

  .dealer-hand-area { min-height: calc(var(--card-h) + 4px); }

  .game-actions { gap: 4px; }
  .action-btn { padding: 10px 4px; }
  .action-btn__label { font-size: 0.65rem; letter-spacing: 0.08em; }
  .action-btn__sub { display: none; }

  .chip-btn { padding: 5px 6px; }
  .chip-btn svg { width: 36px; height: 36px; }
  .chip-btn span { font-size: 0.5rem; }

  .chat-overlay { bottom: 70px; right: 8px; width: calc(100vw - 16px); }
  .chat-messages { height: 120px; }

  .result-modal { padding: var(--sp-lg) var(--sp-md); }

  .card-rank { font-size: 0.65rem; }
  .card-center-suit { width: 22px; height: 22px; }
  .card-suit-sm { width: 8px; height: 8px; }

  .card { margin-left: -18px; }
}

/* Landscape mode di HP */
@media screen and (max-height: 500px) and (orientation: landscape) {
  :root {
    --card-w: 46px;
    --card-h: 66px;
  }

  .game-hud-top { height: 38px; padding: 4px 12px; }
  .action-panel { padding: 6px 12px 8px; }
  .player-self-info { margin-bottom: 4px; }
  .betting-panel { gap: 6px; }
  .bet-display { padding: 4px 10px; }
  .game-actions { gap: 4px; }
  .action-btn { padding: 8px 4px; }
  .action-btn__sub { display: none; }
  .chip-btn { padding: 4px 5px; }
  .chip-btn svg { width: 30px; height: 30px; }
}

@media screen and (min-width: 768px) {
  :root {
    --card-w: 80px;
    --card-h: 112px;
  }

  .game-table { padding: 12px 24px; }
  .action-panel { padding: 12px 24px 20px; }
  .seats-grid { gap: 20px; }

  .betting-panel { flex-direction: row; align-items: center; flex-wrap: wrap; }
  .bet-display { flex-shrink: 0; }
  .chip-selector { flex: 1; }
  .bet-controls { flex-shrink: 0; }

  .game-actions { max-width: 500px; margin: 0 auto; gap: 10px; }
  .action-btn { padding: 14px 10px; }
}

/* ─────────────────────────────────────────────
   SECTION 22: UTILITY CLASSES
   ───────────────────────────────────────────── */
[hidden] { display: none !important; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}

.transition-all { transition: all 0.3s var(--ease-out-expo); }

.text-gold { color: var(--gold); }
.text-gold-bright { color: var(--gold-bright); }
.text-muted { color: var(--white-muted); }
.text-green { color: var(--accent-green); }
.text-red   { color: var(--accent-red); }

/* ─────────────────────────────────────────────
   SECTION 23: SCROLLBAR GLOBAL
   ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(212,168,67,0.4); }

/* ─────────────────────────────────────────────
   SECTION 24: SELECTION
   ───────────────────────────────────────────── */
::selection {
  background: rgba(212,168,67,0.25);
  color: var(--gold-bright);
}
