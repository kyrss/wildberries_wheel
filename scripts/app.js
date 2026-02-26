/**
 * WILDBERRIES — Колесо Фортуны (PUBG Mobile)
 * scripts/app.js  — mobile-first, iOS-safe, offline
 *
 * Архитектура:
 *   AudioManager   — iOS-safe звуки, тумблер, localStorage
 *   WheelRenderer  — Canvas 2D рендер
 *   SpinEngine     — математика вращения (детерминированная)
 *   WeaponWheel    — рулетка оружий
 *   ChallengeWheel — рулетка усложнений
 *   CatalogUI      — каталог
 *   App            — точка входа
 */

'use strict';

/* ============================================================
   ГРОМКОСТЬ (0.0 – 1.0)
   ============================================================ */
const SOUND_VOLUME = 0.6;

/* ============================================================
   КОНСТАНТЫ РЕДКОСТИ
   ============================================================ */
const RARITY = {
  common: {
    prob:        0.70,
    strokeColor: '#1e2130',
    fillDark:    '#0e1018',
    fillLight:   '#161924',
    textColor:   '#8b92a5',
    glowColor:   'rgba(139,146,165,0.55)',
    accent:      '#4a5060',
    label:       'Обычное',
    labelEn:     'common'
  },
  rare: {
    prob:        0.25,
    strokeColor: '#2a1a55',
    fillDark:    '#0d0820',
    fillLight:   '#140e30',
    textColor:   '#9d7fe8',
    glowColor:   'rgba(157,127,232,0.75)',
    accent:      '#5534a8',
    label:       'Редкое',
    labelEn:     'rare'
  },
  legendary: {
    prob:        0.05,
    strokeColor: '#3d2800',
    fillDark:    '#100900',
    fillLight:   '#1c1000',
    textColor:   '#d4a832',
    glowColor:   'rgba(212,168,50,0.9)',
    accent:      '#8a5e0a',
    label:       'Легендарное',
    labelEn:     'legendary'
  }
};

/* ============================================================
   ВСТРОЕННЫЕ ДАННЫЕ (работает offline / file://)
   ============================================================ */
