/**
 * ============================================================
 * ui.js — UI Engine & Animation System
 * Bertanggung jawab atas semua DOM manipulation, render kartu,
 * animasi chip, celebration, toast, dan visual feedback.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   SECTION 1: DOM ELEMENT REGISTRY
   ───────────────────────────────────────────── */
const DOM = {
  // Screens
  screenLogin   : document.getElementById('screen-login'),
  screenGame    : document.getElementById('screen-game'),

  // Login
  inputUsername : document.getElementById('input-username'),
  btnModeOnline : document.getElementById('btn-mode-online'),
  btnModeSolo   : document.getElementById('btn-mode-solo'),
  dotConnection : document.getElementById('dot-connection'),
  textConnection: document.getElementById('text-connection'),
  btnMasuk      : document.getElementById('btn-masuk'),

  // HUD
  hudModeBadge  : document.getElementById('hud-mode-badge'),
  hudPhaseBadge : document.getElementById('hud-phase-badge'),
  hudRoundNum   : document.getElementById('hud-round-num'),
  hudRoomId     : document.getElementById('hud-room-id'),
  btnLeave      : document.getElementById('btn-leave'),

  // Table
  dealerHandArea : document.getElementById('dealer-hand-area'),
  dealerScoreVal : document.getElementById('dealer-score-val'),
  dealerStatusMsg: document.getElementById('dealer-status-msg'),
  seatsContainer : document.getElementById('players-seats-container'),
  potInner       : document.getElementById('pot-inner'),

  // Action Panel
  selfName       : document.getElementById('self-name'),
  selfBalance    : document.getElementById('self-balance'),
  selfHandVal    : document.getElementById('self-hand-val'),
  bettingPanel   : document.getElementById('betting-panel'),
  betDisplayAmt  : document.getElementById('bet-display-amount'),
  chipBtns       : document.querySelectorAll('.chip-btn'),
  btnBetClear    : document.getElementById('btn-bet-clear'),
  btnBetConfirm  : document.getElementById('btn-bet-confirm'),
  gameActions    : document.getElementById('game-actions'),
  btnHit         : document.getElementById('btn-hit'),
  btnStand       : document.getElementById('btn-stand'),
  btnDouble      : document.getElementById('btn-double'),
  btnSplit       : document.getElementById('btn-split'),
  waitingMsg     : document.getElementById('waiting-msg'),
  waitingText    : document.getElementById('waiting-text'),

  // Timer
  timerFill      : document.getElementById('timer-fill'),
  turnTimerBar   : document.getElementById('turn-timer-bar'),

  // Chat
  chatOverlay    : document.getElementById('chat-overlay'),
  chatHeader     : document.getElementById('chat-header'),
  chatBody       : document.getElementById('chat-body'),
  chatMessages   : document.getElementById('chat-messages'),
  chatInput      : document.getElementById('chat-input'),
  chatSendBtn    : document.getElementById('chat-send-btn'),
  chatUnreadBadge: document.getElementById('chat-unread-badge'),

  // Overlays
  overlayResult  : document.getElementById('overlay-result'),
  resultIcon     : document.getElementById('result-icon'),
  resultHeadline : document.getElementById('result-headline'),
  resultSub      : document.getElementById('result-sub'),
  resultAmount   : document.getElementById('result-amount'),
  resultBalanceNew: document.getElementById('result-balance-new'),
  btnResultContinue: document.getElementById('btn-result-continue'),

  // Toast & Canvas
  toastContainer   : document.getElementById('toast-container'),
  celebrationCanvas: document.getElementById('celebration-canvas'),
  particlesCanvas  : document.getElementById('particles-canvas'),
};

/* ─────────────────────────────────────────────
   SECTION 2: SUIT ICON MAPPING
   ───────────────────────────────────────────── */
const SUIT_ICON = {
  spades   : 'icon-spades',
  hearts   : 'icon-hearts',
  diamonds : 'icon-diamonds',
  clubs    : 'icon-clubs',
};

const SUIT_COLOR_CLASS = {
  spades   : '--black',
  clubs    : '--black',
  hearts   : '--red',
  diamonds : '--red',
};

/* ─────────────────────────────────────────────
   SECTION 3: SCREEN TRANSITIONS
   ───────────────────────────────────────────── */
const UIScreen = {
  showLogin() {
    DOM.screenGame.classList.remove('screen--active');
    DOM.screenLogin.classList.add('screen--active');
  },

  showGame() {
    DOM.screenLogin.classList.remove('screen--active');
    DOM.screenGame.classList.add('screen--active');
  },
};

