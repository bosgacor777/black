/**
 * ============================================================
 * socket-client.js — Socket.io Client Wrapper
 * Mengelola koneksi real-time ke server.
 * Menyediakan interface yang sama dengan offline engine
 * agar script.js bisa pakai keduanya secara transparan.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   SECTION 1: CLIENT CONFIG
   ───────────────────────────────────────────── */
const SOCKET_CONFIG = Object.freeze({
  SERVER_URL       : window.location.origin,
  CONNECT_TIMEOUT  : 5000,     // 5 detik sebelum fallback
  RECONNECT_TRIES  : 3,
  RECONNECT_DELAY  : 2000,
});

/* ─────────────────────────────────────────────
   SECTION 2: SOCKET CLIENT CLASS
   ───────────────────────────────────────────── */
class SocketClient {
  constructor() {
    this._socket      = null;
    this._connected   = false;
    this._listeners   = {};
    this._pendingAcks = new Map();
    this._roomId      = null;
    this._mySocketId  = null;
  }

  /* ── Getters ─── */
  get connected()  { return this._connected; }
  get socketId()   { return this._mySocketId; }
  get roomId()     { return this._roomId; }

  /* ─────────────────────────────────────────
     EVENT SYSTEM
     ───────────────────────────────────────── */
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return this;
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    if (fn) {
      this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    } else {
      delete this._listeners[event];
    }
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(fn => {
      try { fn(data); } catch (e) { console.error(`[SocketClient] Listener error (${event}):`, e); }
    });
  }

  /* ─────────────────────────────────────────
     CONNECTION
     ───────────────────────────────────────── */
  /**
   * Coba koneksi ke server dengan timeout.
   * Resolve true jika berhasil, false jika gagal/timeout.
   */
  connect(username) {
    return new Promise((resolve) => {
      if (typeof io === 'undefined') {
        console.warn('[SocketClient] Socket.io tidak tersedia — mode offline.');
        resolve(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        console.warn('[SocketClient] Koneksi timeout — mode offline.');
        this._cleanup();
        resolve(false);
      }, SOCKET_CONFIG.CONNECT_TIMEOUT);

      try {
        this._socket = io(SOCKET_CONFIG.SERVER_URL, {
          auth              : { username },
          reconnectionAttempts: SOCKET_CONFIG.RECONNECT_TRIES,
          reconnectionDelay : SOCKET_CONFIG.RECONNECT_DELAY,
          timeout           : SOCKET_CONFIG.CONNECT_TIMEOUT,
          transports        : ['websocket', 'polling'],
        });

        this._socket.on('connect', () => {
          clearTimeout(timeoutId);
          this._connected  = true;
          this._mySocketId = this._socket.id;
          console.log(`[SocketClient] Terhubung: ${this._socket.id}`);
          this._registerServerEvents();
          resolve(true);
        });

        this._socket.on('connect_error', (err) => {
          clearTimeout(timeoutId);
          console.warn('[SocketClient] Gagal konek:', err.message);
          this._connected = false;
          resolve(false);
        });

      } catch (err) {
        clearTimeout(timeoutId);
        console.error('[SocketClient] Exception saat konek:', err);
        resolve(false);
      }
    });
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._cleanup();
    }
  }

  _cleanup() {
    if (this._socket) {
      this._socket.removeAllListeners();
      this._socket = null;
    }
    this._connected  = false;
    this._mySocketId = null;
    this._roomId     = null;
  }

  /* ─────────────────────────────────────────
     SERVER EVENT REGISTRATION
     ───────────────────────────────────────── */
  _registerServerEvents() {
    const s = this._socket;

    // ── Koneksi ──
    s.on('disconnect', (reason) => {
      this._connected = false;
      console.warn('[SocketClient] Putus koneksi:', reason);
      this._emit('disconnected', { reason });
    });

    s.on('reconnect', () => {
      this._connected  = true;
      this._mySocketId = s.id;
      this._emit('reconnected', {});
    });

    // ── Room ──
    s.on('room:joined', (data) => {
      this._roomId = data.roomId;
      this._emit('room:joined', data);
    });

    s.on('room:player_joined', (data) => {
      this._emit('room:player_joined', data);
    });

    s.on('room:player_left', (data) => {
      this._emit('room:player_left', data);
    });

    // ── Game State ──
    s.on('game:state', (data) => {
      this._emit('game:state', data);
    });

    s.on('game:error', (data) => {
      console.error('[Server Error]', data.code, data.message);
      this._emit('game:error', data);
    });

    // ── Deal ──
    s.on('game:deal_start', (data) => {
      this._emit('game:deal_start', data);
    });

    // ── Betting ──
    s.on('game:player_bet', (data) => {
      this._emit('game:player_bet', data);
    });

    // ── Player Actions ──
    s.on('game:player_card', (data) => {
      this._emit('game:player_card', data);
    });

    s.on('game:player_bust', (data) => {
      this._emit('game:player_bust', data);
    });

    s.on('game:player_stood', (data) => {
      this._emit('game:player_stood', data);
    });

    s.on('game:player_doubled', (data) => {
      this._emit('game:player_doubled', data);
    });

    s.on('game:player_split', (data) => {
      this._emit('game:player_split', data);
    });

    s.on('game:auto_stand', (data) => {
      this._emit('game:auto_stand', data);
    });

    // ── Dealer ──
    s.on('dealer:card_dealt', (data) => {
      this._emit('dealer:card_dealt', data);
    });

    // ── Round Result ──
    s.on('game:round_result', (data) => {
      this._emit('game:round_result', data);
    });

    s.on('game:new_round_ready', (data) => {
      this._emit('game:new_round_ready', data);
    });

    // ── Chat ──
    s.on('chat:message', (data) => {
      this._emit('chat:message', data);
    });
  }

  /* ─────────────────────────────────────────
     CLIENT → SERVER ACTIONS
     ───────────────────────────────────────── */

  /**
   * Utility emit dengan ack dan error handling.
   */
  _send(event, data, timeout = 8000) {
    return new Promise((resolve, reject) => {
      if (!this._connected || !this._socket) {
        reject(new Error('Tidak terhubung ke server'));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Timeout menunggu respons ${event}`));
      }, timeout);

      this._socket.emit(event, data, (response) => {
        clearTimeout(timer);
        if (response?.success === false) {
          reject(new Error(response.message || 'Aksi gagal'));
        } else {
          resolve(response);
        }
      });
    });
  }

  joinRoom(roomId = null) {
    return this._send('room:join', roomId ? { roomId } : {});
  }

  placeBet(amount) {
    return this._send('game:bet', { amount });
  }

  hit() {
    return this._send('game:hit', null);
  }

  stand() {
    return this._send('game:stand', null);
  }

  doubleDown() {
    return this._send('game:double_down', null);
  }

  split() {
    return this._send('game:split', null);
  }

  sendChat(message) {
    return this._send('chat:send', { message });
  }

  ping() {
    return this._send('ping:client', null);
  }
}

/* ─────────────────────────────────────────────
   SECTION 3: SERVER PROBE
   Cek apakah server online sebelum konek.
   ───────────────────────────────────────────── */
async function probeServer() {
  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 3000);
    const resp       = await fetch('/health', { signal: controller.signal });
    clearTimeout(timeoutId);
    return resp.ok;
  } catch (_) {
    return false;
  }
}

/* ─────────────────────────────────────────────
   SECTION 4: GLOBAL EXPORT
   ───────────────────────────────────────────── */
window.SocketClient  = SocketClient;
window.probeServer   = probeServer;
