/**
 * ============================================================
 * BLACKJACK UNDERGROUND — SERVER CORE
 * Arsitektur: Event-Driven State Machine + Socket.io Real-time
 * Stack: Node.js + Express + Socket.io
 * Author: Lead Game Architect
 * ============================================================
 */

'use strict';

// ─────────────────────────────────────────────
// SECTION 1: DEPENDENCY IMPORTS & INITIALIZATION
// ─────────────────────────────────────────────
const express       = require('express');
const http          = require('http');
const { Server }    = require('socket.io');
const path          = require('path');
const crypto        = require('crypto');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin      : '*',
    methods     : ['GET', 'POST'],
    credentials : false,
  },
  pingTimeout  : 20000,
  pingInterval : 10000,
});

// ─────────────────────────────────────────────
// SECTION 2: SERVER CONFIG CONSTANTS
// ─────────────────────────────────────────────
const CONFIG = Object.freeze({
  PORT              : process.env.PORT || 3000,
  MAX_PLAYERS       : 4,
  STARTING_BALANCE  : 1_000_000,          // Rp 1.000.000
  MIN_BET           : 10_000,
  MAX_BET           : 500_000,
  BLACKJACK_PAYOUT  : 1.5,               // 3:2
  DEALER_STAND_MIN  : 17,
  DECK_COUNT        : 6,                  // 6-deck shoe
  SHUFFLE_THRESHOLD : 0.25,              // reshuffle saat < 25% sisa
  TURN_TIMEOUT_MS   : 30_000,            // 30 detik per giliran
  CHAT_HISTORY_MAX  : 80,
  ACTION_DELAY_MS   : 600,               // delay animasi antar aksi
});

// ─────────────────────────────────────────────
// SECTION 3: GAME STATE ENUMS
// ─────────────────────────────────────────────
const GamePhase = Object.freeze({
  LOBBY        : 'LOBBY',
  BETTING      : 'BETTING',
  DEALING      : 'DEALING',
  PLAYER_TURN  : 'PLAYER_TURN',
  DEALER_TURN  : 'DEALER_TURN',
  PAYOUT       : 'PAYOUT',
  GAME_OVER    : 'GAME_OVER',
});

const HandResult = Object.freeze({
  BLACKJACK    : 'BLACKJACK',
  WIN          : 'WIN',
  LOSE         : 'LOSE',
  PUSH         : 'PUSH',
  BUST         : 'BUST',
  SURRENDER    : 'SURRENDER',
});

const PlayerAction = Object.freeze({
  HIT          : 'HIT',
  STAND        : 'STAND',
  DOUBLE_DOWN  : 'DOUBLE_DOWN',
  SPLIT        : 'SPLIT',
  BET          : 'BET',
});

// ─────────────────────────────────────────────
// SECTION 4: CARD & DECK ENGINE
// ─────────────────────────────────────────────
class Card {
  constructor(suit, rank) {
    this.suit   = suit;   // 'spades' | 'hearts' | 'diamonds' | 'clubs'
    this.rank   = rank;   // '2'–'10' | 'J' | 'Q' | 'K' | 'A'
    this.faceUp = true;
    this.id     = crypto.randomBytes(4).toString('hex');
  }

  get value() {
    if (['J', 'Q', 'K'].includes(this.rank)) return 10;
    if (this.rank === 'A') return 11;
    return parseInt(this.rank, 10);
  }

  toJSON() {
    return {
      id     : this.id,
      suit   : this.suit,
      rank   : this.rank,
      value  : this.value,
      faceUp : this.faceUp,
    };
  }
}

class Shoe {
  constructor(deckCount = CONFIG.DECK_COUNT) {
    this.deckCount  = deckCount;
    this.cards      = [];
    this._build();
    this._shuffle();
  }

  _build() {
    const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
    const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    this.cards = [];
    for (let d = 0; d < this.deckCount; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push(new Card(suit, rank));
        }
      }
    }
    this._total = this.cards.length;
  }

  _shuffle() {
    // Fisher-Yates
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(faceUp = true) {
    if (this.needsShuffle) this._rebuild();
    const card   = this.cards.pop();
    card.faceUp  = faceUp;
    return card;
  }

  get needsShuffle() {
    return this.cards.length / this._total < CONFIG.SHUFFLE_THRESHOLD;
  }

  _rebuild() {
    console.log('[Shoe] Reshuffling shoe...');
    this._build();
    this._shuffle();
  }

  get remaining() { return this.cards.length; }
}