/* ─────────────────────────────────────────────
   SECTION 4: CONNECTION STATUS UI
   ───────────────────────────────────────────── */
const UIConnection = {
  setChecking() {
    DOM.dotConnection.className = 'status-dot status-dot--checking';
    DOM.textConnection.textContent = 'Mengecek koneksi server...';
  },

  setOnline() {
    DOM.dotConnection.className = 'status-dot status-dot--online';
    DOM.textConnection.textContent = 'Server aktif — Mode Mabar tersedia';
  },

  setOffline() {
    DOM.dotConnection.className = 'status-dot status-dot--offline';
    DOM.textConnection.textContent = 'Server offline — Mode Solo Offline aktif';
  },

  setConnecting() {
    DOM.dotConnection.className = 'status-dot status-dot--checking';
    DOM.textConnection.textContent = 'Sedang terhubung ke server...';
  },
};

/* ─────────────────────────────────────────────
   SECTION 5: HUD UPDATERS
   ───────────────────────────────────────────── */
const UIHud = {
  setMode(mode) {
    // mode: 'online' | 'offline'
    DOM.hudModeBadge.textContent = mode === 'online' ? 'MABAR' : 'SOLO';
    DOM.hudModeBadge.style.borderColor = mode === 'online' ? 'var(--accent-green)' : 'var(--gold-dim)';
    DOM.hudModeBadge.style.background  = mode === 'online' ? 'rgba(61,184,122,0.15)' : 'rgba(212,168,67,0.1)';
    DOM.hudModeBadge.style.color       = mode === 'online' ? 'var(--accent-green)' : 'var(--gold)';
  },

  setPhase(phase) {
    const PHASE_LABELS = {
      LOBBY       : 'LOBBY',
      BETTING     : 'TARUHAN',
      DEALING     : 'BAGI KARTU',
      PLAYER_TURN : 'GILIRAN MAIN',
      DEALER_TURN : 'GILIRAN BANDAR',
      PAYOUT      : 'PEMBAYARAN',
      GAME_OVER   : 'GAME OVER',
    };
    DOM.hudPhaseBadge.textContent = PHASE_LABELS[phase] || phase;
  },

  setRound(num) {
    DOM.hudRoundNum.textContent = num > 0 ? num : '—';
  },

  setRoomId(id) {
    DOM.hudRoomId.textContent = id ? `# ${id}` : '';
  },

  updateSelfInfo(username, balance) {
    DOM.selfName.textContent = username;
    UIHud.updateBalance(balance);
  },

  updateBalance(balance, flash = false) {
    const formatted = `Rp ${balance.toLocaleString('id-ID')}`;
    const prev = DOM.selfBalance.textContent;
    DOM.selfBalance.textContent = formatted;

    if (flash && prev !== formatted) {
      const oldNum = parseInt(prev.replace(/\D/g, ''), 10) || 0;
      const cls    = balance > oldNum ? '--increased' : '--decreased';
      DOM.selfBalance.classList.add(cls);
      setTimeout(() => DOM.selfBalance.classList.remove(cls), 800);
    }
  },

  updateSelfHandValue(value, isBust = false, isBlackjack = false) {
    if (!value && value !== 0) {
      DOM.selfHandVal.textContent = '';
      DOM.selfHandVal.className   = 'self-hand-val';
      return;
    }
    DOM.selfHandVal.textContent = value;
    DOM.selfHandVal.className   = 'self-hand-val' +
      (isBust ? ' --bust' : isBlackjack ? ' --blackjack' : '');
  },
};

/* ─────────────────────────────────────────────
   SECTION 6: CARD RENDERER
   ───────────────────────────────────────────── */
