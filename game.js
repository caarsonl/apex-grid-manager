const { useState, useEffect, useMemo, useRef } = React;

// ==========================================
// 1. COPYRIGHT-FREE GOWS SERIES DATA
// ==========================================
const TIRE_SPECS = {
  SOFT: { label: 'Soft C4', short: 'S', color: '#ef4444', textColor: '#ffffff', baseGrip: 1.05, degPerLap: 4.2, optTempMin: 88, optTempMax: 112, optimalWetMin: 0, optimalWetMax: 18 },
  MEDIUM: { label: 'Medium C3', short: 'M', color: '#eab308', textColor: '#0f172a', baseGrip: 1.024, degPerLap: 2.55, optTempMin: 84, optTempMax: 108, optimalWetMin: 0, optimalWetMax: 20 },
  HARD: { label: 'Hard C2', short: 'H', color: '#f8fafc', textColor: '#0f172a', baseGrip: 0.998, degPerLap: 1.5, optTempMin: 80, optTempMax: 106, optimalWetMin: 0, optimalWetMax: 22 },
  INTER: { label: 'Intermediate', short: 'I', color: '#22c55e', textColor: '#052e16', baseGrip: 0.988, degPerLap: 2.35, optTempMin: 68, optTempMax: 95, optimalWetMin: 18, optimalWetMax: 65 },
  WET: { label: 'Full Wet', short: 'W', color: '#3b82f6', textColor: '#ffffff', baseGrip: 0.958, degPerLap: 1.95, optTempMin: 60, optTempMax: 88, optimalWetMin: 60, optimalWetMax: 100 },
};

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0];
const PRIZE_MONEY_MILLIONS = [18, 14, 11, 9, 7.5, 6, 5, 4, 3, 2.5, 2, 1.5];

const INITIAL_TEAMS = [
  { id: 'apex-works', name: 'Apex Dynamics Racing', shortName: 'APEX', primaryColor: '#f59e0b', secondaryColor: '#1e293b', isPlayer: true, budget: 24.0, car: { aero: 74, powertrain: 72, chassis: 73, reliability: 76 }, points: 0 },
  { id: 'valkyrie-gp', name: 'Valkyrie Aero Engineering', shortName: 'VALK', primaryColor: '#06b6d4', secondaryColor: '#0f172a', isPlayer: false, budget: 35.0, car: { aero: 86, powertrain: 84, chassis: 85, reliability: 82 }, points: 0 },
  { id: 'solaris-motorsport', name: 'Solaris Scuderia', shortName: 'SOLR', primaryColor: '#ef4444', secondaryColor: '#450a0a', isPlayer: false, budget: 33.0, car: { aero: 83, powertrain: 87, chassis: 81, reliability: 79 }, points: 0 },
  { id: 'hyperion-works', name: 'Hyperion Powertrains', shortName: 'HYPR', primaryColor: '#10b981', secondaryColor: '#064e3b', isPlayer: false, budget: 28.0, car: { aero: 78, powertrain: 80, chassis: 77, reliability: 84 }, points: 0 },
  { id: 'borealis-racing', name: 'Borealis Composite', shortName: 'BORE', primaryColor: '#8b5cf6', secondaryColor: '#2e1065', isPlayer: false, budget: 22.0, car: { aero: 73, powertrain: 72, chassis: 75, reliability: 76 }, points: 0 },
  { id: 'kestrel-autosport', name: 'Kestrel Autosport', shortName: 'KEST', primaryColor: '#ec4899', secondaryColor: '#500724', isPlayer: false, budget: 18.0, car: { aero: 67, powertrain: 69, chassis: 68, reliability: 72 }, points: 0 },
];

const INITIAL_DRIVERS = [
  { id: 'drv-1', name: 'Callum Vance', code: 'VAN', teamId: 'apex-works', carNumber: 14, pace: 83, consistency: 81, tireManagement: 80, wetSkill: 85, racecraft: 86, points: 0 },
  { id: 'drv-2', name: 'Sora Takahashi', code: 'TAK', teamId: 'apex-works', carNumber: 27, pace: 80, consistency: 84, tireManagement: 86, wetSkill: 79, racecraft: 82, points: 0 },
  { id: 'drv-3', name: 'Henrik Lindqvist', code: 'LIN', teamId: 'valkyrie-gp', carNumber: 1, pace: 92, consistency: 90, tireManagement: 88, wetSkill: 91, racecraft: 91, points: 0 },
  { id: 'drv-4', name: 'Mateo Castellanos', code: 'CAS', teamId: 'valkyrie-gp', carNumber: 8, pace: 86, consistency: 84, tireManagement: 83, wetSkill: 82, racecraft: 85, points: 0 },
  { id: 'drv-5', name: 'Lorenzo Bellini', code: 'BEL', teamId: 'solaris-motorsport', carNumber: 16, pace: 90, consistency: 85, tireManagement: 84, wetSkill: 87, racecraft: 89, points: 0 },
  { id: 'drv-6', name: 'Julian Mercer', code: 'MER', teamId: 'solaris-motorsport', carNumber: 55, pace: 85, consistency: 87, tireManagement: 86, wetSkill: 85, racecraft: 84, points: 0 },
  { id: 'drv-7', name: 'Kieran Gallagher', code: 'GAL', teamId: 'hyperion-works', carNumber: 4, pace: 84, consistency: 82, tireManagement: 81, wetSkill: 88, racecraft: 86, points: 0 },
  { id: 'drv-8', name: 'Arjun Subramanian', code: 'SUB', teamId: 'hyperion-works', carNumber: 23, pace: 80, consistency: 84, tireManagement: 83, wetSkill: 79, racecraft: 80, points: 0 },
  { id: 'drv-9', name: 'Niko Kovalev', code: 'KOV', teamId: 'borealis-racing', carNumber: 31, pace: 78, consistency: 77, tireManagement: 80, wetSkill: 81, racecraft: 81, points: 0 },
  { id: 'drv-10', name: 'Elena Rostova', code: 'ROS', teamId: 'borealis-racing', carNumber: 77, pace: 77, consistency: 81, tireManagement: 79, wetSkill: 76, racecraft: 79, points: 0 },
  { id: 'drv-11', name: 'Tomasz Zielinski', code: 'ZIE', teamId: 'kestrel-autosport', carNumber: 20, pace: 75, consistency: 74, tireManagement: 76, wetSkill: 77, racecraft: 77, points: 0 },
  { id: 'drv-12', name: 'Lucas Moreau', code: 'MOR', teamId: 'kestrel-autosport', carNumber: 44, pace: 74, consistency: 76, tireManagement: 75, wetSkill: 74, racecraft: 76, points: 0 },
];

// ==========================================
// 2. WEB AUDIO SYNTHESIZER (FULL RACE FX)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.noiseBuffer = null;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Pre-build a 1-second white noise buffer for tire screeches & crashes
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < sr; i++) data[i] = Math.random() * 2 - 1;
        this.noiseBuffer = buf;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(mute) {
    this.muted = mute;
    if (mute) this.stopEngineHum();
  }

  updateEngineHum(active, simSpeed, flagStatus, anyErsOvertake) {
    if (this.muted || !active || simSpeed === 0 || flagStatus === 'RED_FLAG') {
      this.stopEngineHum();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.engineOsc1) {
      this.engineOsc1 = ctx.createOscillator();
      this.engineOsc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      this.engineGain = ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.012, ctx.currentTime);

      this.engineOsc1.connect(filter);
      this.engineOsc2.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
    }

    const now = ctx.currentTime;
    const speedFactor = Math.min(1.45, 0.92 + Math.log2(Math.max(1, simSpeed)) * 0.085);
    const neutralFactor = flagStatus === 'SC' || flagStatus === 'VSC' ? 0.66 : 1.0;
    const ersBoost = anyErsOvertake ? 1.14 : 1.0;
    const baseFreq = 96 * speedFactor * neutralFactor * ersBoost;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.02, now, 0.08);
    this.engineGain.gain.setTargetAtTime(0.013, now, 0.08);
  }

  stopEngineHum() {
    if (this.engineOsc1) {
      try {
        this.engineOsc1.stop();
        this.engineOsc2.stop();
        this.engineOsc1.disconnect();
        this.engineOsc2.disconnect();
      } catch {}
      this.engineOsc1 = null;
      this.engineOsc2 = null;
      this.engineGain = null;
    }
  }

  playTireScreech() {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + 0.24);
    filter.Q.setValueAtTime(6.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.27);
  }

  playCrashImpact() {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    // Low thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.32);
    oscGain.gain.setValueAtTime(0.14, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);

    // Carbon crunch burst
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.09, now);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    src.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.32);
  }

  playTelemetryTick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.035);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  playRadioBeep() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [1046.5, 1318.5].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.075;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.065);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.07);
    });
  }

  playPitAirGun() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.15].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now + offset);
      osc.frequency.exponentialRampToValueAtTime(1240, now + offset + 0.11);
      gain.gain.setValueAtTime(0.042, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.125);
    });
  }

  playOvertakeWhoosh() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.14);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  playFlagAlert(isRedFlag = false) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = isRedFlag ? [880, 440, 880, 440] : [659.25, 523.25, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.11;
      osc.type = isRedFlag ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(isRedFlag ? 0.045 : 0.055, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.095);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    });
  }

  playWeatherAlert() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 493.88, 587.33].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.11;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.105);
    });
  }

  playUpgradeConfirm() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.045, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  }
}

const soundEngine = new SoundEngine();

// ==========================================
// 3. PROCEDURAL TRACK GENERATOR (BRAKING ZONES & DRS)
// ==========================================
const CIRCUIT_PREFIXES = ['Aethelgard', 'Valenport', 'Cinderfall', 'Solstice', 'Kuroshio', 'Vespera', 'Nordhaven', 'Altiplano', 'Meridian', 'Halcyon', 'Stratos', 'Oakhaven'];
const CIRCUIT_SUFFIXES = ['Autodrome', 'International Circuit', 'Ring', 'Speedway Park', 'Motorsport Arena', 'Coastal Circuit'];
const COUNTRIES = ['Nordland', 'Iberia', 'Hokkaido', 'Cascadia', 'Helvetia', 'Patagonia', 'Caledonia', 'Dalmatia', 'Aotearoa', 'Bohemia'];

function createRng(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function generateProceduralTrack(seed) {
  const rng = createRng(seed * 7919 + 1337);
  const prefix = CIRCUIT_PREFIXES[Math.floor(rng() * CIRCUIT_PREFIXES.length)];
  const suffix = CIRCUIT_SUFFIXES[Math.floor(rng() * CIRCUIT_SUFFIXES.length)];
  const country = COUNTRIES[Math.floor(rng() * COUNTRIES.length)];
  const name = `${prefix} ${suffix}`;

  const cx = 500;
  const cy = 310;
  const numControlPoints = 12 + Math.floor(rng() * 5);
  const controlPts = [];

  for (let i = 0; i < numControlPoints; i++) {
    const angle = (i / numControlPoints) * Math.PI * 2;
    const isBottomStraight = Math.sin(angle) > 0.72 && Math.abs(Math.cos(angle)) < 0.55;
    const rx = isBottomStraight ? 360 : 250 + rng() * 145;
    const ry = isBottomStraight ? 205 : 135 + rng() * 85;
    const jitterAngle = isBottomStraight ? angle : angle + (rng() - 0.5) * (Math.PI / numControlPoints) * 0.55;
    controlPts.push({ x: cx + Math.cos(jitterAngle) * rx, y: cy + Math.sin(jitterAngle) * ry });
  }

  const samplesPerSegment = 36;
  const rawPoints = [];
  const n = controlPts.length;

  for (let i = 0; i < n; i++) {
    const p0 = controlPts[(i - 1 + n) % n];
    const p1 = controlPts[i];
    const p2 = controlPts[(i + 1) % n];
    const p3 = controlPts[(i + 2) % n];
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      rawPoints.push({ x: catmullRom(p0.x, p1.x, p2.x, p3.x, t), y: catmullRom(p0.y, p1.y, p2.y, p3.y, t) });
    }
  }

  const cumulativeDist = [0];
  let totalPixelLength = 0;
  for (let i = 1; i <= rawPoints.length; i++) {
    const prev = rawPoints[i - 1];
    const curr = rawPoints[i % rawPoints.length];
    const d = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    totalPixelLength += d;
    cumulativeDist.push(totalPixelLength);
  }

  const uniformCount = 360;
  const waypoints = [];
  for (let i = 0; i < uniformCount; i++) {
    const targetDist = (i / uniformCount) * totalPixelLength;
    let low = 0;
    let high = rawPoints.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (cumulativeDist[mid] <= targetDist) low = mid;
      else high = mid - 1;
    }
    const segStart = cumulativeDist[low];
    const segEnd = cumulativeDist[low + 1];
    const alpha = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;
    const a = rawPoints[low];
    const b = rawPoints[(low + 1) % rawPoints.length];
    waypoints.push({ x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, curvature: 0, isBrakingZone: false, progress: i / uniformCount });
  }

  let totalCurvature = 0;
  for (let i = 0; i < uniformCount; i++) {
    const prev = waypoints[(i - 3 + uniformCount) % uniformCount];
    const curr = waypoints[i];
    const next = waypoints[(i + 3) % uniformCount];
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const cross = Math.abs(v1x * v2y - v1y * v2x);
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1;
    const curv = cross / mag;
    curr.curvature = curv;
    totalCurvature += curv;
  }

  // Flag heavy braking zones right before high-curvature corners
  for (let i = 0; i < uniformCount; i++) {
    const lookAhead = waypoints[(i + 6) % uniformCount];
    const curr = waypoints[i];
    curr.isBrakingZone = lookAhead.curvature > 0.145 && curr.curvature < 0.17;
  }

  let bottomIdx = 0;
  let maxY = -Infinity;
  for (let i = 0; i < uniformCount; i++) {
    if (waypoints[i].y > maxY) {
      maxY = waypoints[i].y;
      bottomIdx = i;
    }
  }

  const rotatedWaypoints = [];
  for (let i = 0; i < uniformCount; i++) {
    const src = waypoints[(bottomIdx + i) % uniformCount];
    rotatedWaypoints.push({ ...src, progress: i / uniformCount });
  }

  const pStart = rotatedWaypoints[0];
  const pAfter = rotatedWaypoints[2];
  const sdx = pAfter.x - pStart.x;
  const sdy = pAfter.y - pStart.y;
  const slen = Math.hypot(sdx, sdy) || 1;
  const startNormal = { nx: -sdy / slen, ny: sdx / slen };

  const pitWaypoints = [];
  const pitSpan = 36;
  for (let offset = -pitSpan; offset <= pitSpan; offset++) {
    const idx = (offset + uniformCount) % uniformCount;
    const prev = rotatedWaypoints[(idx - 1 + uniformCount) % uniformCount];
    const next = rotatedWaypoints[(idx + 1) % uniformCount];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tlen = Math.hypot(tx, ty) || 1;
    let nx = -ty / tlen;
    let ny = tx / tlen;
    const toCenterX = cx - rotatedWaypoints[idx].x;
    const toCenterY = cy - rotatedWaypoints[idx].y;
    if (nx * toCenterX + ny * toCenterY < 0) {
      nx = -nx;
      ny = -ny;
    }
    const edgeFactor = Math.min(1, (pitSpan - Math.abs(offset)) / 10);
    const pitOffsetPx = 22 * edgeFactor;
    pitWaypoints.push({ x: rotatedWaypoints[idx].x + nx * pitOffsetPx, y: rotatedWaypoints[idx].y + ny * pitOffsetPx });
  }

  const drsZones = [
    { start: 0.91, end: 0.08 },
    { start: 0.44, end: 0.59 },
  ];

  const lengthKm = Number((4.1 + rng() * 2.3).toFixed(2));
  const totalLaps = Math.max(18, Math.min(34, Math.round(135 / lengthKm)));
  const avgCurvature = totalCurvature / uniformCount;
  const aeroDemand = Number(Math.min(0.98, Math.max(0.25, avgCurvature * 4.2 + rng() * 0.15)).toFixed(2));
  const powerDemand = Number(Math.min(0.98, Math.max(0.25, 1.05 - aeroDemand * 0.65 + rng() * 0.15)).toFixed(2));
  const chassisDemand = Number(Math.min(0.98, Math.max(0.3, 0.4 + rng() * 0.5)).toFixed(2));
  const tireAbrasion = Number((0.75 + rng() * 0.55).toFixed(2));
  const overtakeDifficulty = Number((0.25 + rng() * 0.55).toFixed(2));
  const baseLapTimeSec = Number((lengthKm * 15.8 + aeroDemand * 6.5).toFixed(2));
  const pitLossSec = Number((18.5 + rng() * 4.5).toFixed(1));
  const airTempC = Math.round(16 + rng() * 16);

  return {
    seed, name, country, lengthKm, totalLaps, baseLapTimeSec, airTempC,
    aeroDemand, powerDemand, chassisDemand, tireAbrasion, overtakeDifficulty, pitLossSec,
    waypoints: rotatedWaypoints, pitWaypoints, drsZones, sectorSplits: [0.33, 0.67], startNormal,
  };
}