const WEAPONS_DATA = [
  {"name":"M416",                        "rarity":"common",    "image":"images/m416.png",        "imgFallback":"images/weapon_common.svg"},
  {"name":"AKM",                         "rarity":"common",    "image":"images/akm.png",         "imgFallback":"images/weapon_common.svg"},
  {"name":"M16A4",                       "rarity":"common",    "image":"images/m16a4.png",       "imgFallback":"images/weapon_common.svg"},
  {"name":"SCAR-L",                      "rarity":"common",    "image":"images/scar_l.png",      "imgFallback":"images/weapon_common.svg"},
  {"name":"M762",                        "rarity":"common",    "image":"images/m762.png",        "imgFallback":"images/weapon_common.svg"},
  {"name":"Mini14",                      "rarity":"common",    "image":"images/mini14.png",      "imgFallback":"images/weapon_common.svg"},
  {"name":"SLR",                         "rarity":"common",    "image":"images/slr.png",         "imgFallback":"images/weapon_common.svg"},
  {"name":"Kar98K",                      "rarity":"common",    "image":"images/kar98k.png",      "imgFallback":"images/weapon_common.svg"},
  {"name":"M24",                         "rarity":"common",    "image":"images/m24.png",         "imgFallback":"images/weapon_common.svg"},
  {"name":"UMP45",                       "rarity":"common",    "image":"images/ump45.png",       "imgFallback":"images/weapon_common.svg"},
  {"name":"UZI",                         "rarity":"common",    "image":"images/uzi.png",         "imgFallback":"images/weapon_common.svg"},
  {"name":"Vector",                      "rarity":"common",    "image":"images/vector.png",      "imgFallback":"images/weapon_common.svg"},
  {"name":"S686",                        "rarity":"common",    "image":"images/s686.png",        "imgFallback":"images/weapon_common.svg"},
  {"name":"S1897",                       "rarity":"common",    "image":"images/s1897.png",       "imgFallback":"images/weapon_common.svg"},
  {"name":"G36C",                        "rarity":"rare",      "image":"images/g36c.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"QBZ",                         "rarity":"rare",      "image":"images/qbz.png",         "imgFallback":"images/weapon_rare.svg"},
  {"name":"QBU",                         "rarity":"rare",      "image":"images/qbu.png",         "imgFallback":"images/weapon_rare.svg"},
  {"name":"Honey Badger",                "rarity":"rare",      "image":"images/honey_badger.png","imgFallback":"images/weapon_rare.svg"},
  {"name":"Mk47",                        "rarity":"rare",      "image":"images/mk47.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"ACE32",                       "rarity":"rare",      "image":"images/ace32.png",       "imgFallback":"images/weapon_rare.svg"},
  {"name":"Mk12",                        "rarity":"rare",      "image":"images/mk12.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"DSR",                         "rarity":"rare",      "image":"images/dsr.png",         "imgFallback":"images/weapon_rare.svg"},
  {"name":"BCC",                         "rarity":"rare",      "image":"images/bcc.png",         "imgFallback":"images/weapon_rare.svg"},
  {"name":"CKC",                         "rarity":"rare",      "image":"images/ckc.png",         "imgFallback":"images/weapon_rare.svg"},
  {"name":"Снайперская винтовка Мосина", "rarity":"rare",      "image":"images/mosin.png",       "imgFallback":"images/weapon_rare.svg"},
  {"name":"Win94",                       "rarity":"rare",      "image":"images/win94.png",       "imgFallback":"images/weapon_rare.svg"},
  {"name":"PP-19",                       "rarity":"rare",      "image":"images/pp19.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"MP5K",                        "rarity":"rare",      "image":"images/mp5k.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"Автомат Томпсона",            "rarity":"rare",      "image":"images/thompson.png",    "imgFallback":"images/weapon_rare.svg"},
  {"name":"S12K",                        "rarity":"rare",      "image":"images/s12k.png",        "imgFallback":"images/weapon_rare.svg"},
  {"name":"M1014",                       "rarity":"rare",      "image":"images/m1014.png",       "imgFallback":"images/weapon_rare.svg"},
  {"name":"NS2000",                      "rarity":"rare",      "image":"images/ns2000.png",      "imgFallback":"images/weapon_rare.svg"},
  {"name":"AWM",                         "rarity":"legendary", "image":"images/awm.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"AMR",                         "rarity":"legendary", "image":"images/amr.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"Mk14",                        "rarity":"legendary", "image":"images/mk14.png",        "imgFallback":"images/weapon_legendary.svg"},
  {"name":"AUG",                         "rarity":"legendary", "image":"images/aug.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"Groza",                       "rarity":"legendary", "image":"images/groza.png",       "imgFallback":"images/weapon_legendary.svg"},
  {"name":"MG3",                         "rarity":"legendary", "image":"images/mg3.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"P90",                         "rarity":"legendary", "image":"images/p90.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"DBS",                         "rarity":"legendary", "image":"images/dbs.png",         "imgFallback":"images/weapon_legendary.svg"},
  {"name":"FAMAS",                       "rarity":"legendary", "image":"images/famas.png",       "imgFallback":"images/weapon_legendary.svg"}
];

const CHALLENGES_DATA = [
  {"name":"Играть без гранат",                                              "rarity":"common"},
  {"name":"Нельзя использовать транспорт",                                  "rarity":"common"},
  {"name":"Нельзя ложиться (без prone)",                                    "rarity":"common"},
  {"name":"Играть без шлема",                                               "rarity":"common"},
  {"name":"Играть без брони",                                               "rarity":"common"},
  {"name":"Нельзя использовать энергетики",                                 "rarity":"common"},
  {"name":"Только прицел 1x",                                               "rarity":"common"},
  {"name":"Нельзя использовать глушители",                                  "rarity":"common"},
  {"name":"После 3-й зоны нельзя лутать",                                   "rarity":"common"},
  {"name":"Нельзя подбирать прицелы выше 2x",                              "rarity":"common"},
  {"name":"Только одно оружие",                                             "rarity":"common"},
  {"name":"Не более 150 патронов суммарно",                                 "rarity":"common"},
  {"name":"Нельзя использовать дымовые гранаты",                           "rarity":"common"},
  {"name":"Нельзя использовать молотовы",                                   "rarity":"common"},
  {"name":"Нельзя использовать осколочные гранаты",                        "rarity":"common"},
  {"name":"Только одиночный режим стрельбы",                               "rarity":"rare"},
  {"name":"Только хипфайр (без ADS)",                                       "rarity":"rare"},
  {"name":"Нельзя хилиться во время боя",                                   "rarity":"rare"},
  {"name":"Только 1 магазин на один файт",                                  "rarity":"rare"},
  {"name":"После каждого килла смени позицию",                              "rarity":"rare"},
  {"name":"Нельзя стрелять первым",                                         "rarity":"rare"},
  {"name":"Играть без миникарты",                                           "rarity":"rare"},
  {"name":"Только один тип прицела за игру",                                "rarity":"rare"},
  {"name":"Нельзя использовать аптечки (только бинты)",                    "rarity":"rare"},
  {"name":"Нельзя использовать обезболивающие",                             "rarity":"rare"},
  {"name":"Только 1 тип гранат",                                            "rarity":"rare"},
  {"name":"Запрещён присед (без crouch)",                                   "rarity":"rare"},
  {"name":"Первый килл только кулаками",                                    "rarity":"legendary"},
  {"name":"До 2-й зоны нельзя стрелять",                                    "rarity":"legendary"},
  {"name":"Нельзя использовать хил вообще",                                 "rarity":"legendary"},
  {"name":"Играть без звука",                                               "rarity":"legendary"},
  {"name":"Каждый бой начинать с прыжка",                                   "rarity":"legendary"},
  {"name":"Только хипфайр и без приседа",                                   "rarity":"legendary"},
  {"name":"После каждого килла выбросить предмет",                          "rarity":"legendary"},
  {"name":"Нельзя поднимать рюкзак выше 1 уровня",                         "rarity":"legendary"}
];

/* ============================================================
   AUDIO MANAGER — iOS-safe
   ============================================================
   Алгоритм разблокировки iOS:
   1. При первом клике пользователя создаём AudioContext
   2. Воспроизводим беззвучный буфер (1 фрейм) — iOS разрешает аудио
   3. Все последующие play() работают без ограничений

   Используем Web Audio API (BufferSourceNode) для точного контроля.
   XHR вместо fetch — работает на file:// в iOS Safari.
   ============================================================ */
const AudioManager = {
  ctx:          null,
  masterGain:   null,
  buffers:      {},
  spinSource:   null,
  spinGain:     null,
  activeWins:   [],
  tickCooldown: false,
  unlocked:     false,
  enabled:      true,
  volume:       SOUND_VOLUME,

  /* ---------- Инициализация ---------- */
  init() {
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this._updateToggleUI();
  },

  /* ---------- Разблокировка iOS (вызывать в user gesture) ---------- */
  async unlock() {
    if (this.unlocked) return;
    if (this._unlocking) return;
    this._unlocking = true;
    console.log('[AudioManager] unlock() начат');
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { console.warn('[AudioManager] AudioContext не поддерживается'); return; }
      this.ctx = new AC();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      /* Беззвучный буфер — разблокирует iOS */
      const silentBuf = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      const src = this.ctx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(this.ctx.destination);
      src.start(0);

      await this.ctx.resume();
      this.unlocked   = true;
      this._unlocking = false;
      console.log('[AudioManager] ✓ разблокирован, загружаю звуки…');
      this._loadAll();
    } catch (e) {
      this._unlocking = false;
      console.error('[AudioManager] unlock() ОШИБКА:', e);
    }
  },

  /* ---------- Загрузка файлов через XHR (работает на file://) ---------- */
  _loadAll() {
    const files = [
      'tick', 'spin',
      'win_common', 'win_rare', 'win_legendary',
      'win_common_challenge', 'win_rare_challenge', 'win_legendary_challenge'
    ];
    files.forEach(key => this._load(key, `audio/${key}.mp3`));
  },

  _load(key, url) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status !== 200 && xhr.status !== 0) return;
      ctx.decodeAudioData(
        xhr.response,
        buf => { this.buffers[key] = buf; console.log(`[AudioManager] ✓ ${key}`); },
        ()  => console.log(`[AudioManager] decode skip (${key}): синтез`)
      );
    };
    xhr.onerror = () => console.log(`[AudioManager] не найден (${key}): синтез`);
    try { xhr.send(); } catch(e) { console.log(`[AudioManager] XHR error (${key}):`, e); }
  },

  /* ---------- Helpers ---------- */
  _canPlay() { return this.enabled && this.unlocked && this.ctx; },

  _makeGain(vol) {
    const g = this.ctx.createGain();
    g.gain.value = vol;
    g.connect(this.masterGain);
    return g;
  },

  _playBuf(key, gain, loop = false) {
    if (!this.buffers[key] || !this.ctx) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[key];
    src.loop   = loop;
    src.connect(gain);
    src.start(0);
    return src;
  },

  /* ---------- Синтетические fallback звуки ---------- */
  _synthTick() {
    if (!this.ctx) return;
    const osc  = this.ctx.createOscillator();
    const gain = this._makeGain(this.volume * 0.25);
    osc.connect(gain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.start(); osc.stop(this.ctx.currentTime + 0.07);
  },

  _synthWin(rarity) {
    if (!this.ctx) return;
    const sets = {
      legendary: [261,329,392,523,659,784],
      rare:      [293,370,440,587],
      common:    [330,392,494]
    };
    const freqs = sets[rarity] || sets.common;
    freqs.forEach((f, i) => {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.masterGain);
      osc.type = rarity === 'legendary' ? 'sine' : 'triangle';
      const t  = this.ctx.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      osc.start(t); osc.stop(t + 0.7);
    });
  },

  _bassImpact() {
    if (!this.ctx) return;
    const t    = this.ctx.currentTime;
    const osc  = this.ctx.createOscillator();
    const gain = this._makeGain(this.volume * 1.1);
    osc.connect(gain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.18);
    gain.gain.setValueAtTime(this.volume * 1.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.2);

    const len  = this.ctx.sampleRate * 0.12;
    const buf  = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise  = this.ctx.createBufferSource();
    noise.buffer = buf;
    const flt    = this.ctx.createBiquadFilter();
    flt.type     = 'lowpass';
    flt.frequency.value = 180;
    const nGain  = this._makeGain(this.volume * 0.4);
    noise.connect(flt); flt.connect(nGain);
    nGain.gain.setValueAtTime(this.volume * 0.4, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.start(t); noise.stop(t + 0.15);
  },

  /* ---------- Публичное API ---------- */

  /**
   * Тик при пересечении сектора.
   * @param {number} boost  — множитель громкости (1.0 нормально, 1.3 в конце)
   * FIX-DRAMA: последние 20% вращения тик громче (boost > 1)
   */
  playTick(boost = 1.0) {
    if (!this._canPlay() || this.tickCooldown) return;
    this.tickCooldown = true;
    setTimeout(() => { this.tickCooldown = false; }, 60);

    const vol = Math.min(this.volume * 0.65 * boost, 1.0);
    if (this.buffers.tick) {
      const g = this._makeGain(vol);
      this._playBuf('tick', g);
    } else {
      /* Синтез с pitch по boost: драма звучит выше */
      if (!this.ctx) return;
      const osc  = this.ctx.createOscillator();
      const gain = this._makeGain(vol);
      osc.connect(gain);
      osc.type = 'square';
      const baseHz = 880 * (boost > 1 ? 1.15 : 1.0);
      osc.frequency.setValueAtTime(baseHz, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseHz * 0.5, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.start(); osc.stop(this.ctx.currentTime + 0.07);
    }
  },

  startSpinLoop() {
    if (!this._canPlay()) return;
    this.stopSpinLoop();
    if (!this.buffers.spin) return;
    this.spinGain   = this._makeGain(this.volume * 0.5);
    this.spinSource = this._playBuf('spin', this.spinGain, true);
  },

  stopSpinLoop() {
    if (this.spinSource) {
      try { this.spinSource.stop(); } catch (_) {}
      this.spinSource = null;
    }
    this.spinGain = null;
  },

  _stopWins() {
    this.activeWins.forEach(s => { try { s.stop(); } catch (_) {} });
    this.activeWins = [];
  },

  playWinByRarity(rarity) {
    if (!this._canPlay()) return;
    this._stopWins();
    this.stopSpinLoop();

    if (rarity === 'legendary') this._bassImpact();
    const delay = rarity === 'legendary' ? 190 : 0;

    setTimeout(() => {
      if (!this._canPlay()) return;
      const key = `win_${rarity}`;
      if (this.buffers[key]) {
        const g   = this._makeGain(this.volume);
        const src = this._playBuf(key, g);
        if (src) {
          this.activeWins.push(src);
          src.onended = () => { this.activeWins = this.activeWins.filter(s => s !== src); };
        }
      } else {
        this._synthWin(rarity);
      }
    }, delay);
  },

  playChallengeWinByRarity(rarity) {
    if (!this._canPlay()) return;
    this._stopWins();

    if (rarity === 'legendary') this._bassImpact();
    const delay = rarity === 'legendary' ? 190 : 0;

    setTimeout(() => {
      if (!this._canPlay()) return;
      const key = `win_${rarity}_challenge`;
      if (this.buffers[key]) {
        const g   = this._makeGain(this.volume);
        const src = this._playBuf(key, g);
        if (src) {
          this.activeWins.push(src);
          src.onended = () => { this.activeWins = this.activeWins.filter(s => s !== src); };
        }
      } else {
        this._synthWin(rarity);
      }
    }, delay);
  },

  stopAll() {
    this.stopSpinLoop();
    this._stopWins();
  },

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    this._updateToggleUI();
    if (!this.enabled) this.stopAll();
  },

  _updateToggleUI() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.textContent = this.enabled ? '🔊' : '🔇';
    btn.title       = this.enabled ? 'Звук включён' : 'Звук выключен';
    btn.dataset.on  = this.enabled ? '1' : '0';
  }
};