const UICard = {
  /**
   * Build sebuah elemen kartu dari data.
   * @param {Object} cardData - { suit, rank, faceUp, id }
   * @param {number} delay    - animasi delay (ms)
   */
  build(cardData, delay = 0) {
    const el = document.createElement('div');
    el.className    = 'card';
    el.dataset.cardId = cardData.id;
    el.style.animationDelay = `${delay}ms`;

    if (!cardData.faceUp || !cardData.suit) {
      // Kartu tertutup
      el.innerHTML = `
        <div class="card-inner">
          <div class="card-back"></div>
        </div>`;
    } else {
      el.innerHTML = UICard._buildFace(cardData);
    }

    return el;
  },

  _buildFace(cardData) {
    const colorClass = SUIT_COLOR_CLASS[cardData.suit] || '--black';
    const suitId     = SUIT_ICON[cardData.suit];
    return `
      <div class="card-inner">
        <div class="card-face ${colorClass}">
          <div class="card-corner">
            <span class="card-rank">${cardData.rank}</span>
            <svg class="card-suit-sm" viewBox="0 0 24 24"><use href="#${suitId}"/></svg>
          </div>
          <div class="card-center">
            <svg class="card-center-suit" viewBox="0 0 24 24"><use href="#${suitId}"/></svg>
          </div>
          <div class="card-corner card-corner--bottom">
            <span class="card-rank">${cardData.rank}</span>
            <svg class="card-suit-sm" viewBox="0 0 24 24"><use href="#${suitId}"/></svg>
          </div>
        </div>
      </div>`;
  },

  /**
   * Flip kartu tertutup → terbuka dengan animasi 3D.
   */
  flip(cardEl, cardData) {
    cardEl.classList.add('card--flipping');

    setTimeout(() => {
      cardEl.innerHTML = UICard._buildFace(cardData);
      cardEl.classList.remove('card--flipping');
    }, 300);
  },

  /**
   * Tambah kartu ke container dengan slide-in animation.
   */
  appendTo(container, cardData, delay = 0) {
    const el = UICard.build(cardData, delay);
    container.appendChild(el);
    return el;
  },

  /**
   * Update kartu yang sudah ada (flip dari back ke face).
   */
  reveal(container, cardData) {
    const el = container.querySelector(`[data-card-id="${cardData.id}"]`);
    if (el) {
      UICard.flip(el, cardData);
    } else {
      // Kartu belum ada di DOM, tambahkan langsung
      UICard.appendTo(container, cardData);
    }
  },

  clearContainer(container) {
    container.innerHTML = '';
  },
};

/* ─────────────────────────────────────────────
   SECTION 7: DEALER UI
   ───────────────────────────────────────────── */
const UIDealer = {
  render(dealerData) {
    // Render semua kartu dealer
    DOM.dealerHandArea.innerHTML = '';
    if (!dealerData || !dealerData.cards) return;

    dealerData.cards.forEach((card, i) => {
      UICard.appendTo(DOM.dealerHandArea, card, i * 80);
    });

    UIDealer.updateScore(dealerData.value);
  },

  addCard(cardData, dealerValue) {
    const delay = 0;
    UICard.appendTo(DOM.dealerHandArea, cardData, delay);
    UIDealer.updateScore(dealerValue);
  },

  revealHole(dealerData) {
    // Flip kartu ke-2 yang tadinya tertutup
    const cards = DOM.dealerHandArea.querySelectorAll('.card');
    if (cards.length >= 2 && dealerData.cards.length >= 2) {
      const holeCardData = dealerData.cards[1];
      if (holeCardData.faceUp && holeCardData.suit) {
        UICard.flip(cards[1], holeCardData);
      }
    }
    UIDealer.updateScore(dealerData.value);
  },

  updateScore(value) {
    DOM.dealerScoreVal.textContent = value > 0 ? value : '—';
  },

  setStatus(msg, type = '') {
    DOM.dealerStatusMsg.textContent = msg;
    DOM.dealerStatusMsg.className   = 'dealer-status-msg' + (type ? ` --${type}` : '');
  },

  clear() {
    DOM.dealerHandArea.innerHTML    = '';
    DOM.dealerScoreVal.textContent  = '—';
    DOM.dealerStatusMsg.textContent = '';
    DOM.dealerStatusMsg.className   = 'dealer-status-msg';
  },
};

/* ─────────────────────────────────────────────
   SECTION 8: PLAYER SEATS UI
   ───────────────────────────────────────────── */
