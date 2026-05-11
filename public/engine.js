/**
 * ============================================================
 * engine.js — Frontend Game Engine (Offline Mirror)
 * Logika kartu, hand, dealer AI identik dengan server.js.
 * Dipakai di Mode Solo Offline tanpa koneksi server.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG (Mirror dari server)
   ───────────────────────────────────────────── */
const ENGINE_CONFIG = Object.freeze({
  STARTING_BALANCE  : 1_000_000,
  MIN_BET           : 10_000,
  MAX_BET           : 500_000,
  BLACKJACK_PAYOUT  : 1.5,
  DEALER_STAND_MIN  : 17,
  DECK_COUNT        : 6,
  SHUFFLE_THRESHOLD : 0.25,
  ACTION_DELAY_MS   : 550,
});

const GamePhaseLocal = Object.freeze({
  LOBBY        : 'LOBBY',
  BETTING      : 'BETTING',
  DEALING      : 'DEALING',
  PLAYER_TURN  : 'PLAYER_TURN',
  DEALER_TURN  : 'DEALER_TURN',
  PAYOUT       : 'PAYOUT',
  GAME_OVER    : 'GAME_OVER',
});

const HandResultLocal = Object.freeze({
  BLACKJACK : 'BLACKJACK',
  WIN       : 'WIN',
  LOSE      : 'LOSE',
  PUSH      : 'PUSH',
  BUST      : 'BUST',
});

/* ─────────────────────────────────────────────
   CARD
   ───────────────────────────────────────────── */
class LocalCard {
  constructor(suit, rank) {
    this.suit   = suit;
    this.rank   = rank;
    this.faceUp = true;
    this.id     = Math.random().toString(36).slice(2, 10);
  }

  get value() {
    if (['J','Q','K'].includes(this.rank)) return 10;
    if (this.rank === 'A') return 11;
    return parseInt(this.rank, 10);
  }

  toJSON() {
    return { id: this.id, suit: this.suit, rank: this.rank, value: this.value, faceUp: this.faceUp };
  }
}

/* ─────────────────────────────────────────────
   SHOE (6-deck)
   ───────────────────────────────────────────── */
class LocalShoe {
  constructor(deckCount = ENGINE_CONFIG.DECK_COUNT) {
    this.deckCount = deckCount;
    this._total    = 0;
    this.cards     = [];
    this._build();
    this._shuffle();
  }

  _build() {
    const SUITS = ['spades','hearts','diamonds','clubs'];
    const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    this.cards = [];
    for (let d = 0; d < this.deckCount; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push(new LocalCard(suit, rank));
        }
      }
    }
    this._total = this.cards.length;
  }

  _shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(faceUp = true) {
    if (this.cards.length / this._total < ENGINE_CONFIG.SHUFFLE_THRESHOLD) {
      this._build();
      this._shuffle();
    }
    const card  = this.cards.pop();
    card.faceUp = faceUp;
    return card;
  }

  get remaining() { return this.cards.length; }
}

/* ─────────────────────────────────────────────
   HAND
   ───────────────────────────────────────────── */
class LocalHand {
  constructor(bet = 0) {
    this.cards      = [];
    this.bet        = bet;
    this.isStood    = false;
    this.isDoubled  = false;
    this.isSplit    = false;
    this.result     = null;
    this.payout     = 0;
  }

  addCard(card) { this.cards.push(card); return this; }