/* ============================================================
   FISHER-YATES SHUFFLE
   Статистически равномерное перемешивание.
   .sort(() => Math.random()-0.5) — НЕРАВНОМЕРНО, не использовать.
   ============================================================ */
function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   СЛУЧАЙНЫЙ ВЫБОР ПО РЕДКОСТИ
   ============================================================ */
function pickRandom(segments) {
  const rand = Math.random();
  let rarity;
  if      (rand < RARITY.legendary.prob)                          rarity = 'legendary';
  else if (rand < RARITY.legendary.prob + RARITY.rare.prob)       rarity = 'rare';
  else                                                             rarity = 'common';

  const pool = segments.map((w, i) => ({ w, i })).filter(({ w }) => w.rarity === rarity);
  if (!pool.length) {
    console.warn(`[pickRandom] пул "${rarity}" пуст, беру случайный`);
    const i = Math.floor(Math.random() * segments.length);
    return { item: segments[i], index: i };
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { item: chosen.w, index: chosen.i };
}

/* ============================================================
   WHEEL RENDERER — Canvas 2D
   ============================================================
   СИСТЕМА КООРДИНАТ:
     Canvas 0° = 3 часа (вектор вправо).
     Указатель = 12 часов = угол -π/2 в canvas.
     Сектор i: startAngle = (wheelAngle - π/2) + i * sliceAngle
     Центр  i: startAngle + sliceAngle/2

   АУДИТ-FIX-1: ctx.shadowColor/shadowBlur сбрасываются после
     каждого использования внутри ctx.save/restore — нет утечки.

   АУДИТ-FIX-2: highlightWinner — shadowBlur сброшен через restore().

   АУДИТ-FIX-3: _resize() guard size===0 — не трогаем canvas.

   АУДИТ-FIX-4: dpr capped at 2 для старых iPhone.
   ============================================================ */
const WheelRenderer = {
  canvas:   null,
  ctx:      null,
  segs:     [],
  angle:    0,
  spinning: false,

  /* FIX-DRAMA: индекс подсвеченного "соседнего" сектора (эффект "почти выпало") */
  _nearMissIndex:    -1,
  _nearMissAlpha:     0,

  init(canvas, segments) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d', { alpha: true });
    this.segs   = segments;
    this._resize();
    this.draw(this.angle);
  },

  _resize() {
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.round(Math.min(rect.width, rect.height));
    if (size === 0) return;
    this.canvas.width  = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  draw(angle) {
    this.angle = angle;
    const ctx  = this.ctx;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const W    = this.canvas.width  / dpr;
    const H    = this.canvas.height / dpr;
    const cx   = W / 2;
    const cy   = H / 2;
    const R    = Math.min(W, H) / 2 - 3;

    ctx.clearRect(0, 0, W, H);

    const n     = this.segs.length;
    const slice = (2 * Math.PI) / n;
    const base  = angle - Math.PI / 2;

    const isSpinning = this.spinning;

    for (let i = 0; i < n; i++) {
      const seg = this.segs[i];
      const rc  = RARITY[seg.rarity];
      const sa  = base + i * slice;
      const ea  = sa + slice;
      const mid = sa + slice / 2;

      /* ── Градиент сектора ── */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sa, ea);
      ctx.closePath();

      if (isSpinning) {
        ctx.fillStyle = rc.fillLight;
      } else {
        const grd = ctx.createRadialGradient(cx, cy, R * 0.06, cx, cy, R);
        grd.addColorStop(0,    rc.fillDark);
        grd.addColorStop(0.42, rc.fillLight);
        grd.addColorStop(1,    rc.fillDark);
        ctx.fillStyle = grd;
      }
      ctx.fill();

      /* АУДИТ-FIX-1: stroke не имеет shadow — сброс не нужен, но явно гарантируем */
      ctx.strokeStyle = rc.strokeColor;
      ctx.lineWidth   = 1;
      ctx.stroke();

      /* ── Текст + полоска-акцент в ctx.save/restore ── */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      if (!isSpinning) {
        /* Полоска-акцент редкости */
        const stripW = Math.max(3, R * 0.028);
        const stripH = Math.max(12, R * 0.13);
        const stripX = R * 0.86;

        ctx.globalAlpha = 0.78;
        ctx.fillStyle   = rc.accent;

        if (seg.rarity !== 'common') {
          /* АУДИТ-FIX-1: shadowBlur/Color устанавливаем внутри save, restore сбросит */
          ctx.shadowColor = rc.glowColor;
          ctx.shadowBlur  = seg.rarity === 'legendary' ? 12 : 7;
        }

        const rx = stripX, ry = -stripH / 2, rw = stripW, rh = stripH, rr = 2;
        ctx.beginPath();
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + rw - rr, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
        ctx.lineTo(rx + rw, ry + rh - rr);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
        ctx.lineTo(rx + rr, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
        ctx.lineTo(rx, ry + rr);
        ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
        ctx.closePath();
        ctx.fill();

        /* Явный сброс shadow перед текстом */
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
        ctx.globalAlpha = 1;
      }

      /* ── Текст ── */
      const maxW  = R * (isSpinning ? 0.76 : 0.80);
      const fSize = Math.max(6, Math.min(
        R * (isSpinning ? 0.057 : 0.065),
        isSpinning ? 10 : 12
      ));

      ctx.font         = `${isSpinning ? '600' : '700'} ${fSize}px 'Segoe UI','Inter',system-ui,sans-serif`;
      ctx.fillStyle    = rc.textColor;
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';

      if (!isSpinning) {
        if (seg.rarity === 'legendary') {
          ctx.shadowColor = rc.glowColor;
          ctx.shadowBlur  = 9;
        } else if (seg.rarity === 'rare') {
          ctx.shadowColor = rc.glowColor;
          ctx.shadowBlur  = 5;
        }
        /* common — без glow: shadowBlur остаётся 0 (сброшен выше или не был установлен) */
      }

      let label = seg.name;
      while (ctx.measureText(label).width > maxW && label.length > 2) {
        label = label.slice(0, -1);
      }
      if (label !== seg.name) label = label.trimEnd() + '…';

      ctx.fillText(label, R * 0.88, 0);

      /* АУДИТ-FIX-1: явный сброс перед restore (для надёжности) */
      ctx.shadowBlur  = 0;
      ctx.shadowColor = 'transparent';
      ctx.restore();
    }

    /* FIX-DRAMA: near-miss подсветка соседнего сектора */
    if (this._nearMissIndex >= 0 && this._nearMissAlpha > 0) {
      const nm  = this._nearMissIndex;
      const nrc = RARITY[this.segs[nm].rarity];
      const sa  = base + nm * slice;
      const ea  = sa + slice;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sa, ea);
      ctx.closePath();
      ctx.globalAlpha = this._nearMissAlpha * 0.45;
      ctx.fillStyle   = nrc.glowColor;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* ── Обод ── */
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    /* ── Хаб-кольцо ── */
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.17, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  },

  highlightWinner(winIndex, angle) {
    const ctx  = this.ctx;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const W    = this.canvas.width  / dpr;
    const H    = this.canvas.height / dpr;
    const cx   = W / 2;
    const cy   = H / 2;
    const R    = Math.min(W, H) / 2 - 3;
    const n    = this.segs.length;
    const sl   = (2 * Math.PI) / n;
    const base = angle - Math.PI / 2;
    const sa   = base + winIndex * sl;
    const ea   = sa + sl;
    const rc   = RARITY[this.segs[winIndex].rarity];

    /* АУДИТ-FIX-2: всё внутри save/restore → shadowBlur не утекает */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, sa, ea);
    ctx.closePath();
    ctx.fillStyle = rc.glowColor.replace(/[\d.]+\)$/, '0.18)');
    ctx.fill();
    ctx.shadowColor = rc.glowColor;
    ctx.shadowBlur  = 20;
    ctx.strokeStyle = rc.textColor;
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.restore();
  },

  /**
   * FIX-DRAMA: подсветить соседний сектор на короткое время (near-miss эффект).
   * @param {number} neighborIndex — индекс соседнего сектора
   * @param {number} durationMs   — длительность мс
   */
  flashNearMiss(neighborIndex, durationMs = 120) {
    this._nearMissIndex = neighborIndex;
    this._nearMissAlpha = 1;
    const start = performance.now();
    const tick  = (now) => {
      const t = (now - start) / durationMs;
      if (t >= 1) {
        this._nearMissIndex = -1;
        this._nearMissAlpha = 0;
        this.draw(this.angle);
        return;
      }
      this._nearMissAlpha = 1 - t;
      this.draw(this.angle);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  getSectorAtPointer(angle) {
    const n  = this.segs.length;
    const sl = (2 * Math.PI) / n;
    let rel  = (Math.PI / 2 - angle) % (2 * Math.PI);
    if (rel < 0) rel += 2 * Math.PI;
    return Math.floor(rel / sl) % n;
  }
};

/* ============================================================
   SPIN ENGINE — детерминированное вращение
   ============================================================
   ФОРМУЛА finalAngle:
     Центр сектора winIndex под указателем (12ч):
       finalAngle = -(winIndex*slice + slice/2)  (mod 2π)
     + MIN_SPINS полных оборотов поверх currentAngle.

   DRAMA PHASE (последние ~0.8 сек):
     Фаза 1: ease-out до (finalTotal + dramaExtra)   ← перелёт
     Фаза 2: ease-in-out обратно к finalTotal        ← откат

   FIX-DRAMA: в последние 20% ph1 — тик с boost 1.3 (громче).
   FIX-DRAMA: в последние 3 сектора — near-miss flash на соседний.
   ============================================================ */
const SpinEngine = {
  spinning: false,
  angle:    0,

  spin({ winIndex, total, onTick, onDone, renderer }) {
    if (this.spinning) return;
    this.spinning = true;

    const MIN_SPINS = 6;
    const slice     = (2 * Math.PI) / total;

    /* ── Точный угол остановки ── */
    const center    = -(winIndex * slice + slice / 2);
    const maxOff    = slice * 0.12;
    const offset    = (Math.random() * 2 - 1) * maxOff;
    let   target    = ((center + offset) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const minTarget = this.angle + MIN_SPINS * 2 * Math.PI;
    while (target <= minTarget) target += 2 * Math.PI;
    const finalTotal = target;

    /* Drama */
    const drama    = slice * (0.28 + Math.random() * 0.26);
    const totalDur = 4400 + Math.random() * 1600;
    const dramaDur = 780;
    const ph1Dur   = totalDur - dramaDur;
    const ph1Tgt   = finalTotal + drama;

    const t0       = performance.now();
    const startAng = this.angle;
    let   lastSect = Math.floor(startAng / slice);

    /* FIX-DRAMA: near-miss флаг — срабатывает один раз за спин */
    let nearMissFired = false;

    /* Easing */
    const easeOut   = t => 1 - Math.pow(1 - t, 4);
    const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const frame = (now) => {
      const el = now - t0;
      let   a;

      if (el < ph1Dur) {
        a = startAng + (ph1Tgt - startAng) * easeOut(el / ph1Dur);
      } else if (el < totalDur) {
        a = ph1Tgt + (finalTotal - ph1Tgt) * easeInOut((el - ph1Dur) / dramaDur);
      } else {
        a = finalTotal;
        this.angle    = a;
        this.spinning = false;
        onTick(a);
        onDone(a);
        return;
      }

      /* Тик при смене сектора */
      const sect = Math.floor(a / slice);
      if (sect !== lastSect) {
        /* FIX-DRAMA: boost громкости в последние 20% ph1 */
        const ph1Progress = Math.min(el / ph1Dur, 1);
        const tickBoost   = ph1Progress > 0.80 ? 1.3 : 1.0;
        AudioManager.playTick(tickBoost);

        /* FIX-DRAMA: near-miss в последние 3 сектора до остановки */
        if (!nearMissFired && renderer) {
          const secsLeft = Math.abs(finalTotal - a) / slice;
          if (secsLeft <= 3 && secsLeft > 1) {
            nearMissFired = true;
            /* Сосед — сектор рядом с winIndex */
            const neighborIndex = (winIndex + 1) % total;
            if (neighborIndex !== winIndex) {
              renderer.flashNearMiss(neighborIndex, 100);
            }
          }
        }

        lastSect = sect;
      }

      this.angle = a;
      onTick(a);
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }
};

/* ============================================================
   LEGENDARY SCENE — затемнение + золотой glow из центра
   FIX-DRAMA: при legendary добавляем overlay перед карточкой
   ============================================================ */
const LegendaryScene = {
  _overlay: null,

  show(onComplete) {
    /* Создаём overlay если не существует */
    let el = document.getElementById('legendarySceneOverlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'legendarySceneOverlay';
      el.style.cssText = [
        'position:fixed','inset:0','z-index:9995',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.3s',
        'background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(212,168,50,0.18) 0%,rgba(0,0,0,0.55) 70%)'
      ].join(';');
      document.body.appendChild(el);
    }
    this._overlay = el;

    /* Fade in */
    el.style.opacity = '0';
    void el.offsetHeight;
    el.style.opacity = '1';

    /* Держим 900мс, затем fade out и callback */
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    }, 900);
  }
};

/* ============================================================
   PARTICLES
   ============================================================ */
const Particles = {
  canvas: null,
  ctx:    null,
  list:   [],
  raf:    null,

  init() {
    this.canvas = document.getElementById('particlesCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    /* FIX-AUDIT: именованная ссылка для возможного removeEventListener */
    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler);
  },

  _resize() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  burst(rarity) {
    if (!this.canvas) return;
    const pal = {
      legendary: ['#d4a832','#e8c04a','#f5d76e','#fffbe6','#c8921a'],
      rare:      ['#7c4fd4','#9d7fe8','#b89ef0','#e0d4ff','#5a34b0'],
      common:    ['#4a5060','#7a8090','#a0a8b8','#d0d4de','#303540']
    };
    const colors = pal[rarity] || pal.common;
    const count  = rarity === 'legendary' ? 110 : rarity === 'rare' ? 70 : 45;
    const cx     = window.innerWidth  / 2;
    const cy     = window.innerHeight * 0.38;

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * 2 * Math.PI;
      const spd = 2.5 + Math.random() * 8;
      this.list.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size:  2.5 + Math.random() * 5.5,
        life:  1,
        decay: 0.012 + Math.random() * 0.018,
        rect:  Math.random() > 0.45
      });
    }
    if (!this.raf) this._loop();
  },

  _loop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.list = this.list.filter(p => p.life > 0.01);
    this.list.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.22; p.vx *= 0.985;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      if (p.rect) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 4);
        ctx.fillRect(-p.size/2, -p.size*0.28, p.size, p.size*0.56);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size/2, 0, 2*Math.PI);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    this.raf = this.list.length > 0 ? requestAnimationFrame(() => this._loop()) : null;
  }
};