// ─────────────────────────────────────────────
// SECTION 5: HAND ENGINE (Kalkulasi AS mutlak)
// ─────────────────────────────────────────────
class Hand {
  constructor(bet = 0) {
    this.cards      = [];
    this.bet        = bet;
    this.isStood    = false;
    this.isDoubled  = false;
    this.isSplit    = false;
    this.result     = null;
    this.payout     = 0;
  }

  addCard(card) {
    this.cards.push(card);
    return this;
  }

  /**
   * Kalkulasi nilai tangan — AS dihitung 1 atau 11.
   * Algoritma: jumlahkan semua kartu dengan Ace = 11,
   * lalu kurangi 10 per Ace selama total > 21.
   */
  get value() {
    let total = 0;
    let aces  = 0;
    for (const card of this.cards) {
      if (!card.faceUp) continue;  // kartu tertutup tidak dihitung
      total += card.value;
      if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }

  /**
   * Nilai total termasuk kartu tertutup (untuk kalkulasi internal dealer).
   */
  get trueValue() {
    let total = 0;
    let aces  = 0;
    for (const card of this.cards) {
      total += card.value;
      if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }

  get isBust()      { return this.value > 21; }
  get isBlackjack() { return this.cards.length === 2 && this.value === 21 && !this.isSplit; }
  get isSoft()      {
    let total = 0, aces = 0;
    for (const c of this.cards) { if (c.faceUp) { total += c.value; if (c.rank === 'A') aces++; } }
    return aces > 0 && total <= 21 && (total - 10) <= 21;
  }
  get canSplit()    { return this.cards.length === 2 && this.cards[0].rank === this.cards[1].rank; }
  get canDouble()   { return this.cards.length === 2 && !this.isStood && !this.isDoubled; }

  revealAll() {
    this.cards.forEach(c => (c.faceUp = true));
  }

  toJSON() {
    return {
      cards     : this.cards.map(c => c.toJSON()),
      value     : this.value,
      bet       : this.bet,
      isStood   : this.isStood,
      isDoubled : this.isDoubled,
      isSplit   : this.isSplit,
      isBust    : this.isBust,
      isBlackjack: this.isBlackjack,
      result    : this.result,
      payout    : this.payout,
    };
  }
}

// ─────────────────────────────────────────────
// SECTION 6: PLAYER MODEL
// ─────────────────────────────────────────────
class Player {
  constructor(socketId, username) {
    this.socketId  = socketId;
    this.username  = username;
    this.balance   = CONFIG.STARTING_BALANCE;
    this.hands     = [];           // bisa lebih dari 1 setelah split
    this.activeHandIndex = 0;
    this.hasBet    = false;
    this.isReady   = false;
    this.seatIndex = -1;
    this.isConnected = true;
    this.totalWon  = 0;
    this.totalLost = 0;
  }

  get activeHand() { return this.hands[this.activeHandIndex] || null; }
  get allHandsDone() {
    return this.hands.every(h => h.isStood || h.isBust || h.isBlackjack);
  }
  get totalBet() { return this.hands.reduce((s, h) => s + h.bet, 0); }

  placeBet(amount) {
    if (amount < CONFIG.MIN_BET) throw new Error(`Taruhan minimal Rp ${CONFIG.MIN_BET.toLocaleString('id-ID')}`);
    if (amount > CONFIG.MAX_BET) throw new Error(`Taruhan maksimal Rp ${CONFIG.MAX_BET.toLocaleString('id-ID')}`);
    if (amount > this.balance)   throw new Error(`Saldo lo kurang, Bos!`);
    this.hands = [new Hand(amount)];
    this.balance -= amount;
    this.hasBet   = true;
    this.activeHandIndex = 0;
    return this.hands[0];
  }

  split(shoe) {
    const hand = this.activeHand;
    if (!hand || !hand.canSplit) throw new Error('Split tidak tersedia sekarang');
    if (this.balance < hand.bet) throw new Error('Saldo tidak cukup untuk split');

    this.balance -= hand.bet;
    const newHand = new Hand(hand.bet);
    newHand.isSplit = true;
    hand.isSplit    = true;

    // pindahkan kartu ke-2 ke tangan baru
    const splitCard = hand.cards.splice(1, 1)[0];
    newHand.addCard(splitCard);

    // bagikan 1 kartu baru ke masing-masing
    hand.addCard(shoe.deal(true));
    newHand.addCard(shoe.deal(true));

    this.hands.splice(this.activeHandIndex + 1, 0, newHand);
    return { hand: hand.toJSON(), newHand: newHand.toJSON() };
  }

  advanceHand() {
    for (let i = this.activeHandIndex + 1; i < this.hands.length; i++) {
      if (!this.hands[i].isStood && !this.hands[i].isBust) {
        this.activeHandIndex = i;
        return true;
      }
    }
    return false;   // semua tangan selesai
  }

  resetRound() {
    this.hands           = [];
    this.activeHandIndex = 0;
    this.hasBet          = false;
    this.isReady         = false;
  }

  toJSON(hideBalance = false) {
    return {
      socketId   : this.socketId,
      username   : this.username,
      balance    : hideBalance ? null : this.balance,
      hands      : this.hands.map(h => h.toJSON()),
      hasBet     : this.hasBet,
      seatIndex  : this.seatIndex,
      isConnected: this.isConnected,
      totalWon   : this.totalWon,
      totalLost  : this.totalLost,
    };
  }
}

// ─────────────────────────────────────────────
// SECTION 7: DEALER AI ENGINE
// ─────────────────────────────────────────────
class Dealer {
  constructor() {
    this.hand = new Hand(0);
  }

  reset() {
    this.hand = new Hand(0);
  }

  revealHoleCard() {
    this.hand.revealAll();
  }

  /**
   * Dealer harus hit sampai nilai >= 17.
   * Soft 17 = tetap hit (Vegas Strip rules).
   */
  async playTurn(shoe, onCardDealt) {
    this.revealHoleCard();

    while (this.hand.trueValue < CONFIG.DEALER_STAND_MIN) {
      await _delay(CONFIG.ACTION_DELAY_MS);
      const card = shoe.deal(true);
      this.hand.addCard(card);
      if (typeof onCardDealt === 'function') onCardDealt(card);
    }
  }

  get value()       { return this.hand.trueValue; }
  get isBust()      { return this.hand.isBust; }
  get isBlackjack() { return this.hand.isBlackjack; }

  toJSON(hideHole = false) {
    const cards = this.hand.cards.map((c, i) => {
      if (hideHole && i === 1 && !c.faceUp) {
        return { id: c.id, suit: null, rank: null, value: null, faceUp: false };
      }
      return c.toJSON();
    });
    return {
      cards,
      value     : hideHole ? this.hand.value : this.hand.trueValue,
      isBlackjack: this.hand.isBlackjack,
      isBust    : this.hand.isBust,
    };
  }
}

// ─────────────────────────────────────────────
// SECTION 8: PAYOUT CALCULATOR
// ─────────────────────────────────────────────
class PayoutEngine {
  static resolve(playerHand, dealer) {
    const dVal  = dealer.value;
    const pVal  = playerHand.value;
    const dBust = dealer.isBust;
    const dBJ   = dealer.isBlackjack;
    const pBJ   = playerHand.isBlackjack;
    const pBust = playerHand.isBust;

    let result;
    let multiplier = 0;

    if (pBust) {
      result     = HandResult.BUST;
      multiplier = 0;
    } else if (pBJ && dBJ) {
      result     = HandResult.PUSH;
      multiplier = 1;  // kembalikan taruhan
    } else if (pBJ) {
      result     = HandResult.BLACKJACK;
      multiplier = 1 + CONFIG.BLACKJACK_PAYOUT;  // 2.5x
    } else if (dBJ) {
      result     = HandResult.LOSE;
      multiplier = 0;
    } else if (dBust) {
      result     = HandResult.WIN;
      multiplier = 2;
    } else if (pVal > dVal) {
      result     = HandResult.WIN;
      multiplier = 2;
    } else if (pVal === dVal) {
      result     = HandResult.PUSH;
      multiplier = 1;
    } else {
      result     = HandResult.LOSE;
      multiplier = 0;
    }

    const payout = Math.floor(playerHand.bet * multiplier);
    return { result, payout, multiplier };
  }
}

// ─────────────────────────────────────────────
// SECTION 9: GAME ROOM STATE MACHINE
// ─────────────────────────────────────────────
class GameRoom {
  constructor(roomId) {
    this.roomId    = roomId;
    this.phase     = GamePhase.LOBBY;
    this.players   = new Map();   // socketId → Player
    this.dealer    = new Dealer();
    this.shoe      = new Shoe(CONFIG.DECK_COUNT);
    this.chatLog   = [];
    this.roundNum  = 0;
    this.turnOrder = [];           // array socketId urutan giliran
    this.currentTurnIndex = 0;
    this._turnTimer = null;
  }

  // ── SEAT MANAGEMENT ──────────────────────────
  addPlayer(socketId, username) {
    if (this.players.size >= CONFIG.MAX_PLAYERS) {
      throw new Error('Meja penuh, Bos! Max 4 pemain.');
    }
    const occupiedSeats = [...this.players.values()].map(p => p.seatIndex);
    let seat = 0;
    while (occupiedSeats.includes(seat)) seat++;

    const player       = new Player(socketId, username);
    player.seatIndex   = seat;
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      player.isConnected = false;
      this.players.delete(socketId);
    }
    return player;
  }

  getPlayer(socketId) { return this.players.get(socketId) || null; }

  get activePlayers() {
    return [...this.players.values()].filter(p => p.isConnected);
  }

  get allPlayersReady() {
    return this.activePlayers.length > 0 && this.activePlayers.every(p => p.isReady);
  }

  get allBetsPlaced() {
    return this.activePlayers.length > 0 && this.activePlayers.every(p => p.hasBet);
  }

  // ── PHASE TRANSITIONS (State Machine) ────────
  transitionTo(phase) {
    const allowed = {
      [GamePhase.LOBBY]       : [GamePhase.BETTING],
      [GamePhase.BETTING]     : [GamePhase.DEALING],
      [GamePhase.DEALING]     : [GamePhase.PLAYER_TURN],
      [GamePhase.PLAYER_TURN] : [GamePhase.DEALER_TURN, GamePhase.PLAYER_TURN],
      [GamePhase.DEALER_TURN] : [GamePhase.PAYOUT],
      [GamePhase.PAYOUT]      : [GamePhase.BETTING, GamePhase.GAME_OVER],
      [GamePhase.GAME_OVER]   : [GamePhase.BETTING],
    };
    if (!allowed[this.phase]?.includes(phase)) {
      throw new Error(`Transisi fase tidak valid: ${this.phase} → ${phase}`);
    }
    this.phase = phase;
    return this;
  }

  // ── DEALING PHASE ─────────────────────────────
  dealInitialCards() {
    this.transitionTo(GamePhase.DEALING);
    this.dealer.reset();
    this.roundNum++;

    const events = [];

    // Bagi 2 putaran (selang-seling ala kasino nyata)
    for (let round = 0; round < 2; round++) {
      for (const player of this.activePlayers) {
        const hand = player.hands[0];
        const card = this.shoe.deal(true);
        hand.addCard(card);
        events.push({ type: 'player_card', socketId: player.socketId, card: card.toJSON(), handIdx: 0 });
      }
      // Dealer: kartu ke-2 tertutup
      const faceUp = (round === 0);
      const dCard  = this.shoe.deal(faceUp);
      this.dealer.hand.addCard(dCard);
      events.push({ type: 'dealer_card', card: dCard.toJSON() });
    }

    // Setup giliran
    this.turnOrder = this.activePlayers
      .sort((a, b) => a.seatIndex - b.seatIndex)
      .map(p => p.socketId);
    this.currentTurnIndex = 0;

    return events;
  }

  // ── PLAYER TURN ENGINE ────────────────────────
  getCurrentTurnPlayer() {
    return this.players.get(this.turnOrder[this.currentTurnIndex]) || null;
  }

  advanceTurn() {
    this._clearTurnTimer();
    this.currentTurnIndex++;

    // Cek apakah ada hand split yang belum selesai
    while (this.currentTurnIndex < this.turnOrder.length) {
      const player = this.getCurrentTurnPlayer();
      if (player && !player.allHandsDone) return player;
      this.currentTurnIndex++;
    }
    return null;  // semua pemain selesai
  }

  // ── ACTION HANDLERS ───────────────────────────
  actionHit(socketId) {
    const player = this._validateTurn(socketId);
    const hand   = player.activeHand;
    const card   = this.shoe.deal(true);
    hand.addCard(card);

    if (hand.isBust) {
      hand.isStood = true;
      return { card: card.toJSON(), bust: true, value: hand.value };
    }
    return { card: card.toJSON(), bust: false, value: hand.value };
  }

  actionStand(socketId) {
    const player = this._validateTurn(socketId);
    player.activeHand.isStood = true;
    return { stood: true };
  }

  actionDoubleDown(socketId) {
    const player = this._validateTurn(socketId);
    const hand   = player.activeHand;

    if (!hand.canDouble) throw new Error('Double Down tidak tersedia!');
    if (player.balance < hand.bet) throw new Error('Saldo tidak cukup untuk Double Down!');

    player.balance -= hand.bet;
    hand.bet       *= 2;
    hand.isDoubled  = true;

    const card = this.shoe.deal(true);
    hand.addCard(card);
    hand.isStood = true;   // wajib stand setelah double

    return { card: card.toJSON(), newBet: hand.bet, bust: hand.isBust, value: hand.value };
  }

  actionSplit(socketId) {
    const player = this._validateTurn(socketId);
    if (!player.activeHand?.canSplit) throw new Error('Split tidak tersedia!');
    if (player.balance < player.activeHand.bet) throw new Error('Saldo tidak cukup untuk Split!');

    const result = player.split(this.shoe);
    // Tambahkan ke turnOrder setelah slot saat ini
    const insertAt = this.currentTurnIndex + 1;
    this.turnOrder.splice(insertAt, 0, socketId + `_split_${Date.now()}`);

    return result;
  }

  // ── DEALER TURN & PAYOUT ──────────────────────
  async runDealerTurn(onCardDealt) {
    this.transitionTo(GamePhase.DEALER_TURN);
    const events = [];
    await this.dealer.playTurn(this.shoe, (card) => {
      events.push(card.toJSON());
      if (typeof onCardDealt === 'function') onCardDealt(card.toJSON());
    });
    return events;
  }

  resolvePayouts() {
    this.transitionTo(GamePhase.PAYOUT);
    const results = [];

    for (const player of this.activePlayers) {
      let roundNet = 0;
      for (const hand of player.hands) {
        const { result, payout } = PayoutEngine.resolve(hand, this.dealer);
        hand.result  = result;
        hand.payout  = payout;
        player.balance += payout;
        roundNet       += payout - hand.bet;
      }

      if (roundNet > 0) player.totalWon  += roundNet;
      else              player.totalLost += Math.abs(roundNet);

      results.push({
        socketId : player.socketId,
        username : player.username,
        balance  : player.balance,
        hands    : player.hands.map(h => h.toJSON()),
        roundNet,
      });
    }
    return results;
  }

  resetForNextRound() {
    for (const player of this.activePlayers) {
      if (player.balance < CONFIG.MIN_BET) {
        // Bust — tidak bisa main lagi
        player.balance = 0;
      }
      player.resetRound();
    }
    this.dealer.reset();
    this.turnOrder         = [];
    this.currentTurnIndex  = 0;

    // Tentukan fase berikutnya
    const activeSolvent = this.activePlayers.filter(p => p.balance >= CONFIG.MIN_BET);
    if (activeSolvent.length === 0) {
      this.phase = GamePhase.GAME_OVER;
    } else {
      this.phase = GamePhase.LOBBY;
    }
  }

  // ── CHAT ──────────────────────────────────────
  addChatMessage(socketId, message) {
    const player = this.getPlayer(socketId);
    if (!player) return null;

    // Sanitize input
    const sanitized = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim()
      .slice(0, 200);

    if (!sanitized) return null;

    const entry = {
      id        : crypto.randomBytes(4).toString('hex'),
      socketId,
      username  : player.username,
      message   : sanitized,
      timestamp : Date.now(),
    };

    this.chatLog.push(entry);
    if (this.chatLog.length > CONFIG.CHAT_HISTORY_MAX) {
      this.chatLog.shift();
    }
    return entry;
  }

  // ── SERIALIZATION ─────────────────────────────
  toPublicJSON(requestingSocketId = null) {
    return {
      roomId    : this.roomId,
      phase     : this.phase,
      roundNum  : this.roundNum,
      dealer    : this.dealer.toJSON(
        this.phase === GamePhase.PLAYER_TURN || this.phase === GamePhase.DEALING
      ),
      players   : this.activePlayers.map(p => p.toJSON(
        requestingSocketId !== null && p.socketId !== requestingSocketId
      )),
      currentTurn      : this.turnOrder[this.currentTurnIndex] || null,
      shoeRemaining    : this.shoe.remaining,
    };
  }

  // ── INTERNALS ─────────────────────────────────
  _validateTurn(socketId) {
    if (this.phase !== GamePhase.PLAYER_TURN) throw new Error('Bukan fase giliran pemain!');
    const current = this.getCurrentTurnPlayer();
    if (!current || current.socketId !== socketId) throw new Error('Bukan giliran lo, Bos!');
    const hand = current.activeHand;
    if (!hand || hand.isStood || hand.isBust) throw new Error('Tangan lo sudah selesai!');
    return current;
  }

  _clearTurnTimer() {
    if (this._turnTimer) {
      clearTimeout(this._turnTimer);
      this._turnTimer = null;
    }
  }

  setTurnTimer(callback) {
    this._clearTurnTimer();
    this._turnTimer = setTimeout(callback, CONFIG.TURN_TIMEOUT_MS);
  }
}

// ─────────────────────────────────────────────
// SECTION 10: ROOM MANAGER
// ─────────────────────────────────────────────
class RoomManager {
  constructor() {
    this._rooms = new Map();   // roomId → GameRoom
  }