const UISeats = {
  _seatMap: new Map(), // socketId → seat element

  /**
   * Render seluruh grid seat dari array players.
   */
  renderAll(players, selfSocketId) {
    DOM.seatsContainer.innerHTML = '';
    UISeats._seatMap.clear();

    if (!players || players.length === 0) {
      // Tampilkan seat kosong jika solo
      UISeats._renderEmptySeat(0, selfSocketId);
      return;
    }

    players.forEach(player => {
      UISeats._renderSeat(player, selfSocketId);
    });
  },

  _renderEmptySeat(seatIndex, selfSocketId) {
    const el = document.createElement('div');
    el.className   = 'player-seat player-seat--empty';
    el.dataset.seat = seatIndex;
    el.innerHTML = `
      <div class="seat-hand-area"></div>
      <div class="seat-nameplate">
        <span class="seat-name">Kursi ${seatIndex + 1}</span>
      </div>`;
    DOM.seatsContainer.appendChild(el);
  },

  _renderSeat(player, selfSocketId) {
    const isSelf = player.socketId === selfSocketId;
    const el = document.createElement('div');
    el.className    = `player-seat${isSelf ? ' player-seat--self' : ''}`;
    el.dataset.sid  = player.socketId;
    el.dataset.seat = player.seatIndex;

    el.innerHTML = `
      <div class="seat-hand-area" id="hand-area-${player.socketId}">
        <!-- kartu diinjek JS -->
      </div>
      <div class="seat-nameplate" style="position:relative">
        <span class="seat-name">${_escHtml(player.username)}${isSelf ? ' <span style="color:var(--gold);font-size:.5rem">▲ LO</span>' : ''}</span>
        <span class="seat-score" id="score-${player.socketId}"></span>
        <span class="seat-bet-badge" id="bet-badge-${player.socketId}"></span>
        <span class="seat-result-badge" id="result-badge-${player.socketId}"></span>
      </div>`;

    DOM.seatsContainer.appendChild(el);
    UISeats._seatMap.set(player.socketId, el);

    // Render existing hands if any
    if (player.hands && player.hands.length > 0) {
      const handArea = el.querySelector('.seat-hand-area');
      player.hands.forEach(hand => {
        hand.cards.forEach(card => UICard.appendTo(handArea, card));
      });
      UISeats.updateScore(player.socketId, player.hands);
    }

    // Bet badge
    if (player.hasBet && player.hands[0]) {
      UISeats.showBetBadge(player.socketId, player.hands[0].bet);
    }
  },

  addCard(socketId, cardData, handIdx = 0) {
    const handArea = document.getElementById(`hand-area-${socketId}`);
    if (!handArea) return;
    UICard.appendTo(handArea, cardData);
  },

  updateScore(socketId, hands) {
    const scoreEl = document.getElementById(`score-${socketId}`);
    if (!scoreEl || !hands || hands.length === 0) return;

    const values = hands.map(h => {
      if (h.isBust)       return `<span style="color:var(--accent-red)">${h.value}!</span>`;
      if (h.isBlackjack)  return `<span style="color:var(--gold-bright)">BJ</span>`;
      return h.value || '';
    });
    scoreEl.innerHTML = values.join(' / ');
  },

  showBetBadge(socketId, amount) {
    const badge = document.getElementById(`bet-badge-${socketId}`);
    if (!badge) return;
    badge.textContent = `Rp ${_formatK(amount)}`;
    badge.classList.add('--visible');
  },

  hideBetBadge(socketId) {
    const badge = document.getElementById(`bet-badge-${socketId}`);
    if (badge) badge.classList.remove('--visible');
  },

  setActive(socketId, isActive) {
    UISeats._seatMap.forEach((el, sid) => {
      el.classList.toggle('player-seat--active', sid === socketId && isActive);
    });
  },

  showResult(socketId, result, payout) {
    const badge = document.getElementById(`result-badge-${socketId}`);
    if (!badge) return;

    const LABELS = {
      BLACKJACK : 'BLACKJACK!',
      WIN       : 'MENANG!',
      LOSE      : 'KALAH',
      PUSH      : 'SERI',
      BUST      : 'BUST!',
    };

    const cls = {
      BLACKJACK : '--blackjack',
      WIN       : '--win',
      LOSE      : '--lose',
      PUSH      : '--push',
      BUST      : '--lose',
    }[result] || '--lose';

    badge.textContent = LABELS[result] || result;
    badge.className   = `seat-result-badge --show ${cls}`;

    setTimeout(() => {
      badge.className = 'seat-result-badge';
    }, 4000);
  },

  clearAllHands() {
    document.querySelectorAll('[id^="hand-area-"]').forEach(el => {
      el.innerHTML = '';
    });
    document.querySelectorAll('[id^="score-"]').forEach(el => {
      el.innerHTML = '';
    });
    document.querySelectorAll('[id^="bet-badge-"]').forEach(el => {
      el.classList.remove('--visible');
    });
    document.querySelectorAll('[id^="result-badge-"]').forEach(el => {
      el.className = 'seat-result-badge';
    });
  },

  removeSeat(socketId) {
    const el = UISeats._seatMap.get(socketId);
    if (el) {
      el.style.opacity   = '0';
      el.style.transform = 'scale(0.8)';
      el.style.transition = 'all 0.4s';
      setTimeout(() => el.remove(), 400);
      UISeats._seatMap.delete(socketId);
    }
  },
};

/* ─────────────────────────────────────────────
   SECTION 9: ACTION PANEL CONTROLLER
   ───────────────────────────────────────────── */