/* ============================================================
   RESULT MODAL
   ============================================================ */
const ResultModal = {
  el:       null,
  closeBtn: null,

  init() {
    this.el       = document.getElementById('resultOverlay');
    this.closeBtn = document.getElementById('resultCloseBtn');

    if (!this.el) {
      console.error('[ResultModal] КРИТИЧНО: #resultOverlay не найден!');
      return;
    }
    if (!this.closeBtn) {
      console.error('[ResultModal] КРИТИЧНО: #resultCloseBtn не найден!');
      return;
    }

    this.closeBtn.addEventListener('click', () => this.hide());
    this.el.addEventListener('click', e => { if (e.target === this.el) this.hide(); });
    console.log('[ResultModal] инициализирован ✓');
  },

  show(item, type = 'weapon') {
    if (!this.el) { console.error('[ResultModal] show() без init()!'); return; }

    const rarity = item.rarity;
    console.log(`[ResultModal] показываю: "${item.name}" (${rarity}, ${type})`);

    /* Бейдж */
    const badge = document.getElementById('resultBadge');
    if (badge) {
      badge.className   = `result-badge rarity-${rarity}`;
      badge.textContent =
        rarity === 'legendary' ? '⭐ ЛЕГЕНДАРНОЕ' :
        rarity === 'rare'      ? '💎 РЕДКОЕ' : '▪ ОБЫЧНОЕ';
    }

    /* Тип */
    const typeLabel = document.getElementById('resultTypeLabel');
    if (typeLabel) typeLabel.textContent = type === 'challenge' ? 'Усложнение выпало!' : 'Оружие выпало!';

    /* Изображение */
    const imgWrap = document.getElementById('resultImgWrap');
    const img     = document.getElementById('resultImg');

    if (imgWrap) {
      const oldFb = imgWrap.querySelector('.result-img-fallback');
      if (oldFb) oldFb.remove();
    }

    const emoMap  = { legendary: '⭐', rare: '💎', common: '🔫' };
    const chalEmo = { legendary: '☠️', rare: '⚡', common: '🎯' };

    if (item.image && imgWrap && img) {
      imgWrap.style.display = '';
      img.style.display     = '';
      img.src               = '';
      img.onerror = () => {
        img.style.display = 'none';
        const fb = document.createElement('div');
        fb.className   = 'result-img-fallback';
        fb.textContent = emoMap[rarity] || '🔫';
        imgWrap.appendChild(fb);
      };
      img.src = item.image;
    } else if (imgWrap && img) {
      imgWrap.style.display = '';
      img.style.display     = 'none';
      const fb = document.createElement('div');
      fb.className   = 'result-img-fallback';
      fb.textContent = chalEmo[rarity] || '🎯';
      imgWrap.appendChild(fb);
    }

    /* Название */
    const nameEl = document.getElementById('resultName');
    if (nameEl) {
      nameEl.textContent = item.name;
      nameEl.className   = `result-name rarity-text-${rarity}`;
    }

    /* Карточка */
    const card = document.getElementById('resultCard');
    if (card) card.className = `result-card rarity-card-${rarity}`;

    /* FIX-DRAMA: для legendary — карточка появляется с усиленной анимацией scale */
    if (card && rarity === 'legendary') {
      card.style.transition = 'transform 0.45s cubic-bezier(0.34,1.6,0.64,1)';
    } else if (card) {
      card.style.transition = 'transform 0.35s cubic-bezier(0.34,1.45,0.64,1)';
    }

    /* Показ: display → reflow → visible */
    this.el.style.display = 'flex';
    void this.el.offsetHeight;
    this.el.classList.add('visible');
    console.log('[ResultModal] visible ✓');
  },

  hide() {
    if (!this.el) return;
    this.el.classList.remove('visible');
    setTimeout(() => {
      if (!this.el.classList.contains('visible')) this.el.style.display = '';
    }, 320);
  }
};

