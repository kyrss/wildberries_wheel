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

   Используем Web Audio API (BufferSourceNode) для точного контроля,
   с fallback на HTMLAudioElement для файловых звуков.
   ============================================================ */
const AudioManager = {
  ctx:          null,       // AudioContext
  masterGain:   null,       // GainNode — общая громкость
  buffers:      {},         // кэш декодированных AudioBuffer
  spinSource:   null,       // текущий источник spin-loop
  spinGain:     null,
  activeWins:   [],         // активные победные источники
  tickCooldown: false,      // throttle тиков
  unlocked:     false,      // iOS разблокирован?
  enabled:      true,       // тумблер звука
  volume:       SOUND_VOLUME,

  /* ---------- Инициализация ---------- */
  init() {
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this._updateToggleUI();
  },

  /* ---------- Разблокировка iOS (вызывать в user gesture) ---------- */
  async unlock() {
    if (this.unlocked) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      /* Беззвучный буфер — "разблокирует" iOS */
      const silentBuf = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      const src = this.ctx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(this.ctx.destination);
      src.start(0);

      await this.ctx.resume();
      this.unlocked = true;

      /* Загружаем все звуки в фоне */
      this._loadAll();
    } catch (e) {
      console.warn('[AudioManager] unlock error:', e);
    }
  },

  /* ---------- Загрузка файлов ---------- */
  _loadAll() {
    const files = [
      'tick', 'spin',
      'win_common', 'win_rare', 'win_legendary',
      'win_common_challenge', 'win_rare_challenge', 'win_legendary_challenge'
    ];
    files.forEach(key => this._load(key, `audio/${key}.mp3`));
  },

  async _load(key, url) {
    if (!this.ctx) return;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;
      const ab = await resp.arrayBuffer();
      this.buffers[key] = await this.ctx.decodeAudioData(ab);
    } catch (_) {
      /* файл отсутствует — используем синтез */
    }
  },

  /* ---------- Helpers ---------- */
  _canPlay() { return this.enabled && this.unlocked && this.ctx; },

  _makeGain(vol = this.volume) {
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
    const t = this.ctx.currentTime;
    const osc  = this.ctx.createOscillator();
    const gain = this._makeGain(this.volume * 1.1);
    osc.connect(gain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.18);
    gain.gain.setValueAtTime(this.volume * 1.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.2);

    /* Noise burst */
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

  /** Тик при пересечении сектора */
  playTick() {
    if (!this._canPlay() || this.tickCooldown) return;
    this.tickCooldown = true;
    setTimeout(() => { this.tickCooldown = false; }, 60);

    if (this.buffers.tick) {
      const g = this._makeGain(this.volume * 0.65);
      this._playBuf('tick', g);
    } else {
      this._synthTick();
    }
  },

  /** Запустить loop вращения */
  startSpinLoop() {
    if (!this._canPlay()) return;
    this.stopSpinLoop();
    if (!this.buffers.spin) return;
    this.spinGain   = this._makeGain(this.volume * 0.5);
    this.spinSource = this._playBuf('spin', this.spinGain, true);
  },

  /** Остановить loop вращения */
  stopSpinLoop() {
    if (this.spinSource) {
      try { this.spinSource.stop(); } catch (_) {}
      this.spinSource = null;
    }
    this.spinGain = null;
  },

  /** Остановить все победные звуки */
  _stopWins() {
    this.activeWins.forEach(s => { try { s.stop(); } catch (_) {} });
    this.activeWins = [];
  },

  /**
   * Победный звук оружия
   * @param {'common'|'rare'|'legendary'} rarity
   */
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
          src.onended = () => {
            this.activeWins = this.activeWins.filter(s => s !== src);
          };
        }
      } else {
        this._synthWin(rarity);
      }
    }, delay);
  },

  /**
   * Победный звук усложнения
   * @param {'common'|'rare'|'legendary'} rarity
   */
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
          src.onended = () => {
            this.activeWins = this.activeWins.filter(s => s !== src);
          };
        }
      } else {
        /* Fallback: синтез с небольшим pitch-shift */
        this._synthWin(rarity);
      }
    }, delay);
  },

  /** Остановить всё */
  stopAll() {
    this.stopSpinLoop();
    this._stopWins();
  },

  /* ---------- Тумблер звука ---------- */
  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    this._updateToggleUI();
    if (!this.enabled) this.stopAll();
  },

  _updateToggleUI() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.textContent  = this.enabled ? '🔊' : '🔇';
    btn.title        = this.enabled ? 'Звук включён' : 'Звук выключен';
    btn.dataset.on   = this.enabled ? '1' : '0';
  }
};