  /**
   * Kalkulasi AS mutlak — Ace = 11, dikurangi 10 per ace jika bust.
   */
  get value() {
    let total = 0, aces = 0;
    for (const c of this.cards) {
      if (!c.faceUp) continue;
      total += c.value;
      if (c.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  get trueValue() {
    let total = 0, aces = 0;
    for (const c of this.cards) {
      total += c.value;
      if (c.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  get isBust()       { return this.value > 21; }
  get isBlackjack()  { return this.cards.length === 2 && this.value === 21 && !this.isSplit; }
  get canSplit()     { return this.cards.length === 2 && this.cards[0].rank === this.cards[1].rank; }
  get canDouble()    { return this.cards.length === 2 && !this.isStood && !this.isDoubled; }

  revealAll() { this.cards.forEach(c => (c.faceUp = true)); }

  toJSON() {
    return {
      cards      : this.cards.map(c => c.toJSON()),
      value      : this.value,
      bet        : this.bet,
      isStood    : this.isStood,
      isDoubled  : this.isDoubled,
      isSplit    : this.isSplit,
      isBust     : this.isBust,
      isBlackjack: this.isBlackjack,
      result     : this.result,
      payout     : this.payout,
    };
  }
}

/* ─────────────────────────────────────────────
   PAYOUT ENGINE
   ───────────────────────────────────────────── */
class LocalPayoutEngine {
  static resolve(playerHand, dealerTrueVal, dealerIsBlackjack, dealerIsBust) {
    const pVal  = playerHand.trueValue;
    const pBJ   = playerHand.isBlackjack;
    const pBust = playerHand.isBust;

    let result, multiplier;

    if (pBust) {
      result = HandResultLocal.BUST; multiplier = 0;
    } else if (pBJ && dealerIsBlackjack) {
      result = HandResultLocal.PUSH; multiplier = 1;
    } else if (pBJ) {
      result = HandResultLocal.BLACKJACK; multiplier = 1 + ENGINE_CONFIG.BLACKJACK_PAYOUT;
    } else if (dealerIsBlackjack) {
      result = HandResultLocal.LOSE; multiplier = 0;
    } else if (dealerIsBust) {
      result = HandResultLocal.WIN; multiplier = 2;
    } else if (pVal > dealerTrueVal) {
      result = HandResultLocal.WIN; multiplier = 2;
    } else if (pVal === dealerTrueVal) {
      result = HandResultLocal.PUSH; multiplier = 1;
    } else {
      result = HandResultLocal.LOSE; multiplier = 0;
    }

    return { result, payout: Math.floor(playerHand.bet * multiplier), multiplier };
  }
}

/* ─────────────────────────────────────────────
   DEALER AI (Offline)
   ───────────────────────────────────────────── */
class LocalDealer {
  constructor() {
    this.hand = new LocalHand(0);
  }

  reset() { this.hand = new LocalHand(0); }

  addCard(card) { this.hand.addCard(card); }

  revealHoleCard() { this.hand.revealAll(); }

  /**
   * Dealer mainkan gilirannya secara async.
   * Callback onCard dipanggil setiap kartu baru.
   */
  async playTurn(shoe, onCard) {
    this.revealHoleCard();

    while (this.hand.trueValue < ENGINE_CONFIG.DEALER_STAND_MIN) {
      await _engineDelay(ENGINE_CONFIG.ACTION_DELAY_MS);
      const card = shoe.deal(true);
      this.hand.addCard(card);
      if (typeof onCard === 'function') onCard(card.toJSON());
    }
  }

  get value()       { return this.hand.trueValue; }
  get isBust()      { return this.hand.trueValue > 21; }
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
      value      : hideHole ? this.hand.value : this.hand.trueValue,
      isBust     : this.isBust,
      isBlackjack: this.isBlackjack,
    };
  }
}

/* ─────────────────────────────────────────────
   OFFLINE GAME CONTROLLER
   ─── State machine penuh untuk mode solo ──────
   ───────────────────────────────────────────── */
class OfflineGameController {
  constructor(username) {
    this.username    = username;
    this.balance     = ENGINE_CONFIG.STARTING_BALANCE;
    this.shoe        = new LocalShoe();
    this.dealer      = new LocalDealer();
    this.hands       = [];
    this.activeHandIndex = 0;
    this.phase       = GamePhaseLocal.LOBBY;
    this.roundNum    = 0;
    this.currentBet  = 0;
    this.totalWon    = 0;
    this.totalLost   = 0;

    // Event callback registry
    this._listeners  = {};
  }

  /* ── Event System ── */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return this;
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => fn(data));
  }

  /* ── Phase Helpers ── */
  get phase() { return this._phase; }
  set phase(v) {
    this._phase = v;
    this._emit('phase_change', { phase: v });
  }

  get activeHand()   { return this.hands[this.activeHandIndex] || null; }
  get allHandsDone() { return this.hands.every(h => h.isStood || h.isBust); }

  /* ── BET ── */
  placeBet(amount) {
    if (![GamePhaseLocal.LOBBY, GamePhaseLocal.BETTING].includes(this.phase)) {
      throw new Error('Fase taruhan sudah tutup!');
    }
    if (amount < ENGINE_CONFIG.MIN_BET) throw new Error(`Minimal Rp ${ENGINE_CONFIG.MIN_BET.toLocaleString('id-ID')}`);
    if (amount > ENGINE_CONFIG.MAX_BET) throw new Error(`Maksimal Rp ${ENGINE_CONFIG.MAX_BET.toLocaleString('id-ID')}`);
    if (amount > this.balance)           throw new Error('Saldo lo kurang, Bos!');

    this.currentBet = amount;
    this.balance   -= amount;
    this.hands      = [new LocalHand(amount)];
    this.activeHandIndex = 0;
    this.phase      = GamePhaseLocal.BETTING;

    this._emit('bet_placed', { amount, balance: this.balance });
    return this;
  }

  /* ── DEAL ── */
  deal() {
    if (this.phase !== GamePhaseLocal.BETTING) throw new Error('Belum taruhan, Bos!');
    this.roundNum++;
    this.dealer.reset();
    this.phase = GamePhaseLocal.DEALING;

    const events = [];

    for (let round = 0; round < 2; round++) {
      const playerCard = this.shoe.deal(true);
      this.hands[0].addCard(playerCard);
      events.push({ type: 'player_card', card: playerCard.toJSON(), handIdx: 0 });

      const faceUp   = (round === 0);
      const dealCard = this.shoe.deal(faceUp);
      this.dealer.addCard(dealCard);
      events.push({ type: 'dealer_card', card: dealCard.toJSON() });
    }

    this.phase = GamePhaseLocal.PLAYER_TURN;
    this._emit('deal_complete', { events, state: this.getState() });

    // Cek natural blackjack
    if (this.hands[0].isBlackjack) {
      this._emit('player_blackjack', { handIdx: 0 });
      // Auto-stand jika blackjack
      setTimeout(() => this._runDealerAndPayout(), 1000);
    }

    return events;
  }

  /* ── HIT ── */
  hit() {
    this._assertPhase(GamePhaseLocal.PLAYER_TURN);
    const hand = this._assertActiveHand();

    const card = this.shoe.deal(true);
    hand.addCard(card);

    this._emit('player_card', { card: card.toJSON(), handIdx: this.activeHandIndex, value: hand.value, bust: hand.isBust });

    if (hand.isBust) {
      hand.isStood = true;
      this._emit('player_bust', { handIdx: this.activeHandIndex, value: hand.value });
      this._tryAdvanceOrDealer();
    } else {
      this._emit('state_update', this.getState());
    }

    return { card: card.toJSON(), bust: hand.isBust, value: hand.value };
  }

  /* ── STAND ── */
  stand() {
    this._assertPhase(GamePhaseLocal.PLAYER_TURN);
    const hand = this._assertActiveHand();
    hand.isStood = true;
    this._emit('player_stood', { handIdx: this.activeHandIndex });
    this._tryAdvanceOrDealer();
    return this;
  }

  /* ── DOUBLE DOWN ── */
  doubleDown() {
    this._assertPhase(GamePhaseLocal.PLAYER_TURN);
    const hand = this._assertActiveHand();
    if (!hand.canDouble) throw new Error('Double Down tidak tersedia!');
    if (this.balance < hand.bet) throw new Error('Saldo kurang untuk Double Down!');

    this.balance  -= hand.bet;
    hand.bet      *= 2;
    hand.isDoubled = true;

    const card = this.shoe.deal(true);
    hand.addCard(card);
    hand.isStood = true;

    this._emit('player_doubled', { card: card.toJSON(), handIdx: this.activeHandIndex, newBet: hand.bet, bust: hand.isBust, value: hand.value });

    if (hand.isBust) this._emit('player_bust', { handIdx: this.activeHandIndex, value: hand.value });

    this._tryAdvanceOrDealer();
    return { card: card.toJSON(), bust: hand.isBust, value: hand.value, newBet: hand.bet };
  }

  /* ── SPLIT ── */
  split() {
    this._assertPhase(GamePhaseLocal.PLAYER_TURN);
    const hand = this._assertActiveHand();
    if (!hand.canSplit) throw new Error('Split tidak tersedia!');
    if (this.balance < hand.bet) throw new Error('Saldo kurang untuk Split!');

    this.balance -= hand.bet;

    const newHand    = new LocalHand(hand.bet);
    newHand.isSplit  = true;
    hand.isSplit     = true;

    const splitCard  = hand.cards.splice(1, 1)[0];
    newHand.addCard(splitCard);

    hand.addCard(this.shoe.deal(true));
    newHand.addCard(this.shoe.deal(true));

    this.hands.splice(this.activeHandIndex + 1, 0, newHand);

    this._emit('player_split', { hand: hand.toJSON(), newHand: newHand.toJSON(), activeHandIndex: this.activeHandIndex });
    this._emit('state_update', this.getState());

    return { hand: hand.toJSON(), newHand: newHand.toJSON() };
  }

  /* ── INTERNAL: Advance or go to dealer ── */
  _tryAdvanceOrDealer() {
    // Coba advance ke hand berikutnya
    for (let i = this.activeHandIndex + 1; i < this.hands.length; i++) {
      if (!this.hands[i].isStood && !this.hands[i].isBust) {
        this.activeHandIndex = i;
        this._emit('hand_changed', { activeHandIndex: this.activeHandIndex });
        this._emit('state_update', this.getState());
        return;
      }
    }
    // Semua hand selesai → dealer turn
    this._runDealerAndPayout();
  }

  /* ── DEALER TURN & PAYOUT ── */
  async _runDealerAndPayout() {
    this.phase = GamePhaseLocal.DEALER_TURN;
    this._emit('dealer_turn_start', { dealer: this.dealer.toJSON(false) });

    await this.dealer.playTurn(this.shoe, (card) => {
      this._emit('dealer_card_dealt', { card, dealerValue: this.dealer.value });
    });

    this._emit('dealer_turn_end', { dealer: this.dealer.toJSON(false) });

    // Resolve payouts
    this.phase = GamePhaseLocal.PAYOUT;
    const results = this._resolvePayouts();
    this._emit('round_result', { results, dealer: this.dealer.toJSON(false) });

    // Prepare next round
    setTimeout(() => {
      this.phase = this.balance >= ENGINE_CONFIG.MIN_BET ? GamePhaseLocal.LOBBY : GamePhaseLocal.GAME_OVER;
      this._emit('new_round_ready', { phase: this.phase, balance: this.balance });
    }, 3500);
  }

  _resolvePayouts() {
    const results = [];
    let roundNet  = 0;

    for (const hand of this.hands) {
      const { result, payout } = LocalPayoutEngine.resolve(
        hand,
        this.dealer.value,
        this.dealer.isBlackjack,
        this.dealer.isBust
      );
      hand.result  = result;
      hand.payout  = payout;
      this.balance += payout;
      roundNet     += payout - hand.bet;
      results.push({ hand: hand.toJSON(), result, payout, net: payout - hand.bet });
    }

    if (roundNet > 0) this.totalWon  += roundNet;
    else              this.totalLost += Math.abs(roundNet);

    return results;
  }

  resetForNextRound() {
    this.hands           = [];
    this.activeHandIndex = 0;
    this.currentBet      = 0;
    this.dealer.reset();
    this.phase = this.balance >= ENGINE_CONFIG.MIN_BET ? GamePhaseLocal.LOBBY : GamePhaseLocal.GAME_OVER;
  }

  /* ── STATE SNAPSHOT ── */
  getState() {
    return {
      phase       : this.phase,
      roundNum    : this.roundNum,
      balance     : this.balance,
      currentBet  : this.currentBet,
      hands       : this.hands.map(h => h.toJSON()),
      activeHandIndex: this.activeHandIndex,
      dealer      : this.dealer.toJSON(this.phase === GamePhaseLocal.PLAYER_TURN || this.phase === GamePhaseLocal.DEALING),
      totalWon    : this.totalWon,
      totalLost   : this.totalLost,
    };
  }

  /* ── ASSERTIONS ── */
  _assertPhase(expected) {
    if (this.phase !== expected) throw new Error(`Aksi tidak valid di fase ${this.phase}`);
  }

  _assertActiveHand() {
    const hand = this.activeHand;
    if (!hand || hand.isStood || hand.isBust) throw new Error('Tidak ada hand aktif!');
    return hand;
  }
}

/* ─────────────────────────────────────────────
   UTILITY
   ───────────────────────────────────────────── */
function _engineDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─────────────────────────────────────────────
   EXPORTS (ke global untuk module non-bundler)
   ───────────────────────────────────────────── */
window.GameEngine = {
  OfflineGameController,
  LocalCard,
  LocalShoe,
  LocalHand,
  LocalDealer,
  LocalPayoutEngine,
  GamePhaseLocal,
  HandResultLocal,
  ENGINE_CONFIG,
};