/* ============================================================
   FLASH
   ============================================================ */
function flashScreen(rarity) {
  const el = document.getElementById('flashOverlay');
  if (!el) return;
  const c = { legendary:'rgba(212,168,50,0.45)', rare:'rgba(157,127,232,0.35)', common:'rgba(255,255,255,0.18)' };
  el.style.background = c[rarity] || c.common;
  el.style.transition = 'none';
  el.style.opacity    = '1';
  setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; }, 60);
}

/* ============================================================
   STATS MANAGER
   ============================================================ */
const Stats = {
  weapon:    { attempts: 0, legendary: 0, streak: 0 },
  challenge: { attempts: 0, legendary: 0, streak: 0 },

  record(type, rarity) {
    const s = this[type];
    if (!s) return;
    s.attempts++;
    if (rarity === 'legendary') { s.legendary++; s.streak = 0; }
    else                          s.streak++;
    this._render(type);
  },

  _render(type) {
    const s   = this[type];
    const pfx = type === 'weapon' ? 'w' : 'c';
    const se  = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    se(`${pfx}Attempts`,  s.attempts);
    se(`${pfx}Legendary`, s.legendary);
    se(`${pfx}Streak`,    s.streak);
  }
};

/* ============================================================
   CURRENT CHALLENGE BLOCK
   ============================================================ */