const UIPanel = {
  showBetting(currentBet = 0) {
    DOM.bettingPanel.hidden = false;
    DOM.gameActions.hidden  = true;
    DOM.waitingMsg.hidden   = true;
    UIPanel.updateBetDisplay(currentBet);
  },

  showActions(canDouble = false, canSplit = false) {
    DOM.bettingPanel.hidden = true;
    DOM.gameActions.hidden  = false;
    DOM.waitingMsg.hidden   = true;

    DOM.btnDouble.disabled = !canDouble;
    DOM.btnSplit.disabled  = !canSplit;
    DOM.btnHit.disabled    = false;
    DOM.btnStand.disabled  = false;
  },

  showWaiting(msg = 'Nunggu giliran lo...') {
    DOM.bettingPanel.hidden = true;
    DOM.gameActions.hidden  = true;
    DOM.waitingMsg.hidden   = false;
    DOM.waitingText.textContent = msg;
  },

  disableAllActions() {
    DOM.bettingPanel.hidden = true;
    DOM.gameActions.hidden  = true;
    DOM.waitingMsg.hidden   = true;
  },

  updateBetDisplay(amount) {
    DOM.betDisplayAmt.textContent = `Rp ${amount.toLocaleString('id-ID')}`;
    DOM.betDisplayAmt.classList.remove('--bump');
    void DOM.betDisplayAmt.offsetWidth; // reflow
    if (amount > 0) DOM.betDisplayAmt.classList.add('--bump');
  },

  enableBetConfirm(amount, minBet) {
    DOM.btnBetConfirm.disabled = amount < minBet;
  },

  resetBetDisplay() {
    DOM.betDisplayAmt.textContent = 'Rp 0';
    DOM.betDisplayAmt.classList.remove('--bump');
  },

  setChipsEnabled(enabled) {
    DOM.chipBtns.forEach(btn => (btn.disabled = !enabled));
  },
};

/* ─────────────────────────────────────────────
   SECTION 10: TIMER BAR
   ───────────────────────────────────────────── */
const UITimer = {
  _interval   : null,
  _totalMs    : 30000,
  _elapsed    : 0,
  _startTime  : 0,

  start(durationMs = 30000, onExpire) {
    UITimer.stop();
    UITimer._totalMs   = durationMs;
    UITimer._startTime = performance.now();
    DOM.timerFill.style.transition = 'none';
    DOM.timerFill.style.transform  = 'scaleX(1)';
    DOM.timerFill.classList.remove('--urgent');

    UITimer._interval = setInterval(() => {
      const elapsed  = performance.now() - UITimer._startTime;
      const progress = Math.max(0, 1 - elapsed / UITimer._totalMs);
      DOM.timerFill.style.transition = `transform ${100}ms linear`;
      DOM.timerFill.style.transform  = `scaleX(${progress})`;

      if (progress < 0.25) DOM.timerFill.classList.add('--urgent');

      if (progress <= 0) {
        UITimer.stop();
        if (typeof onExpire === 'function') onExpire();
      }
    }, 100);
  },

  stop() {
    if (UITimer._interval) {
      clearInterval(UITimer._interval);
      UITimer._interval = null;
    }
    DOM.timerFill.style.transform = 'scaleX(0)';
    DOM.timerFill.classList.remove('--urgent');
  },
};

/* ─────────────────────────────────────────────
   SECTION 11: TOAST NOTIFICATION SYSTEM
   ───────────────────────────────────────────── */