function isProgressInDrsZone(track, progress) {
  const p = ((progress % 1) + 1) % 1;
  return track.drsZones.some((z) => (z.start <= z.end ? p >= z.start && p <= z.end : p >= z.start || p <= z.end));
}

function getWaypointAt(track, progress) {
  const p = ((progress % 1) + 1) % 1;
  const idx = Math.floor(p * track.waypoints.length) % track.waypoints.length;
  return track.waypoints[idx];
}

function sampleTrackPose(track, progress, inPit, pitTimerSec, lateralOffsetPx = 0) {
  const wrapped = ((progress % 1) + 1) % 1;
  if (inPit && track.pitWaypoints.length > 0) {
    const pitRatio = Math.min(1, Math.max(0, 1 - pitTimerSec / 22));
    const idxFloat = pitRatio * (track.pitWaypoints.length - 1);
    const i0 = Math.floor(idxFloat);
    const i1 = Math.min(track.pitWaypoints.length - 1, i0 + 1);
    const alpha = idxFloat - i0;
    const a = track.pitWaypoints[i0];
    const b = track.pitWaypoints[i1];
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, angle };
  }

  const n = track.waypoints.length;
  const idxFloat = wrapped * n;
  const i0 = Math.floor(idxFloat) % n;
  const i1 = (i0 + 1) % n;
  const alpha = idxFloat - Math.floor(idxFloat);
  const a = track.waypoints[i0];
  const b = track.waypoints[i1];
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const angle = Math.atan2(ty, tx);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);

  return {
    x: a.x + tx * alpha + nx * lateralOffsetPx,
    y: a.y + ty * alpha + ny * lateralOffsetPx,
    angle,
  };
}

// ==========================================
// 4. SIMULATION ENGINE (BATTLES, LATE BRAKE, DEFENDING, MISTAKES, CRASHES)
// ==========================================
const WEATHER_TRANSITIONS = {
  DRY: ['DRY', 'DRY', 'OVERCAST'],
  OVERCAST: ['DRY', 'OVERCAST', 'LIGHT_RAIN'],
  LIGHT_RAIN: ['OVERCAST', 'LIGHT_RAIN', 'HEAVY_RAIN'],
  HEAVY_RAIN: ['LIGHT_RAIN', 'LIGHT_RAIN', 'HEAVY_RAIN'],
};

const TARGET_WETNESS = { DRY: 0, OVERCAST: 5, LIGHT_RAIN: 48, HEAVY_RAIN: 92 };

function generateInitialWeather(seed) {
  const pool = ['DRY', 'DRY', 'OVERCAST', 'LIGHT_RAIN', 'HEAVY_RAIN'];
  const initial = pool[Math.abs(seed * 31) % pool.length];
  const forecast = [initial];
  let curr = initial;
  for (let i = 1; i < 5; i++) {
    const options = WEATHER_TRANSITIONS[curr];
    curr = options[Math.abs(seed * (i + 7) * 17) % options.length];
    forecast.push(curr);
  }
  return { initial, forecast };
}

function chooseOptimalTireForWetness(wetness, remainingLaps) {
  if (wetness >= 60) return 'WET';
  if (wetness >= 22) return 'INTER';
  if (remainingLaps <= 11) return 'SOFT';
  if (remainingLaps <= 21) return 'MEDIUM';
  return 'HARD';
}

function createInitialRaceState(roundNumber, track, teams, drivers, playerSetups, initialWeather, forecast) {
  const initialWetness = TARGET_WETNESS[initialWeather];
  const rankedDrivers = [...drivers]
    .map((drv) => {
      const team = teams.find((t) => t.id === drv.teamId);
      const carPerf = team.car.aero * track.aeroDemand + team.car.powertrain * track.powerDemand + team.car.chassis * track.chassisDemand;
      const qualiScore = carPerf * 0.55 + drv.pace * 0.45 + (Math.random() - 0.5) * 4;
      return { drv, qualiScore };
    })
    .sort((a, b) => b.qualiScore - a.qualiScore);

  const cars = rankedDrivers.map(({ drv }, idx) => {
    const playerSetup = playerSetups.find((s) => s.driverId === drv.id);
    const startingTire = playerSetup ? playerSetup.startingTire : chooseOptimalTireForWetness(initialWetness, track.totalLaps);
    const startingFuelKg = playerSetup ? playerSetup.startingFuelKg : Math.min(110, Math.round(track.totalLaps * 2.15 + 4));
    const gridOffsetProgress = -0.0045 * (idx + 1);

    return {
      driverId: drv.id, teamId: drv.teamId, position: idx + 1, lap: 1,
      lapProgress: gridOffsetProgress, totalDistance: gridOffsetProgress,
      tire: startingTire, tireWear: 0, tireTemp: 82, tireAgeLaps: 0,
      fuelKg: startingFuelKg,
      paceMode: 'STANDARD', ersMode: 'BALANCED', battleStance: 'NEUTRAL', ersBattery: 100,
      drsActive: false, inDirtyAir: false, isBraking: false,
      battleState: 'CLEAR', // CLEAR | SLIPSTREAM | DEFENDING | LATE_BRAKE | SWITCHBACK | LOCKUP | WIDE | SPIN
      battleTimerSec: 0,
      defendingSide: 0, // -1 inside, +1 outside
      lateralOffset: idx % 2 === 0 ? -4 : 4,
      spinAngle: 0,
      wingDamage: 0, // 0 none, 1 endplate, 2 broken front wing
      overtakeFlashSec: 0,
      mistakeCooldownSec: 8 + Math.random() * 12,
      inPit: false, pitTimerSec: 0, pitRequested: false,
      nextTire: startingTire, lastLapTimeSec: null, bestLapTimeSec: null,
      currentLapElapsedSec: 0, gapToLeaderSec: idx * 0.35, intervalSec: idx === 0 ? 0 : 0.35,
      pitStopsCount: 0, dnf: false,
    };
  });

  return {
    roundNumber, track, elapsedSec: 0, weather: initialWeather, forecast,
    nextWeatherChangeSec: track.baseLapTimeSec * 4.5, trackWetness: initialWetness,
    trackRubber: 25, // rubbers in up to 100%
    flagStatus: 'GREEN',
    flagTimerSec: 0,
    safetyCarProgress: 0.04,
    redFlagCount: 0,
    cars,
    logs: [{ id: 'log-start', lap: 1, timeSec: 0, category: 'RACE', message: `LIGHTS OUT at ${track.name}! ${track.totalLaps} laps · Air ${track.airTempC}°C · ${initialWeather.replace('_', ' ')}.` }],
    fastestLapDriverId: null, fastestLapTimeSec: null, finished: false,
  };
}