const CurrentChallenge = {
  weapon:    null,
  challenge: null,

  set(type, item) {
    if (type === 'weapon')    this.weapon    = item;
    if (type === 'challenge') this.challenge = item;
    this._render();
  },

  _render() {
    const block = document.getElementById('currentChallengeBlock');
    if (!block) return;
    const wEl = document.getElementById('ccWeapon');
    const cEl = document.getElementById('ccChallenge');
    if (wEl) wEl.textContent = this.weapon    ? this.weapon.name    : '—';
    if (cEl) cEl.textContent = this.challenge ? this.challenge.name : '—';
    block.style.display = (this.weapon || this.challenge) ? '' : 'none';
  }
};

/* ============================================================
   WHEEL CONTROLLER
   ============================================================
   Ленивая инициализация renderer'а (_ensureInit) —
   canvas инициализируется только когда панель видима
   (getBoundingClientRect() возвращает ненулевой размер).
   ============================================================ */
class WheelController {
  constructor(opts) {
    this.opts     = opts;
    this.renderer = Object.create(WheelRenderer);
    Object.assign(this.renderer, {
      canvas: null, ctx: null, segs: [], angle: 0, spinning: false,
      _nearMissIndex: -1, _nearMissAlpha: 0
    });
    this.engine = Object.create(SpinEngine);
    Object.assign(this.engine, { spinning: false, angle: 0 });
    this._ready = false;
  }

