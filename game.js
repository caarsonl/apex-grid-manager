const { useState, useEffect, useMemo, useRef } = React;

// ==========================================
// 1. SERIES DATA & CONSTANTS
// ==========================================
const TIRE_SPECS = {
  SOFT: { label: 'Soft C4', short: 'S', color: '#ef4444', textColor: '#ffffff', baseGrip: 1.045, degPerLap: 4.3, optimalWetMin: 0, optimalWetMax: 18 },
  MEDIUM: { label: 'Medium C3', short: 'M', color: '#eab308', textColor: '#0f172a', baseGrip: 1.02, degPerLap: 2.6, optimalWetMin: 0, optimalWetMax: 20 },
  HARD: { label: 'Hard C2', short: 'H', color: '#f8fafc', textColor: '#0f172a', baseGrip: 0.995, degPerLap: 1.55, optimalWetMin: 0, optimalWetMax: 22 },
  INTER: { label: 'Intermediate', short: 'I', color: '#22c55e', textColor: '#052e16', baseGrip: 0.985, degPerLap: 2.4, optimalWetMin: 18, optimalWetMax: 65 },
  WET: { label: 'Full Wet', short: 'W', color: '#3b82f6', textColor: '#ffffff', baseGrip: 0.955, degPerLap: 2.0, optimalWetMin: 60, optimalWetMax: 100 },
};

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0];
const PRIZE_MONEY_MILLIONS = [18, 14, 11, 9, 7.5, 6, 5, 4, 3, 2.5, 2, 1.5];

const INITIAL_TEAMS = [
  { id: 'apex-works', name: 'Apex Dynamics Racing', shortName: 'APEX', primaryColor: '#f59e0b', secondaryColor: '#1e293b', isPlayer: true, budget: 24.0, car: { aero: 72, powertrain: 70, chassis: 71, reliability: 74 }, points: 0 },
  { id: 'valkyrie-gp', name: 'Valkyrie Aero Engineering', shortName: 'VALK', primaryColor: '#06b6d4', secondaryColor: '#0f172a', isPlayer: false, budget: 35.0, car: { aero: 86, powertrain: 84, chassis: 85, reliability: 82 }, points: 0 },
  { id: 'solaris-motorsport', name: 'Solaris Scuderia', shortName: 'SOLR', primaryColor: '#ef4444', secondaryColor: '#450a0a', isPlayer: false, budget: 33.0, car: { aero: 83, powertrain: 87, chassis: 81, reliability: 79 }, points: 0 },
  { id: 'hyperion-works', name: 'Hyperion Powertrains', shortName: 'HYPR', primaryColor: '#10b981', secondaryColor: '#064e3b', isPlayer: false, budget: 28.0, car: { aero: 78, powertrain: 80, chassis: 77, reliability: 84 }, points: 0 },
  { id: 'borealis-racing', name: 'Borealis Composite', shortName: 'BORE', primaryColor: '#8b5cf6', secondaryColor: '#2e1065', isPlayer: false, budget: 22.0, car: { aero: 73, powertrain: 72, chassis: 75, reliability: 76 }, points: 0 },
  { id: 'kestrel-autosport', name: 'Kestrel Autosport', shortName: 'KEST', primaryColor: '#ec4899', secondaryColor: '#500724', isPlayer: false, budget: 18.0, car: { aero: 67, powertrain: 69, chassis: 68, reliability: 72 }, points: 0 },
];

