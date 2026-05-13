/**
 * ============================================================
 * script.js — Main Game Controller (Hybrid State Machine)
 * Orkestrasi penuh: deteksi mode, routing event, sinkronisasi
 * antara Online (Socket.io) dan Offline (engine.js) seamlessly.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   SECTION 1: GAME CONTROLLER CLASS
   ───────────────────────────────────────────── */
class BlackjackGame {
  constructor() {
    // Mode & State
    this.mode         = 'offline';   // 'online' | 'offline'
    this.serverOnline = false;
    this.username     = '';
    this.mySocketId   = null;

    // Managers
    this.socket       = null;        // SocketClient instance (online)
    this.engine       = null;        // OfflineGameController instance (offline)

    // Local game state mirror (untuk UI rendering)
    this.state = {
      phase           : 'LOBBY',
      roundNum        : 0,
      balance         : 1_000_000,
      currentBet      : 0,
      pendingBet      : 0,           // bet yang belum dikonfirmasi
      players         : [],
      dealer          : { cards: [], value: 0 },
      currentTurn     : null,
      myHands         : [],
      activeHandIndex : 0,
    };

    // UI shortcuts
    this.UI = window.UI;
    this.DOM = window.UI?.DOM; // Gunakan optional chaining untuk safety
    
    // Flag untuk mencegah event listener ganda
    this._isGameButtonsSetup = false;
  }

  /* ─────────────────────────────────────────
     SECTION 2: INITIALIZATION
     ───────────────────────────────────────── */
  async init() {
    // Init canvas systems
    this.UI.initAll();

    // Setup login UI
    this._setupLoginUI();

    // Probe server
    await this._probeAndUpdateUI();
  }

  async _probeAndUpdateUI() {
    this.UI.Connection.setChecking();

    const online = await window.probeServer();
    this.serverOnline = online;

    if (online) {
      this.UI.Connection.setOnline();
    } else {
      this.UI.Connection.setOffline();
      // Jika mode online dipilih tapi server mati, auto-switch ke offline
      if (this.mode === 'online') {
        this._setMode('offline');
        this.UI.Toast.warn('Server offline — otomatis pindah ke Mode Solo.', 4000);
      }
    }

    this._updateEnterButton();
  }