  init() {
    /* АУДИТ-FIX: null-guard на spinBtn */
    const spinBtn = document.getElementById(this.opts.spinBtnId);
    if (!spinBtn) { console.error(`[WheelController] кнопка #${this.opts.spinBtnId} не найдена`); return; }

    spinBtn.addEventListener('click', () => {
      this._ensureInit();
      this._spin();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === this.opts.tabId) {
          setTimeout(() => this._ensureInit(), 30);
        }
      });
    });

    /* АУДИТ-FIX: именованный handler — не дублируется */
    this._resizeHandler = () => {
      if (!this._ready) return;
      this.renderer._resize();
      this.renderer.draw(this.engine.angle);
    };
    window.addEventListener('resize', this._resizeHandler);

    const panel = document.getElementById(this.opts.tabPanelId);
    if (panel && panel.classList.contains('active')) {
      requestAnimationFrame(() => this._ensureInit());
    }
  }

  _ensureInit() {
    if (this._ready) return;
    const canvas = document.getElementById(this.opts.canvasId);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      requestAnimationFrame(() => this._ensureInit());
      return;
    }
    this.renderer.init(canvas, this.opts.segments);
    this._ready = true;
    console.log(`[WheelController:${this.opts.type}] инициализирован, ${this.opts.segments.length} секторов`);
  }

  _spin() {
    if (this.engine.spinning) return;
    console.log(`[WheelController:${this.opts.type}] _spin()`);

    AudioManager.unlock();

    const { item, index } = pickRandom(this.opts.segments);

    const btn = document.getElementById(this.opts.spinBtnId);
    if (btn) btn.disabled = true;

    const ring = document.getElementById(this.opts.ringId);
    if (ring) ring.className = 'wheel-ring';

    AudioManager.startSpinLoop();
    this.renderer.spinning = true;

    this.engine.spin({
      winIndex: index,
      total:    this.opts.segments.length,
      renderer: this.renderer,         /* FIX-DRAMA: передаём renderer для near-miss */
      onTick:   (a) => this.renderer.draw(a),
      onDone:   (a) => this._onDone(a, item, index)
    });
  }

  _onDone(finalAngle, item, index) {
    console.log(`[WheelController:${this.opts.type}] _onDone → "${item.name}" (${item.rarity})`);

    this.renderer.spinning = false;
    AudioManager.stopSpinLoop();

    /* Верификация */
    const verified = this.renderer.getSectorAtPointer(finalAngle);
    if (verified !== index) {
      console.warn(`[WheelController:${this.opts.type}] ⚠ рассинхрон: ожидался ${index}, под стрелкой ${verified}`);
    } else {
      console.log(`[WheelController:${this.opts.type}] ✓ верификация OK: сектор ${index}`);
    }

    this.renderer.draw(finalAngle);
    this.renderer.highlightWinner(index, finalAngle);

    const ring = document.getElementById(this.opts.ringId);
    if (ring) ring.classList.add(item.rarity);

    flashScreen(item.rarity);

    /* FIX-DRAMA: legendary — сначала мини-сцена затемнения, потом карточка */
    if (item.rarity === 'legendary') {
      /* Частицы сразу */
      setTimeout(() => Particles.burst(item.rarity), 80);
      /* Bass impact */
      setTimeout(() => {
        if (this.opts.type === 'challenge') AudioManager.playChallengeWinByRarity(item.rarity);
        else                                AudioManager.playWinByRarity(item.rarity);
      }, 60);
      /* Overlay-сцена, карточка — после */
      LegendaryScene.show(() => {
        this._showResult(item, index);
      });
    } else {
      setTimeout(() => Particles.burst(item.rarity), 100);
      const soundDelay = 160;
      setTimeout(() => {
        if (this.opts.type === 'challenge') AudioManager.playChallengeWinByRarity(item.rarity);
        else                                AudioManager.playWinByRarity(item.rarity);
      }, soundDelay);
      setTimeout(() => this._showResult(item, index), 360);
    }

    /* Разблокировать кнопку */
    setTimeout(() => {
      const btn = document.getElementById(this.opts.spinBtnId);
      if (btn) btn.disabled = false;
    }, 1800);
  }

  _showResult(item, index) {
    try {
      ResultModal.show(item, this.opts.type);
      Stats.record(this.opts.type, item.rarity);
      CurrentChallenge.set(this.opts.type, item);
      this._updateMini(item);
    } catch(e) {
      console.error(`[WheelController:${this.opts.type}] ОШИБКА в _showResult:`, e);
    }
  }

  _updateMini(item) {
    const miniId = this.opts.type === 'weapon' ? 'lastWeaponMini' : 'lastChallengeMini';
    const mini   = document.getElementById(miniId);
    if (!mini) return;
    const rc = RARITY[item.rarity];
    mini.innerHTML = `
      <div class="panel-label">${this.opts.type === 'weapon' ? 'Последнее оружие' : 'Последнее усложнение'}</div>
      <div class="mini-name" style="margin-bottom:3px">${item.name}</div>
      <div class="mini-rarity" style="color:${rc.textColor}">${rc.label}</div>
    `;
    mini.style.display = '';
  }
}