const UIToast = {
  _queue: [],

  show(message, type = 'info', duration = 3000) {
    const el = document.createElement('div');
    el.className   = `toast --${type}`;
    el.textContent = message;
    DOM.toastContainer.appendChild(el);

    // Auto-remove
    const remove = () => {
      el.classList.add('--leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
      setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
    };

    setTimeout(remove, duration);
    return el;
  },

  info   (msg, dur) { return UIToast.show(msg, 'info', dur); },
  success(msg, dur) { return UIToast.show(msg, 'success', dur); },
  error  (msg, dur) { return UIToast.show(msg, 'error', dur || 4000); },
  warn   (msg, dur) { return UIToast.show(msg, 'warn', dur); },
};

/* ─────────────────────────────────────────────
   SECTION 12: RESULT OVERLAY
   ───────────────────────────────────────────── */
const UIResult = {
  show({ result, headline, sub, amount, newBalance, onContinue }) {
    const ICONS = {
      BLACKJACK : '★',
      WIN       : '✦',
      LOSE      : '✧',
      PUSH      : '◆',
      BUST      : '✗',
    };

    DOM.resultIcon.textContent = ICONS[result] || '◆';
    DOM.resultIcon.style.color = {
      BLACKJACK : 'var(--gold-bright)',
      WIN       : 'var(--accent-green)',
      LOSE      : 'var(--accent-red)',
      PUSH      : 'var(--gold)',
      BUST      : 'var(--accent-red)',
    }[result] || 'var(--white-dim)';

    DOM.resultHeadline.textContent = headline || result;
    DOM.resultSub.textContent      = sub || '';

    if (amount !== null && amount !== undefined) {
      const sign   = amount > 0 ? '+' : '';
      const cls    = amount > 0 ? '--win' : amount < 0 ? '--lose' : '--push';
      DOM.resultAmount.textContent = `${sign}Rp ${Math.abs(amount).toLocaleString('id-ID')}`;
      DOM.resultAmount.className   = `result-amount ${cls}`;
    } else {
      DOM.resultAmount.textContent = '';
    }

    DOM.resultBalanceNew.textContent = newBalance != null
      ? `Saldo baru: Rp ${newBalance.toLocaleString('id-ID')}`
      : '';

    DOM.overlayResult.hidden = false;

    // One-time handler for continue button
    const handler = () => {
      DOM.overlayResult.hidden = true;
      DOM.btnResultContinue.removeEventListener('click', handler);
      if (typeof onContinue === 'function') onContinue();
    };
    DOM.btnResultContinue.addEventListener('click', handler);
  },

  hide() {
    DOM.overlayResult.hidden = true;
  },
};

/* ─────────────────────────────────────────────
   SECTION 13: CHIP ANIMATION
   ───────────────────────────────────────────── */
const UIChip = {
  /**
   * Animasi chip terbang dari sumber ke target.
   */
  fly(fromEl, toEl, color = 'var(--gold)', amount = 0) {
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect   = toEl.getBoundingClientRect();

    const fromX = fromRect.left + fromRect.width  / 2;
    const fromY = fromRect.top  + fromRect.height / 2;
    const toX   = toRect.left   + toRect.width    / 2;
    const toY   = toRect.top    + toRect.height   / 2;

    // Buat beberapa chip untuk efek lebih dramatis
    const count = Math.min(3, Math.floor(amount / 50000) + 1);

    for (let i = 0; i < count; i++) {
      const chip = document.createElement('div');
      chip.className = 'chip-flying';
      chip.style.cssText = `
        left: ${fromX - 14}px;
        top: ${fromY - 14}px;
        --tx: ${toX - fromX + (Math.random() - 0.5) * 20}px;
        --ty: ${toY - fromY + (Math.random() - 0.5) * 20}px;
        animation-delay: ${i * 80}ms;
      `;
      chip.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 40 40">
          <use href="#icon-chip" color="${color}"/>
        </svg>`;
      document.body.appendChild(chip);

      chip.addEventListener('animationend', () => chip.remove(), { once: true });
      setTimeout(() => { if (chip.parentNode) chip.remove(); }, 1200);
    }
  },
};

/* ─────────────────────────────────────────────
   SECTION 14: CELEBRATION / PARTICLE SYSTEM
   ───────────────────────────────────────────── */
const UICelebration = {
  _canvas  : DOM.celebrationCanvas,
  _ctx     : null,
  _particles: [],
  _raf     : null,
  _running : false,

  init() {
    UICelebration._ctx = UICelebration._canvas.getContext('2d');
    UICelebration._resize();
    window.addEventListener('resize', UICelebration._resize);
  },

  _resize() {
    UICelebration._canvas.width  = window.innerWidth;
    UICelebration._canvas.height = window.innerHeight;
  },

  start(type = 'win') {
    if (UICelebration._running) return;
    UICelebration._running = true;
    UICelebration._canvas.classList.add('--active');
    UICelebration._spawnParticles(type);
    UICelebration._loop();

    setTimeout(() => UICelebration.stop(), type === 'blackjack' ? 5000 : 3000);
  },

  stop() {
    UICelebration._running = false;
    UICelebration._canvas.classList.remove('--active');
    cancelAnimationFrame(UICelebration._raf);
    const ctx = UICelebration._ctx;
    if (ctx) ctx.clearRect(0, 0, UICelebration._canvas.width, UICelebration._canvas.height);
    UICelebration._particles = [];
  },

  _spawnParticles(type) {
    const COLORS_WIN = ['#d4a843','#fde68a','#f5d070','#c8903a','#fff'];
    const COLORS_BJ  = ['#d4a843','#fde68a','#ff4466','#4af','#fff','#a8f'];
    const colors = type === 'blackjack' ? COLORS_BJ : COLORS_WIN;
    const count  = type === 'blackjack' ? 160 : 80;
    const W = UICelebration._canvas.width;

    for (let i = 0; i < count; i++) {
      UICelebration._particles.push({
        x     : Math.random() * W,
        y     : -10 - Math.random() * 200,
        vx    : (Math.random() - 0.5) * 4,
        vy    : 2 + Math.random() * 5,
        rot   : Math.random() * 360,
        rotV  : (Math.random() - 0.5) * 8,
        size  : 6 + Math.random() * 8,
        color : colors[Math.floor(Math.random() * colors.length)],
        shape : Math.random() > 0.5 ? 'rect' : 'circle',
        alpha : 1,
        life  : 1,
        decay : 0.005 + Math.random() * 0.01,
      });
    }
  },

  _loop() {
    if (!UICelebration._running && UICelebration._particles.length === 0) return;

    const ctx = UICelebration._ctx;
    const W   = UICelebration._canvas.width;
    const H   = UICelebration._canvas.height;
    ctx.clearRect(0, 0, W, H);

    UICelebration._particles = UICelebration._particles.filter(p => p.life > 0);

    for (const p of UICelebration._particles) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.12; // gravity
      p.rot += p.rotV;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    UICelebration._raf = requestAnimationFrame(UICelebration._loop);
  },
};

/* ─────────────────────────────────────────────
   SECTION 15: AMBIENT PARTICLE BACKGROUND
   ───────────────────────────────────────────── */
const UIParticles = {
  _canvas : DOM.particlesCanvas,
  _ctx    : null,
  _dots   : [],

  init() {
    UIParticles._ctx = UIParticles._canvas.getContext('2d');
    UIParticles._resize();
    window.addEventListener('resize', UIParticles._resize);
    UIParticles._spawn();
    UIParticles._loop();
  },

  _resize() {
    UIParticles._canvas.width  = window.innerWidth;
    UIParticles._canvas.height = window.innerHeight;
  },

  _spawn() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (let i = 0; i < 30; i++) {
      UIParticles._dots.push({
        x    : Math.random() * W,
        y    : Math.random() * H,
        r    : 0.5 + Math.random() * 1.5,
        vx   : (Math.random() - 0.5) * 0.3,
        vy   : (Math.random() - 0.5) * 0.3,
        alpha: 0.1 + Math.random() * 0.3,
      });
    }
  },

  _loop() {
    const ctx = UIParticles._ctx;
    const W   = UIParticles._canvas.width;
    const H   = UIParticles._canvas.height;
    ctx.clearRect(0, 0, W, H);

    for (const d of UIParticles._dots) {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = W;
      if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H;
      if (d.y > H) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,168,67,${d.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(UIParticles._loop);
  },
};

/* ─────────────────────────────────────────────
   SECTION 16: SCREEN SHAKE
   ───────────────────────────────────────────── */
const UIEffect = {
  shake(el = document.body) {
    el.classList.remove('screen-shake');
    void el.offsetWidth;
    el.classList.add('screen-shake');
    el.addEventListener('animationend', () => el.classList.remove('screen-shake'), { once: true });
  },

  glowGold(el) {
    el.classList.add('glow-gold');
    setTimeout(() => el.classList.remove('glow-gold'), 2000);
  },
};

/* ─────────────────────────────────────────────
   SECTION 17: CHAT UI
   ───────────────────────────────────────────── */
const UIChat = {
  _collapsed  : true,
  _unreadCount: 0,
  _isSelf     : null, // function(socketId) → bool

  init(isSelfFn) {
    UIChat._isSelf = isSelfFn;

    DOM.chatHeader.addEventListener('click', UIChat.toggle);
    DOM.chatHeader.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') UIChat.toggle();
    });

    DOM.chatSendBtn.addEventListener('click', UIChat._handleSend);
    DOM.chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') UIChat._handleSend();
    });

    // Mulai collapsed
    DOM.chatOverlay.classList.add('--collapsed');
  },

  show() {
    DOM.chatOverlay.hidden = false;
  },

  hide() {
    DOM.chatOverlay.hidden = true;
  },

  toggle() {
    UIChat._collapsed = !UIChat._collapsed;
    DOM.chatOverlay.classList.toggle('--collapsed', UIChat._collapsed);
    DOM.chatHeader.setAttribute('aria-expanded', String(!UIChat._collapsed));

    if (!UIChat._collapsed) {
      UIChat._resetUnread();
      DOM.chatInput.focus();
    }
  },

  addMessage(entry) {
    const isSelf = typeof UIChat._isSelf === 'function' && UIChat._isSelf(entry.socketId);
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.innerHTML = `
      <span class="chat-msg-author ${isSelf ? '--self' : ''}">${_escHtml(entry.username)}</span>
      <span class="chat-msg-text">${_escHtml(entry.message)}</span>
    `;
    DOM.chatMessages.appendChild(div);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;

    if (UIChat._collapsed) {
      UIChat._unreadCount++;
      DOM.chatUnreadBadge.textContent = UIChat._unreadCount;
      DOM.chatUnreadBadge.hidden      = false;
    }
  },

  _handleSend() {
    const msg = DOM.chatInput.value.trim();
    if (!msg) return;
    DOM.chatInput.value = '';
    // Callback diset dari script.js
    if (typeof UIChat.onSend === 'function') UIChat.onSend(msg);
  },

  _resetUnread() {
    UIChat._unreadCount      = 0;
    DOM.chatUnreadBadge.hidden = true;
  },
};

/* ─────────────────────────────────────────────
   SECTION 18: HELPER UTILITIES
   ───────────────────────────────────────────── */
function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _formatK(amount) {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1) + 'Jt';
  if (amount >= 1_000)     return (amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1) + 'K';
  return amount;
}

/* ─────────────────────────────────────────────
   SECTION 19: RESULT PHRASE GENERATOR
   ───────────────────────────────────────────── */
const UIPhrase = {
  get(result, amount) {
    const phrases = {
      BLACKJACK: [
        { h: 'BLACKJACK! LO RAJA MEJA!', s: 'Langit pun iri sama keberuntungan lo, Bos.' },
        { h: 'NATURAL BLACKJACK!', s: 'Kartu mau apa? Udah sempurna dari sononya.' },
        { h: 'DEWA KARTU HADIR!', s: 'Bandar ketemu lawan yang salah malam ini.' },
      ],
      WIN: [
        { h: 'MENANG! AMBIL DUITNYA!', s: 'Bandar nangis di pojokan. Bagus.' },
        { h: 'LO PANEN BOS!', s: 'Strategi jalan, saldo tebal.' },
        { h: 'HANTAM BALIK!', s: 'Bandar rasa sendal jepit lo.' },
        { h: 'UNTUNG HARI INI!', s: 'Chip makin banyak, senyum makin lebar.' },
      ],
      LOSE: [
        { h: 'KALAH KALI INI...', s: 'Tenang, masih ada ronde berikutnya, Bos.' },
        { h: 'BANDAR MENANG RONDE INI', s: 'Tapi malam masih panjang. Balas dendam!' },
        { h: 'DOWN DULU...', s: 'Strategi di-reset, mental tetap baja.' },
        { h: 'KEOK RONDE INI', s: 'Kasino memang suka ngerjain. Tapi lo lebih suka balik.' },
      ],
      BUST: [
        { h: 'BUST! KELEWATAN!', s: 'Tangan lo rakus tapi dompetnya tipis.' },
        { h: 'OVER 21, BOS!', s: 'Tamak memang mahal. Next round lebih sabar.' },
        { h: 'KEBACUT NIH!', s: 'Kartu bilang "stop", lo malah "hit" lagi.' },
      ],
      PUSH: [
        { h: 'SERI! IMPAS!', s: 'Taruhan balik ke kantong lo. Lanjut!' },
        { h: 'DRAW! SAMA KUAT!', s: 'Bandar kagum. Tapi belum kalah juga.' },
      ],
    };

    const list   = phrases[result] || phrases.PUSH;
    const chosen = list[Math.floor(Math.random() * list.length)];
    return chosen;
  },
};

/* ─────────────────────────────────────────────
   SECTION 20: GLOBAL EXPORT
   ───────────────────────────────────────────── */
window.UI = {
  DOM,
  Screen     : UIScreen,
  Connection : UIConnection,
  Hud        : UIHud,
  Card       : UICard,
  Dealer     : UIDealer,
  Seats      : UISeats,
  Panel      : UIPanel,
  Timer      : UITimer,
  Toast      : UIToast,
  Result     : UIResult,
  Chip       : UIChip,
  Celebration: UICelebration,
  Particles  : UIParticles,
  Effect     : UIEffect,
  Chat       : UIChat,
  Phrase     : UIPhrase,

  // Init all canvas systems
  initAll() {
    UICelebration.init();
    UIParticles.init();
  },
};