function stepRaceSimulation(prev, dtSec, teams, drivers, playerTeamId, fxQueue) {
  const emptyEvents = { playerLapCompleted: false, weatherChanged: false, radioAlert: false, overtakeEvent: false, flagChanged: false, isRedFlag: false, pitStopSound: false, tireScreech: false, crashImpact: false };
  if (prev.finished) return { nextState: prev, events: emptyEvents };

  const track = prev.track;
  const elapsedSec = prev.elapsedSec + dtSec;
  let weather = prev.weather;
  let forecast = [...prev.forecast];
  let nextWeatherChangeSec = prev.nextWeatherChangeSec;
  let trackWetness = prev.trackWetness;
  let trackRubber = prev.trackRubber;
  let flagStatus = prev.flagStatus;
  let flagTimerSec = prev.flagTimerSec;
  let safetyCarProgress = prev.safetyCarProgress;
  let redFlagCount = prev.redFlagCount;
  const logs = [...prev.logs];
  let fastestLapDriverId = prev.fastestLapDriverId;
  let fastestLapTimeSec = prev.fastestLapTimeSec;

  const events = { ...emptyEvents };
  const leaderCar = prev.cars.find((c) => !c.dnf) || prev.cars[0];
  const currentLeaderLap = leaderCar ? leaderCar.lap : 1;

  const pushLog = (category, message, lap = currentLeaderLap) => {
    logs.unshift({ id: `log-${elapsedSec.toFixed(2)}-${Math.random().toString(36).slice(2, 6)}`, lap, timeSec: elapsedSec, category, message });
    if (logs.length > 90) logs.pop();
  };

  const emitFx = (item) => {
    if (fxQueue) fxQueue.push(item);
  };

  // Handle active Red Flag suspension
  if (flagStatus === 'RED_FLAG') {
    flagTimerSec -= dtSec;
    if (flagTimerSec <= 0) {
      flagStatus = 'GREEN';
      events.flagChanged = true;
      emitFx({ type: 'CLEAR_DEBRIS' });
      pushLog('FLAG', 'RED FLAG LIFTED — Standing restart! All wings repaired & fresh tires fitted.', currentLeaderLap);
    } else {
      return { nextState: { ...prev, elapsedSec, flagStatus, flagTimerSec, logs }, events };
    }
  }

  // Handle VSC / SC countdown
  if (flagStatus === 'VSC' || flagStatus === 'SC') {
    flagTimerSec -= dtSec;
    if (flagStatus === 'SC') {
      safetyCarProgress = (safetyCarProgress + dtSec / (track.baseLapTimeSec * 1.38)) % 1;
    }
    if (flagTimerSec <= 0) {
      const endedFlag = flagStatus;
      flagStatus = 'GREEN';
      events.flagChanged = true;
      emitFx({ type: 'CLEAR_DEBRIS' });
      pushLog('FLAG', `${endedFlag === 'SC' ? 'SAFETY CAR IN THIS LAP' : 'VSC ENDING'} — Green flag racing resumes!`, currentLeaderLap);
    }
  }

  // Dynamic weather evolution
  if (elapsedSec >= nextWeatherChangeSec) {
    const nextW = forecast.shift() || 'DRY';
    const tail = forecast[forecast.length - 1] || nextW;
    const options = WEATHER_TRANSITIONS[tail];
    forecast.push(options[Math.floor(Math.random() * options.length)]);
    if (nextW !== weather) {
      weather = nextW;
      events.weatherChanged = true;
      pushLog('WEATHER', `Radar Alert: Conditions shifting to ${weather.replace('_', ' ')}.`);
    }
    nextWeatherChangeSec = elapsedSec + track.baseLapTimeSec * (3.5 + Math.random() * 3.5);
  }

  const targetWet = TARGET_WETNESS[weather];
  const wetRate = targetWet > trackWetness ? 1.45 : 0.75;
  if (trackWetness < targetWet) trackWetness = Math.min(targetWet, trackWetness + wetRate * dtSec);
  else if (trackWetness > targetWet) trackWetness = Math.max(targetWet, trackWetness - wetRate * dtSec);

  // Track rubber grip builds up in dry, washes away in rain
  if (trackWetness > 25) trackRubber = Math.max(10, trackRubber - dtSec * 0.45);
  else trackRubber = Math.min(100, trackRubber + dtSec * 0.14);

  // Torrential rain Red Flag check
  if (flagStatus === 'GREEN' && trackWetness > 88 && redFlagCount === 0 && currentLeaderLap > 3 && currentLeaderLap < track.totalLaps - 3 && Math.random() < 0.0018 * dtSec) {
    flagStatus = 'RED_FLAG';
    flagTimerSec = 14;
    redFlagCount += 1;
    events.flagChanged = true;
    events.isRedFlag = true;
    pushLog('FLAG', 'RED FLAG! Standing water exceeds safe limits. Cars return to pit lane.');

    const gridResetCars = prev.cars.map((c, idx) => {
      if (c.dnf) return c;
      const baseLap = Math.max(1, currentLeaderLap);
      const gridProg = -0.004 * (idx + 1);
      return {
        ...c, lap: baseLap, lapProgress: gridProg, totalDistance: baseLap - 1 + gridProg,
        tire: 'WET', tireWear: 0, tireAgeLaps: 0, wingDamage: 0, inPit: false, pitRequested: false,
        battleState: 'CLEAR', spinAngle: 0, lateralOffset: idx % 2 === 0 ? -4 : 4,
      };
    });

    return {
      nextState: { ...prev, elapsedSec, weather, forecast, nextWeatherChangeSec, trackWetness, trackRubber, flagStatus, flagTimerSec, redFlagCount, cars: gridResetCars, logs },
      events,
    };
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));

  const preRankMap = new Map();
  prev.cars.forEach((c, idx) => preRankMap.set(c.driverId, idx + 1));

  // Build maps for car directly ahead AND car directly behind (for active defense!)
  const activeSortedPrev = prev.cars.filter((c) => !c.dnf);
  const aheadByDriverId = new Map();
  const behindByDriverId = new Map();
  for (let i = 0; i < activeSortedPrev.length; i++) {
    if (i > 0) aheadByDriverId.set(activeSortedPrev[i].driverId, activeSortedPrev[i - 1]);
    if (i < activeSortedPrev.length - 1) behindByDriverId.set(activeSortedPrev[i].driverId, activeSortedPrev[i + 1]);
  }

  const drsPermitted = flagStatus === 'GREEN' && trackWetness < 22 && currentLeaderLap >= 2;
  let incidentTriggeredThisTick = false;

  const updatedCars = prev.cars.map((car) => {
    if (car.dnf) return { ...car, drsActive: false, inDirtyAir: false, isBraking: false };
    const team = teamMap.get(car.teamId);
    const driver = driverMap.get(car.driverId);
    const isPlayer = team.id === playerTeamId;
    const wp = getWaypointAt(track, car.lapProgress);
    const isBraking = wp.isBrakingZone && !car.inPit && flagStatus === 'GREEN';

    // Active Pit Stop (extra time if replacing damaged front wing)
    if (car.inPit) {
      const nextTimer = car.pitTimerSec - dtSec;
      if (nextTimer <= 0) {
        const refuelTarget = Math.min(110, Math.max(car.fuelKg, (track.totalLaps - car.lap + 1) * 2.15 + 3));
        const repairedWing = car.wingDamage > 0;
        if (isPlayer) {
          events.radioAlert = true;
          events.pitStopSound = true;
          pushLog('PIT', `${driver.code} released on fresh ${car.nextTire} tires${repairedWing ? ' + new front wing' : ''}.`, car.lap);
        }
        return {
          ...car, inPit: false, pitTimerSec: 0, pitRequested: false, tire: car.nextTire,
          tireWear: 0, tireAgeLaps: 0, tireTemp: 82, wingDamage: 0, fuelKg: refuelTarget,
          pitStopsCount: car.pitStopsCount + 1, lapProgress: 0.015, totalDistance: car.lap - 1 + 0.015,
          drsActive: false, inDirtyAir: false, battleState: 'CLEAR', spinAngle: 0,
        };
      }
      return { ...car, pitTimerSec: nextTimer, currentLapElapsedSec: car.currentLapElapsedSec + dtSec, drsActive: false, inDirtyAir: false, isBraking: false };
    }

    const aheadCar = aheadByDriverId.get(car.driverId);
    const behindCar = behindByDriverId.get(car.driverId);

    const gapAheadSec = aheadCar && !aheadCar.inPit ? Math.max(0, (aheadCar.totalDistance - car.totalDistance) * track.baseLapTimeSec) : 99;
    const gapBehindSec = behindCar && !behindCar.inPit ? Math.max(0, (car.totalDistance - behindCar.totalDistance) * track.baseLapTimeSec) : 99;

    const inDirtyAir = flagStatus === 'GREEN' && gapAheadSec > 0.04 && gapAheadSec < 1.25;
    const drsActive = drsPermitted && gapAheadSec <= 1.0 && isProgressInDrsZone(track, car.lapProgress);

    // AI Stance & ERS Management
    let ersMode = car.ersMode;
    let battleStance = car.battleStance;
    let ersBattery = car.ersBattery;

    if (!isPlayer) {
      if (flagStatus !== 'GREEN') {
        ersMode = 'HARVEST';
        battleStance = 'NEUTRAL';
      } else {
        if (gapAheadSec < 1.05 && ersBattery > 25) {
          ersMode = 'OVERTAKE';
          battleStance = driver.racecraft >= 84 ? 'AGGRESSIVE' : 'NEUTRAL';
        } else if (gapBehindSec < 0.75 && ersBattery > 20) {
          ersMode = 'OVERTAKE';
          battleStance = 'DEFEND';
        } else if (ersBattery < 28) {
          ersMode = 'HARVEST';
          battleStance = 'NEUTRAL';
        } else {
          ersMode = 'BALANCED';
          battleStance = 'NEUTRAL';
        }
      }
    }

    const lapFractionEst = dtSec / track.baseLapTimeSec;
    if (ersMode === 'OVERTAKE') {
      ersBattery = Math.max(0, ersBattery - lapFractionEst * 38);
      if (ersBattery <= 1 && isPlayer) ersMode = 'BALANCED';
    } else if (ersMode === 'HARVEST') {
      ersBattery = Math.min(100, ersBattery + lapFractionEst * 27);
    } else {
      ersBattery = Math.min(100, Math.max(0, ersBattery + lapFractionEst * 4));
    }

    // Tire Surface Temperature Physics
    const tireSpec = TIRE_SPECS[car.tire];
    const paceHeatTarget = car.paceMode === 'ATTACK' ? 114 : car.paceMode === 'CONSERVE' ? 84 : 96;
    const wetCooling = trackWetness * 0.24;
    const scCooling = flagStatus !== 'GREEN' ? 16 : 0;
    const dirtyAirHeat = inDirtyAir ? 5.5 : 0;
    const dryWetCompoundHeat = (car.tire === 'INTER' || car.tire === 'WET') && trackWetness < 14 ? 26 : 0;
    const targetTemp = Math.max(52, Math.min(136, paceHeatTarget + (track.airTempC - 22) * 0.5 + dirtyAirHeat + dryWetCompoundHeat - wetCooling - scCooling));
    const tireTemp = car.tireTemp + (targetTemp - car.tireTemp) * Math.min(1, dtSec * 0.08);

    // Temperature grip penalty
    let tempDeltaSec = 0;
    if (tireTemp < tireSpec.optTempMin) tempDeltaSec = (tireSpec.optTempMin - tireTemp) * 0.045;
    else if (tireTemp > tireSpec.optTempMax) tempDeltaSec = (tireTemp - tireSpec.optTempMax) * 0.055;

    // Battle Maneuver State Machine (Late Brake, Defending Line, Switchback, Mistakes)
    let battleState = car.battleState;
    let battleTimerSec = Math.max(0, car.battleTimerSec - dtSec);
    let defendingSide = car.defendingSide;
    let spinAngle = car.spinAngle;
    let wingDamage = car.wingDamage;
    let mistakeCooldownSec = Math.max(0, car.mistakeCooldownSec - dtSec);
    let extraSpeedPenaltySec = 0;
    let extraAttackBoostSec = 0;
    let tireWearBump = 0;

    if (battleTimerSec <= 0 && (battleState === 'LOCKUP' || battleState === 'WIDE' || battleState === 'SPIN' || battleState === 'LATE_BRAKE' || battleState === 'SWITCHBACK')) {
      battleState = 'CLEAR';
      spinAngle = 0;
    }

    // Active Spin / Lock-up / Wide execution
    if (battleState === 'SPIN') {
      extraSpeedPenaltySec += 18.0;
      spinAngle += dtSec * 7.8;
      const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
      emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 2 });
    } else if (battleState === 'LOCKUP') {
      extraSpeedPenaltySec += 3.8;
      const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
      emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 2 });
      emitFx({ type: 'SKID', x: pose.x, y: pose.y, angle: pose.angle });
    } else if (battleState === 'WIDE') {
      extraSpeedPenaltySec += 4.6;
    } else if (flagStatus === 'GREEN' && car.lap >= 1) {
      // Check for Defensive Line Change when rival is closing behind
      if (gapBehindSec < 0.65 && behindCar && !behindCar.inPit) {
        const defendAggression = battleStance === 'DEFEND' ? 1.0 : battleStance === 'NEUTRAL' ? 0.55 : 0.25;
        if (Math.random() < defendAggression * dtSec * 1.4 && battleState !== 'DEFENDING') {
          battleState = 'DEFENDING';
          battleTimerSec = 2.4;
          defendingSide = -1; // Move inward to block the apex
          const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
          if (isPlayer || car.position <= 6) {
            emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'DEFEND!', color: '#f59e0b' });
          }
        }
      }

      // Check for Late-Braking Divebomb or Switchback Attack when chasing closely
      if (gapAheadSec < 0.72 && aheadCar && !aheadCar.inPit && battleState !== 'LATE_BRAKE' && battleState !== 'SWITCHBACK') {
        if (isBraking) {
          const attackBias = battleStance === 'AGGRESSIVE' ? 1.55 : battleStance === 'DEFEND' ? 0.45 : 1.0;
          const skillEdge = (driver.racecraft - 75) / 40;
          if (Math.random() < (0.48 + skillEdge) * attackBias * dtSec * 1.5) {
            const aheadDefending = aheadCar.battleState === 'DEFENDING';
            battleState = aheadDefending ? 'SWITCHBACK' : 'LATE_BRAKE';
            battleTimerSec = 2.2;
            const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
            emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 4 });
            if (isPlayer || aheadCar.teamId === playerTeamId || car.position <= 8) {
              emitFx({
                type: 'CALLOUT',
                x: pose.x,
                y: pose.y,
                text: aheadDefending ? 'SWITCHBACK!' : 'LATE BRAKE!',
                color: aheadDefending ? '#38bdf8' : '#22c55e',
              });
              pushLog(
                'BATTLE',
                aheadDefending
                  ? `${driver.code} cuts back underneath ${driverMap.get(aheadCar.driverId).code}'s defensive line!`
                  : `${driver.code} sends a late-braking divebomb down the inside of ${driverMap.get(aheadCar.driverId).code}!`,
                car.lap
              );
            }

            // Wheel-to-wheel contact risk during aggressive divebomb vs hard defense
            const clashRisk = (battleStance === 'AGGRESSIVE' ? 0.07 : 0.025) * (aheadCar.battleStance === 'DEFEND' ? 1.7 : 1.0);
            if (Math.random() < clashRisk && mistakeCooldownSec <= 0) {
              wingDamage = Math.min(2, wingDamage + 1);
              mistakeCooldownSec = 18;
              events.crashImpact = true;
              emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 14 });
              emitFx({ type: 'DEBRIS', x: pose.x, y: pose.y, count: 6 });
              emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'CONTACT! WING DMG', color: '#ef4444' });
              pushLog('INCIDENT', `CONTACT! ${driver.code} clips ${driverMap.get(aheadCar.driverId).code} on entry — front wing damage!`, car.lap);
            }
          }
        } else if (gapAheadSec < 0.95) {
          battleState = 'SLIPSTREAM';
        }
      } else if (battleTimerSec <= 0) {
        battleState = 'CLEAR';
      }

      // Apply maneuver pace effects
      if (battleState === 'LATE_BRAKE') extraAttackBoostSec += 1.45;
      if (battleState === 'SWITCHBACK') extraAttackBoostSec += 1.25;
      if (battleState === 'DEFENDING') extraSpeedPenaltySec += 0.25; // Compromised exit, blocks attacker

      // Check for Driver Mistakes (Lock-Up, Running Wide, Spin)
      if (mistakeCooldownSec <= 0 && battleState !== 'LOCKUP' && battleState !== 'WIDE' && battleState !== 'SPIN') {
        const wearRisk = car.tireWear > 68 ? (car.tireWear - 65) * 0.0012 : 0;
        const heatRisk = tireTemp > tireSpec.optTempMax + 6 ? 0.012 : tireTemp < tireSpec.optTempMin - 10 ? 0.01 : 0;
        const wetRisk = trackWetness > 45 ? ((100 - driver.wetSkill) / 100) * 0.018 : 0;
        const modeRisk = car.paceMode === 'ATTACK' ? 0.009 : car.paceMode === 'CONSERVE' ? -0.004 : 0;
        const consistencyBase = ((100 - driver.consistency) / 100) * 0.014;
        const totalMistakeRate = Math.max(0.0015, consistencyBase + wearRisk + heatRisk + wetRisk + modeRisk);

        if (Math.random() < totalMistakeRate * dtSec * (isBraking || wp.curvature > 0.13 ? 3.2 : 0.45)) {
          mistakeCooldownSec = 16 + Math.random() * 14;
          const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
          const roll = Math.random();

          if (isBraking && roll < 0.52) {
            battleState = 'LOCKUP';
            battleTimerSec = 1.9;
            tireWearBump += 3.2;
            events.tireScreech = true;
            emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 10 });
            emitFx({ type: 'SKID', x: pose.x, y: pose.y, angle: pose.angle });
            emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'LOCK-UP!', color: '#f8fafc' });
            if (isPlayer || car.position <= 8) {
              pushLog('MISTAKE', `${driver.code} locks the front brakes into the braking zone! (+3% flat-spot wear)`, car.lap);
            }
          } else if (roll < 0.86) {
            battleState = 'WIDE';
            battleTimerSec = 2.1;
            emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 6 });
            emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'RUNS WIDE!', color: '#fb923c' });
            if (isPlayer || car.position <= 8) {
              pushLog('MISTAKE', `${driver.code} runs wide across the kerbs and loses momentum!`, car.lap);
            }
          } else {
            battleState = 'SPIN';
            battleTimerSec = 2.8;
            tireWearBump += 4.5;
            events.tireScreech = true;
            emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 16 });
            emitFx({ type: 'SKID', x: pose.x, y: pose.y, angle: pose.angle });
            emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'SPIN!', color: '#ef4444' });
            pushLog('MISTAKE', `${driver.code} loses the rear and SPINS on track!`, car.lap);

            // Chance a spin ends in the barrier (Crash -> SC / Red Flag)
            if (Math.random() < (trackWetness > 40 ? 0.34 : 0.22) && car.lap > 1 && car.lap < track.totalLaps) {
              events.crashImpact = true;
              emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 18 });
              emitFx({ type: 'DEBRIS', x: pose.x, y: pose.y, count: 10 });
              emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: 'CRASH!', color: '#dc2626' });
              pushLog('INCIDENT', `HEAVY CRASH! ${driver.code} (${team.shortName}) slides into the barriers — OUT!`, car.lap);

              if (flagStatus === 'GREEN' && !incidentTriggeredThisTick) {
                incidentTriggeredThisTick = true;
                if (redFlagCount === 0 && Math.random() < 0.38) {
                  flagStatus = 'RED_FLAG';
                  flagTimerSec = 14;
                  redFlagCount += 1;
                  events.flagChanged = true;
                  events.isRedFlag = true;
                  pushLog('FLAG', `RED FLAG! Barrier repair required after ${driver.code}'s crash.`, car.lap);
                } else {
                  flagStatus = 'SC';
                  flagTimerSec = track.baseLapTimeSec * 2.2;
                  safetyCarProgress = (car.lapProgress + 0.06) % 1;
                  events.flagChanged = true;
                  pushLog('FLAG', `SAFETY CAR DEPLOYED — Marshals clearing debris from ${driver.code}'s crash.`, car.lap);
                }
              }

              return {
                ...car, dnf: true, dnfReason: 'Barrier Crash', battleState: 'SPIN',
                drsActive: false, inDirtyAir: false, isBraking: false,
              };
            }
          }
        }
      }
    }

    // Core Lap Time Physics
    const demandSum = track.aeroDemand + track.powerDemand + track.chassisDemand;
    const weightedCar = (team.car.aero * track.aeroDemand + team.car.powertrain * track.powerDemand + team.car.chassis * track.chassisDemand) / demandSum;
    const carDeltaSec = (75 - weightedCar) * 0.085;

    const wetBlend = Math.min(1, trackWetness / 70);
    const effectiveSkill = driver.pace * (1 - wetBlend) + driver.wetSkill * wetBlend;
    const driverDeltaSec = (80 - effectiveSkill) * 0.065;

    const wearCliff = car.tireWear > 72 ? Math.pow((car.tireWear - 72) / 10, 1.85) * 1.4 : (car.tireWear / 100) * 1.35;
    const compoundDeltaSec = (1.02 - tireSpec.baseGrip) * 42 + wearCliff + tempDeltaSec;

    let weatherMismatchSec = 0;
    if (trackWetness < tireSpec.optimalWetMin) weatherMismatchSec = (tireSpec.optimalWetMin - trackWetness) * 0.14;
    else if (trackWetness > tireSpec.optimalWetMax) weatherMismatchSec = (trackWetness - tireSpec.optimalWetMax) * 0.22;

    const rubberGripBonus = -(trackRubber / 100) * 0.75;
    const fuelDeltaSec = car.fuelKg * 0.032;
    const paceDeltaSec = car.paceMode === 'ATTACK' ? -0.58 : car.paceMode === 'CONSERVE' ? 0.6 : 0;
    const ersDeltaSec = ersMode === 'OVERTAKE' && ersBattery > 2 ? -0.68 : ersMode === 'HARVEST' ? 0.45 : 0;
    const drsDeltaSec = drsActive ? -0.82 : 0;

    // Blocking effect if car directly ahead is actively defending
    const aheadBlockingSec = aheadCar && aheadCar.battleState === 'DEFENDING' && gapAheadSec < 0.45 && battleState !== 'SWITCHBACK' ? 0.65 : 0;
    const dirtyAirDeltaSec = inDirtyAir ? (0.42 * track.overtakeDifficulty * (1 - team.car.aero / 160)) + aheadBlockingSec : 0;
    const wingDamagePenalty = wingDamage === 2 ? 2.4 : wingDamage === 1 ? 0.9 : 0;
    const outOfFuelPenalty = car.fuelKg <= 0.1 ? 9.5 : 0;
    const jitter = ((100 - driver.consistency) / 100) * (Math.random() - 0.5) * 0.28;

    let effectiveLapTime = Math.max(
      track.baseLapTimeSec * 0.78,
      track.baseLapTimeSec + carDeltaSec + driverDeltaSec + compoundDeltaSec + weatherMismatchSec + rubberGripBonus +
        fuelDeltaSec + paceDeltaSec + ersDeltaSec + drsDeltaSec + dirtyAirDeltaSec + wingDamagePenalty +
        outOfFuelPenalty + extraSpeedPenaltySec - extraAttackBoostSec + jitter
    );

    if (flagStatus === 'VSC') {
      effectiveLapTime = track.baseLapTimeSec * 1.32;
    } else if (flagStatus === 'SC') {
      const targetScLapTime = track.baseLapTimeSec * 1.38;
      if (car.position === 1) effectiveLapTime = targetScLapTime;
      else if (gapAheadSec > 0.65) effectiveLapTime = track.baseLapTimeSec * 1.15;
      else effectiveLapTime = targetScLapTime * 1.01;
    }

    const progressDelta = dtSec / effectiveLapTime;
    const prevProgress = car.lapProgress;
    let newProgress = prevProgress + progressDelta;
    let newLap = car.lap;
    let tireAgeLaps = car.tireAgeLaps;
    let lastLapTimeSec = car.lastLapTimeSec;
    let bestLapTimeSec = car.bestLapTimeSec;
    let currentLapElapsedSec = car.currentLapElapsedSec + dtSec;
    let inPit = false;
    let pitTimerSec = 0;
    let pitRequested = car.pitRequested;
    let nextTire = car.nextTire;
    let paceMode = car.paceMode;
    let dnf = false;
    let dnfReason;

    // Emit occasional titanium skid sparks on fast straights or rain spray in wet
    if (flagStatus === 'GREEN' && !car.inPit) {
      if (trackWetness > 25 && Math.random() < 0.25) {
        const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
        emitFx({ type: 'SPRAY', x: pose.x, y: pose.y, angle: pose.angle });
      } else if (wp.curvature < 0.04 && Math.random() < 0.04) {
        const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
        emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 2 });
      }
    }

    const neutralMult = flagStatus === 'GREEN' ? 1.0 : 0.35;
    const paceWearMult = paceMode === 'ATTACK' ? 1.28 : paceMode === 'CONSERVE' ? 0.78 : 1.0;
    const mgmtFactor = 1.25 - (driver.tireManagement / 100) * 0.45;
    const heatWearMult = tireTemp > tireSpec.optTempMax + 4 ? 1.35 : 1.0;
    const dryOverheatMult = (car.tire === 'INTER' || car.tire === 'WET') && trackWetness < 15 ? 2.1 : 1.0;

    const tireWear = Math.min(100, car.tireWear + tireWearBump + progressDelta * tireSpec.degPerLap * track.tireAbrasion * paceWearMult * mgmtFactor * heatWearMult * dryOverheatMult * neutralMult);
    const fuelBurnMult = (paceMode === 'ATTACK' ? 1.14 : paceMode === 'CONSERVE' ? 0.86 : 1.0) * neutralMult;
    const fuelKg = Math.max(0, car.fuelKg - progressDelta * 2.05 * fuelBurnMult);

    // AI Pit Strategy (reacts to wear, rain, wing damage, and SC cheap stops)
    if (!isPlayer) {
      const remainingLaps = track.totalLaps - newLap;
      const wrongTireForRain =
        (trackWetness >= 26 && (car.tire === 'SOFT' || car.tire === 'MEDIUM' || car.tire === 'HARD')) ||
        (trackWetness >= 68 && car.tire === 'INTER') ||
        (trackWetness <= 14 && (car.tire === 'INTER' || car.tire === 'WET'));
      const scCheapStop = (flagStatus === 'SC' || flagStatus === 'VSC') && tireWear >= 44 && remainingLaps >= 4;
      const wingRepairStop = wingDamage >= 2 && remainingLaps >= 3;

      if (!pitRequested && remainingLaps >= 2 && (tireWear >= 74 || wrongTireForRain || scCheapStop || wingRepairStop)) {
        pitRequested = true;
        nextTire = chooseOptimalTireForWetness(trackWetness, remainingLaps);
      }
      if (flagStatus !== 'GREEN' || tireWear > 65 || tireTemp > tireSpec.optTempMax + 6) paceMode = 'CONSERVE';
      else if (remainingLaps <= 5 && tireWear < 55 && fuelKg > remainingLaps * 2.2) paceMode = 'ATTACK';
      else paceMode = 'STANDARD';
    }

    if (pitRequested && prevProgress < 0.96 && newProgress >= 0.96 && newLap < track.totalLaps) {
      inPit = true;
      const wingRepairExtra = wingDamage > 0 ? 5.5 : 0;
      pitTimerSec = track.pitLossSec + wingRepairExtra + (Math.random() - 0.5) * 1.0;
      if (isPlayer) {
        events.radioAlert = true;
        events.pitStopSound = true;
        pushLog('PIT', `${driver.code} boxing for ${nextTire} tires${wingDamage > 0 ? ' + front wing swap' : ''}.`, newLap);
      }
    }

    if (prevProgress < 1.0 && newProgress >= 1.0) {
      const completedLaps = Math.floor(newProgress);
      newProgress -= completedLaps;
      if (prevProgress >= 0) {
        tireAgeLaps += completedLaps;
        lastLapTimeSec = Number((currentLapElapsedSec / completedLaps).toFixed(3));
        if (bestLapTimeSec === null || lastLapTimeSec < bestLapTimeSec) bestLapTimeSec = lastLapTimeSec;
        if (flagStatus === 'GREEN' && (fastestLapTimeSec === null || lastLapTimeSec < fastestLapTimeSec)) {
          fastestLapTimeSec = lastLapTimeSec;
          fastestLapDriverId = driver.id;
        }
        if (isPlayer) events.playerLapCompleted = true;

        // Mechanical Reliability Check
        const attackStress = paceMode === 'ATTACK' ? 1.8 : 1.0;
        const failureProb = ((102 - team.car.reliability) / 100) * 0.002 * attackStress * completedLaps;
        if (newLap > 2 && newLap < track.totalLaps && Math.random() < failureProb) {
          dnf = true;
          dnfReason = 'Power Unit Failure';
          events.radioAlert = isPlayer;
          const pose = sampleTrackPose(track, newProgress, false, 0, car.lateralOffset);
          emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 16 });
          pushLog('INCIDENT', `${driver.code} (${team.shortName}) smokes out: ${dnfReason}!`, newLap);

          if (flagStatus === 'GREEN' && !incidentTriggeredThisTick) {
            incidentTriggeredThisTick = true;
            flagStatus = 'VSC';
            flagTimerSec = track.baseLapTimeSec * 1.4;
            events.flagChanged = true;
            pushLog('FLAG', `VIRTUAL SAFETY CAR — Marshals clearing ${driver.code}'s stopped car.`, newLap);
          }
        }
      }
      newLap += completedLaps;
      currentLapElapsedSec = 0;
    }

    // Dynamic Lateral Racing-Line Choreography (Defense, Divebomb, Switchback, Running Wide)
    let targetLateral = 0;
    if (battleState === 'WIDE') {
      targetLateral = 13.5; // Runs off outside onto kerb/runoff
    } else if (battleState === 'DEFENDING') {
      targetLateral = -7.2; // Covers the inside defensive line
    } else if (battleState === 'LATE_BRAKE') {
      targetLateral = -8.2; // Lunges down the inside apex
    } else if (battleState === 'SWITCHBACK') {
      targetLateral = 7.8; // Cuts outside -> inside switchback
    } else if (car.overtakeFlashSec > 0) {
      targetLateral = 6.8;
    } else if (gapAheadSec < 0.85 && !inPit) {
      targetLateral = aheadCar && aheadCar.lateralOffset < -3 ? 6.5 : -5.5; // Peeks out of tow
    }

    const lateralOffset = car.lateralOffset + (targetLateral - car.lateralOffset) * Math.min(1, dtSec * 5.2);
    const overtakeFlashSec = Math.max(0, car.overtakeFlashSec - dtSec);

    return {
      ...car, lap: newLap, lapProgress: newProgress, totalDistance: newLap - 1 + newProgress,
      tireWear, tireTemp, tireAgeLaps, fuelKg, paceMode, ersMode, battleStance, ersBattery,
      drsActive, inDirtyAir, isBraking, battleState, battleTimerSec, defendingSide,
      lateralOffset, spinAngle, wingDamage, overtakeFlashSec, mistakeCooldownSec,
      inPit, pitTimerSec, pitRequested, nextTire,
      lastLapTimeSec, bestLapTimeSec, currentLapElapsedSec, dnf, dnfReason,
    };
  });

  // Sort classification & detect exact on-track overtakes
  const sortedCars = [...updatedCars].sort((a, b) => {
    if (a.dnf && !b.dnf) return 1;
    if (!a.dnf && b.dnf) return -1;
    return b.totalDistance - a.totalDistance;
  });

  const leaderDist = sortedCars[0]?.totalDistance ?? 0;
  for (let i = 0; i < sortedCars.length; i++) {
    const car = sortedCars[i];
    const newPos = i + 1;
    const oldPos = preRankMap.get(car.driverId) || newPos;
    car.position = newPos;

    if (i === 0 || car.dnf) {
      car.gapToLeaderSec = 0;
      car.intervalSec = 0;
    } else {
      const ahead = sortedCars[i - 1];
      car.gapToLeaderSec = Number((Math.max(0, leaderDist - car.totalDistance) * track.baseLapTimeSec).toFixed(2));
      car.intervalSec = Number((Math.max(0, ahead.totalDistance - car.totalDistance) * track.baseLapTimeSec).toFixed(2));

      if (!car.dnf && !car.inPit && newPos < oldPos && car.lap >= 1) {
        const passedCar = sortedCars[i + 1];
        if (passedCar && !passedCar.inPit && !passedCar.dnf) {
          car.overtakeFlashSec = 2.6;
          const d1 = driverMap.get(car.driverId);
          const d2 = driverMap.get(passedCar.driverId);
          const isPlayerInvolved = car.teamId === playerTeamId || passedCar.teamId === playerTeamId;
          const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);

          if (isPlayerInvolved || newPos <= 8) {
            const moveTag =
              car.battleState === 'LATE_BRAKE'
                ? ' [LATE BRAKE]'
                : car.battleState === 'SWITCHBACK'
                  ? ' [SWITCHBACK]'
                  : car.drsActive
                    ? ' [DRS]'
                    : car.ersMode === 'OVERTAKE'
                      ? ' [ERS]'
                      : '';
            emitFx({ type: 'CALLOUT', x: pose.x, y: pose.y, text: `P${newPos} PASS!`, color: '#10b981' });
            pushLog('OVERTAKE', `${d1.code} passes ${d2.code} for P${newPos}${moveTag}!`, car.lap);
            if (isPlayerInvolved) events.overtakeEvent = true;
          }
        }
      }
    }
  }

  const topCar = sortedCars[0];
  const finished = Boolean(topCar && !topCar.dnf && topCar.lap > track.totalLaps);
  if (finished && !prev.finished) {
    const winner = driverMap.get(topCar.driverId);
    pushLog('RACE', `CHEQUERED FLAG! ${winner.name} (${winner.code}) wins at ${track.name}!`, track.totalLaps);
    events.radioAlert = true;
  }

  return {
    nextState: {
      ...prev, elapsedSec, weather, forecast, nextWeatherChangeSec, trackWetness, trackRubber,
      flagStatus, flagTimerSec, safetyCarProgress, redFlagCount,
      cars: sortedCars, logs, fastestLapDriverId, fastestLapTimeSec, finished,
    },
    events,
  };
}