  /* ─────────────────────────────────────────
     SECTION 3: LOGIN UI SETUP
     ───────────────────────────────────────── */
  _setupLoginUI() {
    const { DOM } = this.UI;

    // Username input
    DOM.inputUsername.addEventListener('input', () => {
      this._updateEnterButton();
    });

    DOM.inputUsername.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._handleEnter();
    });

    // Mode buttons
    DOM.btnModeOnline.addEventListener('click', () => {
      this._setMode('online');
    });

    DOM.btnModeSolo.addEventListener('click', () => {
      this._setMode('offline');
    });

    // Enter button
    DOM.btnMasuk.addEventListener('click', () => this._handleEnter());

    // Default mode
    this._setMode('online');
  }

  _setMode(mode) {
    this.mode = mode;
    const DOM = this.UI.DOM;

    DOM.btnModeOnline.classList.toggle('mode-btn--active', mode === 'online');
    DOM.btnModeSolo.classList.toggle('mode-btn--active',   mode === 'offline');

    this._updateEnterButton();
  }

  _updateEnterButton() {
    const uname  = this.UI.DOM.inputUsername.value.trim();
    const valid  = uname.length >= 2;
    const canPlay = valid && (this.mode === 'offline' || this.serverOnline);
    this.UI.DOM.btnMasuk.disabled = !canPlay;

    // Jika pilih online tapi server mati
    if (this.mode === 'online' && !this.serverOnline) {
      this.UI.DOM.btnMasuk.disabled = true;
    }
    // Solo selalu bisa main jika username valid
    if (this.mode === 'offline' && valid) {
      this.UI.DOM.btnMasuk.disabled = false;
    }
  }

  async _handleEnter() {
    const uname = this.UI.DOM.inputUsername.value.trim();
    if (uname.length < 2) {
      this.UI.Toast.error('Nama lo minimal 2 karakter, Bos!');
      this.UI.DOM.inputUsername.focus();
      return;
    }

    this.username = uname;
    this.UI.DOM.btnMasuk.disabled  = true;
    const btnText = this.UI.DOM.btnMasuk.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'SEDANG MASUK...';

    try {
      if (this.mode === 'online') {
        await this._startOnlineMode();
      } else {
        this._startOfflineMode();
      }
    } catch (err) {
      console.error('[Enter] Error:', err);
      this.UI.Toast.error(`Gagal masuk: ${err.message}`);
      this.UI.DOM.btnMasuk.disabled = false;
      if (btnText) btnText.textContent = 'MASUK KE MEJA';
    }
  }

  /* ─────────────────────────────────────────
     SECTION 4: ONLINE MODE
     ───────────────────────────────────────── */
  async _startOnlineMode() {
    this.UI.Connection.setConnecting();

    this.socket     = new window.SocketClient();
    const connected = await this.socket.connect(this.username);

    if (!connected) {
      // Fallback ke offline
      console.warn('[Game] Koneksi gagal — fallback ke offline mode.');
      this.UI.Toast.warn('Gagal terhubung — otomatis pindah ke Mode Solo Offline.', 4000);
      this.mode = 'offline';
      this.socket = null;
      this._startOfflineMode();
      return;
    }

    // Berhasil konek
    this.mySocketId = this.socket.socketId;
    this._setupOnlineEvents();

    // Join room
    await this.socket.joinRoom();
  }

  _setupOnlineEvents() {
    const s = this.socket;

    s.on('room:joined', (data) => {
      this.state.balance = data.balance;
      this.UI.Hud.setRoomId(data.roomId);
      this.UI.Hud.updateSelfInfo(this.username, data.balance);
      this._enterGameScreen('online');
    });

    s.on('room:player_joined', (data) => {
      this.UI.Toast.info(`${data.username} masuk ke meja.`);
    });

    s.on('room:player_left', (data) => {
      this.UI.Toast.warn(`${data.username} cabut dari meja.`);
      this.UI.Seats.removeSeat(data.socketId);
    });

    s.on('game:state', (state) => {
      this._applyServerState(state);
    });

    s.on('game:deal_start', (data) => {
      this._handleOnlineDeal(data.events);
    });

    s.on('game:player_bet', (data) => {
      this.UI.Seats.showBetBadge(data.socketId, data.amount);
      if (data.socketId === this.mySocketId) {
        this.state.balance = data.balance;
        this.UI.Hud.updateBalance(data.balance, true);
        this.UI.Panel.showWaiting('Menunggu pemain lain pasang taruhan...');
      }
    });

    s.on('game:player_card', (data) => {
      this.UI.Seats.addCard(data.socketId, data.card, data.handIndex);
      if (data.socketId === this.mySocketId) {
        this._updateSelfHandDisplay(data.value, data.bust);
      }
    });

    s.on('game:player_bust', (data) => {
      if (data.socketId === this.mySocketId) {
        this.UI.Toast.error(`BUST! Lo kelebihan ${data.value}. Haduh.`, 3000);
        this.UI.Effect.shake();
      } else {
        this.UI.Toast.info(`${data.username} BUST! Aman.`);
      }
    });

    s.on('game:player_stood', (data) => {
      if (data.socketId !== this.mySocketId) {
        this.UI.Toast.info(`${data.username} pilih STAND.`);
      }
    });

    s.on('game:player_doubled', (data) => {
      this.UI.Seats.addCard(data.socketId, data.card, data.handIndex);
      if (data.socketId === this.mySocketId) {
        this.state.balance = this.state.balance - (data.newBet / 2);
        this.UI.Hud.updateBalance(this.state.balance, true);
        this.UI.Toast.info(`Double Down! Taruhan jadi Rp ${data.newBet.toLocaleString('id-ID')}`);
        this._updateSelfHandDisplay(data.value, data.bust);
      }
    });

    s.on('game:player_split', (data) => {
      if (data.socketId === this.mySocketId) {
        this.UI.Toast.info('Split berhasil! Lo punya 2 tangan sekarang.');
      }
    });

    s.on('game:auto_stand', (data) => {
      this.UI.Toast.warn(`${data.username} auto-stand (timeout).`);
      if (data.socketId === this.mySocketId) {
        this.UI.Panel.showWaiting('Waktu lo habis — auto stand.');
        this.UI.Timer.stop();
      }
    });

    s.on('dealer:card_dealt', (data) => {
      this.UI.Dealer.addCard(data.card, data.dealerValue);
    });

    s.on('game:round_result', (data) => {
      this._handleOnlineRoundResult(data);
    });

    s.on('game:new_round_ready', (data) => {
      this._prepareNextRound(data.phase);
    });

    s.on('chat:message', (entry) => {
      this.UI.Chat.addMessage(entry);
    });

    s.on('game:error', (data) => {
      this.UI.Toast.error(data.message, 4000);
    });

    s.on('disconnected', ({ reason }) => {
      this.UI.Toast.error('Koneksi putus — mencoba sambung ulang...', 5000);
      this.UI.Timer.stop();
    });

    s.on('reconnected', () => {
      this.UI.Toast.success('Terhubung kembali!');
    });
  }

  _applyServerState(state) {
    this.state.phase       = state.phase;
    this.state.roundNum    = state.roundNum;
    this.state.currentTurn = state.currentTurn;

    this.UI.Hud.setPhase(state.phase);
    this.UI.Hud.setRound(state.roundNum);
    this.UI.Dealer.render(state.dealer);

    const me = state.players.find(p => p.socketId === this.mySocketId);
    if (me) {
      this.state.balance = me.balance;
      this.state.myHands = me.hands;
      this.UI.Hud.updateBalance(me.balance, true);

      if (me.hands && me.hands.length > 0) {
        const h = me.hands[me.activeHandIndex || 0];
        if (h) this._updateSelfHandDisplay(h.value, h.isBust, h.isBlackjack);
      }
    }

    this.UI.Seats.renderAll(state.players, this.mySocketId);

    if (state.currentTurn) {
      this.UI.Seats.setActive(state.currentTurn, true);
    }

    this._updateActionPanelOnline(state);
  }

  _updateActionPanelOnline(state) {
    const isMyTurn = state.currentTurn === this.mySocketId;
    const phase    = state.phase;

    if (phase === 'LOBBY' || phase === 'BETTING') {
      const me = state.players.find(p => p.socketId === this.mySocketId);
      if (me && !me.hasBet) {
        this.UI.Panel.showBetting(this.state.pendingBet);
      } else {
        this.UI.Panel.showWaiting('Menunggu semua pemain pasang taruhan...');
      }
    } else if (phase === 'PLAYER_TURN' && isMyTurn) {
      const me = state.players.find(p => p.socketId === this.mySocketId);
      if (me && me.hands.length > 0) {
        const hand = me.hands[me.activeHandIndex || 0];
        this.UI.Panel.showActions(
          hand?.canDouble && me.balance >= hand?.bet,
          hand?.canSplit  && me.balance >= hand?.bet
        );
        this.UI.Timer.start(30000);
      }
    } else if (phase === 'PLAYER_TURN' && !isMyTurn) {
      const activePlayer = state.players.find(p => p.socketId === state.currentTurn);
      this.UI.Panel.showWaiting(`Giliran ${activePlayer?.username || 'pemain lain'}...`);
      this.UI.Timer.start(30000);
    } else if (['DEALER_TURN', 'PAYOUT', 'DEALING'].includes(phase)) {
      this.UI.Panel.showWaiting('Bandar lagi jalan...');
      this.UI.Timer.stop();
    }
  }

  _handleOnlineDeal(events) {
    this.UI.Dealer.clear();
    this.UI.Seats.clearAllHands();

    events.forEach((evt, i) => {
      setTimeout(() => {
        if (evt.type === 'dealer_card') {
          this.UI.Dealer.addCard(evt.card, 0);
        } else if (evt.type === 'player_card') {
          this.UI.Seats.addCard(evt.socketId, evt.card, evt.handIdx);
        }
      }, i * 200);
    });
  }

  _handleOnlineRoundResult(data) {
    this.UI.Timer.stop();
    this.UI.Dealer.render(data.dealerHand);

    if (data.dealerBust) {
      this.UI.Dealer.setStatus('BUST! BANDAR KETIBAN SIAL!', 'bust');
    } else if (data.dealerHand.isBlackjack) {
      this.UI.Dealer.setStatus('BLACKJACK BANDAR!', 'blackjack');
    }

    data.results.forEach(r => {
      r.hands.forEach(h => {
        if (h.result) this.UI.Seats.showResult(r.socketId, h.result, h.payout);
      });
    });

    const myResult = data.results.find(r => r.socketId === this.mySocketId);
    if (myResult) {
      this.state.balance = myResult.balance;
      this.UI.Hud.updateBalance(myResult.balance, true);

      const bestResult = _pickBestResult(myResult.hands);
      const net        = myResult.roundNet;
      const phrase     = this.UI.Phrase.get(bestResult, net);

      if (bestResult === 'BLACKJACK') {
        this.UI.Celebration.start('blackjack');
        this.UI.Effect.shake();
      } else if (bestResult === 'WIN') {
        this.UI.Celebration.start('win');
      } else if (bestResult === 'BUST' || bestResult === 'LOSE') {
        this.UI.Effect.shake();
      }

      setTimeout(() => {
        this.UI.Result.show({
          result     : bestResult,
          headline   : phrase.h,
          sub        : phrase.s,
          amount     : net,
          newBalance : myResult.balance,
          onContinue : () => { /* server triggers new_round_ready */ }
        });
      }, 1500);
    }
  }

  /* ─────────────────────────────────────────
     SECTION 5: OFFLINE MODE
     ───────────────────────────────────────── */
  _startOfflineMode() {
    const { OfflineGameController } = window.GameEngine;
    this.engine = new OfflineGameController(this.username);

    this.mySocketId = 'local-player';
    this.state.balance = this.engine.balance;

    this._setupOfflineEvents();
    this._enterGameScreen('offline');
  }

  _setupOfflineEvents() {
    const e = this.engine;

    e.on('phase_change', ({ phase }) => {
      this.state.phase = phase;
      this.UI.Hud.setPhase(phase);
      this._syncOfflineUI();
    });

    e.on('bet_placed', ({ amount, balance }) => {
      this.state.currentBet = amount;
      this.state.balance    = balance;
      this.UI.Hud.updateBalance(balance, true);
      this.UI.Seats.showBetBadge('local-player', amount);
    });

    e.on('deal_complete', ({ events, state }) => {
      this._renderOfflineDeal(events, state);
    });

    e.on('player_blackjack', () => {
      setTimeout(() => {
        this.UI.Toast.show('BLACKJACK! SEMPURNA!', 'success', 3000);
        this.UI.Celebration.start('blackjack');
        this.UI.Effect.shake();
      }, 600);
    });

    e.on('player_card', ({ card, handIdx, value, bust }) => {
      this.UI.Seats.addCard('local-player', card, handIdx);
      this._updateSelfHandDisplay(value, bust);
    });

    e.on('player_bust', ({ handIdx, value }) => {
      this.UI.Toast.error(`BUST! Tangan lo ${value}. Kebacut, Bos!`, 3000);
      this.UI.Effect.shake();
      this._updateSelfHandDisplay(value, true);
    });

    e.on('player_stood', () => {
      this.UI.Panel.showWaiting('Bandar lagi jalan...');
    });

    e.on('player_doubled', ({ card, handIdx, newBet, bust, value }) => {
      this.UI.Seats.addCard('local-player', card, handIdx);
      this.UI.Toast.info(`Double Down! Taruhan jadi Rp ${newBet.toLocaleString('id-ID')}`);
      this.UI.Hud.updateBalance(this.engine.balance, true);
      this._updateSelfHandDisplay(value, bust);
    });

    e.on('player_split', ({ hand, newHand, activeHandIndex }) => {
      const area = document.getElementById('hand-area-local-player');
      if (area) {
        area.innerHTML = '';
        this.engine.hands.forEach(h => {
          h.cards.forEach(c => this.UI.Card.appendTo(area, c.toJSON()));
        });
      }
      this.UI.Toast.info('Split! Lo punya 2 tangan sekarang.');
      this.UI.Hud.updateBalance(this.engine.balance, true);
    });

    e.on('hand_changed', ({ activeHandIndex }) => {
      this.state.activeHandIndex = activeHandIndex;
      this.UI.Toast.info(`Lanjut ke tangan ${activeHandIndex + 1}`);
      this._syncOfflineUI();
    });

    e.on('dealer_turn_start', ({ dealer }) => {
      this.UI.Dealer.revealHole(dealer);
      this.UI.Panel.showWaiting('Bandar lagi jalan...');
      this.UI.Timer.stop();
    });

    e.on('dealer_card_dealt', ({ card, dealerValue }) => {
      this.UI.Dealer.addCard(card, dealerValue);
    });

    e.on('dealer_turn_end', ({ dealer }) => {
      if (dealer.isBust) {
        this.UI.Dealer.setStatus('BANDAR BUST! LO PANEN BOS!', 'bust');
      } else if (dealer.isBlackjack) {
        this.UI.Dealer.setStatus('BLACKJACK BANDAR!', 'blackjack');
      }
    });

    e.on('round_result', ({ results, dealer }) => {
      this._handleOfflineRoundResult(results, dealer);
    });

    e.on('new_round_ready', ({ phase, balance }) => {
      this.state.balance = balance;
      this._prepareNextRound(phase);
    });
  }

  _renderOfflineDeal(events, state) {
    this.UI.Dealer.clear();
    this.UI.Seats.clearAllHands();

    events.forEach((evt, i) => {
      setTimeout(() => {
        if (evt.type === 'dealer_card') {
          this.UI.Dealer.addCard(evt.card, state.dealer.value);
        } else if (evt.type === 'player_card') {
          this.UI.Seats.addCard('local-player', evt.card, evt.handIdx);
        }
      }, i * 200);
    });

    setTimeout(() => {
      this._syncOfflineUI();
    }, events.length * 200 + 300);
  }

  _syncOfflineUI() {
    if (!this.engine) return;
    const state = this.engine.getState();

    this.UI.Hud.setRound(state.roundNum);
    this.UI.Hud.updateBalance(state.balance, false);
    this.UI.Seats.updateScore('local-player', state.hands);

    const phase = state.phase;
    if (phase === 'LOBBY' || phase === 'BETTING') {
      this.UI.Panel.showBetting(this.state.pendingBet);
      this.UI.Panel.enableBetConfirm(this.state.pendingBet, 10_000);
    } else if (phase === 'PLAYER_TURN') {
      const hand = state.hands[state.activeHandIndex];
      this.UI.Panel.showActions(
        hand?.canDouble && state.balance >= hand?.bet,
        hand?.canSplit  && state.balance >= hand?.bet
      );
      this._updateSelfHandDisplay(hand?.value, hand?.isBust, hand?.isBlackjack);
    }
  }

  _handleOfflineRoundResult(results, dealer) {
    this.UI.Timer.stop();
    this.UI.Dealer.render(dealer);

    results.forEach(r => {
      this.UI.Seats.showResult('local-player', r.result, r.payout);
    });

    const bestResult = _pickBestResult(results.map(r => r.hand));
    const totalPayout = results.reduce((s, r) => s + r.payout, 0);
    const totalBet    = results.reduce((s, r) => s + r.hand.bet, 0);
    const net         = totalPayout - totalBet;
    const phrase      = this.UI.Phrase.get(bestResult, net);

    if (bestResult === 'BLACKJACK') {
      this.UI.Celebration.start('blackjack');
      this.UI.Effect.shake();
    } else if (bestResult === 'WIN') {
      this.UI.Celebration.start('win');
    } else if (['BUST','LOSE'].includes(bestResult)) {
      this.UI.Effect.shake();
    }

    setTimeout(() => {
      this.UI.Result.show({
        result     : bestResult,
        headline   : phrase.h,
        sub        : phrase.s,
        amount     : net,
        newBalance : this.engine.balance,
        onContinue : () => {
          this.engine.resetForNextRound();
          this._syncOfflineUI();
        }
      });
    }, 1500);
  }

  /* ─────────────────────────────────────────
     SECTION 6: COMMON GAME SCREEN SETUP
     ───────────────────────────────────────── */
  _enterGameScreen(mode) {
    this.UI.Screen.showGame();
    this.UI.Hud.setMode(mode);
    this.UI.Hud.updateSelfInfo(this.username, this.state.balance);

    if (mode === 'offline') {
      this.UI.Seats.renderAll([{
        socketId    : 'local-player',
        username    : this.username,
        seatIndex   : 0,
        hands       : [],
        hasBet      : false,
        isConnected : true,
      }], 'local-player');
    }

    this._setupGameButtons();

    if (mode === 'online') {
      this.UI.Chat.init((socketId) => socketId === this.mySocketId);
      this.UI.Chat.show();
      this.UI.Chat.onSend = (msg) => {
        this.socket.sendChat(msg).catch(err => {
          this.UI.Toast.error(err.message);
        });
      };
    } else {
      this.UI.Chat.hide();
    }

    this.UI.DOM.btnLeave.addEventListener('click', () => this._handleLeave(), { once: true });

    this.UI.Panel.showBetting(0);
    this.UI.Panel.enableBetConfirm(0, 10_000);
    this.UI.Hud.setPhase('LOBBY');
    this.UI.Hud.setRound(0);
  }

  /* ─────────────────────────────────────────
     SECTION 7: GAME BUTTONS SETUP
     ───────────────────────────────────────── */
  _setupGameButtons() {
    // Mencegah duplicate event listener kalau user leave lalu join meja lagi
    if (this._isGameButtonsSetup) return;
    this._isGameButtonsSetup = true;

    const { DOM } = this.UI;

    // ── Chip selector ──
    DOM.chipBtns.forEach(btn => {
      // FIX: Menambahkan parameter (e) agar bisa di-pass ke function _addToBet
      btn.addEventListener('click', (e) => {
        const amount = parseInt(btn.dataset.amount, 10);
        this._addToBet(amount, e);
      });
    });

    // ── Bet controls ──
    DOM.btnBetClear.addEventListener('click', () => {
      this.state.pendingBet = 0;
      this.UI.Panel.updateBetDisplay(0);
      this.UI.Panel.enableBetConfirm(0, 10_000);
    });

    DOM.btnBetConfirm.addEventListener('click', () => {
      this._confirmBet();
    });

    // ── Game actions ──
    DOM.btnHit.addEventListener('click',    () => this._actionHit());
    DOM.btnStand.addEventListener('click',  () => this._actionStand());
    DOM.btnDouble.addEventListener('click', () => this._actionDouble());
    DOM.btnSplit.addEventListener('click',  () => this._actionSplit());
  }

  // FIX: Menangkap parameter event
  _addToBet(amount, event) {
    const maxBet = 500_000;
    const newBet = this.state.pendingBet + amount;

    if (newBet > this.state.balance) {
      this.UI.Toast.warn('Saldo lo kurang, Bos!');
      return;
    }
    if (newBet > maxBet) {
      this.UI.Toast.warn(`Taruhan maksimal Rp ${maxBet.toLocaleString('id-ID')}`);
      return;
    }

    this.state.pendingBet = newBet;
    this.UI.Panel.updateBetDisplay(newBet);
    this.UI.Panel.enableBetConfirm(newBet, 10_000);

    // FIX: Mengambil element yang di-klik secara aman dari parameter event
    const chipBtn     = event ? event.currentTarget : null;
    const displayEl   = this.UI.DOM.betDisplayAmt;
    
    if (chipBtn && this.UI.Chip) {
      this.UI.Chip.fly(chipBtn, displayEl, _chipColor(amount), amount);
    }
  }

  async _confirmBet() {
    const amount = this.state.pendingBet;
    if (amount < 10_000) {
      this.UI.Toast.warn('Taruhan minimal Rp 10.000, Bos!');
      return;
    }

    this.UI.DOM.btnBetConfirm.disabled = true;

    try {
      if (this.mode === 'online') {
        await this.socket.placeBet(amount);
      } else {
        this.engine.placeBet(amount);
        setTimeout(() => {
          try {
            this.engine.deal();
          } catch (err) {
            this.UI.Toast.error(err.message);
          }
        }, 500);
      }
      this.state.pendingBet = 0;
      this.UI.Panel.resetBetDisplay();
    } catch (err) {
      this.UI.Toast.error(err.message);
      this.UI.DOM.btnBetConfirm.disabled = false;
    }
  }

  /* ─────────────────────────────────────────
     SECTION 8: PLAYER ACTIONS
     ───────────────────────────────────────── */
  async _actionHit() {
    this._disableActionsTemp();
    try {
      if (this.mode === 'online') {
        await this.socket.hit();
      } else {
        this.engine.hit();
      }
    } catch (err) {
      this.UI.Toast.error(err.message);
      this._reenableActions();
    }
  }

  async _actionStand() {
    this._disableActionsTemp();
    try {
      if (this.mode === 'online') {
        this.UI.Timer.stop();
        await this.socket.stand();
        this.UI.Panel.showWaiting('Lo STAND. Nunggu pemain lain...');
      } else {
        this.engine.stand();
      }
    } catch (err) {
      this.UI.Toast.error(err.message);
      this._reenableActions();
    }
  }

  async _actionDouble() {
    this._disableActionsTemp();
    try {
      if (this.mode === 'online') {
        await this.socket.doubleDown();
      } else {
        this.engine.doubleDown();
      }
    } catch (err) {
      this.UI.Toast.error(err.message);
      this._reenableActions();
    }
  }

  async _actionSplit() {
    this._disableActionsTemp();
    try {
      if (this.mode === 'online') {
        await this.socket.split();
      } else {
        this.engine.split();
        this._syncOfflineUI();
      }
    } catch (err) {
      this.UI.Toast.error(err.message);
      this._reenableActions();
    }
  }

  _disableActionsTemp() {
    const btns = [
      this.UI.DOM.btnHit,
      this.UI.DOM.btnStand,
      this.UI.DOM.btnDouble,
      this.UI.DOM.btnSplit,
    ];
    btns.forEach(b => (b.disabled = true));

    setTimeout(() => this._reenableActions(), 800);
  }

  _reenableActions() {
    if (this.mode === 'online') return; 
    if (this.engine?.phase === 'PLAYER_TURN') {
      this._syncOfflineUI();
    }
  }

  /* ─────────────────────────────────────────
     SECTION 9: ROUND TRANSITION
     ───────────────────────────────────────── */
  _prepareNextRound(phase) {
    this.UI.Dealer.clear();
    this.UI.Seats.clearAllHands();
    this.UI.Timer.stop();
    this.UI.Hud.updateSelfInfo(this.username, this.state.balance);
    this.UI.Hud.setPhase(phase);
    this.UI.Hud.updateSelfHandValue(null);

    if (phase === 'GAME_OVER') {
      this.UI.Toast.error('Saldo lo habis, Bos! Game Over.', 5000);
      this.UI.Panel.disableAllActions();
      setTimeout(() => this._handleLeave(), 5000);
      return;
    }

    this.state.pendingBet = 0;
    this.UI.Panel.showBetting(0);
    this.UI.Panel.resetBetDisplay();
    this.UI.Panel.enableBetConfirm(0, 10_000);
    this.UI.DOM.btnBetConfirm.disabled = true;

    if (this.mode === 'online') {
      this.UI.Toast.info('Ronde baru dimulai! Pasang taruhan lo.');
    } else {
      this.UI.Toast.info('Ronde baru! Pasang taruhan, Bos.');
    }
  }

  /* ─────────────────────────────────────────
     SECTION 10: LEAVE GAME
     ───────────────────────────────────────── */
  _handleLeave() {
    if (this.mode === 'online' && this.socket) {
      this.socket.disconnect();
    }
    this.engine     = null;
    this.socket     = null;
    this.mySocketId = null;

    this.state = {
      phase: 'LOBBY', roundNum: 0, balance: 1_000_000,
      currentBet: 0, pendingBet: 0, players: [], dealer: { cards: [], value: 0 },
      currentTurn: null, myHands: [], activeHandIndex: 0,
    };

    this.UI.Dealer.clear();
    this.UI.Seats.clearAllHands();
    this.UI.Timer.stop();
    this.UI.Celebration.stop();
    this.UI.Result.hide();
    this.UI.Chat.hide();
    this.UI.Hud.setRoomId('');
    this.UI.DOM.btnMasuk.disabled = false;
    const btnText = this.UI.DOM.btnMasuk.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'MASUK KE MEJA';

    this.UI.Screen.showLogin();
    this._probeAndUpdateUI();
  }

  /* ─────────────────────────────────────────
     SECTION 11: SHARED UI HELPERS
     ───────────────────────────────────────── */
  _updateSelfHandDisplay(value, isBust = false, isBlackjack = false) {
    this.UI.Hud.updateSelfHandValue(value, isBust, isBlackjack);

    const hands = this.mode === 'offline'
      ? (this.engine?.hands?.map(h => h.toJSON()) || [])
      : this.state.myHands;
    this.UI.Seats.updateScore('local-player', hands);

    if (this.mode === 'online') {
      this.UI.Seats.updateScore(this.mySocketId, this.state.myHands);
    }
  }
}