const INITIAL_DRIVERS = [
  { id: 'drv-1', name: 'Callum Vance', code: 'VAN', teamId: 'apex-works', carNumber: 14, pace: 82, consistency: 80, tireManagement: 79, wetSkill: 84, points: 0 },
  { id: 'drv-2', name: 'Sora Takahashi', code: 'TAK', teamId: 'apex-works', carNumber: 27, pace: 79, consistency: 83, tireManagement: 85, wetSkill: 78, points: 0 },
  { id: 'drv-3', name: 'Henrik Lindqvist', code: 'LIN', teamId: 'valkyrie-gp', carNumber: 1, pace: 92, consistency: 90, tireManagement: 88, wetSkill: 91, points: 0 },
  { id: 'drv-4', name: 'Mateo Castellanos', code: 'CAS', teamId: 'valkyrie-gp', carNumber: 8, pace: 86, consistency: 84, tireManagement: 83, wetSkill: 82, points: 0 },
  { id: 'drv-5', name: 'Lorenzo Bellini', code: 'BEL', teamId: 'solaris-motorsport', carNumber: 16, pace: 90, consistency: 85, tireManagement: 84, wetSkill: 87, points: 0 },
  { id: 'drv-6', name: 'Julian Mercer', code: 'MER', teamId: 'solaris-motorsport', carNumber: 55, pace: 85, consistency: 87, tireManagement: 86, wetSkill: 85, points: 0 },
  { id: 'drv-7', name: 'Kieran Gallagher', code: 'GAL', teamId: 'hyperion-works', carNumber: 4, pace: 84, consistency: 82, tireManagement: 81, wetSkill: 88, points: 0 },
  { id: 'drv-8', name: 'Arjun Subramanian', code: 'SUB', teamId: 'hyperion-works', carNumber: 23, pace: 80, consistency: 84, tireManagement: 83, wetSkill: 79, points: 0 },
  { id: 'drv-9', name: 'Niko Kovalev', code: 'KOV', teamId: 'borealis-racing', carNumber: 31, pace: 78, consistency: 77, tireManagement: 80, wetSkill: 81, points: 0 },
  { id: 'drv-10', name: 'Elena Rostova', code: 'ROS', teamId: 'borealis-racing', carNumber: 77, pace: 77, consistency: 81, tireManagement: 79, wetSkill: 76, points: 0 },
  { id: 'drv-11', name: 'Tomasz Zielinski', code: 'ZIE', teamId: 'kestrel-autosport', carNumber: 20, pace: 75, consistency: 74, tireManagement: 76, wetSkill: 77, points: 0 },
  { id: 'drv-12', name: 'Lucas Moreau', code: 'MOR', teamId: 'kestrel-autosport', carNumber: 44, pace: 74, consistency: 76, tireManagement: 75, wetSkill: 74, points: 0 },
];

// ==========================================
// 2. WEB AUDIO SYNTHESIZER
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(mute) {
    this.muted = mute;
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
// 3. PROCEDURAL TRACK GENERATOR
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
    waypoints.push({ x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, curvature: 0, progress: i / uniformCount });
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

  return {
    seed, name, country, lengthKm, totalLaps, baseLapTimeSec,
    aeroDemand, powerDemand, chassisDemand, tireAbrasion, overtakeDifficulty, pitLossSec,
    waypoints: rotatedWaypoints, pitWaypoints, sectorSplits: [0.33, 0.67], startNormal,
  };
}

function sampleTrackPosition(track, progress, inPit, pitTimerSec) {
  const wrapped = ((progress % 1) + 1) % 1;
  if (inPit && track.pitWaypoints.length > 0) {
    const pitRatio = Math.min(1, Math.max(0, 1 - pitTimerSec / 22));
    const idxFloat = pitRatio * (track.pitWaypoints.length - 1);
    const i0 = Math.floor(idxFloat);
    const i1 = Math.min(track.pitWaypoints.length - 1, i0 + 1);
    const alpha = idxFloat - i0;
    const a = track.pitWaypoints[i0];
    const b = track.pitWaypoints[i1];
    return { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha };
  }
  const n = track.waypoints.length;
  const idxFloat = wrapped * n;
  const i0 = Math.floor(idxFloat) % n;
  const i1 = (i0 + 1) % n;
  const alpha = idxFloat - Math.floor(idxFloat);
  const a = track.waypoints[i0];
  const b = track.waypoints[i1];
  return { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha };
}

// ==========================================
// 4. SIMULATION ENGINE
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
      tire: startingTire, tireWear: 0, fuelKg: startingFuelKg,
      paceMode: 'STANDARD', inPit: false, pitTimerSec: 0, pitRequested: false,
      nextTire: startingTire, lastLapTimeSec: null, bestLapTimeSec: null,
      currentLapElapsedSec: 0, gapToLeaderSec: idx * 0.35, intervalSec: idx === 0 ? 0 : 0.35,
      pitStopsCount: 0, dnf: false,
    };
  });

  return {
    roundNumber, track, elapsedSec: 0, weather: initialWeather, forecast,
    nextWeatherChangeSec: track.baseLapTimeSec * 4.5, trackWetness: initialWetness,
    cars,
    logs: [{ id: 'log-start', lap: 1, timeSec: 0, category: 'RACE', message: `Lights out at ${track.name}! ${track.totalLaps} laps scheduled under ${initialWeather.replace('_', ' ')} skies.` }],
    fastestLapDriverId: null, fastestLapTimeSec: null, finished: false,
  };
}