// ==========================================
// 5. OPEN-WHEEL CANVAS RENDERER (BATTLE CAM, PARTICLES, PIT GHOST, SLIPSTREAM)
// ==========================================
function drawOpenWheelCar(ctx, x, y, angle, primaryColor, tireColor, opts) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (opts.spinAngle || 0));

  // Slipstream aero tow lines behind chasing car
  if (opts.slipstream) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(12, -5); ctx.lineTo(24, -7);
    ctx.moveTo(12, 5); ctx.lineTo(24, 7);
    ctx.stroke();
  }

  // Overtake / Defend / Player ring
  if (opts.overtaking) {
    ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)'; ctx.lineWidth = 2.2; ctx.stroke();
  } else if (opts.defending) {
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.setLineDash([]);
  } else if (opts.isPlayer) {
    ctx.beginPath(); ctx.arc(0, 0, 14.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)'; ctx.lineWidth = 1.6; ctx.stroke();
  }

  // ERS exhaust boost plume
  if (opts.ersOvertake) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-11, -2.2); ctx.lineTo(-19, 0); ctx.lineTo(-11, 2.2);
    ctx.closePath(); ctx.fill();
  }

  // Glowing Carbon Brake Discs & Rear Rain/Brake Light
  if (opts.isBraking || opts.lateBrake) {
    ctx.fillStyle = opts.lateBrake ? '#ff2a2a' : '#f97316';
    ctx.beginPath(); ctx.arc(6.5, -5.5, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6.5, 5.5, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12.5, -1.3, 2, 2.6);
  }

  // 4 Open-Wheel Tires
  ctx.fillStyle = tireColor;
  ctx.fillRect(4.5, -7.4, 4.4, 2.6);
  ctx.fillRect(4.5, 4.8, 4.4, 2.6);
  ctx.fillRect(-8.8, -7.8, 4.8, 2.9);
  ctx.fillRect(-8.8, 4.9, 4.8, 2.9);

  // Front Wing (shortened/skewed if damaged!)
  ctx.fillStyle = opts.wingDamage >= 2 ? '#ef4444' : '#e2e8f0';
  if (opts.wingDamage >= 2) {
    ctx.fillRect(9.2, -3.5, 2.2, 7);
  } else {
    ctx.fillRect(9.2, -6.8, 2.5, 13.6);
  }

  // Monocoque & Sculpted Sidepods
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(10.8, -1.6);
  ctx.lineTo(2.2, -4.6);
  ctx.lineTo(-8.8, -3.6);
  ctx.lineTo(-9.8, 0);
  ctx.lineTo(-8.8, 3.6);
  ctx.lineTo(2.2, 4.6);
  ctx.lineTo(10.8, 1.6);
  ctx.closePath();
  ctx.fill();

  // Cockpit Halo & Driver Helmet
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(0.5, 0, 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath(); ctx.arc(0.7, 0, 1.1, 0, Math.PI * 2); ctx.fill();

  // Rear Wing (flashes bright green when DRS is open)
  ctx.fillStyle = opts.drsActive ? '#22c55e' : '#cbd5e1';
  ctx.fillRect(-11.4, -6.0, 2.5, 12.0);

  ctx.restore();
}