/* ============================================================
   FISHER-YATES SHUFFLE — статистически равномерное перемешивание
   ============================================================
   Стандартный .sort(() => Math.random() - 0.5) даёт НЕРАВНОМЕРНОЕ
   распределение из-за нестабильности сортировки.
   Fisher-Yates гарантирует равновероятность каждой перестановки.
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

   ФОРМУЛА УГЛА ОСТАНОВКИ:
     Нужно: центр сектора winIndex оказался под указателем (-π/2):
       (finalAngle - π/2) + winIndex*slice + slice/2 = -π/2 + 2πk
       finalAngle = -(winIndex*slice + slice/2)  (mod 2π)
     Добавляем N полных оборотов поверх текущего угла.
   ============================================================ */
const WheelRenderer = {
  canvas:  null,
  ctx:     null,
  segs:    [],
  imgs:    {},         // кэш Image
  angle:   0,         // текущий абсолютный угол (рад, накапливается)

  init(canvas, segments) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.segs   = segments;
    this._resize();
    this._preload();
    this.draw(this.angle);
  },

  _resize() {
    const dpr  = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.round(Math.min(rect.width, rect.height));
    this.canvas.width  = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  _preload() {
    this.segs.forEach(seg => {
      if (this.imgs[seg.image] !== undefined) return;
      this.imgs[seg.image] = 'loading';
      const img = new Image();

      img.onload = () => {
        this.imgs[seg.image] = img;
        this.draw(this.angle);
      };

      img.onerror = () => {
        /* PNG не найден — пробуем SVG-заглушку по редкости */
        if (seg.imgFallback) {
          const fb = new Image();
          fb.onload  = () => { this.imgs[seg.image] = fb; this.draw(this.angle); };
          fb.onerror = () => { this.imgs[seg.image] = null; };
          fb.src = seg.imgFallback;
        } else {
          this.imgs[seg.image] = null;   // нарисуем цветной блок
        }
      };

      img.src = seg.image;
    });
  },

  draw(angle) {
    this.angle = angle;
    const ctx  = this.ctx;
    const dpr  = window.devicePixelRatio || 1;
    const W    = this.canvas.width  / dpr;
    const H    = this.canvas.height / dpr;
    const cx   = W / 2;
    const cy   = H / 2;
    const R    = Math.min(W, H) / 2 - 3;

    ctx.clearRect(0, 0, W, H);

    const n     = this.segs.length;
    const slice = (2 * Math.PI) / n;
    const base  = angle - Math.PI / 2;   // указатель на 12 часов

    for (let i = 0; i < n; i++) {
      const seg = this.segs[i];
      const rc  = RARITY[seg.rarity];
      const sa  = base + i * slice;
      const ea  = sa + slice;
      const mid = sa + slice / 2;

      /* Градиент сектора */
      const grd = ctx.createRadialGradient(cx, cy, R * 0.06, cx, cy, R);
      grd.addColorStop(0,    rc.fillDark);
      grd.addColorStop(0.42, rc.fillLight);
      grd.addColorStop(1,    rc.fillDark);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sa, ea);
      ctx.closePath();
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.strokeStyle = rc.strokeColor;
      ctx.lineWidth   = 1;
      ctx.stroke();

      /* Текст + иконка */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);

      const img      = this.imgs[seg.image];
      const iconSize = Math.max(14, Math.min(R * 0.15, 28));
      const iconDist = R * 0.60;

      /* ── Иконка с glow по редкости ─────────────────────── */
      if (img && img !== 'loading') {
        /* Glow-тень перед отрисовкой иконки */
        if (seg.rarity === 'legendary') {
          ctx.shadowColor = 'rgba(212,168,50,0.82)';
          ctx.shadowBlur  = iconSize * 0.85;
        } else if (seg.rarity === 'rare') {
          ctx.shadowColor = 'rgba(157,127,232,0.72)';
          ctx.shadowBlur  = iconSize * 0.65;
        } else {
          ctx.shadowColor = 'rgba(139,146,165,0.28)';
          ctx.shadowBlur  = iconSize * 0.25;
        }
        ctx.drawImage(img, iconDist - iconSize / 2, -iconSize / 2, iconSize, iconSize);
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
      } else {
        /* Fallback — цветной прямоугольник с мягким glow */
        ctx.shadowColor = rc.glowColor;
        ctx.shadowBlur  = seg.rarity === 'legendary' ? 10 : seg.rarity === 'rare' ? 7 : 3;
        ctx.fillStyle   = rc.accent;
        ctx.globalAlpha = 0.55;
        /* Скруглённый прямоугольник */
        const bx = iconDist - iconSize / 2;
        const by = -iconSize * 0.35;
        const bw = iconSize;
        const bh = iconSize * 0.7;
        const br = 3;
        ctx.beginPath();
        ctx.moveTo(bx + br, by);
        ctx.lineTo(bx + bw - br, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
        ctx.lineTo(bx + bw, by + bh - br);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
        ctx.lineTo(bx + br, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
        ctx.lineTo(bx, by + br);
        ctx.quadraticCurveTo(bx, by, bx + br, by);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
      }

      const maxW    = R * 0.44;
      const fSize   = Math.max(6.5, Math.min(R * 0.062, 11.5));
      ctx.font      = `700 ${fSize}px 'Segoe UI','Inter',system-ui,sans-serif`;
      ctx.fillStyle = rc.textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      if (seg.rarity !== 'common') {
        ctx.shadowColor = rc.glowColor;
        ctx.shadowBlur  = seg.rarity === 'legendary' ? 7 : 4;
      }

      let label = seg.name;
      while (ctx.measureText(label).width > maxW && label.length > 2) {
        label = label.slice(0, -1);
      }
      if (label !== seg.name) label = label.trimEnd() + '…';

      ctx.fillText(label, R * 0.90, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    /* Внешний обод */
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    /* Внутреннее кольцо */
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.17, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    ctx.stroke();
  },

  highlightWinner(winIndex, angle) {
    const ctx  = this.ctx;
    const dpr  = window.devicePixelRatio || 1;
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

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, sa, ea);
    ctx.closePath();
    ctx.fillStyle = rc.glowColor.replace(/[\d.]+\)$/, '0.18)');
    ctx.fill();
    ctx.strokeStyle = rc.textColor;
    ctx.lineWidth   = 3;
    ctx.shadowColor = rc.glowColor;
    ctx.shadowBlur  = 20;
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Определить индекс сектора под указателем (12 часов) по углу колеса.
   *
   * Логика:
   *   Указатель в системе колеса = смещение относительно базового угла.
   *   base = angle - π/2
   *   Нормализуем "указатель" в систему отсчёта секторов:
   *     rel = (π/2 - angle) mod 2π   ← угол указателя от начала колеса
   *   Индекс = floor(rel / sliceAngle) mod n
   */
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
     Центр сектора winIndex должен оказаться под указателем (12ч):
       (A - π/2) + winIndex*slice + slice/2 = -π/2  (mod 2π)
       A = -(winIndex*slice + slice/2)               (mod 2π)

     Micro-offset: ±12% ширины сектора (естественность, не меняет сектор).
     Добавляем MIN_SPINS полных оборотов поверх currentAngle.

   DRAMA PHASE (последние ~0.8 сек):
     Фаза 1: ease-out до (finalTotal + dramaExtra)   ← перелёт
     Фаза 2: ease-in-out обратно к finalTotal        ← откат
   ============================================================ */
const SpinEngine = {
  spinning: false,
  angle:    0,          // накапливается между спинами

  spin({ winIndex, total, onTick, onDone }) {
    if (this.spinning) return;
    this.spinning = true;

    const MIN_SPINS = 6;
    const slice     = (2 * Math.PI) / total;

    /* ── Точный угол остановки ──────────────────────────── */
    const center    = -(winIndex * slice + slice / 2);
    const maxOff    = slice * 0.12;
    const offset    = (Math.random() * 2 - 1) * maxOff;
    let   target    = ((center + offset) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    /* Добавляем обороты: finalTotal > currentAngle + MIN_SPINS * 2π */
    const minTarget = this.angle + MIN_SPINS * 2 * Math.PI;
    while (target <= minTarget) target += 2 * Math.PI;
    const finalTotal = target;

    /* Drama extra — перелёт */
    const drama    = slice * (0.28 + Math.random() * 0.26);
    const totalDur = 4400 + Math.random() * 1600;   // 4.4–6 сек
    const dramaDur = 780;
    const ph1Dur   = totalDur - dramaDur;
    const ph1Tgt   = finalTotal + drama;

    const t0       = performance.now();
    const startAng = this.angle;
    const slice1   = slice;           // для замыкания
    let   lastSect = Math.floor(startAng / slice1);

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

      /* Тик */
      const sect = Math.floor(a / slice1);
      if (sect !== lastSect) { AudioManager.playTick(); lastSect = sect; }

      this.angle = a;
      onTick(a);
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
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
    window.addEventListener('resize', () => this._resize());
  },

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  burst(rarity) {
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
  el: null,

  init() {
    this.el = document.getElementById('resultOverlay');
    document.getElementById('resultCloseBtn')
      .addEventListener('click', () => this.hide());
    this.el.addEventListener('click', e => {
      if (e.target === this.el) this.hide();
    });
  },

  show(item, type = 'weapon') {
    const rarity = item.rarity;
    const rc     = RARITY[rarity];

    document.getElementById('resultBadge').className   = `result-badge rarity-${rarity}`;
    document.getElementById('resultBadge').textContent =
      rarity === 'legendary' ? '⭐ ЛЕГЕНДАРНОЕ' :
      rarity === 'rare'      ? '💎 РЕДКОЕ' : '▪ ОБЫЧНОЕ';

    document.getElementById('resultTypeLabel').textContent =
      type === 'challenge' ? 'Усложнение выпало!' : 'Оружие выпало!';

    const img = document.getElementById('resultImg');
    if (item.image) {
      img.src           = item.image;
      img.style.display = '';
      img.onerror       = () => { img.style.display = 'none'; };
    } else {
      img.style.display = 'none';
    }

    const nameEl       = document.getElementById('resultName');
    nameEl.textContent = item.name;
    nameEl.className   = `result-name rarity-text-${rarity}`;

    const card = document.getElementById('resultCard');
    card.className = `result-card rarity-card-${rarity}`;

    this.el.classList.add('visible');
  },

  hide() {
    this.el.classList.remove('visible');
  }
};

/* ============================================================
   FLASH
   ============================================================ */
function flashScreen(rarity) {
  const el = document.getElementById('flashOverlay');
  const c  = { legendary:'rgba(212,168,50,0.45)', rare:'rgba(157,127,232,0.35)', common:'rgba(255,255,255,0.18)' };
  el.style.background = c[rarity] || c.common;
  el.style.transition = 'none';
  el.style.opacity    = '1';
  setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; }, 60);
}

/* ============================================================
   STATS MANAGER — счётчики
   ============================================================ */
const Stats = {
  weapon: { attempts: 0, legendary: 0, streak: 0 },
  challenge: { attempts: 0, legendary: 0, streak: 0 },

  record(type, rarity) {
    const s = this[type];
    s.attempts++;
    if (rarity === 'legendary') { s.legendary++; s.streak = 0; }
    else                          s.streak++;
    this._render(type);
  },

  _render(type) {
    const s   = this[type];
    const pfx = type === 'weapon' ? 'w' : 'c';
    const el  = id => document.getElementById(id);
    const se  = (id, v) => { const e = el(id); if (e) e.textContent = v; };
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
   WHEEL CONTROLLER — управляет одним колесом
   ============================================================
   Ключевая проблема: если canvas находится в скрытой вкладке
   (display:none), то getBoundingClientRect() возвращает 0×0,
   и renderer._resize() выставит размер 0 — колесо не нарисуется.

   Решение: _ensureInit() — ленивая инициализация renderer'а.
   Вызывается при первом показе вкладки (через tab-switch observer)
   и при первом нажатии кнопки КРУТИТЬ.
   ============================================================ */
class WheelController {
  /**
   * @param {object} opts
   * @param {string}   opts.canvasId
   * @param {string}   opts.ringId
   * @param {string}   opts.spinBtnId
   * @param {string}   opts.tabPanelId   — id панели, содержащей canvas
   * @param {Array}    opts.segments     — перемешанный массив (Fisher-Yates)
   * @param {'weapon'|'challenge'} opts.type
   */
  constructor(opts) {
    this.opts        = opts;
    this.renderer    = Object.create(WheelRenderer);
    Object.assign(this.renderer, { canvas: null, ctx: null, segs: [], imgs: {}, angle: 0 });
    this.engine      = Object.create(SpinEngine);
    Object.assign(this.engine, { spinning: false, angle: 0 });
    this._lastResult = null;
    this._ready      = false;   // инициализирован ли renderer
  }

  /* Привязать кнопку и наблюдатель вкладки */
  init() {
    document.getElementById(this.opts.spinBtnId)
      .addEventListener('click', () => {
        this._ensureInit();
        this._spin();
      });

    /* Слушаем переключение вкладок — если показалась наша панель, инициализируем */
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === this.opts.tabId) {
          /* Небольшая задержка — CSS успевает применить display:block */
          setTimeout(() => this._ensureInit(), 30);
        }
      });
    });

    window.addEventListener('resize', () => {
      if (!this._ready) return;
      this.renderer._resize();
      this.renderer.draw(this.engine.angle);
    });

    /* Если наша панель уже активна при загрузке — инициализируем сразу */
    const panel = document.getElementById(this.opts.tabPanelId);
    if (panel && panel.classList.contains('active')) {
      /* Ждём следующего кадра, чтобы layout был готов */
      requestAnimationFrame(() => this._ensureInit());
    }
  }

  /* Ленивая инициализация — вызывать только когда canvas виден */
  _ensureInit() {
    if (this._ready) return;
    const canvas = document.getElementById(this.opts.canvasId);
    if (!canvas) return;

    /* Проверяем, что canvas имеет реальный размер */
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      /* Canvas ещё невидим — подождём ещё кадр */
      requestAnimationFrame(() => this._ensureInit());
      return;
    }

    this.renderer.init(canvas, this.opts.segments);
    this._ready = true;
    console.log(`[WheelController:${this.opts.type}] инициализирован, ${this.opts.segments.length} секторов, canvas ${rect.width}×${rect.height}`);
  }

  _spin() {
    if (this.engine.spinning) return;

    /* Разблокировка iOS при первом клике */
    AudioManager.unlock();

    const { item, index } = pickRandom(this.opts.segments);
    this._lastResult = { item, index };

    const btn  = document.getElementById(this.opts.spinBtnId);
    btn.disabled = true;

    const ring = document.getElementById(this.opts.ringId);
    ring.className = 'wheel-ring';

    AudioManager.startSpinLoop();

    this.engine.spin({
      winIndex: index,
      total:    this.opts.segments.length,
      onTick:   (a) => this.renderer.draw(a),
      onDone:   (a) => this._onDone(a, item, index)
    });
  }

  _onDone(finalAngle, item, index) {
    AudioManager.stopSpinLoop();

    /* Верификация */
    const verified = this.renderer.getSectorAtPointer(finalAngle);
    if (verified !== index) {
      console.warn(`[WheelController:${this.opts.type}] ожидался ${index} (${item.name}), под стрелкой ${verified} (${this.opts.segments[verified].name})`);
    }

    /* Отрисовка + подсветка */
    this.renderer.draw(finalAngle);
    this.renderer.highlightWinner(index, finalAngle);

    /* Кольцо */
    const ring = document.getElementById(this.opts.ringId);
    ring.classList.add(item.rarity);

    /* Спецэффекты */
    flashScreen(item.rarity);
    setTimeout(() => Particles.burst(item.rarity), 100);

    /* Звук по редкости и типу */
    const delay = item.rarity === 'legendary' ? 60 : 160;
    setTimeout(() => {
      if (this.opts.type === 'challenge') {
        AudioManager.playChallengeWinByRarity(item.rarity);
      } else {
        AudioManager.playWinByRarity(item.rarity);
      }
    }, delay);

    /* Карточка */
    setTimeout(() => {
      ResultModal.show(item, this.opts.type);
      Stats.record(this.opts.type, item.rarity);
      CurrentChallenge.set(this.opts.type, item);
      this._updateMini(item);
    }, 360);

    /* Разблокировать кнопку */
    setTimeout(() => {
      document.getElementById(this.opts.spinBtnId).disabled = false;
    }, 1800);
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
      const rc    = RARITY[w.rarity];
      const label = rc.label;
      const imgHtml = w.image
        ? `<img src="${w.image}" alt="${w.name}" loading="lazy" onerror="this.style.opacity='0.12'">`
        : `<div class="no-img">🔫</div>`;
      return `<div class="weapon-card rarity-card-${w.rarity}">
        <div class="icon-wrap rarity-${w.rarity}">${imgHtml}</div>
        <div class="wcard-name">${w.name}</div>
        <div class="wcard-rarity" style="color:${rc.textColor}">${label}</div>
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
    /* AudioManager — только init (не unlock), unlock при первом клике */
    AudioManager.init();

    /* Тумблер звука */
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) soundBtn.addEventListener('click', () => AudioManager.toggleSound());

    /* Tabs */
    initTabs();

    /* Particles */
    Particles.init();

    /* Result Modal */
    ResultModal.init();

    /* CurrentChallenge */
    CurrentChallenge._render();

    /* ── Колесо оружий ─────────────────────────────────── */
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

    /* ── Колесо усложнений ─────────────────────────────── */
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

    /* ── Каталог ────────────────────────────────────────── */
    CatalogUI.init();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