/* ─────────────────────────────────────────────
   SECTION 12: UTILITY FUNCTIONS
   ───────────────────────────────────────────── */
function _pickBestResult(hands) {
  if (!hands || hands.length === 0) return 'LOSE';
  const priority = ['BLACKJACK','WIN','PUSH','BUST','LOSE'];
  const results  = hands.map(h => h.result).filter(Boolean);
  for (const p of priority) {
    if (results.includes(p)) return p;
  }
  return results[0] || 'LOSE';
}

function _chipColor(amount) {
  if (amount >= 500_000) return '#e67e22';
  if (amount >= 250_000) return '#9b59b6';
  if (amount >= 100_000) return '#f0ad4e';
  if (amount >= 50_000)  return '#d9534f';
  if (amount >= 25_000)  return '#5cb85c';
  return '#4a90d9';
}

/* ─────────────────────────────────────────────
   SECTION 13: BOOT SEQUENCE
   ───────────────────────────────────────────── */
(async function boot() {
  await new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });

  if (!window.UI) {
    console.error('[Boot] UI module tidak ditemukan!');
    return;
  }
  if (!window.GameEngine) {
    console.error('[Boot] GameEngine tidak ditemukan!');
    return;
  }
  if (!window.SocketClient) {
    console.error('[Boot] SocketClient tidak ditemukan!');
    return;
  }

  const game = new BlackjackGame();
  window._game = game; 

  await game.init();

  console.log(`
  ╔═══════════════════════════════════════╗
  ║   BLACKJACK UNDERGROUND — READY       ║
  ║   Mode default: ${game.mode.padEnd(20)}║
  ╚═══════════════════════════════════════╝
  `);
})();