function TrackCanvas({ raceState, teams, drivers, playerTeamId, fxQueueRef, cameraMode, focusDriverId }) {
  const canvasRef = useRef(null);
  const rainRef = useRef([]);
  const particlesRef = useRef([]);
  const skidsRef = useRef([]);
  const debrisRef = useRef([]);
  const calloutsRef = useRef([]);
  const camRef = useRef({ x: 500, y: 310, zoom: 1 });

  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 140; i++) {
      drops.push({ x: Math.random() * 1000, y: Math.random() * 620, len: 8 + Math.random() * 10, speed: 6 + Math.random() * 7 });
    }
    rainRef.current = drops;
  }, []);

  useEffect(() => {
    // Drain new FX events from simulation
    while (fxQueueRef.current.length > 0) {
      const ev = fxQueueRef.current.shift();
      if (ev.type === 'CLEAR_DEBRIS') {
        debrisRef.current = [];
      } else if (ev.type === 'SKID') {
        skidsRef.current.push({ x: ev.x, y: ev.y, angle: ev.angle, alpha: 0.55 });
        if (skidsRef.current.length > 120) skidsRef.current.shift();
      } else if (ev.type === 'DEBRIS') {
        for (let i = 0; i < (ev.count || 6); i++) {
          debrisRef.current.push({
            x: ev.x + (Math.random() - 0.5) * 26,
            y: ev.y + (Math.random() - 0.5) * 26,
            size: 1.5 + Math.random() * 2.5,
            rot: Math.random() * Math.PI,
          });
        }
        if (debrisRef.current.length > 70) debrisRef.current.splice(0, 15);
      } else if (ev.type === 'SMOKE') {
        for (let i = 0; i < (ev.count || 4); i++) {
          particlesRef.current.push({
            kind: 'SMOKE',
            x: ev.x + (Math.random() - 0.5) * 6,
            y: ev.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.4,
            vy: (Math.random() - 0.5) * 1.4,
            r: 3 + Math.random() * 4,
            life: 1.0,
          });
        }
      } else if (ev.type === 'SPARK') {
        for (let i = 0; i < (ev.count || 4); i++) {
          particlesRef.current.push({
            kind: 'SPARK',
            x: ev.x,
            y: ev.y,
            vx: (Math.random() - 0.5) * 4.2,
            vy: (Math.random() - 0.5) * 4.2,
            r: 1.6,
            life: 1.0,
          });
        }
      } else if (ev.type === 'SPRAY') {
        particlesRef.current.push({
          kind: 'SPRAY',
          x: ev.x - Math.cos(ev.angle) * 10,
          y: ev.y - Math.sin(ev.angle) * 10,
          vx: -Math.cos(ev.angle) * 1.5 + (Math.random() - 0.5),
          vy: -Math.sin(ev.angle) * 1.5 + (Math.random() - 0.5),
          r: 3.5,
          life: 0.7,
        });
      } else if (ev.type === 'CALLOUT') {
        calloutsRef.current.push({ x: ev.x, y: ev.y - 16, text: ev.text, color: ev.color || '#ffffff', life: 1.0 });
        if (calloutsRef.current.length > 14) calloutsRef.current.shift();
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1000;
    const H = 620;
    const { track, cars, weather, trackWetness, flagStatus, safetyCarProgress } = raceState;

    // Update particles & callouts
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        r: p.kind === 'SMOKE' ? p.r + 0.35 : p.r,
        life: p.life - (p.kind === 'SPARK' ? 0.12 : 0.055),
      }))
      .filter((p) => p.life > 0);
    if (particlesRef.current.length > 220) particlesRef.current.splice(0, particlesRef.current.length - 220);

    calloutsRef.current = calloutsRef.current
      .map((c) => ({ ...c, y: c.y - 0.45, life: c.life - 0.025 }))
      .filter((c) => c.life > 0);

    // Compute smooth camera target (Overview vs Battle Zoom)
    let targetX = 500;
    let targetY = 310;
    let targetZoom = 1.0;

    if (cameraMode === 'BATTLE') {
      const targetCar =
        cars.find((c) => c.driverId === focusDriverId && !c.dnf) ||
        cars.find((c) => !c.dnf && (c.battleState === 'LATE_BRAKE' || c.battleState === 'SWITCHBACK' || c.battleState === 'DEFENDING')) ||
        cars.find((c) => c.teamId === playerTeamId && !c.dnf) ||
        cars[0];
      if (targetCar) {
        const pose = sampleTrackPose(track, targetCar.lapProgress, targetCar.inPit, targetCar.pitTimerSec, targetCar.lateralOffset);
        targetX = pose.x;
        targetY = pose.y;
        targetZoom = 1.85;
      }
    }

    camRef.current.x += (targetX - camRef.current.x) * 0.14;
    camRef.current.y += (targetY - camRef.current.y) * 0.14;
    camRef.current.zoom += (targetZoom - camRef.current.zoom) * 0.12;

    // 1. Background
    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, 60, W * 0.5, H * 0.5, 640);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Apply Camera Transform
    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    ctx.scale(camRef.current.zoom, camRef.current.zoom);
    ctx.translate(-camRef.current.x, -camRef.current.y);

    // Engineering grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.22)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += 50) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += 50) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    const pts = track.waypoints;
    if (pts.length > 0) {
      const traceMainLoop = () => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
      };

      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Gravel / Runoff border
      traceMainLoop();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 40;
      ctx.stroke();

      // Apex Kerbs (react to Flag Status)
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].curvature > 0.14) {
          const next = pts[(i + 1) % pts.length];
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(next.x, next.y);
          if (flagStatus === 'SC' || flagStatus === 'VSC') ctx.strokeStyle = i % 2 === 0 ? '#eab308' : '#0f172a';
          else if (flagStatus === 'RED_FLAG') ctx.strokeStyle = i % 2 === 0 ? '#ef4444' : '#0f172a';
          else ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#f8fafc';
          ctx.lineWidth = 31;
          ctx.stroke();
        }
      }

      // Pit Lane
      if (track.pitWaypoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(track.pitWaypoints[0].x, track.pitWaypoints[0].y);
        for (let i = 1; i < track.pitWaypoints.length; i++) ctx.lineTo(track.pitWaypoints[i].x, track.pitWaypoints[i].y);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Asphalt Surface
      traceMainLoop();
      const wetRatio = Math.min(1, trackWetness / 100);
      ctx.strokeStyle = wetRatio > 0.25 ? '#263547' : '#334155';
      ctx.lineWidth = 26;
      ctx.stroke();

      // Rubbered-in darker racing groove
      traceMainLoop();
      ctx.strokeStyle = `rgba(15, 23, 42, ${0.15 + (raceState.trackRubber / 100) * 0.25})`;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Wet sheen
      if (wetRatio > 0.15) {
        traceMainLoop();
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + wetRatio * 0.28})`;
        ctx.lineWidth = 16;
        ctx.stroke();
      }

      // DRS Zones (emerald strip)
      if (flagStatus === 'GREEN' && trackWetness < 22) {
        for (let i = 0; i < pts.length; i++) {
          if (isProgressInDrsZone(track, pts[i].progress)) {
            const next = pts[(i + 1) % pts.length];
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.36)';
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }
      }

      // Braking Zone Markers (subtle amber ticks)
      for (let i = 0; i < pts.length; i += 4) {
        if (pts[i].isBrakingZone) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.26)';
          ctx.fillRect(pts[i].x - 2, pts[i].y - 2, 4, 4);
        }
      }

      // Persistent Tire Skid Marks
      skidsRef.current.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.fillStyle = `rgba(2, 6, 23, ${s.alpha})`;
        ctx.fillRect(-6, -3.5, 12, 1.8);
        ctx.fillRect(-6, 1.8, 12, 1.8);
        ctx.restore();
      });

      // Carbon Crash Debris on Track
      debrisRef.current.forEach((d) => {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-d.size, -d.size * 0.5, d.size * 2, d.size);
        ctx.restore();
      });

      // Sector Splits
      track.sectorSplits.forEach((splitProg, idx) => {
        const sPos = sampleTrackPose(track, splitProg, false, 0, 0);
        ctx.beginPath();
        ctx.arc(sPos.x, sPos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#06b6d4' : '#a855f7';
        ctx.fill();
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`S${idx + 2}`, sPos.x + 9, sPos.y - 7);
      });

      // Checkered Start / Finish Line
      const sf = pts[0];
      const { nx, ny } = track.startNormal;
      ctx.save();
      ctx.translate(sf.x, sf.y);
      ctx.rotate(Math.atan2(ny, nx));
      for (let r = -12; r < 12; r += 4) {
        for (let c = -3; c < 3; c += 3) {
          ctx.fillStyle = ((r + c) / 3) % 2 === 0 ? '#ffffff' : '#0f172a';
          ctx.fillRect(r, c, 4, 3);
        }
      }
      ctx.restore();
      ctx.restore();

      // Pit-Exit Rejoin Ghost Markers for Player Cars with Pit Requested
      const pitDropFrac = track.pitLossSec / track.baseLapTimeSec;
      cars
        .filter((c) => c.teamId === playerTeamId && !c.dnf && !c.inPit && c.pitRequested)
        .forEach((car) => {
          const drv = drivers.find((d) => d.id === car.driverId);
          const rejoinDist = car.totalDistance - pitDropFrac;
          const rejoinPosRank = cars.filter((o) => !o.dnf && o.driverId !== car.driverId && o.totalDistance > rejoinDist).length + 1;
          const ghostPose = sampleTrackPose(track, car.lapProgress - pitDropFrac, false, 0, 0);

          ctx.save();
          ctx.beginPath();
          ctx.arc(ghostPose.x, ghostPose.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = '#22d3ee';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(8, 51, 68, 0.9)';
          ctx.fillRect(ghostPose.x + 11, ghostPose.y - 12, 64, 13);
          ctx.font = 'bold 9px ui-monospace, monospace';
          ctx.fillStyle = '#67e8f9';
          ctx.fillText(`${drv.code}→P${rejoinPosRank}`, ghostPose.x + 14, ghostPose.y - 3);
          ctx.restore();
        });

      // Safety Car on Track
      if (flagStatus === 'SC') {
        const scPose = sampleTrackPose(track, safetyCarProgress, false, 0, 0);
        drawOpenWheelCar(ctx, scPose.x, scPose.y, scPose.angle, '#f8fafc', '#eab308', {});
        ctx.fillStyle = '#eab308';
        ctx.fillRect(scPose.x + 11, scPose.y - 14, 22, 11);
        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.fillStyle = '#020617';
        ctx.fillText('SC', scPose.x + 15, scPose.y - 6);
      }

      // Particles behind/around cars
      particlesRef.current.forEach((p) => {
        if (p.kind === 'SMOKE') {
          ctx.fillStyle = `rgba(226, 232, 240, ${p.life * 0.48})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else if (p.kind === 'SPRAY') {
          ctx.fillStyle = `rgba(125, 211, 252, ${p.life * 0.35})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else if (p.kind === 'SPARK') {
          ctx.fillStyle = `rgba(251, 191, 36, ${p.life})`;
          ctx.fillRect(p.x, p.y, 2.5, 2.5);
        }
      });

      // Render Active Cars
      const teamMap = new Map(teams.map((t) => [t.id, t]));
      const driverMap = new Map(drivers.map((d) => [d.id, d]));

      const drawOrder = [...cars]
        .filter((c) => !c.dnf)
        .sort((a, b) => {
          const aPlayer = a.teamId === playerTeamId ? 1 : 0;
          const bPlayer = b.teamId === playerTeamId ? 1 : 0;
          if (aPlayer !== bPlayer) return aPlayer - bPlayer;
          return b.position - a.position;
        });

      drawOrder.forEach((car) => {
        const team = teamMap.get(car.teamId);
        const driver = driverMap.get(car.driverId);
        if (!team || !driver) return;
        const pose = sampleTrackPose(track, car.lapProgress, car.inPit, car.pitTimerSec, car.lateralOffset);
        const isPlayer = team.id === playerTeamId;
        const tireColor = TIRE_SPECS[car.tire].color;

        drawOpenWheelCar(ctx, pose.x, pose.y, pose.angle, team.primaryColor, tireColor, {
          isPlayer,
          drsActive: car.drsActive,
          ersOvertake: car.ersMode === 'OVERTAKE' && car.ersBattery > 2,
          overtaking: car.overtakeFlashSec > 0 || car.battleState === 'LATE_BRAKE' || car.battleState === 'SWITCHBACK',
          defending: car.battleState === 'DEFENDING',
          slipstream: car.battleState === 'SLIPSTREAM',
          isBraking: car.isBraking,
          lateBrake: car.battleState === 'LATE_BRAKE',
          spinAngle: car.spinAngle,
          wingDamage: car.wingDamage,
        });

        const tagX = pose.x + 12;
        const tagY = pose.y - 7;
        ctx.fillStyle =
          car.overtakeFlashSec > 0
            ? 'rgba(16, 185, 129, 0.95)'
            : isPlayer
              ? 'rgba(245, 158, 11, 0.95)'
              : 'rgba(15, 23, 42, 0.86)';
        ctx.fillRect(tagX - 2, tagY - 9, 28, 12);

        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.fillStyle = isPlayer || car.overtakeFlashSec > 0 ? '#020617' : '#f8fafc';
        ctx.fillText(driver.code, tagX, tagY);
      });

      // Floating Maneuver & Mistake Callouts in World Space
      calloutsRef.current.forEach((c) => {
        ctx.save();
        ctx.globalAlpha = Math.min(1, c.life * 1.4);
        ctx.font = 'bold 10px ui-monospace, monospace';
        const tw = ctx.measureText(c.text).width;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(c.x - tw * 0.5 - 4, c.y - 10, tw + 8, 13);
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x - tw * 0.5 - 4, c.y - 10, tw + 8, 13);
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, c.x - tw * 0.5, c.y);
        ctx.restore();
      });
    }

    ctx.restore(); // End Camera Transform

    // Screen-Space Rain Overlay
    if (weather === 'LIGHT_RAIN' || weather === 'HEAVY_RAIN') {
      const activeDrops = weather === 'HEAVY_RAIN' ? 140 : 55;
      const speedMult = weather === 'HEAVY_RAIN' ? 1.5 : 0.9;
      ctx.strokeStyle = weather === 'HEAVY_RAIN' ? 'rgba(125, 211, 252, 0.45)' : 'rgba(125, 211, 252, 0.28)';
      ctx.lineWidth = weather === 'HEAVY_RAIN' ? 1.5 : 1;
      for (let i = 0; i < activeDrops; i++) {
        const drop = rainRef.current[i];
        drop.x -= drop.speed * 0.35 * speedMult;
        drop.y += drop.speed * speedMult;
        if (drop.y > H) { drop.y = -10; drop.x = Math.random() * W; }
        if (drop.x < 0) drop.x += W;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.len * 0.35, drop.y + drop.len);
        ctx.stroke();
      }
    }

    // Screen-Space Broadcast HUD Header
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.fillRect(12, 12, 330, 42);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, 330, 42);

    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${track.name.toUpperCase()} // ${track.lengthKm.toFixed(2)} KM`, 22, 29);

    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `GRIP: ${Math.round(raceState.trackRubber)}% · WET: ${Math.round(trackWetness)}% · DRS: ${flagStatus === 'GREEN' && trackWetness < 22 ? 'ACTIVE' : 'OFF'}`,
      22,
      46
    );

    if (flagStatus !== 'GREEN') {
      ctx.fillStyle = flagStatus === 'RED_FLAG' ? 'rgba(220, 38, 38, 0.94)' : 'rgba(234, 179, 8, 0.94)';
      ctx.fillRect(W - 230, 12, 218, 30);
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillStyle = flagStatus === 'RED_FLAG' ? '#ffffff' : '#020617';
      const label = flagStatus === 'RED_FLAG' ? 'RED FLAG — SESSION HALTED' : flagStatus === 'SC' ? 'SAFETY CAR DEPLOYED' : 'VIRTUAL SAFETY CAR';
      ctx.fillText(label, W - 218, 31);
    }
  }, [raceState, teams, drivers, playerTeamId, cameraMode, focusDriverId]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <canvas ref={canvasRef} width={1000} height={620} className="block h-auto w-full select-none" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/90 px-4 py-2 text-[11px] text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />Player / Defending</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />DRS / Late Brake</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />ERS / Slipstream</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-cyan-400" />Pit Rejoin Ghost</span>
        </div>
        <div>Camera: <strong className="text-amber-300">{cameraMode === 'BATTLE' ? '1.85X BATTLE ZOOM' : 'FULL CIRCUIT'}</strong></div>
      </div>
    </div>
  );
}