/* ============================================================
   CATALOG UI
   ============================================================ */
const CatalogUI = {
  filter: 'all',
  search: '',
  type:   'weapon',

  init() {
    const searchEl = document.getElementById('catalogSearch');
    if (searchEl) searchEl.addEventListener('input', e => { this.search = e.target.value.toLowerCase(); this._render(); });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('f-active'));
        btn.classList.add('f-active');
        this._render();
      });
    });

    document.querySelectorAll('.catalog-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.type = btn.dataset.ctype;
        document.querySelectorAll('.catalog-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._render();
      });
    });

    this._render();
  },

  _render() {
    const data = this.type === 'weapon' ? WEAPONS_DATA : CHALLENGES_DATA;
    const filtered = data.filter(w => {
      const mr = this.filter === 'all' || w.rarity === this.filter;
      const ms = w.name.toLowerCase().includes(this.search);
      return mr && ms;
    });

    const countEl = document.getElementById('catalogCount');
    if (countEl) countEl.textContent = `${filtered.length} шт.`;

    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    grid.innerHTML = filtered.map(w => {
      const rc      = RARITY[w.rarity];
      const imgHtml = w.image
        ? `<img src="${w.image}" alt="${w.name}" loading="lazy" onerror="this.style.opacity='0.12'">`
        : `<div class="no-img">🔫</div>`;
      return `<div class="weapon-card rarity-card-${w.rarity}">
        <div class="icon-wrap rarity-${w.rarity}">${imgHtml}</div>
        <div class="wcard-name">${w.name}</div>
        <div class="wcard-rarity" style="color:${rc.textColor}">${rc.label}</div>
      </div>`;
    }).join('');
  }
};

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`${tab}-panel`);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ============================================================
   APP — точка входа
   ============================================================ */
const App = {
  init() {
    console.log('[App] init()');

    AudioManager.init();

    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) soundBtn.addEventListener('click', () => AudioManager.toggleSound());

    initTabs();
    Particles.init();
    ResultModal.init();
    CurrentChallenge._render();

    /* Колесо оружий */
    const weaponSegs  = fisherYatesShuffle(WEAPONS_DATA);
    const weaponWheel = new WheelController({
      canvasId:   'weaponCanvas',
      ringId:     'weaponRing',
      spinBtnId:  'spinWeaponBtn',
      tabPanelId: 'weapon-panel',
      tabId:      'weapon',
      segments:   weaponSegs,
      type:       'weapon'
    });
    weaponWheel.init();

    const wb = document.getElementById('weaponCountBadge');
    if (wb) wb.textContent = weaponSegs.length;

    /* Колесо усложнений */
    const challengeSegs  = fisherYatesShuffle(CHALLENGES_DATA);
    const challengeWheel = new WheelController({
      canvasId:   'challengeCanvas',
      ringId:     'challengeRing',
      spinBtnId:  'spinChallengeBtn',
      tabPanelId: 'challenge-panel',
      tabId:      'challenge',
      segments:   challengeSegs,
      type:       'challenge'
    });
    challengeWheel.init();

    CatalogUI.init();

    console.log('[App] ✓ готов');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