function stepRaceSimulation(prev, dtSec, teams, drivers, playerTeamId) {
  if (prev.finished) {
    return { nextState: prev, events: { playerLapCompleted: false, weatherChanged: false, radioAlert: false } };
  }

  const track = prev.track;
  const elapsedSec = prev.elapsedSec + dtSec;
  let weather = prev.weather;
  let forecast = [...prev.forecast];
  let nextWeatherChangeSec = prev.nextWeatherChangeSec;
  let trackWetness = prev.trackWetness;
  const logs = [...prev.logs];
  let fastestLapDriverId = prev.fastestLapDriverId;
  let fastestLapTimeSec = prev.fastestLapTimeSec;

  const events = { playerLapCompleted: false, weatherChanged: false, radioAlert: false };
  const leaderCar = prev.cars.find((c) => !c.dnf) || prev.cars[0];
  const currentLeaderLap = leaderCar ? leaderCar.lap : 1;

  const pushLog = (category, message, lap = currentLeaderLap) => {
    logs.unshift({ id: `log-${elapsedSec.toFixed(2)}-${Math.random().toString(36).slice(2, 6)}`, lap, timeSec: elapsedSec, category, message });
    if (logs.length > 70) logs.pop();
  };

  if (elapsedSec >= nextWeatherChangeSec) {
    const nextW = forecast.shift() || 'DRY';
    const tail = forecast[forecast.length - 1] || nextW;
    const options = WEATHER_TRANSITIONS[tail];
    forecast.push(options[Math.floor(Math.random() * options.length)]);
    if (nextW !== weather) {
      weather = nextW;
      events.weatherChanged = true;
      pushLog('WEATHER', `Meteorology update: Conditions shifting to ${weather.replace('_', ' ')}.`);
    }
    nextWeatherChangeSec = elapsedSec + track.baseLapTimeSec * (3.5 + Math.random() * 3.5);
  }

  const targetWet = TARGET_WETNESS[weather];
  const wetRate = targetWet > trackWetness ? 1.45 : 0.75;
  if (trackWetness < targetWet) trackWetness = Math.min(targetWet, trackWetness + wetRate * dtSec);
  else if (trackWetness > targetWet) trackWetness = Math.max(targetWet, trackWetness - wetRate * dtSec);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));
  const prevOrder = prev.cars.map((c) => c.driverId);

  const updatedCars = prev.cars.map((car) => {
    if (car.dnf) return { ...car };
    const team = teamMap.get(car.teamId);
    const driver = driverMap.get(car.driverId);
    const isPlayer = team.id === playerTeamId;

    if (car.inPit) {
      const nextTimer = car.pitTimerSec - dtSec;
      if (nextTimer <= 0) {
        const refuelTarget = Math.min(110, Math.max(car.fuelKg, (track.totalLaps - car.lap + 1) * 2.15 + 3));
        if (isPlayer) {
          events.radioAlert = true;
          pushLog('PIT', `${driver.code} exits pit lane on fresh ${car.nextTire} tires.`, car.lap);
        }
        return {
          ...car, inPit: false, pitTimerSec: 0, pitRequested: false, tire: car.nextTire,
          tireWear: 0, fuelKg: refuelTarget, pitStopsCount: car.pitStopsCount + 1,
          lapProgress: 0.015, totalDistance: car.lap - 1 + 0.015,
        };
      }
      return { ...car, pitTimerSec: nextTimer, currentLapElapsedSec: car.currentLapElapsedSec + dtSec };
    }

    const tireSpec = TIRE_SPECS[car.tire];
    const demandSum = track.aeroDemand + track.powerDemand + track.chassisDemand;
    const weightedCar = (team.car.aero * track.aeroDemand + team.car.powertrain * track.powerDemand + team.car.chassis * track.chassisDemand) / demandSum;
    const carDeltaSec = (75 - weightedCar) * 0.085;

    const wetBlend = Math.min(1, trackWetness / 70);
    const effectiveSkill = driver.pace * (1 - wetBlend) + driver.wetSkill * wetBlend;
    const driverDeltaSec = (80 - effectiveSkill) * 0.065;

    const wearCliff = car.tireWear > 72 ? Math.pow((car.tireWear - 72) / 10, 1.85) * 1.4 : (car.tireWear / 100) * 1.35;
    const compoundDeltaSec = (1.02 - tireSpec.baseGrip) * 42 + wearCliff;

    let weatherMismatchSec = 0;
    if (trackWetness < tireSpec.optimalWetMin) weatherMismatchSec = (tireSpec.optimalWetMin - trackWetness) * 0.14;
    else if (trackWetness > tireSpec.optimalWetMax) weatherMismatchSec = (trackWetness - tireSpec.optimalWetMax) * 0.22;

    const fuelDeltaSec = car.fuelKg * 0.032;
    const paceDeltaSec = car.paceMode === 'ATTACK' ? -0.55 : car.paceMode === 'CONSERVE' ? 0.6 : 0;
    const outOfFuelPenalty = car.fuelKg <= 0.1 ? 9.5 : 0;
    const jitter = ((100 - driver.consistency) / 100) * (Math.random() - 0.5) * 0.35;

    const effectiveLapTime = Math.max(
      track.baseLapTimeSec * 0.82,
      track.baseLapTimeSec + carDeltaSec + driverDeltaSec + compoundDeltaSec + weatherMismatchSec + fuelDeltaSec + paceDeltaSec + outOfFuelPenalty + jitter
    );

    const progressDelta = dtSec / effectiveLapTime;
    const prevProgress = car.lapProgress;
    let newProgress = prevProgress + progressDelta;
    let newLap = car.lap;
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

    const paceWearMult = paceMode === 'ATTACK' ? 1.28 : paceMode === 'CONSERVE' ? 0.78 : 1.0;
    const mgmtFactor = 1.25 - (driver.tireManagement / 100) * 0.45;
    const dryOverheatMult = (car.tire === 'INTER' || car.tire === 'WET') && trackWetness < 15 ? 2.1 : 1.0;

    const tireWear = Math.min(100, car.tireWear + progressDelta * tireSpec.degPerLap * track.tireAbrasion * paceWearMult * mgmtFactor * dryOverheatMult);
    const fuelBurnMult = paceMode === 'ATTACK' ? 1.14 : paceMode === 'CONSERVE' ? 0.86 : 1.0;
    const fuelKg = Math.max(0, car.fuelKg - progressDelta * 2.05 * fuelBurnMult);

    if (!isPlayer) {
      const remainingLaps = track.totalLaps - newLap;
      const wrongTireForRain =
        (trackWetness >= 26 && (car.tire === 'SOFT' || car.tire === 'MEDIUM' || car.tire === 'HARD')) ||
        (trackWetness >= 68 && car.tire === 'INTER') ||
        (trackWetness <= 14 && (car.tire === 'INTER' || car.tire === 'WET'));

      if (!pitRequested && remainingLaps >= 2 && (tireWear >= 74 || wrongTireForRain)) {
        pitRequested = true;
        nextTire = chooseOptimalTireForWetness(trackWetness, remainingLaps);
      }
      if (tireWear > 65) paceMode = 'CONSERVE';
      else if (remainingLaps <= 5 && tireWear < 55 && fuelKg > remainingLaps * 2.2) paceMode = 'ATTACK';
      else paceMode = 'STANDARD';
    }

    if (pitRequested && prevProgress < 0.96 && newProgress >= 0.96 && newLap < track.totalLaps) {
      inPit = true;
      pitTimerSec = track.pitLossSec + (Math.random() - 0.5) * 1.2;
      if (isPlayer) {
        events.radioAlert = true;
        pushLog('PIT', `${driver.code} boxing for ${nextTire} tires.`, newLap);
      }
    }

    if (prevProgress < 1.0 && newProgress >= 1.0) {
      newProgress -= 1.0;
      if (prevProgress >= 0) {
        lastLapTimeSec = Number(currentLapElapsedSec.toFixed(3));
        if (bestLapTimeSec === null || lastLapTimeSec < bestLapTimeSec) bestLapTimeSec = lastLapTimeSec;
        if (fastestLapTimeSec === null || lastLapTimeSec < fastestLapTimeSec) {
          fastestLapTimeSec = lastLapTimeSec;
          fastestLapDriverId = driver.id;
        }
        if (isPlayer) events.playerLapCompleted = true;

        const attackStress = paceMode === 'ATTACK' ? 1.8 : 1.0;
        const failureProb = ((102 - team.car.reliability) / 100) * 0.0022 * attackStress;
        if (newLap > 2 && newLap < track.totalLaps && Math.random() < failureProb) {
          dnf = true;
          dnfReason = 'Power Unit Failure';
          events.radioAlert = isPlayer;
          pushLog('INCIDENT', `${driver.code} (${team.shortName}) retires: ${dnfReason}!`, newLap);
        }
      }
      newLap += 1;
      currentLapElapsedSec = 0;
    }

    return {
      ...car, lap: newLap, lapProgress: newProgress, totalDistance: newLap - 1 + newProgress,
      tireWear, fuelKg, paceMode, inPit, pitTimerSec, pitRequested, nextTire,
      lastLapTimeSec, bestLapTimeSec, currentLapElapsedSec, dnf, dnfReason,
    };
  });

  const sortedCars = [...updatedCars].sort((a, b) => {
    if (a.dnf && !b.dnf) return 1;
    if (!a.dnf && b.dnf) return -1;
    return b.totalDistance - a.totalDistance;
  });

  const leaderDist = sortedCars[0]?.totalDistance ?? 0;
  for (let i = 0; i < sortedCars.length; i++) {
    const car = sortedCars[i];
    car.position = i + 1;
    if (i === 0 || car.dnf) {
      car.gapToLeaderSec = 0;
      car.intervalSec = 0;
    } else {
      const ahead = sortedCars[i - 1];
      car.gapToLeaderSec = Number((Math.max(0, leaderDist - car.totalDistance) * track.baseLapTimeSec).toFixed(2));
      car.intervalSec = Number((Math.max(0, ahead.totalDistance - car.totalDistance) * track.baseLapTimeSec).toFixed(2));

      const prevIdx = prevOrder.indexOf(car.driverId);
      const aheadPrevIdx = prevOrder.indexOf(ahead.driverId);
      if (prevIdx > aheadPrevIdx && car.position <= 6 && !car.inPit && !ahead.inPit && car.lap > 1 && Math.random() < 0.35) {
        const d1 = driverMap.get(car.driverId);
        const d2 = driverMap.get(ahead.driverId);
        pushLog('OVERTAKE', `${d1.code} overtakes ${d2.code} for P${car.position}!`, car.lap);
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
    nextState: { ...prev, elapsedSec, weather, forecast, nextWeatherChangeSec, trackWetness, cars: sortedCars, logs, fastestLapDriverId, fastestLapTimeSec, finished },
    events,
  };
}

// ==========================================
// 5. UI COMPONENTS
// ==========================================
function TrackCanvas({ raceState, teams, drivers, playerTeamId }) {
  const canvasRef = useRef(null);
  const rainRef = useRef([]);

  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 140; i++) {
      drops.push({ x: Math.random() * 1000, y: Math.random() * 620, len: 8 + Math.random() * 10, speed: 6 + Math.random() * 7 });
    }
    rainRef.current = drops;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1000;
    const H = 620;
    const { track, cars, weather, trackWetness } = raceState;

    ctx.clearRect(0, 0, W, H);
    const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, 60, W * 0.5, H * 0.5, 620);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.22)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += 50) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += 50) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    const pts = track.waypoints;
    if (pts.length === 0) return;

    const traceMainLoop = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
    };

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    traceMainLoop();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 34;
    ctx.stroke();

    for (let i = 0; i < pts.length; i++) {
      if (pts[i].curvature > 0.14) {
        const next = pts[(i + 1) % pts.length];
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#f8fafc';
        ctx.lineWidth = 27;
        ctx.stroke();
      }
    }

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

    traceMainLoop();
    const wetRatio = Math.min(1, trackWetness / 100);
    ctx.strokeStyle = wetRatio > 0.25 ? '#263547' : '#334155';
    ctx.lineWidth = 22;
    ctx.stroke();

    if (wetRatio > 0.15) {
      traceMainLoop();
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + wetRatio * 0.28})`;
      ctx.lineWidth = 14;
      ctx.stroke();
    }

    traceMainLoop();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    track.sectorSplits.forEach((splitProg, idx) => {
      const sPos = sampleTrackPosition(track, splitProg, false, 0);
      ctx.beginPath();
      ctx.arc(sPos.x, sPos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = idx === 0 ? '#06b6d4' : '#a855f7';
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`S${idx + 2}`, sPos.x + 9, sPos.y - 7);
    });

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
      const pos = sampleTrackPosition(track, car.lapProgress, car.inPit, car.pitTimerSec);
      const isPlayer = team.id === playerTeamId;
      const tireColor = TIRE_SPECS[car.tire].color;

      if (isPlayer) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isPlayer ? 8.5 : 7, 0, Math.PI * 2);
      ctx.fillStyle = tireColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isPlayer ? 6 : 4.8, 0, Math.PI * 2);
      ctx.fillStyle = team.primaryColor;
      ctx.fill();

      const tagX = pos.x + 10;
      const tagY = pos.y - 6;
      ctx.fillStyle = isPlayer ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.86)';
      ctx.fillRect(tagX - 2, tagY - 9, 28, 12);

      ctx.font = 'bold 9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.fillStyle = isPlayer ? '#020617' : '#f8fafc';
      ctx.fillText(driver.code, tagX, tagY);
    });

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

    ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${track.name.toUpperCase()} // ${track.lengthKm.toFixed(2)} KM`, 18, 26);

    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`SURFACE WETNESS: ${Math.round(trackWetness)}% | PIT LOSS: ~${track.pitLossSec}s`, 18, 44);
  }, [raceState, teams, drivers, playerTeamId]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <canvas ref={canvasRef} width={1000} height={620} className="block h-auto w-full select-none" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/90 px-4 py-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />Player Entry</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />Sector 2 Split</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-400" />Sector 3 Split</span>
        </div>
        <div>
          Sectors: S1 {(raceState.track.sectorSplits[0] * 100).toFixed(0)}% · S2 {((raceState.track.sectorSplits[1] - raceState.track.sectorSplits[0]) * 100).toFixed(0)}% · S3 {((1 - raceState.track.sectorSplits[1]) * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function TimingTower({ raceState, teams, drivers, playerTeamId }) {
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
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
              <th className="py-2 pl-3 pr-1.5">Pos</th>
              <th className="py-2 px-1.5">Driver</th>
              <th className="py-2 px-1.5 text-right">Gap</th>
              <th className="py-2 px-1.5 text-center">Tire</th>
              <th className="py-2 px-1.5 text-right">Wear</th>
              <th className="py-2 pl-1.5 pr-3 text-right">Last Lap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {raceState.cars.map((car) => {
              const team = teamMap.get(car.teamId);
              const driver = driverMap.get(car.driverId);
              const isPlayer = team.id === playerTeamId;
              const tireSpec = TIRE_SPECS[car.tire];
              const isFastest = raceState.fastestLapDriverId === car.driverId;

              return (
                <tr key={car.driverId} className={`transition-colors ${car.dnf ? 'opacity-45 bg-slate-950/50' : isPlayer ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-slate-800/40'}`}>
                  <td className="py-1.5 pl-3 pr-1.5 font-bold text-slate-300">{car.dnf ? 'DNF' : car.position}</td>
                  <td className="py-1.5 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-1 rounded-sm shrink-0" style={{ backgroundColor: team.primaryColor }} />
                      <span className={`font-bold ${isPlayer ? 'text-amber-300' : 'text-slate-100'}`}>{driver.code}</span>
                      {car.inPit && <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300 border border-amber-500/40">PIT</span>}
                      {!car.inPit && car.pitRequested && <span className="rounded bg-cyan-500/20 px-1 text-[9px] font-bold text-cyan-300">BOX</span>}
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 text-right text-slate-300">
                    {car.dnf ? car.dnfReason || 'OUT' : car.position === 1 ? 'LEADER' : `+${car.gapToLeaderSec.toFixed(1)}s`}
                  </td>
                  <td className="py-1.5 px-1.5 text-center">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold" style={{ backgroundColor: tireSpec.color, color: tireSpec.textColor }}>
                      {tireSpec.short}
                    </span>
                  </td>
                  <td className="py-1.5 px-1.5 text-right">
                    <span className={car.tireWear > 72 ? 'text-rose-400 font-bold' : car.tireWear > 45 ? 'text-amber-300' : 'text-emerald-400'}>
                      {Math.round(100 - car.tireWear)}%
                    </span>
                  </td>
                  <td className={`py-1.5 pl-1.5 pr-3 text-right ${isFastest ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
                    {formatLapTime(car.lastLapTimeSec)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DriverPitWall({ driver, telemetry, onChangePace, onTogglePit }) {
  const tireLife = Math.max(0, Math.round(100 - telemetry.tireWear));
  const currentTire = TIRE_SPECS[telemetry.tire];
  const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTER', 'WET'];
  const PACE_MODES = [
    { mode: 'CONSERVE', label: 'Conserve', desc: '-Wear / -Fuel' },
    { mode: 'STANDARD', label: 'Standard', desc: 'Balanced' },
    { mode: 'ATTACK', label: 'Attack', desc: '+Pace / +Wear' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/40 font-mono text-sm font-black text-amber-300">
            #{driver.carNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{driver.name}</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-400">{driver.code}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {telemetry.dnf ? (
                <span className="text-rose-400 font-bold">RETIRED — {telemetry.dnfReason}</span>
              ) : (
                <>Pos <span className="text-slate-100 font-bold">P{telemetry.position}</span> · Stops <span className="text-slate-100">{telemetry.pitStopsCount}</span></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right font-mono">
            <div className="text-[10px] uppercase text-slate-400">Fitted</div>
            <div className="text-xs font-bold text-slate-200">{currentTire.label}</div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-black shadow" style={{ backgroundColor: currentTire.color, color: currentTire.textColor }}>
            {currentTire.short}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>TIRE CONDITION</span>
            <span className={tireLife < 28 ? 'text-rose-400 font-bold' : tireLife < 55 ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>{tireLife}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full transition-all duration-200 ${tireLife < 28 ? 'bg-rose-500' : tireLife < 55 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${tireLife}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800/80">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>FUEL REMAINING</span>
            <span className="text-cyan-300 font-bold">{telemetry.fuelKg.toFixed(1)} kg</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all duration-200" style={{ width: `${Math.min(100, (telemetry.fuelKg / 110) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Energy & Pace Mode</div>
        <div className="grid grid-cols-3 gap-1.5">
          {PACE_MODES.map(({ mode, label, desc }) => {
            const active = telemetry.paceMode === mode;
            return (
              <button
                key={mode}
                disabled={telemetry.dnf}
                onClick={() => onChangePace(driver.id, mode)}
                className={`rounded-lg border px-2 py-1.5 text-left transition ${
                  active
                    ? mode === 'ATTACK'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-200'
                      : mode === 'CONSERVE'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                        : 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                } disabled:opacity-40`}
              >
                <div className="text-xs font-bold">{label}</div>
                <div className="text-[10px] opacity-80">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Stint Compound</span>
          <button
            disabled={telemetry.dnf || telemetry.inPit}
            onClick={() => onTogglePit(driver.id)}
            className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide transition ${
              telemetry.inPit
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400 cursor-wait'
                : telemetry.pitRequested
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            } disabled:opacity-40`}
          >
            {telemetry.inPit ? 'IN PIT LANE...' : telemetry.pitRequested ? `BOXING (${TIRE_SPECS[telemetry.nextTire].short}) — CANCEL` : 'CALL BOX THIS LAP'}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {COMPOUNDS.map((comp) => {
            const spec = TIRE_SPECS[comp];
            const selected = telemetry.nextTire === comp;
            return (
              <button
                key={comp}
                disabled={telemetry.dnf}
                onClick={() => onTogglePit(driver.id, comp)}
                className={`flex flex-col items-center justify-center rounded-lg border py-1.5 font-mono text-xs transition ${
                  selected ? 'border-amber-400 bg-slate-800 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-950/60 opacity-75 hover:opacity-100'
                } disabled:opacity-30`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black" style={{ backgroundColor: spec.color, color: spec.textColor }}>
                  {spec.short}
                </span>
                <span className="mt-1 text-[10px] text-slate-300">{comp}</span>
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
    { key: 'aero', title: 'Aerodynamics Package', subtitle: 'High-speed cornering downforce & floor venturi efficiency', accent: 'bg-cyan-500' },
    { key: 'powertrain', title: 'Hybrid Powertrain', subtitle: 'Internal combustion output & electrical deployment recovery', accent: 'bg-rose-500' },
    { key: 'chassis', title: 'Monocoque & Suspension', subtitle: 'Mechanical grip, kerb compliance & weight distribution', accent: 'bg-amber-500' },
    { key: 'reliability', title: 'Component Reliability', subtitle: 'Thermal tolerances & gearbox durability under Attack mode', accent: 'bg-emerald-500' },
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
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">CONS</span><span className="font-bold text-slate-100">{drv.consistency}</span></div>
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
          <p className="mt-1 font-mono text-xs text-slate-400">Distance: {track.totalLaps} Laps ({(track.lengthKm * track.totalLaps).toFixed(1)} km) · Est. Pit Loss: {track.pitLossSec}s</p>
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
      case 'INCIDENT': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };
  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-950/60 px-3.5 py-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Race Control & Pit-Wall Radio Feed</span>
        <span className="font-mono text-[11px] text-slate-500">{logs.length} events</span>
      </div>
      <div className="max-h-44 overflow-y-auto divide-y divide-slate-800/50 px-3.5 py-1 font-mono text-xs">
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
const STORAGE_KEY = 'apex_grid_manager_save_v1';

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
  const [raceState, setRaceState] = useState(null);

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
    const initial = createInitialRaceState(career.round, currentTrack, career.teams, career.drivers, setups, preRaceWeather.initial, preRaceWeather.forecast);
    setRaceState(initial);
    setSimSpeed(1);
    setPhase('RACING');
  };

  useEffect(() => {
    if (phase !== 'RACING' || !raceState || raceState.finished || simSpeed === 0) return;
    const tickIntervalMs = 50;
    const interval = window.setInterval(() => {
      setRaceState((prev) => {
        if (!prev || prev.finished) return prev;
        const dtSimSec = (tickIntervalMs / 1000) * 2.8 * simSpeed;
        const { nextState, events } = stepRaceSimulation(prev, dtSimSec, career.teams, career.drivers, playerTeam.id);
        if (events.weatherChanged) soundEngine.playWeatherAlert();
        else if (events.radioAlert) soundEngine.playRadioBeep();
        else if (events.playerLapCompleted) soundEngine.playTelemetryTick();
        return nextState;
      });
    }, tickIntervalMs);
    return () => window.clearInterval(interval);
  }, [phase, raceState?.finished, simSpeed, career.teams, career.drivers, playerTeam.id]);

  const handleChangePace = (driverId, mode) => {
    soundEngine.playTelemetryTick();
    setRaceState((prev) => !prev ? prev : { ...prev, cars: prev.cars.map((c) => (c.driverId === driverId ? { ...c, paceMode: mode } : c)) });
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

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6">
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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-3 shadow-lg">
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                <div><span className="text-slate-400">WEATHER: </span><span className={`font-bold ${raceState.weather.includes('RAIN') ? 'text-cyan-300' : 'text-amber-300'}`}>{raceState.weather.replace('_', ' ')}</span></div>
                <div><span className="text-slate-400">NEXT RADAR: </span><span className="font-bold text-slate-200">{raceState.forecast[0]?.replace('_', ' ')}</span></div>
                <div><span className="text-slate-400">WETNESS: </span><span className="font-bold text-cyan-400 tabular-nums">{Math.round(raceState.trackWetness)}%</span></div>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {[{ spd: 0, label: 'PAUSE' }, { spd: 1, label: '1X' }, { spd: 2, label: '2X' }, { spd: 4, label: '4X' }].map(({ spd, label }) => (
                  <button key={spd} onClick={() => setSimSpeed(spd)} className={`rounded-lg px-3 py-1.5 font-bold transition ${simSpeed === spd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {label}
                  </button>
                ))}
                {raceState.finished && (
                  <button onClick={() => setPhase('POST_RACE')} className="ml-2 rounded-lg bg-emerald-500 px-4 py-1.5 font-black uppercase text-slate-950 animate-pulse hover:bg-emerald-400">
                    Proceed to Podium →
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <TimingTower raceState={raceState} teams={career.teams} drivers={career.drivers} playerTeamId={playerTeam.id} />
              </div>
              <div className="space-y-4 lg:col-span-8">
                <TrackCanvas raceState={raceState} teams={career.teams} drivers={career.drivers} playerTeamId={playerTeam.id} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {playerDrivers.map((drv) => {
                    const telemetry = raceState.cars.find((c) => c.driverId === drv.id);
                    return <DriverPitWall key={drv.id} driver={drv} telemetry={telemetry} onChangePace={handleChangePace} onTogglePit={handleTogglePit} />;
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