// Broadcast-Style Live Battle Telemetry Card
function BattleMonitor({ raceState, teams, drivers, playerTeamId }) {
  const active = raceState.cars.filter((c) => !c.dnf && !c.inPit);
  // Find closest battle (prefer involving a player car if gap < 1.3s)
  let bestPair = null;
  let bestScore = Infinity;

  for (let i = 1; i < active.length; i++) {
    const chaser = active[i];
    const defender = active[i - 1];
    const gap = Math.max(0.01, (defender.totalDistance - chaser.totalDistance) * raceState.track.baseLapTimeSec);
    const involvesPlayer = chaser.teamId === playerTeamId || defender.teamId === playerTeamId;
    const score = involvesPlayer ? gap * 0.55 : gap;
    if (gap < 1.8 && score < bestScore) {
      bestScore = score;
      bestPair = { defender, chaser, gap };
    }
  }

  if (!bestPair) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 font-mono text-xs text-slate-400 flex items-center justify-between">
        <span>BROADCAST BATTLE RADAR: Field spread out — monitoring sector gaps...</span>
        <span className="text-slate-500">AIR {raceState.track.airTempC}°C · GRIP {Math.round(raceState.trackRubber)}%</span>
      </div>
    );
  }

  const dDef = drivers.find((d) => d.id === bestPair.defender.driverId);
  const tDef = teams.find((t) => t.id === bestPair.defender.teamId);
  const dCha = drivers.find((d) => d.id === bestPair.chaser.driverId);
  const tCha = teams.find((t) => t.id === bestPair.chaser.teamId);

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 px-4 py-2.5 shadow-lg font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">BATTLE FOR P{bestPair.defender.position}</span>
          <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: tDef.primaryColor }} />
          <strong className="text-white">{dDef.code}</strong>
          <span className="text-[10px] text-slate-400">({bestPair.defender.tire[0]} {bestPair.defender.tireAgeLaps}L · ERS {Math.round(bestPair.defender.ersBattery)}%)</span>
          {bestPair.defender.battleState === 'DEFENDING' && (
            <span className="rounded bg-amber-500/20 border border-amber-500/50 px-1.5 text-[10px] font-bold text-amber-300">DEFENDING LINE</span>
          )}
        </div>

        <div className="rounded-lg bg-slate-950 px-3 py-1 border border-slate-800 text-emerald-400 font-black tabular-nums">
          GAP {bestPair.gap.toFixed(3)}s
        </div>

        <div className="flex items-center gap-2">
          {bestPair.chaser.battleState === 'LATE_BRAKE' && <span className="rounded bg-emerald-500/25 border border-emerald-400 px-1.5 text-[10px] font-bold text-emerald-300">LATE BRAKE!</span>}
          {bestPair.chaser.battleState === 'SWITCHBACK' && <span className="rounded bg-sky-500/25 border border-sky-400 px-1.5 text-[10px] font-bold text-sky-300">SWITCHBACK!</span>}
          {bestPair.chaser.drsActive && <span className="rounded bg-emerald-500 px-1.5 text-[10px] font-black text-slate-950">DRS</span>}
          <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: tCha.primaryColor }} />
          <strong className="text-white">{dCha.code}</strong>
          <span className="text-[10px] text-slate-400">({bestPair.chaser.tire[0]} {bestPair.chaser.tireAgeLaps}L · ERS {Math.round(bestPair.chaser.ersBattery)}%)</span>
        </div>
      </div>
    </div>
  );
}