  createRoom() {
    const roomId = this._generateRoomId();
    const room   = new GameRoom(roomId);
    this._rooms.set(roomId, room);
    console.log(`[RoomManager] Room dibuat: ${roomId}`);
    return room;
  }

  getRoom(roomId) { return this._rooms.get(roomId) || null; }

  getOrCreatePublicRoom() {
    // Cari room publik yang belum penuh dan masih di fase LOBBY/BETTING
    for (const room of this._rooms.values()) {
      if (
        room.activePlayers.length < CONFIG.MAX_PLAYERS &&
        [GamePhase.LOBBY, GamePhase.BETTING].includes(room.phase)
      ) {
        return room;
      }
    }
    return this.createRoom();
  }

  deleteRoom(roomId) {
    this._rooms.delete(roomId);
    console.log(`[RoomManager] Room dihapus: ${roomId}`);
  }

  cleanEmptyRooms() {
    for (const [roomId, room] of this._rooms) {
      if (room.activePlayers.length === 0) {
        this.deleteRoom(roomId);
      }
    }
  }

  _generateRoomId() {
    return 'UG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  get stats() {
    return {
      totalRooms   : this._rooms.size,
      totalPlayers : [...this._rooms.values()].reduce((s, r) => s + r.activePlayers.length, 0),
    };
  }
}

// ─────────────────────────────────────────────
// SECTION 11: SOCKET EVENT HANDLERS
// ─────────────────────────────────────────────
const roomManager = new RoomManager();

/**
 * Utility: kirim error ke klien secara konsisten
 */
function emitError(socket, code, message) {
  socket.emit('game:error', { code, message });
}

/**
 * Utility: broadcast state terbaru ke seluruh room
 */
function broadcastState(io, room) {
  room.activePlayers.forEach(player => {
    const target = io.sockets.sockets.get(player.socketId);
    if (target) {
      target.emit('game:state', room.toPublicJSON(player.socketId));
    }
  });
}

/**
 * Broadcast ke room kecuali pengirim
 */
function broadcastToOthers(io, room, senderId, event, data) {
  room.activePlayers.forEach(player => {
    if (player.socketId !== senderId) {
      const target = io.sockets.sockets.get(player.socketId);
      if (target) target.emit(event, data);
    }
  });
}

/**
 * Logika maju ke giliran dealer jika semua pemain selesai
 */
async function checkAndAdvanceToDealer(io, room) {
  const allDone = room.activePlayers.every(p => p.allHandsDone || !p.hasBet);
  if (!allDone) {
    // Maju ke pemain berikutnya
    const next = room.advanceTurn();
    if (next) {
      broadcastState(io, room);
      // Set turn timer — auto-stand jika tidak ada aksi
      room.setTurnTimer(() => {
        console.log(`[AutoStand] Timeout untuk ${next.socketId}`);
        try {
          room.actionStand(next.socketId);
          io.to(room.roomId).emit('game:auto_stand', { socketId: next.socketId, username: next.username });
          checkAndAdvanceToDealer(io, room);
        } catch (_) {}
      });
      return;
    }
  }

  // Semua selesai → dealer turn
  await startDealerTurn(io, room);
}

async function startDealerTurn(io, room) {
  try {
    room.transitionTo(GamePhase.DEALER_TURN);
    broadcastState(io, room);

    await room.runDealerTurn((card) => {
      io.to(room.roomId).emit('dealer:card_dealt', {
        card,
        dealerValue: room.dealer.value,
      });
    });

    // Payout
    const results = room.resolvePayouts();
    broadcastState(io, room);
    io.to(room.roomId).emit('game:round_result', {
      results,
      dealerHand : room.dealer.toJSON(false),
      dealerValue: room.dealer.value,
      dealerBust : room.dealer.isBust,
    });

    // Reset untuk ronde baru setelah delay
    setTimeout(() => {
      room.resetForNextRound();
      broadcastState(io, room);
      io.to(room.roomId).emit('game:new_round_ready', {
        phase: room.phase,
        roundNum: room.roundNum,
      });
    }, 5000);

  } catch (err) {
    console.error('[DealerTurn Error]', err.message);
    io.to(room.roomId).emit('game:error', { code: 'DEALER_ERROR', message: err.message });
  }
}

// ─── SOCKET MIDDLEWARE & CONNECTION ──────────
io.use((socket, next) => {
  const username = socket.handshake.auth?.username;
  if (!username || typeof username !== 'string' || username.trim().length < 2) {
    return next(new Error('Username tidak valid. Min 2 karakter.'));
  }
  socket.username = username.trim().slice(0, 20);
  next();
});

io.on('connection', (socket) => {
  console.log(`[Socket] Terhubung: ${socket.id} (${socket.username})`);

  // ── JOIN ROOM ─────────────────────────────
  socket.on('room:join', (data, ack) => {
    try {
      let room;
      if (data?.roomId) {
        room = roomManager.getRoom(data.roomId);
        if (!room) throw new Error(`Room ${data.roomId} tidak ditemukan.`);
      } else {
        room = roomManager.getOrCreatePublicRoom();
      }

      const player = room.addPlayer(socket.id, socket.username);
      socket.join(room.roomId);
      socket.roomId = room.roomId;

      console.log(`[Room] ${socket.username} gabung room ${room.roomId}`);

      // Kirim state ke yang baru join
      socket.emit('room:joined', {
        roomId    : room.roomId,
        seatIndex : player.seatIndex,
        balance   : player.balance,
        config    : {
          maxPlayers     : CONFIG.MAX_PLAYERS,
          minBet         : CONFIG.MIN_BET,
          maxBet         : CONFIG.MAX_BET,
          startingBalance: CONFIG.STARTING_BALANCE,
        },
      });

      broadcastState(io, room);

      // Beritahu pemain lain
      broadcastToOthers(io, room, socket.id, 'room:player_joined', {
        socketId : player.socketId,
        username : player.username,
        seatIndex: player.seatIndex,
      });

      if (typeof ack === 'function') ack({ success: true, roomId: room.roomId });
    } catch (err) {
      console.warn('[room:join Error]', err.message);
      emitError(socket, 'JOIN_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── PLACE BET ────────────────────────────
  socket.on('game:bet', (data, ack) => {
    try {
      const room   = _getSocketRoom(socket);
      const player = room.getPlayer(socket.id);

      if (![GamePhase.LOBBY, GamePhase.BETTING].includes(room.phase)) {
        throw new Error('Fase taruhan sudah tutup, Bos!');
      }
      if (player.hasBet) throw new Error('Lo udah taruhan di ronde ini!');

      const amount = parseInt(data?.amount, 10);
      player.placeBet(amount);

      if (room.phase === GamePhase.LOBBY) room.phase = GamePhase.BETTING;

      player.isReady = true;

      broadcastState(io, room);
      io.to(room.roomId).emit('game:player_bet', {
        socketId : socket.id,
        username : socket.username,
        amount,
        balance  : player.balance,
      });

      // Auto-mulai deal jika semua sudah taruhan
      if (room.allBetsPlaced) {
        setTimeout(() => {
          try {
            const events = room.dealInitialCards();
            room.transitionTo(GamePhase.PLAYER_TURN);
            broadcastState(io, room);
            io.to(room.roomId).emit('game:deal_start', { events });

            // Set timer untuk pemain pertama
            const first = room.getCurrentTurnPlayer();
            if (first) {
              room.setTurnTimer(() => {
                try {
                  room.actionStand(first.socketId);
                  io.to(room.roomId).emit('game:auto_stand', {
                    socketId: first.socketId,
                    username: first.username,
                  });
                  checkAndAdvanceToDealer(io, room);
                } catch (_) {}
              });
            }
          } catch (e) {
            io.to(room.roomId).emit('game:error', { code: 'DEAL_ERROR', message: e.message });
          }
        }, 1200);
      }

      if (typeof ack === 'function') ack({ success: true });
    } catch (err) {
      emitError(socket, 'BET_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── HIT ───────────────────────────────────
  socket.on('game:hit', (_, ack) => {
    try {
      const room   = _getSocketRoom(socket);
      const result = room.actionHit(socket.id);

      io.to(room.roomId).emit('game:player_card', {
        socketId : socket.id,
        ...result,
        handIndex: room.getPlayer(socket.id).activeHandIndex,
      });

      if (result.bust) {
        io.to(room.roomId).emit('game:player_bust', {
          socketId : socket.id,
          username : socket.username,
          value    : result.value,
        });
        checkAndAdvanceToDealer(io, room);
      } else {
        broadcastState(io, room);
        // Reset turn timer
        room.setTurnTimer(() => {
          try {
            room.actionStand(socket.id);
            io.to(room.roomId).emit('game:auto_stand', { socketId: socket.id, username: socket.username });
            checkAndAdvanceToDealer(io, room);
          } catch (_) {}
        });
      }

      if (typeof ack === 'function') ack({ success: true, ...result });
    } catch (err) {
      emitError(socket, 'HIT_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── STAND ─────────────────────────────────
  socket.on('game:stand', (_, ack) => {
    try {
      const room = _getSocketRoom(socket);
      room.actionStand(socket.id);
      io.to(room.roomId).emit('game:player_stood', { socketId: socket.id, username: socket.username });
      broadcastState(io, room);
      checkAndAdvanceToDealer(io, room);
      if (typeof ack === 'function') ack({ success: true });
    } catch (err) {
      emitError(socket, 'STAND_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── DOUBLE DOWN ────────────────────────────
  socket.on('game:double_down', (_, ack) => {
    try {
      const room   = _getSocketRoom(socket);
      const result = room.actionDoubleDown(socket.id);

      io.to(room.roomId).emit('game:player_doubled', {
        socketId  : socket.id,
        username  : socket.username,
        ...result,
        handIndex : room.getPlayer(socket.id).activeHandIndex,
      });

      if (result.bust) {
        io.to(room.roomId).emit('game:player_bust', { socketId: socket.id, username: socket.username, value: result.value });
      }

      broadcastState(io, room);
      checkAndAdvanceToDealer(io, room);

      if (typeof ack === 'function') ack({ success: true, ...result });
    } catch (err) {
      emitError(socket, 'DOUBLE_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── SPLIT ─────────────────────────────────
  socket.on('game:split', (_, ack) => {
    try {
      const room   = _getSocketRoom(socket);
      const result = room.actionSplit(socket.id);

      io.to(room.roomId).emit('game:player_split', {
        socketId : socket.id,
        username : socket.username,
        ...result,
      });

      broadcastState(io, room);
      if (typeof ack === 'function') ack({ success: true, ...result });
    } catch (err) {
      emitError(socket, 'SPLIT_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── CHAT ──────────────────────────────────
  socket.on('chat:send', (data, ack) => {
    try {
      const room  = _getSocketRoom(socket);
      const entry = room.addChatMessage(socket.id, data?.message || '');
      if (!entry) throw new Error('Pesan kosong atau tidak valid!');

      io.to(room.roomId).emit('chat:message', entry);
      if (typeof ack === 'function') ack({ success: true });
    } catch (err) {
      emitError(socket, 'CHAT_FAILED', err.message);
      if (typeof ack === 'function') ack({ success: false, message: err.message });
    }
  });

  // ── PING / HEALTH ──────────────────────────
  socket.on('ping:client', (_, ack) => {
    if (typeof ack === 'function') ack({ pong: true, ts: Date.now(), stats: roomManager.stats });
  });

  // ── DISCONNECT ────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Putus: ${socket.id} — ${reason}`);
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const player = room.removePlayer(socket.id);
    if (!player) return;

    io.to(roomId).emit('room:player_left', {
      socketId : socket.id,
      username : player.username,
      reason,
    });

    broadcastState(io, room);

    // Bersihkan room kosong
    roomManager.cleanEmptyRooms();

    // Jika pemain disconnect saat giliran mereka, auto-stand
    if (
      room.phase === GamePhase.PLAYER_TURN &&
      room.getCurrentTurnPlayer()?.socketId === socket.id
    ) {
      io.to(roomId).emit('game:auto_stand', { socketId: socket.id, username: player.username });
      checkAndAdvanceToDealer(io, room);
    }
  });
});

// ─────────────────────────────────────────────
// SECTION 12: HELPER UTILITIES
// ─────────────────────────────────────────────
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function _getSocketRoom(socket) {
  const roomId = socket.roomId;
  if (!roomId) throw new Error('Lo belum gabung room manapun!');
  const room = roomManager.getRoom(roomId);
  if (!room) throw new Error('Room tidak ditemukan!');
  return room;
}

// ─────────────────────────────────────────────
// SECTION 13: EXPRESS ROUTES
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status  : 'OK',
    uptime  : process.uptime(),
    stats   : roomManager.stats,
    version : '1.0.0',
  });
});

// API: list active rooms (untuk debugging)
app.get('/api/rooms', (req, res) => {
  const rooms = [...roomManager._rooms.values()].map(r => ({
    roomId  : r.roomId,
    phase   : r.phase,
    players : r.activePlayers.length,
    round   : r.roundNum,
  }));
  res.json({ rooms });
});

// Fallback ke index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
// SECTION 14: PROCESS ERROR HANDLERS
// ─────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// ─────────────────────────────────────────────
// SECTION 15: SERVER START
// ─────────────────────────────────────────────
server.listen(CONFIG.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   BLACKJACK UNDERGROUND — SERVER AKTIF       ║
║   Port    : ${String(CONFIG.PORT).padEnd(32)}║
║   Mode    : ${(process.env.NODE_ENV || 'development').padEnd(32)}║
║   Max Room: 4 pemain / room                  ║
╚══════════════════════════════════════════════╝
  `);
});

// ─────────────────────────────────────────────
// SECTION 16: MODULE EXPORTS (untuk testing)
// ─────────────────────────────────────────────
module.exports = {
  app,
  server,
  io,
  // Expose classes untuk unit testing
  Card,
  Shoe,
  Hand,
  Dealer,
  Player,
  GameRoom,
  RoomManager,
  PayoutEngine,
  GamePhase,
  HandResult,
  PlayerAction,
  CONFIG,
};