function TimingTower({ raceState, teams, drivers, playerTeamId, focusDriverId, onSelectFocus }) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));

  const formatLapTime = (sec) => {
    if (sec === null || !Number.isFinite(sec)) return '--:--.---';
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem.toFixed(3)}`;
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${raceState.flagStatus === 'RED_FLAG' ? 'bg-rose-500' : raceState.flagStatus !== 'GREEN' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Live Timing Tower</h2>
        </div>
        <span className="font-mono text-xs text-slate-400 tabular-nums">
          LAP {Math.min(raceState.cars[0]?.lap ?? 1, raceState.track.totalLaps)} / {raceState.track.totalLaps}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
          <thead>
            <tr className="border-b border-slate-800/90 bg-slate-950/40 text-[10px] uppercase text-slate-400">
              <th className="py-2 pl-2.5 pr-1">Pos</th>
              <th className="py-2 px-1">Driver</th>
              <th className="py-2 px-1 text-right">Int</th>
              <th className="py-2 px-1 text-center">Status</th>
              <th className="py-2 px-1 text-center">Tire</th>
              <th className="py-2 px-1 text-right">Wear</th>
              <th className="py-2 pl-1 pr-2.5 text-right">Last Lap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {raceState.cars.map((car) => {
              const team = teamMap.get(car.teamId);
              const driver = driverMap.get(car.driverId);
              const isPlayer = team.id === playerTeamId;
              const isFocused = focusDriverId === car.driverId;
              const tireSpec = TIRE_SPECS[car.tire];
              const isFastest = raceState.fastestLapDriverId === car.driverId;

              return (
                <tr
                  key={car.driverId}
                  onClick={() => onSelectFocus(car.driverId)}
                  title="Click to lock Battle Cam onto this driver"
                  className={`cursor-pointer transition-colors ${
                    car.dnf
                      ? 'opacity-45 bg-slate-950/50'
                      : isFocused
                        ? 'bg-cyan-500/20 ring-1 ring-inset ring-cyan-400/50'
                        : isPlayer
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-1.5 pl-2.5 pr-1 font-bold text-slate-300">{car.dnf ? 'DNF' : car.position}</td>
                  <td className="py-1.5 px-1">
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-3 w-1 rounded-sm shrink-0" style={{ backgroundColor: team.primaryColor }} />
                      <span className={`font-bold ${isPlayer ? 'text-amber-300' : 'text-slate-100'}`}>{driver.code}</span>
                      {car.wingDamage > 0 && <span className="rounded bg-rose-600 px-1 text-[8px] font-black text-white">DMG</span>}
                      {car.inPit && <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300 border border-amber-500/40">PIT</span>}
                    </div>
                  </td>
                  <td className="py-1.5 px-1 text-right text-slate-300">
                    {car.dnf ? 'OUT' : car.position === 1 ? 'LDR' : `+${car.intervalSec.toFixed(1)}s`}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    {car.battleState === 'LATE_BRAKE' ? (
                      <span className="rounded bg-emerald-500/25 px-1 text-[9px] font-bold text-emerald-300">DIVE</span>
                    ) : car.battleState === 'DEFENDING' ? (
                      <span className="rounded bg-amber-500/25 px-1 text-[9px] font-bold text-amber-300">DEF</span>
                    ) : car.battleState === 'LOCKUP' || car.battleState === 'SPIN' ? (
                      <span className="rounded bg-rose-500/25 px-1 text-[9px] font-bold text-rose-300">{car.battleState === 'SPIN' ? 'SPIN' : 'LOCK'}</span>
                    ) : car.drsActive ? (
                      <span className="rounded bg-emerald-500/25 px-1 text-[9px] font-bold text-emerald-300 border border-emerald-500/40">DRS</span>
                    ) : car.inDirtyAir ? (
                      <span className="rounded bg-orange-500/20 px-1 text-[9px] font-bold text-orange-300">TOW</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ backgroundColor: tireSpec.color, color: tireSpec.textColor }}>
                      {tireSpec.short}
                    </span>
                  </td>
                  <td className="py-1.5 px-1 text-right">
                    <span className={car.tireWear > 72 ? 'text-rose-400 font-bold' : car.tireWear > 45 ? 'text-amber-300' : 'text-emerald-400'}>
                      {Math.round(100 - car.tireWear)}%
                    </span>
                  </td>
                  <td className={`py-1.5 pl-1 pr-2.5 text-right ${isFastest ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                    {formatLapTime(car.lastLapTimeSec)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-800 bg-slate-950/60 px-3 py-1.5 font-mono text-[10px] text-slate-500">
        Tip: Click any driver row to lock Battle Cam onto them.
      </div>
    </div>
  );
}

function DriverPitWall({ driver, telemetry, onChangePace, onChangeErs, onChangeStance, onTogglePit }) {
  const tireLife = Math.max(0, Math.round(100 - telemetry.tireWear));
  const currentTire = TIRE_SPECS[telemetry.tire];
  const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTER', 'WET'];
  const PACE_MODES = [
    { mode: 'CONSERVE', label: 'Save' },
    { mode: 'STANDARD', label: 'Std' },
    { mode: 'ATTACK', label: 'Push' },
  ];
  const ERS_MODES = [
    { mode: 'HARVEST', label: 'Chrg' },
    { mode: 'BALANCED', label: 'Auto' },
    { mode: 'OVERTAKE', label: 'Ovt' },
  ];
  const STANCES = [
    { mode: 'DEFEND', label: 'Defend' },
    { mode: 'NEUTRAL', label: 'Clean' },
    { mode: 'AGGRESSIVE', label: 'Dive' },
  ];

  const tempStatus =
    telemetry.tireTemp > currentTire.optTempMax + 3
      ? { color: 'text-rose-400', label: 'HOT' }
      : telemetry.tireTemp < currentTire.optTempMin - 3
        ? { color: 'text-sky-400', label: 'COLD' }
        : { color: 'text-emerald-400', label: 'OPT' };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/40 font-mono text-sm font-black text-amber-300">
            #{driver.carNumber}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-100">{driver.name}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">{driver.code}</span>
              {telemetry.wingDamage > 0 && (
                <span className="rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[9px] font-black text-white">
                  WING DMG {telemetry.wingDamage === 2 ? '(SEVERE)' : '(MINOR)'}
                </span>
              )}
              {telemetry.drsActive && <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300">DRS</span>}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {telemetry.dnf ? (
                <span className="text-rose-400 font-bold">RETIRED — {telemetry.dnfReason}</span>
              ) : (
                <>P<span className="text-slate-100 font-bold">{telemetry.position}</span> · Stops {telemetry.pitStopsCount} · Action: <span className="text-cyan-300">{telemetry.battleState}</span></>
              )}
            </div>
          </div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-black shadow" style={{ backgroundColor: currentTire.color, color: currentTire.textColor }}>
          {currentTire.short}
        </span>
      </div>

      {/* Telemetry Gauges: Tire Life, Tire Temp, Fuel, ERS */}
      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px]">
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>TIRE</span><span className={tireLife < 28 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{tireLife}%</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full ${tireLife < 28 ? 'bg-rose-500' : tireLife < 55 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${tireLife}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>TEMP</span><span className={`${tempStatus.color} font-bold`}>{Math.round(telemetry.tireTemp)}°</span></div>
          <div className={`text-[9px] font-bold ${tempStatus.color}`}>{tempStatus.label} WINDOW</div>
        </div>

        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>FUEL</span><span className="text-cyan-300 font-bold">{telemetry.fuelKg.toFixed(0)}kg</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (telemetry.fuelKg / 110) * 100)}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>ERS</span><span className="text-sky-300 font-bold">{Math.round(telemetry.ersBattery)}%</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-sky-400" style={{ width: `${Math.round(telemetry.ersBattery)}%` }} />
          </div>
        </div>
      </div>

      {/* 3-Column Tactical Controls: Pace, ERS, Racecraft Stance */}
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pace</div>
          <div className="grid grid-cols-3 gap-0.5">
            {PACE_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                disabled={telemetry.dnf}
                onClick={() => onChangePace(driver.id, mode)}
                className={`rounded border py-1 text-[10px] font-bold transition ${
                  telemetry.paceMode === mode ? 'border-amber-500 bg-amber-500/20 text-amber-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">ERS Battery</div>
          <div className="grid grid-cols-3 gap-0.5">
            {ERS_MODES.map(({ mode, label }) => (
              <button
                key={mode}
                disabled={telemetry.dnf}
                onClick={() => onChangeErs(driver.id, mode)}
                className={`rounded border py-1 text-[10px] font-bold transition ${
                  telemetry.ersMode === mode ? 'border-sky-500 bg-sky-500/20 text-sky-200' : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Battle Stance</div>
          <div className="grid grid-cols-3 gap-0.5">
            {STANCES.map(({ mode, label }) => (
              <button
                key={mode}
                disabled={telemetry.dnf}
                onClick={() => onChangeStance(driver.id, mode)}
                className={`rounded border py-1 text-[10px] font-bold transition ${
                  telemetry.battleStance === mode
                    ? mode === 'AGGRESSIVE'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                      : mode === 'DEFEND'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                        : 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pit Strategy & Compound Selection */}
      <div className="mt-2.5 border-t border-slate-800/80 pt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pit Window & Next Tire</span>
          <button
            disabled={telemetry.dnf || telemetry.inPit}
            onClick={() => onTogglePit(driver.id)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
              telemetry.inPit
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400 cursor-wait'
                : telemetry.pitRequested
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            } disabled:opacity-40`}
          >
            {telemetry.inPit ? 'IN BOX...' : telemetry.pitRequested ? `BOXING (${TIRE_SPECS[telemetry.nextTire].short}) — CANCEL` : 'BOX THIS LAP'}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {COMPOUNDS.map((comp) => {
            const spec = TIRE_SPECS[comp];
            const selected = telemetry.nextTire === comp;
            return (
              <button
                key={comp}
                disabled={telemetry.dnf}
                onClick={() => onTogglePit(driver.id, comp)}
                className={`flex flex-col items-center justify-center rounded-lg border py-1 font-mono text-xs transition ${
                  selected ? 'border-amber-400 bg-slate-800 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-950/60 opacity-75 hover:opacity-100'
                } disabled:opacity-30`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black" style={{ backgroundColor: spec.color, color: spec.textColor }}>
                  {spec.short}
                </span>
                <span className="mt-0.5 text-[9px] text-slate-300">{comp}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GarageView({ season, round, teams, drivers, playerTeam, nextTrack, onUpgradeCar, onProceedToRace, onResetChampionship }) {
  const [standingsTab, setStandingsTab] = useState('DRIVERS');
  const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points || b.pace - a.pace);
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const playerDrivers = drivers.filter((d) => d.teamId === playerTeam.id);

  const getUpgradeCost = (currentVal) => Number((3.5 + Math.max(0, currentVal - 65) * 0.25).toFixed(1));

  const UPGRADE_META = [
    { key: 'aero', title: 'Aerodynamics Package', subtitle: 'Downforce, DRS speed & reduced dirty-air wake loss', accent: 'bg-cyan-500' },
    { key: 'powertrain', title: 'Hybrid Powertrain & ERS', subtitle: 'ICE power & electrical deployment surge', accent: 'bg-rose-500' },
    { key: 'chassis', title: 'Monocoque & Suspension', subtitle: 'Mechanical grip, braking stability & kerb compliance', accent: 'bg-amber-500' },
    { key: 'reliability', title: 'Component Reliability', subtitle: 'Engine & gearbox durability under Attack mode', accent: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-400">
            <span>Global Open-Wheel Series</span><span>·</span><span>Season {season} — Round {round}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">{playerTeam.name} — Engineering HQ</h1>
          <p className="mt-1 text-sm text-slate-400">
            Next Event: <span className="font-semibold text-slate-200">{nextTrack.name}</span> ({nextTrack.country} · {nextTrack.lengthKm} km · {nextTrack.totalLaps} Laps)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-mono">
            <div className="text-[10px] uppercase text-emerald-300/80">R&D Treasury</div>
            <div className="text-xl font-black text-emerald-400 tabular-nums">${playerTeam.budget.toFixed(1)}M</div>
          </div>
          <button onClick={onProceedToRace} className="rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
            Travel to Circuit →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Chassis & Powertrain R&D Department</h2>
              <span className="font-mono text-xs text-slate-400">+2 Rating per Spec</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {UPGRADE_META.map((item) => {
                const val = playerTeam.car[item.key];
                const cost = getUpgradeCost(val);
                const maxed = val >= 99;
                const canAfford = playerTeam.budget >= cost && !maxed;
                return (
                  <div key={item.key} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{item.title}</span>
                        <span className="font-mono text-sm font-black text-white tabular-nums">{val}/99</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className={`h-full ${item.accent} transition-all duration-300`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => onUpgradeCar(item.key, cost)}
                      className={`mt-4 w-full rounded-lg py-2 font-mono text-xs font-bold uppercase transition ${
                        canAfford ? 'bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-slate-700' : 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed'
                      }`}
                    >
                      {maxed ? 'MAX SPEC REACHED' : `DEVELOP SPEC ($${cost.toFixed(1)}M)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Contracted Race Drivers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {playerDrivers.map((drv) => (
                <div key={drv.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="font-sans text-base font-bold text-white">{drv.name}</div>
                      <div className="text-xs text-amber-400">Car #{drv.carNumber} · {drv.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">POINTS</div>
                      <div className="text-lg font-black text-slate-100">{drv.points}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">PACE</span><span className="font-bold text-slate-100">{drv.pace}</span></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">RACECRAFT</span><span className="font-bold text-emerald-300">{drv.racecraft}</span></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">TIRE</span><span className="font-bold text-slate-100">{drv.tireManagement}</span></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">WET</span><span className="font-bold text-cyan-300">{drv.wetSkill}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">GOWS Standings</h2>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button onClick={() => setStandingsTab('DRIVERS')} className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${standingsTab === 'DRIVERS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>Drivers</button>
                <button onClick={() => setStandingsTab('CONSTRUCTORS')} className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${standingsTab === 'CONSTRUCTORS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>Constructors</button>
              </div>
            </div>

            {standingsTab === 'DRIVERS' ? (
              <table className="w-full text-left font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="py-2">#</th><th className="py-2">Driver</th><th className="py-2">Team</th><th className="py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedDrivers.map((d, idx) => {
                    const team = teams.find((t) => t.id === d.teamId);
                    return (
                      <tr key={d.id} className={team.isPlayer ? 'bg-amber-500/10 text-amber-200' : 'text-slate-200'}>
                        <td className="py-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 font-sans font-semibold">{d.name}</td>
                        <td className="py-2"><span className="inline-flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.primaryColor }} />{team.shortName}</span></td>
                        <td className="py-2 text-right font-bold">{d.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="py-2">#</th><th className="py-2">Constructor</th><th className="py-2 text-right">Car Rating</th><th className="py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedTeams.map((t, idx) => {
                    const avgCar = Math.round((t.car.aero + t.car.powertrain + t.car.chassis + t.car.reliability) / 4);
                    return (
                      <tr key={t.id} className={t.isPlayer ? 'bg-amber-500/10 text-amber-200' : 'text-slate-200'}>
                        <td className="py-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 font-sans font-semibold"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: t.primaryColor }} />{t.name}</span></td>
                        <td className="py-2 text-right text-slate-400">{avgCar}</td>
                        <td className="py-2 text-right font-bold">{t.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Auto-saved to browser storage</span>
            <button onClick={onResetChampionship} className="text-rose-400/80 hover:text-rose-300 underline">Reset Career</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreRaceSetup({ round, track, playerTeam, playerDrivers, initialWeather, forecast, onBackToGarage, onStartRace }) {
  const recommendedFuel = Math.min(110, Math.round(track.totalLaps * 2.15 + 3));
  const defaultTire = initialWeather === 'HEAVY_RAIN' ? 'WET' : initialWeather === 'LIGHT_RAIN' ? 'INTER' : 'MEDIUM';
  const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTER', 'WET'];

  const [setups, setSetups] = useState(() => {
    const map = {};
    playerDrivers.forEach((d) => {
      map[d.id] = { driverId: d.id, startingTire: defaultTire, startingFuelKg: recommendedFuel };
    });
    return map;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl md:flex-row md:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">Round {round} · Pre-Race Parc Fermé & Strategy Briefing</div>
          <h1 className="mt-1 text-2xl font-black text-white">{track.name} ({track.country})</h1>
          <p className="mt-1 font-mono text-xs text-slate-400">Distance: {track.totalLaps} Laps ({(track.lengthKm * track.totalLaps).toFixed(1)} km) · Air {track.airTempC}°C · Pit Loss: {track.pitLossSec}s</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBackToGarage} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-700">← Back to HQ</button>
          <button onClick={() => onStartRace(Object.values(setups))} className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400">Go to Starting Grid →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">Circuit Telemetry Demands vs. {playerTeam.shortName} Car</h2>
          <div className="space-y-3 font-mono text-xs">
            {[
              { label: 'Aero Downforce Demand', demand: track.aeroDemand, carVal: playerTeam.car.aero },
              { label: 'Powertrain Sensitivity', demand: track.powerDemand, carVal: playerTeam.car.powertrain },
              { label: 'Chassis & Kerb Demand', demand: track.chassisDemand, carVal: playerTeam.car.chassis },
            ].map((row) => (
              <div key={row.label} className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">{row.label}</span>
                  <span className="text-amber-300 font-bold">Demand {Math.round(row.demand * 100)}% · Car {row.carVal}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${Math.round(row.demand * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">Meteorological Radar Timeline</h2>
          <div className="grid grid-cols-5 gap-2 font-mono text-xs">
            {forecast.map((cond, idx) => {
              const isRain = cond === 'LIGHT_RAIN' || cond === 'HEAVY_RAIN';
              return (
                <div key={idx} className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center ${idx === 0 ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950/70'}`}>
                  <span className="text-[10px] text-slate-400">{idx === 0 ? 'LIGHTS OUT' : `STINT +${idx}`}</span>
                  <span className={`mt-2 inline-block h-3 w-3 rounded-full ${cond === 'HEAVY_RAIN' ? 'bg-blue-500' : cond === 'LIGHT_RAIN' ? 'bg-cyan-400' : cond === 'OVERCAST' ? 'bg-slate-400' : 'bg-amber-400'}`} />
                  <span className={`mt-2 text-[11px] font-bold ${isRain ? 'text-cyan-300' : 'text-slate-200'}`}>{cond.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {playerDrivers.map((drv) => {
          const setup = setups[drv.id];
          const estLapsOfFuel = (setup.startingFuelKg / 2.05).toFixed(1);
          return (
            <div key={drv.id} className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div><span className="font-mono text-xs text-amber-400">#{drv.carNumber}</span><h3 className="text-lg font-bold text-white">{drv.name}</h3></div>
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-slate-200">{drv.code}</span>
              </div>
              <div className="mt-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Starting Tire Compound</div>
                <div className="grid grid-cols-5 gap-2">
                  {COMPOUNDS.map((comp) => {
                    const spec = TIRE_SPECS[comp];
                    const selected = setup.startingTire === comp;
                    return (
                      <button
                        key={comp}
                        onClick={() => setSetups((p) => ({ ...p, [drv.id]: { ...p[drv.id], startingTire: comp } }))}
                        className={`flex flex-col items-center rounded-xl border p-2.5 font-mono text-xs transition ${selected ? 'border-amber-400 bg-slate-800 ring-2 ring-amber-400/40' : 'border-slate-800 bg-slate-950/70 opacity-75 hover:opacity-100'}`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black" style={{ backgroundColor: spec.color, color: spec.textColor }}>{spec.short}</span>
                        <span className="mt-1.5 font-bold text-slate-200">{comp}</span>
                        <span className="text-[10px] text-slate-400">~{Math.round(85 / (spec.degPerLap * track.tireAbrasion))}L</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between font-mono text-xs mb-1.5">
                  <span className="font-bold uppercase text-slate-400">Starting Fuel Load</span>
                  <span className="text-cyan-300 font-bold">{setup.startingFuelKg} kg (~{estLapsOfFuel} Laps)</span>
                </div>
                <input
                  type="range" min={25} max={110} value={setup.startingFuelKg}
                  onChange={(e) => setSetups((p) => ({ ...p, [drv.id]: { ...p[drv.id], startingFuelKg: Number(e.target.value) } }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RaceLog({ logs }) {
  const badgeStyle = (cat) => {
    switch (cat) {
      case 'WEATHER': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'PIT': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'OVERTAKE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'BATTLE': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'MISTAKE': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'INCIDENT': return 'bg-rose-500/25 text-rose-300 border-rose-500/50';
      case 'FLAG': return 'bg-yellow-500/25 text-yellow-200 border-yellow-500/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-950/60 px-3.5 py-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Race Control, Battles & Pit-Wall Feed</span>
        <span className="font-mono text-[11px] text-slate-500">{logs.length} events</span>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/50 px-3.5 py-1 font-mono text-xs">
        {logs.map((entry) => (
          <div key={entry.id} className="flex items-start gap-2.5 py-1.5">
            <span className="shrink-0 text-slate-500 tabular-nums">L{entry.lap}</span>
            <span className={`shrink-0 rounded border px-1.5 text-[9px] font-bold ${badgeStyle(entry.category)}`}>{entry.category}</span>
            <span className="text-slate-200 leading-snug">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostRacePodium({ raceState, teams, drivers, playerTeamId, onClaimAndReturnToHQ }) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));
  const podium = raceState.cars.slice(0, 3);

  let playerPointsEarned = 0;
  let playerPrizeEarned = 0;
  raceState.cars.forEach((car, idx) => {
    if (car.teamId === playerTeamId) {
      playerPointsEarned += car.dnf ? 0 : POINTS_SYSTEM[idx] ?? 0;
      playerPrizeEarned += PRIZE_MONEY_MILLIONS[idx] ?? 1.0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-amber-400">Official Classification · Round {raceState.roundNumber}</div>
            <h1 className="mt-1 text-2xl font-black text-white">{raceState.track.name} — Post-Race Podium</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono">
              <div className="text-[10px] uppercase text-amber-300/80">Team Points</div>
              <div className="text-lg font-black text-amber-300">+{playerPointsEarned} PTS</div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-mono">
              <div className="text-[10px] uppercase text-emerald-300/80">Prize Payout</div>
              <div className="text-lg font-black text-emerald-400">+${playerPrizeEarned.toFixed(1)}M</div>
            </div>
            <button onClick={onClaimAndReturnToHQ} className="rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400">
              Collect Payout & Return to HQ →
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {podium.map((car, idx) => {
            const drv = driverMap.get(car.driverId);
            const team = teamMap.get(car.teamId);
            const medalColors = ['border-amber-400 bg-amber-500/10', 'border-slate-400 bg-slate-400/10', 'border-orange-600 bg-orange-600/10'];
            return (
              <div key={car.driverId} className={`rounded-2xl border p-5 ${medalColors[idx]}`}>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-2xl font-black text-white">P{idx + 1}</span>
                  <span className="rounded bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-amber-300">+{POINTS_SYSTEM[idx]} PTS</span>
                </div>
                <div className="mt-3 text-lg font-black text-white">{drv.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.primaryColor }} />{team.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs tabular-nums">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2.5 px-3">Pos</th><th className="py-2.5 px-3">Driver</th><th className="py-2.5 px-3">Constructor</th>
                <th className="py-2.5 px-3 text-right">Stops</th><th className="py-2.5 px-3 text-right">Gap / Status</th>
                <th className="py-2.5 px-3 text-right">Points</th><th className="py-2.5 px-3 text-right">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {raceState.cars.map((car, idx) => {
                const drv = driverMap.get(car.driverId);
                const team = teamMap.get(car.teamId);
                const isPlayer = team.id === playerTeamId;
                const pts = car.dnf ? 0 : POINTS_SYSTEM[idx] ?? 0;
                const prize = PRIZE_MONEY_MILLIONS[idx] ?? 1.0;
                return (
                  <tr key={car.driverId} className={isPlayer ? 'bg-amber-500/10 text-amber-200' : 'text-slate-200'}>
                    <td className="py-2 px-3 font-bold">{car.dnf ? 'DNF' : idx + 1}</td>
                    <td className="py-2 px-3 font-sans font-semibold">{drv.name}</td>
                    <td className="py-2 px-3 text-slate-400">{team.name}</td>
                    <td className="py-2 px-3 text-right">{car.pitStopsCount}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{car.dnf ? car.dnfReason : idx === 0 ? 'WINNER' : `+${car.gapToLeaderSec.toFixed(2)}s`}</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-300">{pts > 0 ? `+${pts}` : '0'}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">+${prize.toFixed(1)}M</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN APPLICATION
// ==========================================
const STORAGE_KEY = 'apex_grid_manager_save_v3';

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.drivers)) return parsed;
    }
  } catch {}
  return { season: 1, round: 1, teams: INITIAL_TEAMS, drivers: INITIAL_DRIVERS, playerTeamId: 'apex-works' };
}

function App() {
  const [career, setCareer] = useState(loadSavedState);
  const [phase, setPhase] = useState('GARAGE');
  const [simSpeed, setSimSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [cameraMode, setCameraMode] = useState('OVERVIEW'); // OVERVIEW | BATTLE
  const [focusDriverId, setFocusDriverId] = useState(null);
  const [raceState, setRaceState] = useState(null);
  const fxQueueRef = useRef([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(career)); } catch {}
  }, [career]);

  const playerTeam = useMemo(() => career.teams.find((t) => t.id === career.playerTeamId) || career.teams[0], [career]);
  const playerDrivers = useMemo(() => career.drivers.filter((d) => d.teamId === playerTeam.id), [career, playerTeam]);
  const currentTrack = useMemo(() => generateProceduralTrack(career.season * 100 + career.round), [career.season, career.round]);
  const preRaceWeather = useMemo(() => generateInitialWeather(career.season * 100 + career.round), [career.season, career.round]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  useEffect(() => {
    const active = phase === 'RACING' && raceState && !raceState.finished;
    const anyErs = Boolean(raceState?.cars.some((c) => c.teamId === playerTeam.id && c.ersMode === 'OVERTAKE' && c.ersBattery > 2));
    soundEngine.updateEngineHum(active, simSpeed, raceState?.flagStatus || 'GREEN', anyErs);
    return () => {
      if (!active) soundEngine.stopEngineHum();
    };
  }, [phase, simSpeed, raceState?.finished, raceState?.flagStatus, muted]);

  const handleUpgradeCar = (stat, cost) => {
    if (playerTeam.budget < cost) return;
    soundEngine.playUpgradeConfirm();
    setCareer((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id !== playerTeam.id ? t : { ...t, budget: Number((t.budget - cost).toFixed(1)), car: { ...t.car, [stat]: Math.min(99, t.car[stat] + 2) } }
      ),
    }));
  };

  const handleResetChampionship = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCareer({ season: 1, round: 1, teams: INITIAL_TEAMS, drivers: INITIAL_DRIVERS, playerTeamId: 'apex-works' });
    setPhase('GARAGE');
    setRaceState(null);
  };

  const handleStartRace = (setups) => {
    soundEngine.playRadioBeep();
    fxQueueRef.current = [{ type: 'CLEAR_DEBRIS' }];
    const initial = createInitialRaceState(career.round, currentTrack, career.teams, career.drivers, setups, preRaceWeather.initial, preRaceWeather.forecast);
    setRaceState(initial);
    setFocusDriverId(playerDrivers[0]?.id || null);
    setCameraMode('OVERVIEW');
    setSimSpeed(1);
    setPhase('RACING');
  };

  useEffect(() => {
    if (phase !== 'RACING' || !raceState || raceState.finished || simSpeed === 0) return;
    const tickIntervalMs = 50;
    const interval = window.setInterval(() => {
      setRaceState((prev) => {
        if (!prev || prev.finished) return prev;
        const subSteps = simSpeed >= 16 ? 4 : simSpeed >= 8 ? 2 : 1;
        const totalDt = (tickIntervalMs / 1000) * 2.8 * simSpeed;
        const stepDt = totalDt / subSteps;

        let curr = prev;
        for (let s = 0; s < subSteps; s++) {
          if (curr.finished) break;
          const { nextState, events } = stepRaceSimulation(curr, stepDt, career.teams, career.drivers, playerTeam.id, fxQueueRef.current);
          curr = nextState;
          if (events.flagChanged) soundEngine.playFlagAlert(events.isRedFlag);
          else if (events.crashImpact) soundEngine.playCrashImpact();
          else if (events.tireScreech && simSpeed <= 8) soundEngine.playTireScreech();
          else if (events.weatherChanged) soundEngine.playWeatherAlert();
          else if (events.pitStopSound) soundEngine.playPitAirGun();
          else if (events.overtakeEvent) soundEngine.playOvertakeWhoosh();
          else if (events.radioAlert) soundEngine.playRadioBeep();
          else if (events.playerLapCompleted && simSpeed <= 4) soundEngine.playTelemetryTick();
        }
        return curr;
      });
    }, tickIntervalMs);
    return () => window.clearInterval(interval);
  }, [phase, raceState?.finished, simSpeed, career.teams, career.drivers, playerTeam.id]);

  const handleChangePace = (driverId, mode) => {
    soundEngine.playTelemetryTick();
    setRaceState((prev) => !prev ? prev : { ...prev, cars: prev.cars.map((c) => (c.driverId === driverId ? { ...c, paceMode: mode } : c)) });
  };

  const handleChangeErs = (driverId, mode) => {
    soundEngine.playTelemetryTick();
    setRaceState((prev) => !prev ? prev : { ...prev, cars: prev.cars.map((c) => (c.driverId === driverId ? { ...c, ersMode: mode } : c)) });
  };

  const handleChangeStance = (driverId, stance) => {
    soundEngine.playTelemetryTick();
    setRaceState((prev) => !prev ? prev : { ...prev, cars: prev.cars.map((c) => (c.driverId === driverId ? { ...c, battleStance: stance } : c)) });
  };

  const handleTogglePit = (driverId, compound) => {
    soundEngine.playRadioBeep();
    setRaceState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cars: prev.cars.map((c) => {
          if (c.driverId !== driverId) return c;
          if (compound) return { ...c, nextTire: compound, pitRequested: true };
          return { ...c, pitRequested: !c.pitRequested };
        }),
      };
    });
  };

  const handleSelectFocus = (driverId) => {
    setFocusDriverId(driverId);
    setCameraMode('BATTLE');
  };

  const handleClaimAndReturnToHQ = () => {
    if (!raceState) return;
    soundEngine.playUpgradeConfirm();
    const driverPointsGain = new Map();
    const teamPointsGain = new Map();
    const teamPrizeGain = new Map();

    raceState.cars.forEach((car, idx) => {
      const pts = car.dnf ? 0 : POINTS_SYSTEM[idx] ?? 0;
      const prize = PRIZE_MONEY_MILLIONS[idx] ?? 1.0;
      driverPointsGain.set(car.driverId, (driverPointsGain.get(car.driverId) || 0) + pts);
      teamPointsGain.set(car.teamId, (teamPointsGain.get(car.teamId) || 0) + pts);
      teamPrizeGain.set(car.teamId, (teamPrizeGain.get(car.teamId) || 0) + prize);
    });

    setCareer((prev) => {
      const nextRound = prev.round >= 10 ? 1 : prev.round + 1;
      const nextSeason = prev.round >= 10 ? prev.season + 1 : prev.season;
      return {
        ...prev,
        season: nextSeason,
        round: nextRound,
        drivers: prev.drivers.map((d) => ({ ...d, points: prev.round >= 10 ? 0 : d.points + (driverPointsGain.get(d.id) || 0) })),
        teams: prev.teams.map((t) => {
          const earnedPrize = teamPrizeGain.get(t.id) || 1.5;
          const aiAutoUpgrade = !t.isPlayer && Math.random() < 0.55 ? 1 : 0;
          return {
            ...t,
            budget: Number((t.budget + earnedPrize).toFixed(1)),
            points: prev.round >= 10 ? 0 : t.points + (teamPointsGain.get(t.id) || 0),
            car: aiAutoUpgrade
              ? { aero: Math.min(98, t.car.aero + 1), powertrain: Math.min(98, t.car.powertrain + 1), chassis: Math.min(98, t.car.chassis + 1), reliability: Math.min(98, t.car.reliability + 1) }
              : t.car,
          };
        }),
      };
    });

    setRaceState(null);
    setPhase('GARAGE');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-mono text-sm font-black text-slate-950 shadow">AG</div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white">APEX GRID MANAGER</span>
              <span className="hidden sm:inline-block rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">GOWS 2026</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-xs">
            {['GARAGE', 'PRE_RACE', 'RACING', 'POST_RACE'].map((p) => (
              <span key={p} className={`rounded-md px-2.5 py-1 ${phase === p ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-500'}`}>
                {p.replace('_', ' ')}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="hidden sm:inline text-slate-400">{playerTeam.shortName}: <strong className="text-emerald-400">${playerTeam.budget.toFixed(1)}M</strong></span>
            <button onClick={toggleMute} className={`rounded-lg border px-3 py-1.5 font-bold transition ${muted ? 'border-slate-700 bg-slate-900 text-slate-400' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
              {muted ? 'AUDIO: MUTED' : 'AUDIO: ON'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5">
        {phase === 'GARAGE' && (
          <GarageView
            season={career.season} round={career.round} teams={career.teams} drivers={career.drivers}
            playerTeam={playerTeam} nextTrack={currentTrack} onUpgradeCar={handleUpgradeCar}
            onProceedToRace={() => setPhase('PRE_RACE')} onResetChampionship={handleResetChampionship}
          />
        )}

        {phase === 'PRE_RACE' && (
          <PreRaceSetup
            round={career.round} track={currentTrack} playerTeam={playerTeam} playerDrivers={playerDrivers}
            initialWeather={preRaceWeather.initial} forecast={preRaceWeather.forecast}
            onBackToGarage={() => setPhase('GARAGE')} onStartRace={handleStartRace}
          />
        )}

        {phase === 'RACING' && raceState && (
          <div className="space-y-3.5">
            {/* Broadcast Race Control, Camera & Speed Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-2.5 shadow-lg">
              <div className="flex flex-wrap items-center gap-3.5 font-mono text-xs">
                <div>
                  <span className="text-slate-400">FLAG: </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-bold ${
                      raceState.flagStatus === 'RED_FLAG'
                        ? 'bg-rose-600 text-white'
                        : raceState.flagStatus === 'SC' || raceState.flagStatus === 'VSC'
                          ? 'bg-yellow-400 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {raceState.flagStatus.replace('_', ' ')}
                  </span>
                </div>
                <div><span className="text-slate-400">SKY: </span><span className={`font-bold ${raceState.weather.includes('RAIN') ? 'text-cyan-300' : 'text-amber-300'}`}>{raceState.weather.replace('_', ' ')}</span></div>
                <div><span className="text-slate-400">WET: </span><span className="font-bold text-cyan-400 tabular-nums">{Math.round(raceState.trackWetness)}%</span></div>

                {/* Camera Toggle */}
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                  <button
                    onClick={() => setCameraMode('OVERVIEW')}
                    className={`rounded px-2 py-1 text-[10px] font-bold transition ${cameraMode === 'OVERVIEW' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    FULL TRACK
                  </button>
                  <button
                    onClick={() => setCameraMode('BATTLE')}
                    className={`rounded px-2 py-1 text-[10px] font-bold transition ${cameraMode === 'BATTLE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    BATTLE ZOOM
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                {[
                  { spd: 0, label: 'PAUSE' },
                  { spd: 1, label: '1X' },
                  { spd: 2, label: '2X' },
                  { spd: 4, label: '4X' },
                  { spd: 8, label: '8X' },
                  { spd: 16, label: '16X' },
                  { spd: 32, label: '32X' },
                ].map(({ spd, label }) => (
                  <button key={spd} onClick={() => setSimSpeed(spd)} className={`rounded-lg px-2.5 py-1 font-bold transition ${simSpeed === spd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {label}
                  </button>
                ))}
                {raceState.finished && (
                  <button onClick={() => setPhase('POST_RACE')} className="ml-2 rounded-lg bg-emerald-500 px-4 py-1 font-black uppercase text-slate-950 animate-pulse hover:bg-emerald-400">
                    Proceed to Podium →
                  </button>
                )}
              </div>
            </div>

            {/* Broadcast Live Battle Monitor */}
            <BattleMonitor raceState={raceState} teams={career.teams} drivers={career.drivers} playerTeamId={playerTeam.id} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <TimingTower
                  raceState={raceState} teams={career.teams} drivers={career.drivers}
                  playerTeamId={playerTeam.id} focusDriverId={focusDriverId} onSelectFocus={handleSelectFocus}
                />
              </div>
              <div className="space-y-4 lg:col-span-8">
                <TrackCanvas
                  raceState={raceState} teams={career.teams} drivers={career.drivers}
                  playerTeamId={playerTeam.id} fxQueueRef={fxQueueRef} cameraMode={cameraMode} focusDriverId={focusDriverId}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {playerDrivers.map((drv) => {
                    const telemetry = raceState.cars.find((c) => c.driverId === drv.id);
                    return (
                      <DriverPitWall
                        key={drv.id}
                        driver={drv}
                        telemetry={telemetry}
                        onChangePace={handleChangePace}
                        onChangeErs={handleChangeErs}
                        onChangeStance={handleChangeStance}
                        onTogglePit={handleTogglePit}
                      />
                    );
                  })}
                </div>
                <RaceLog logs={raceState.logs} />
              </div>
            </div>
          </div>
        )}

        {phase === 'POST_RACE' && raceState && (
          <PostRacePodium raceState={raceState} teams={career.teams} drivers={career.drivers} playerTeamId={playerTeam.id} onClaimAndReturnToHQ={handleClaimAndReturnToHQ} />
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);