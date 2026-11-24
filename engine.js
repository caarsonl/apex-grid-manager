// ============================================================================
// APEX GRID MANAGER — GLOBAL OPEN-WHEEL SERIES (GOWS)
// Part 1/2: Series Data, Multi-Slot Save System, Web Audio Synth,
//           1400x820 Procedural Track Generator, Q1/Q2/Q3 Qualifying Engine,
//           and Wheel-to-Wheel Race Physics Engine (100% Copyright-Free)
// ============================================================================

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. COPYRIGHT-FREE SERIES DATA
  // --------------------------------------------------------------------------
  const TIRE_SPECS = {
    SOFT: {
      label: 'Soft C4', short: 'S', color: '#ef4444', textColor: '#ffffff',
      baseGrip: 1.052, degPerLap: 4.1, optTempMin: 88, optTempMax: 112,
      optimalWetMin: 0, optimalWetMax: 18,
    },
    MEDIUM: {
      label: 'Medium C3', short: 'M', color: '#eab308', textColor: '#0f172a',
      baseGrip: 1.024, degPerLap: 2.5, optTempMin: 84, optTempMax: 108,
      optimalWetMin: 0, optimalWetMax: 20,
    },
    HARD: {
      label: 'Hard C2', short: 'H', color: '#f8fafc', textColor: '#0f172a',
      baseGrip: 0.998, degPerLap: 1.48, optTempMin: 80, optTempMax: 106,
      optimalWetMin: 0, optimalWetMax: 22,
    },
    INTER: {
      label: 'Intermediate', short: 'I', color: '#22c55e', textColor: '#052e16',
      baseGrip: 0.988, degPerLap: 2.3, optTempMin: 68, optTempMax: 95,
      optimalWetMin: 18, optimalWetMax: 65,
    },
    WET: {
      label: 'Full Wet', short: 'W', color: '#3b82f6', textColor: '#ffffff',
      baseGrip: 0.958, degPerLap: 1.9, optTempMin: 60, optTempMax: 88,
      optimalWetMin: 60, optimalWetMax: 100,
    },
  };

  const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0];
  const PRIZE_MONEY_MILLIONS = [18, 14, 11, 9, 7.5, 6, 5, 4, 3, 2.5, 2, 1.5];

  const INITIAL_TEAMS = [
    { id: 'apex-works', name: 'Apex Dynamics Racing', shortName: 'APEX', primaryColor: '#f59e0b', secondaryColor: '#1e293b', isPlayer: true, budget: 24.0, car: { aero: 75, powertrain: 73, chassis: 74, reliability: 77 }, points: 0 },
    { id: 'valkyrie-gp', name: 'Valkyrie Aero Engineering', shortName: 'VALK', primaryColor: '#06b6d4', secondaryColor: '#0f172a', isPlayer: false, budget: 35.0, car: { aero: 86, powertrain: 84, chassis: 85, reliability: 82 }, points: 0 },
    { id: 'solaris-motorsport', name: 'Solaris Scuderia', shortName: 'SOLR', primaryColor: '#ef4444', secondaryColor: '#450a0a', isPlayer: false, budget: 33.0, car: { aero: 83, powertrain: 87, chassis: 81, reliability: 79 }, points: 0 },
    { id: 'hyperion-works', name: 'Hyperion Powertrains', shortName: 'HYPR', primaryColor: '#10b981', secondaryColor: '#064e3b', isPlayer: false, budget: 28.0, car: { aero: 78, powertrain: 80, chassis: 77, reliability: 84 }, points: 0 },
    { id: 'borealis-racing', name: 'Borealis Composite', shortName: 'BORE', primaryColor: '#8b5cf6', secondaryColor: '#2e1065', isPlayer: false, budget: 22.0, car: { aero: 73, powertrain: 72, chassis: 75, reliability: 76 }, points: 0 },
    { id: 'kestrel-autosport', name: 'Kestrel Autosport', shortName: 'KEST', primaryColor: '#ec4899', secondaryColor: '#500724', isPlayer: false, budget: 18.0, car: { aero: 67, powertrain: 69, chassis: 68, reliability: 72 }, points: 0 },
  ];

  const INITIAL_DRIVERS = [
    { id: 'drv-1', name: 'Callum Vance', code: 'VAN', teamId: 'apex-works', carNumber: 14, pace: 84, consistency: 82, tireManagement: 80, wetSkill: 85, racecraft: 87, points: 0 },
    { id: 'drv-2', name: 'Sora Takahashi', code: 'TAK', teamId: 'apex-works', carNumber: 27, pace: 81, consistency: 85, tireManagement: 86, wetSkill: 80, racecraft: 83, points: 0 },
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

  // --------------------------------------------------------------------------
  // 2. MULTI-SLOT SAVE & JSON EXPORT/IMPORT SYSTEM
  // --------------------------------------------------------------------------
  const AUTOSAVE_KEY = 'gows_apex_autosave_v4';
  const SLOT_PREFIX = 'gows_apex_slot_v4_';

  function createFreshCareer() {
    return {
      version: 4,
      season: 1,
      round: 1,
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      drivers: JSON.parse(JSON.stringify(INITIAL_DRIVERS)),
      playerTeamId: 'apex-works',
      history: [],
      savedAt: new Date().toISOString(),
    };
  }

  function validateCareerObject(obj) {
    return Boolean(
      obj &&
      typeof obj.season === 'number' &&
      typeof obj.round === 'number' &&
      Array.isArray(obj.teams) && obj.teams.length === 6 &&
      Array.isArray(obj.drivers) && obj.drivers.length === 12
    );
  }

  const SaveManager = {
    loadAutoSave() {
      try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (validateCareerObject(parsed)) return parsed;
        }
      } catch {}
      return createFreshCareer();
    },

    writeAutoSave(career) {
      try {
        const payload = { ...career, savedAt: new Date().toISOString() };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      } catch {}
    },

    listSlots() {
      return [1, 2, 3].map((slotId) => {
        try {
          const raw = localStorage.getItem(SLOT_PREFIX + slotId);
          if (!raw) return { slotId, empty: true };
          const data = JSON.parse(raw);
          if (!validateCareerObject(data)) return { slotId, empty: true };
          const pTeam = data.teams.find((t) => t.id === data.playerTeamId) || data.teams[0];
          const sortedTeams = [...data.teams].sort((a, b) => b.points - a.points);
          const rank = sortedTeams.findIndex((t) => t.id === pTeam.id) + 1;
          return {
            slotId,
            empty: false,
            season: data.season,
            round: data.round,
            teamName: pTeam.name,
            budget: pTeam.budget,
            rank,
            points: pTeam.points,
            savedAt: data.savedAt || '',
          };
        } catch {
          return { slotId, empty: true };
        }
      });
    },

    saveToSlot(slotId, career) {
      try {
        const payload = { ...career, savedAt: new Date().toISOString() };
        localStorage.setItem(SLOT_PREFIX + slotId, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    },

    loadFromSlot(slotId) {
      try {
        const raw = localStorage.getItem(SLOT_PREFIX + slotId);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return validateCareerObject(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    deleteSlot(slotId) {
      try {
        localStorage.removeItem(SLOT_PREFIX + slotId);
      } catch {}
    },

    exportToJsonFile(career) {
      const payload = { ...career, savedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apex-grid-S${career.season}-R${career.round}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    importFromJsonText(text) {
      try {
        const parsed = JSON.parse(text);
        return validateCareerObject(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
  };

  // --------------------------------------------------------------------------
  // 3. ZERO-DEPENDENCY WEB AUDIO API SYNTHESIZER
  // --------------------------------------------------------------------------
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
        filter.frequency.setValueAtTime(340, ctx.currentTime);
        this.engineGain.gain.setValueAtTime(0.011, ctx.currentTime);

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
      const baseFreq = 94 * speedFactor * neutralFactor * ersBoost;

      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.02, now, 0.08);
      this.engineGain.gain.setTargetAtTime(0.012, now, 0.08);
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
      filter.frequency.setValueAtTime(1480, now);
      filter.frequency.exponentialRampToValueAtTime(960, now + 0.24);
      filter.Q.setValueAtTime(6.8, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
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
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(128, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.34);
      oscGain.gain.setValueAtTime(0.14, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.37);

      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.085, now);
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
      gain.gain.setValueAtTime(0.024, now);
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
        gain.gain.setValueAtTime(0.048, start);
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
        gain.gain.setValueAtTime(0.04, now + offset);
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
      gain.gain.setValueAtTime(0.042, now);
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
        gain.gain.setValueAtTime(isRedFlag ? 0.042 : 0.052, start);
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
        gain.gain.setValueAtTime(0.055, start);
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

  // --------------------------------------------------------------------------
  // 4. EXPANDED 1400x820 PROCEDURAL CIRCUIT GENERATOR
  // --------------------------------------------------------------------------
  const TRACK_W = 1400;
  const TRACK_H = 820;

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

    // Large, open canvas geometry so cars & battles have breathing room
    const cx = TRACK_W * 0.5;
    const cy = TRACK_H * 0.5;
    const numControlPoints = 11 + Math.floor(rng() * 3); // 11-13 clean, sweeping corners
    const controlPts = [];

    for (let i = 0; i < numControlPoints; i++) {
      const angle = (i / numControlPoints) * Math.PI * 2;
      const isBottomStraight = Math.sin(angle) > 0.72 && Math.abs(Math.cos(angle)) < 0.58;
      const rx = isBottomStraight ? 545 : 395 + rng() * 190;
      const ry = isBottomStraight ? 290 : 195 + rng() * 130;
      const jitterAngle = isBottomStraight ? angle : angle + (rng() - 0.5) * (Math.PI / numControlPoints) * 0.42;
      controlPts.push({
        x: Math.max(105, Math.min(TRACK_W - 105, cx + Math.cos(jitterAngle) * rx)),
        y: Math.max(100, Math.min(TRACK_H - 95, cy + Math.sin(jitterAngle) * ry)),
      });
    }

    const samplesPerSegment = 42;
    const rawPoints = [];
    const n = controlPts.length;

    for (let i = 0; i < n; i++) {
      const p0 = controlPts[(i - 1 + n) % n];
      const p1 = controlPts[i];
      const p2 = controlPts[(i + 1) % n];
      const p3 = controlPts[(i + 2) % n];
      for (let s = 0; s < samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        rawPoints.push({
          x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
          y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
        });
      }
    }

    const cumulativeDist = [0];
    let totalPixelLength = 0;
    for (let i = 1; i <= rawPoints.length; i++) {
      const prev = rawPoints[i - 1];
      const curr = rawPoints[i % rawPoints.length];
      totalPixelLength += Math.hypot(curr.x - prev.x, curr.y - prev.y);
      cumulativeDist.push(totalPixelLength);
    }

    const uniformCount = 420;
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
      waypoints.push({
        x: a.x + (b.x - a.x) * alpha,
        y: a.y + (b.y - a.y) * alpha,
        curvature: 0,
        isBrakingZone: false,
        turnNumber: 0,
        progress: i / uniformCount,
      });
    }

    let totalCurvature = 0;
    for (let i = 0; i < uniformCount; i++) {
      const prev = waypoints[(i - 4 + uniformCount) % uniformCount];
      const curr = waypoints[i];
      const next = waypoints[(i + 4) % uniformCount];
      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const cross = Math.abs(v1x * v2y - v1y * v2x);
      const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1;
      curr.curvature = cross / mag;
      totalCurvature += curr.curvature;
    }

    // Rotate so index 0 sits at bottom-most straight (Start / Finish)
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

    // Identify numbered turns (curvature peaks separated by >= 28 indices)
    const turns = [];
    let lastTurnIdx = -30;
    for (let i = 18; i < uniformCount - 14; i++) {
      const c = rotatedWaypoints[i].curvature;
      if (c > 0.145 && i - lastTurnIdx >= 28) {
        let peakIdx = i;
        for (let k = i; k < Math.min(uniformCount - 5, i + 12); k++) {
          if (rotatedWaypoints[k].curvature > rotatedWaypoints[peakIdx].curvature) peakIdx = k;
        }
        const turnNum = turns.length + 1;
        turns.push({
          number: turnNum,
          index: peakIdx,
          x: rotatedWaypoints[peakIdx].x,
          y: rotatedWaypoints[peakIdx].y,
          progress: peakIdx / uniformCount,
        });
        // Mark braking zone leading into this corner
        for (let b = 1; b <= 10; b++) {
          const bIdx = (peakIdx - b + uniformCount) % uniformCount;
          rotatedWaypoints[bIdx].isBrakingZone = true;
          rotatedWaypoints[bIdx].turnNumber = turnNum;
        }
        for (let a = 0; a <= 6; a++) {
          rotatedWaypoints[(peakIdx + a) % uniformCount].turnNumber = turnNum;
        }
        lastTurnIdx = peakIdx;
        i = peakIdx + 12;
      }
    }

    const pStart = rotatedWaypoints[0];
    const pAfter = rotatedWaypoints[3];
    const sdx = pAfter.x - pStart.x;
    const sdy = pAfter.y - pStart.y;
    const slen = Math.hypot(sdx, sdy) || 1;
    const startNormal = { nx: -sdy / slen, ny: sdx / slen };

    // Wide parallel pit lane tucked cleanly inside the main straight
    const pitWaypoints = [];
    const pitSpan = 42;
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
      const edgeFactor = Math.min(1, (pitSpan - Math.abs(offset)) / 12);
      const pitOffsetPx = 36 * edgeFactor;
      pitWaypoints.push({
        x: rotatedWaypoints[idx].x + nx * pitOffsetPx,
        y: rotatedWaypoints[idx].y + ny * pitOffsetPx,
      });
    }

    const drsZones = [
      { start: 0.90, end: 0.08 },
      { start: 0.44, end: 0.59 },
    ];

    const lengthKm = Number((4.4 + rng() * 2.1).toFixed(2));
    const totalLaps = Math.max(18, Math.min(34, Math.round(138 / lengthKm)));
    const avgCurvature = totalCurvature / uniformCount;
    const aeroDemand = Number(Math.min(0.98, Math.max(0.28, avgCurvature * 4.4 + rng() * 0.14)).toFixed(2));
    const powerDemand = Number(Math.min(0.98, Math.max(0.28, 1.05 - aeroDemand * 0.62 + rng() * 0.14)).toFixed(2));
    const chassisDemand = Number(Math.min(0.98, Math.max(0.32, 0.4 + rng() * 0.48)).toFixed(2));
    const tireAbrasion = Number((0.75 + rng() * 0.55).toFixed(2));
    const overtakeDifficulty = Number((0.25 + rng() * 0.52).toFixed(2));
    const baseLapTimeSec = Number((lengthKm * 15.6 + aeroDemand * 6.2).toFixed(2));
    const pitLossSec = Number((18.5 + rng() * 4.2).toFixed(1));
    const airTempC = Math.round(16 + rng() * 16);

    return {
      seed, name, country, lengthKm, totalLaps, baseLapTimeSec, airTempC,
      aeroDemand, powerDemand, chassisDemand, tireAbrasion, overtakeDifficulty, pitLossSec,
      waypoints: rotatedWaypoints, pitWaypoints, turns, drsZones, sectorSplits: [0.33, 0.67], startNormal,
      width: TRACK_W, height: TRACK_H,
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

  // --------------------------------------------------------------------------
  // 5. WEATHER & QUALIFYING ENGINE (3-STAGE KNOCKOUT Q1 / Q2 / Q3)
  // --------------------------------------------------------------------------
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

  const QUALI_STAGE_CONFIG = {
    Q1: { durationSec: 260, eliminateCount: 3, nextStage: 'Q2', baseEvolution: 38 },
    Q2: { durationSec: 220, eliminateCount: 3, nextStage: 'Q3', baseEvolution: 62 },
    Q3: { durationSec: 190, eliminateCount: 0, nextStage: 'DONE', baseEvolution: 82 },
  };

  function createQualifyingState(roundNumber, track, teams, drivers, initialWeather, forecast) {
    const initialWetness = TARGET_WETNESS[initialWeather];
    const defaultTire = initialWetness >= 60 ? 'WET' : initialWetness >= 22 ? 'INTER' : 'SOFT';

    const entries = drivers.map((drv, idx) => ({
      driverId: drv.id,
      teamId: drv.teamId,
      eliminatedIn: null, // null | 'Q1' | 'Q2'
      lockedGridPos: null,
      status: 'GARAGE', // GARAGE | OUT_LAP | FLYING_LAP | IN_LAP
      lapProgress: 0,
      lateralOffset: 0,
      tire: defaultTire,
      runsCompleted: 0,
      bestLapSec: null,
      currentLapElapsed: 0,
      sectors: [null, null, null],      // current run sector times
      bestSectors: [null, null, null],  // personal best sector times
      lastSectorColors: [null, null, null], // 'PURPLE' | 'GREEN' | 'YELLOW'
      inTraffic: false,
      aiDispatchTimes: [245 - idx * 3.5, 92 - idx * 2.2], // banker run + late evolution run
    }));

    return {
      roundNumber,
      track,
      stage: 'Q1', // Q1 | Q2 | Q3 | DONE
      timeRemainingSec: QUALI_STAGE_CONFIG.Q1.durationSec,
      stageComplete: false,
      weather: initialWeather,
      forecast,
      trackWetness: initialWetness,
      trackEvolution: QUALI_STAGE_CONFIG.Q1.baseEvolution, // rises toward 100%
      sessionBestSectors: [null, null, null],
      entries,
      finalGridOrder: [], // driverIds P1..P12 once DONE
      banner: { text: 'Q1 GREEN LIGHT — 12 Drivers compete; Bottom 3 eliminated', color: '#22c55e' },
      logs: [{ id: 'q-start', lap: 1, timeSec: 0, category: 'RACE', message: `Q1 Underway at ${track.name}! Track evolution at 38%. Bottom 3 drivers will be knocked out.` }],
    };
  }

  function dispatchQualiDriver(state, driverId, tireCompound) {
    if (state.stageComplete || state.stage === 'DONE') return state;
    const entries = state.entries.map((e) => {
      if (e.driverId !== driverId || e.eliminatedIn || e.status !== 'GARAGE') return e;
      return {
        ...e,
        status: 'OUT_LAP',
        tire: tireCompound || e.tire,
        lapProgress: 0.02,
        currentLapElapsed: 0,
        sectors: [null, null, null],
        lastSectorColors: [null, null, null],
      };
    });
    return { ...state, entries };
  }

  function computeQualiSortedStandings(entries) {
    const active = entries.filter((e) => !e.eliminatedIn);
    const eliminated = entries
      .filter((e) => e.eliminatedIn)
      .sort((a, b) => (a.lockedGridPos || 99) - (b.lockedGridPos || 99));

    active.sort((a, b) => {
      if (a.bestLapSec === null && b.bestLapSec === null) return 0;
      if (a.bestLapSec === null) return 1;
      if (b.bestLapSec === null) return -1;
      return a.bestLapSec - b.bestLapSec;
    });

    return [...active, ...eliminated];
  }

  function stepQualifyingSimulation(prev, dtSec, teams, drivers, playerTeamId) {
    if (prev.stage === 'DONE' || prev.stageComplete) {
      return { nextState: prev, events: { lapCompleted: false, stageEnded: false, radioAlert: false } };
    }

    const track = prev.track;
    const events = { lapCompleted: false, stageEnded: false, radioAlert: false };
    const timeRemainingSec = Math.max(0, prev.timeRemainingSec - dtSec);
    let trackEvolution = Math.min(100, prev.trackEvolution + dtSec * 0.075);
    const sessionBestSectors = [...prev.sessionBestSectors];
    const logs = [...prev.logs];
    let banner = prev.banner;

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    // Active cars on track for traffic/dirty-air check
    const onTrackCars = prev.entries.filter((e) => e.status !== 'GARAGE' && !e.eliminatedIn);

    const updatedEntries = prev.entries.map((entry) => {
      if (entry.eliminatedIn) return entry;
      const team = teamMap.get(entry.teamId);
      const driver = driverMap.get(entry.driverId);
      const isPlayer = team.id === playerTeamId;

      // AI automatic dispatch logic
      if (!isPlayer && entry.status === 'GARAGE' && timeRemainingSec > 28) {
        const nextTrigger = entry.aiDispatchTimes.find((t) => timeRemainingSec <= t);
        if (nextTrigger !== undefined) {
          const remainingTriggers = entry.aiDispatchTimes.filter((t) => t !== nextTrigger);
          const aiTire = prev.trackWetness >= 60 ? 'WET' : prev.trackWetness >= 22 ? 'INTER' : 'SOFT';
          return {
            ...entry,
            status: 'OUT_LAP',
            tire: aiTire,
            lapProgress: 0.02,
            currentLapElapsed: 0,
            sectors: [null, null, null],
            lastSectorColors: [null, null, null],
            aiDispatchTimes: remainingTriggers,
          };
        }
        return entry;
      }

      if (entry.status === 'GARAGE') return entry;

      // Check traffic on track (another car within 0.045 progress ahead)
      let inTraffic = false;
      for (let i = 0; i < onTrackCars.length; i++) {
        const other = onTrackCars[i];
        if (other.driverId === entry.driverId) continue;
        const diff = (other.lapProgress - entry.lapProgress + 1) % 1;
        if (diff > 0.002 && diff < 0.042) {
          inTraffic = true;
          break;
        }
      }

      // Compute Qualifying Pace
      const tireSpec = TIRE_SPECS[entry.tire];
      const demandSum = track.aeroDemand + track.powerDemand + track.chassisDemand;
      const weightedCar = (team.car.aero * track.aeroDemand + team.car.powertrain * track.powerDemand + team.car.chassis * track.chassisDemand) / demandSum;
      const carDelta = (75 - weightedCar) * 0.092;

      const wetBlend = Math.min(1, prev.trackWetness / 70);
      const skill = driver.pace * (1 - wetBlend) + driver.wetSkill * wetBlend;
      const driverDelta = (80 - skill) * 0.072;

      let wetMismatch = 0;
      if (prev.trackWetness < tireSpec.optimalWetMin) wetMismatch = (tireSpec.optimalWetMin - prev.trackWetness) * 0.14;
      else if (prev.trackWetness > tireSpec.optimalWetMax) wetMismatch = (prev.trackWetness - tireSpec.optimalWetMax) * 0.22;

      const tireDelta = (1.02 - tireSpec.baseGrip) * 44;
      const evolutionBonus = -(trackEvolution / 100) * 1.45;
      const trafficPenalty = inTraffic && entry.status === 'FLYING_LAP' ? 0.85 : 0;
      const paceMult = entry.status === 'FLYING_LAP' ? 0.945 : 1.12; // Low fuel + max ERS on flying lap!
      const jitter = ((100 - driver.consistency) / 100) * (Math.random() - 0.5) * 0.25;

      const lapTimeSec = Math.max(
        track.baseLapTimeSec * 0.78,
        (track.baseLapTimeSec + carDelta + driverDelta + tireDelta + wetMismatch + evolutionBonus + trafficPenalty + jitter) * paceMult
      );

      const prevProg = entry.lapProgress;
      let nextProg = prevProg + dtSec / lapTimeSec;
      let status = entry.status;
      let currentLapElapsed = entry.currentLapElapsed + dtSec;
      const sectors = [...entry.sectors];
      const bestSectors = [...entry.bestSectors];
      const lastSectorColors = [...entry.lastSectorColors];
      let bestLapSec = entry.bestLapSec;
      let runsCompleted = entry.runsCompleted;

      // Sector splits during Flying Lap
      if (status === 'FLYING_LAP') {
        if (prevProg < track.sectorSplits[0] && nextProg >= track.sectorSplits[0]) {
          const s1 = Number(currentLapElapsed.toFixed(3));
          sectors[0] = s1;
          if (sessionBestSectors[0] === null || s1 < sessionBestSectors[0]) {
            sessionBestSectors[0] = s1;
            lastSectorColors[0] = 'PURPLE';
          } else if (bestSectors[0] === null || s1 < bestSectors[0]) {
            lastSectorColors[0] = 'GREEN';
          } else {
            lastSectorColors[0] = 'YELLOW';
          }
          if (bestSectors[0] === null || s1 < bestSectors[0]) bestSectors[0] = s1;
        }
        if (prevProg < track.sectorSplits[1] && nextProg >= track.sectorSplits[1]) {
          const s2 = Number((currentLapElapsed - (sectors[0] || currentLapElapsed * 0.33)).toFixed(3));
          sectors[1] = s2;
          if (sessionBestSectors[1] === null || s2 < sessionBestSectors[1]) {
            sessionBestSectors[1] = s2;
            lastSectorColors[1] = 'PURPLE';
          } else if (bestSectors[1] === null || s2 < bestSectors[1]) {
            lastSectorColors[1] = 'GREEN';
          } else {
            lastSectorColors[1] = 'YELLOW';
          }
          if (bestSectors[1] === null || s2 < bestSectors[1]) bestSectors[1] = s2;
        }
      }

      // Lap boundary transitions
      if (nextProg >= 1.0) {
        nextProg -= 1.0;
        if (status === 'OUT_LAP') {
          status = 'FLYING_LAP';
          currentLapElapsed = 0;
        } else if (status === 'FLYING_LAP') {
          const lapTotal = Number(currentLapElapsed.toFixed(3));
          const s3 = Number((lapTotal - (sectors[0] || lapTotal * 0.33) - (sectors[1] || lapTotal * 0.34)).toFixed(3));
          sectors[2] = s3;
          if (sessionBestSectors[2] === null || s3 < sessionBestSectors[2]) {
            sessionBestSectors[2] = s3;
            lastSectorColors[2] = 'PURPLE';
          } else if (bestSectors[2] === null || s3 < bestSectors[2]) {
            lastSectorColors[2] = 'GREEN';
          } else {
            lastSectorColors[2] = 'YELLOW';
          }
          if (bestSectors[2] === null || s3 < bestSectors[2]) bestSectors[2] = s3;

          if (bestLapSec === null || lapTotal < bestLapSec) {
            bestLapSec = lapTotal;
          }
          runsCompleted += 1;
          status = 'IN_LAP';
          currentLapElapsed = 0;
          events.lapCompleted = true;

          const mins = Math.floor(lapTotal / 60);
          const rem = (lapTotal % 60).toFixed(3).padStart(6, '0');
          if (isPlayer) {
            events.radioAlert = true;
            banner = { text: `${driver.code} SETS ${mins}:${rem}${inTraffic ? ' (IMPEDED BY TRAFFIC)' : ''}`, color: '#f59e0b' };
            logs.unshift({
              id: `q-lap-${driver.code}-${runsCompleted}-${timeRemainingSec.toFixed(1)}`,
              lap: runsCompleted, timeSec: timeRemainingSec, category: 'RACE',
              message: `${driver.code} clocks ${mins}:${rem} on ${entry.tire}${inTraffic ? ' — lost time in traffic!' : ''}.`,
            });
          }
        } else if (status === 'IN_LAP') {
          status = 'GARAGE';
          nextProg = 0;
          currentLapElapsed = 0;
        }
      }

      return {
        ...entry,
        status,
        lapProgress: nextProg,
        lateralOffset: status === 'FLYING_LAP' ? 0 : 10, // Slow out/in-lap cars stay off racing line
        currentLapElapsed,
        sectors,
        bestSectors,
        lastSectorColors,
        bestLapSec,
        runsCompleted,
        inTraffic,
      };
    });

    // Check if stage clock hit 0 AND no active cars are mid-flying-lap
    const anyOnFlyingLap = updatedEntries.some((e) => !e.eliminatedIn && e.status === 'FLYING_LAP');
    let stageComplete = false;

    if (timeRemainingSec <= 0 && !anyOnFlyingLap) {
      stageComplete = true;
      events.stageEnded = true;
      const cfg = QUALI_STAGE_CONFIG[prev.stage];
      const activeSorted = updatedEntries
        .filter((e) => !e.eliminatedIn)
        .sort((a, b) => {
          if (a.bestLapSec === null && b.bestLapSec === null) return 0;
          if (a.bestLapSec === null) return 1;
          if (b.bestLapSec === null) return -1;
          return a.bestLapSec - b.bestLapSec;
        });

      // Guarantee every active driver gets a realistic banker time if they never left garage
      activeSorted.forEach((e, idx) => {
        if (e.bestLapSec === null) {
          e.bestLapSec = Number((track.baseLapTimeSec * 1.04 + idx * 0.25).toFixed(3));
        }
      });
      activeSorted.sort((a, b) => a.bestLapSec - b.bestLapSec);

      if (cfg.eliminateCount > 0) {
        const cutoff = activeSorted.length - cfg.eliminateCount;
        for (let i = cutoff; i < activeSorted.length; i++) {
          activeSorted[i].eliminatedIn = prev.stage;
          activeSorted[i].lockedGridPos = i + 1;
          activeSorted[i].status = 'GARAGE';
        }
        const knockedOutNames = activeSorted
          .slice(cutoff)
          .map((e) => driverMap.get(e.driverId).code)
          .join(', ');
        banner = { text: `${prev.stage} COMPLETE — ELIMINATED: ${knockedOutNames}`, color: '#ef4444' };
        logs.unshift({
          id: `q-end-${prev.stage}`, lap: 0, timeSec: 0, category: 'FLAG',
          message: `${prev.stage} Chequered Flag! Knocked out: ${knockedOutNames}.`,
        });
      } else {
        // Q3 Finished — lock Top 6!
        activeSorted.forEach((e, idx) => {
          e.lockedGridPos = idx + 1;
          e.status = 'GARAGE';
        });
        const poleDriver = driverMap.get(activeSorted[0].driverId);
        banner = { text: `POLE POSITION: ${poleDriver.name.toUpperCase()} (${poleDriver.code})!`, color: '#a855f7' };
        logs.unshift({
          id: 'q3-pole', lap: 0, timeSec: 0, category: 'RACE',
          message: `POLE POSITION! ${poleDriver.name} tops Q3 shootout!`,
        });
      }
    }

    const sortedAll = computeQualiSortedStandings(updatedEntries);
    const finalGridOrder = stageComplete && prev.stage === 'Q3' ? sortedAll.map((e) => e.driverId) : prev.finalGridOrder;

    return {
      nextState: {
        ...prev,
        timeRemainingSec,
        stageComplete,
        trackEvolution,
        sessionBestSectors,
        entries: sortedAll,
        finalGridOrder,
        banner,
        logs: logs.slice(0, 60),
      },
      events,
    };
  }

  function advanceQualiStage(prev) {
    const cfg = QUALI_STAGE_CONFIG[prev.stage];
    if (!cfg || cfg.nextStage === 'DONE') {
      const sorted = computeQualiSortedStandings(prev.entries);
      return { ...prev, stage: 'DONE', stageComplete: true, finalGridOrder: sorted.map((e) => e.driverId) };
    }

    const nextStage = cfg.nextStage;
    const nextCfg = QUALI_STAGE_CONFIG[nextStage];
    const entries = prev.entries.map((e, idx) => {
      if (e.eliminatedIn) return e;
      return {
        ...e,
        status: 'GARAGE',
        lapProgress: 0,
        bestLapSec: null, // Reset times for new knockout round!
        sectors: [null, null, null],
        bestSectors: [null, null, null],
        lastSectorColors: [null, null, null],
        currentLapElapsed: 0,
        aiDispatchTimes: [nextCfg.durationSec - 16 - idx * 3, 84 - idx * 2],
      };
    });

    return {
      ...prev,
      stage: nextStage,
      timeRemainingSec: nextCfg.durationSec,
      stageComplete: false,
      trackEvolution: nextCfg.baseEvolution,
      sessionBestSectors: [null, null, null],
      entries,
      banner: {
        text: nextStage === 'Q3'
          ? 'Q3 POLE SHOOTOUT — Top 6 fight for P1!'
          : `${nextStage} GREEN LIGHT — 9 Drivers remain; Bottom 3 eliminated`,
        color: '#22c55e',
      },
      logs: [
        {
          id: `q-begin-${nextStage}`, lap: 0, timeSec: nextCfg.durationSec, category: 'RACE',
          message: `${nextStage} starts! Track grip evolved to ${nextCfg.baseEvolution}%.`,
        },
        ...prev.logs,
      ],
    };
  }

  // --------------------------------------------------------------------------
  // 6. REALISTIC WHEEL-TO-WHEEL RACE SIMULATION ENGINE
  // --------------------------------------------------------------------------
  function createInitialRaceState(roundNumber, track, teams, drivers, playerSetups, initialWeather, forecast, qualiGridOrder) {
    const initialWetness = TARGET_WETNESS[initialWeather];

    let orderedDrivers;
    if (Array.isArray(qualiGridOrder) && qualiGridOrder.length === drivers.length) {
      orderedDrivers = qualiGridOrder.map((id) => drivers.find((d) => d.id === id)).filter(Boolean);
    } else {
      orderedDrivers = [...drivers]
        .map((drv) => {
          const team = teams.find((t) => t.id === drv.teamId);
          const carPerf = team.car.aero * track.aeroDemand + team.car.powertrain * track.powerDemand + team.car.chassis * track.chassisDemand;
          return { drv, score: carPerf * 0.55 + drv.pace * 0.45 + (Math.random() - 0.5) * 4 };
        })
        .sort((a, b) => b.score - a.score)
        .map((x) => x.drv);
    }

    const cars = orderedDrivers.map((drv, idx) => {
      const playerSetup = playerSetups.find((s) => s.driverId === drv.id);
      const startingTire = playerSetup ? playerSetup.startingTire : chooseOptimalTireForWetness(initialWetness, track.totalLaps);
      const startingFuelKg = playerSetup ? playerSetup.startingFuelKg : Math.min(110, Math.round(track.totalLaps * 2.15 + 4));
      const gridOffsetProgress = -0.0055 * (idx + 1);

      return {
        driverId: drv.id, teamId: drv.teamId, position: idx + 1, gridPos: idx + 1, lap: 1,
        lapProgress: gridOffsetProgress, totalDistance: gridOffsetProgress,
        tire: startingTire, tireWear: 0, tireTemp: 84, tireAgeLaps: 0,
        fuelKg: startingFuelKg,
        paceMode: 'STANDARD', ersMode: 'BALANCED', battleStance: 'NEUTRAL', ersBattery: 100,
        drsActive: false, inDirtyAir: false, isBraking: false,
        battleState: 'CLEAR', // CLEAR | SLIPSTREAM | DEFENDING | LATE_BRAKE | SWITCHBACK | LOCKUP | WIDE | SPIN
        battleTimerSec: 0,
        lateralOffset: idx % 2 === 0 ? -7 : 7,
        spinAngle: 0,
        wingDamage: 0,
        trackLimitWarnings: 0,
        penaltySec: 0,
        overtakeFlashSec: 0,
        mistakeCooldownSec: 10 + Math.random() * 14,
        inPit: false, pitTimerSec: 0, pitRequested: false,
        nextTire: startingTire,
        lastLapTimeSec: null, bestLapTimeSec: null, currentLapElapsedSec: 0,
        sectorTimes: [null, null, null],
        sectorColors: [null, null, null],
        personalBestSectors: [null, null, null],
        gapToLeaderSec: idx * 0.35, intervalSec: idx === 0 ? 0 : 0.35,
        pitStopsCount: 0, dnf: false,
      };
    });

    return {
      roundNumber, track, elapsedSec: 0, weather: initialWeather, forecast,
      nextWeatherChangeSec: track.baseLapTimeSec * 4.5, trackWetness: initialWetness,
      trackRubber: 55,
      flagStatus: 'GREEN',
      flagTimerSec: 0,
      safetyCarProgress: 0.04,
      redFlagCount: 0,
      sessionBestSectors: [null, null, null],
      broadcastBanner: { text: `LIGHTS OUT AT ${track.name.toUpperCase()} — ${track.totalLaps} LAPS`, color: '#22c55e', timerSec: 5 },
      cars,
      logs: [{ id: 'log-start', lap: 1, timeSec: 0, category: 'RACE', message: `LIGHTS OUT at ${track.name}! ${track.totalLaps} laps · Air ${track.airTempC}°C · ${initialWeather.replace('_', ' ')}.` }],
      fastestLapDriverId: null, fastestLapTimeSec: null, finished: false,
    };
  }

  function stepRaceSimulation(prev, dtSec, teams, drivers, playerTeamId, fxQueue) {
    const emptyEvents = {
      playerLapCompleted: false, weatherChanged: false, radioAlert: false,
      overtakeEvent: false, flagChanged: false, isRedFlag: false,
      pitStopSound: false, tireScreech: false, crashImpact: false,
    };
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
    const sessionBestSectors = [...prev.sessionBestSectors];
    const logs = [...prev.logs];
    let fastestLapDriverId = prev.fastestLapDriverId;
    let fastestLapTimeSec = prev.fastestLapTimeSec;
    let broadcastBanner = prev.broadcastBanner && prev.broadcastBanner.timerSec > 0
      ? { ...prev.broadcastBanner, timerSec: Math.max(0, prev.broadcastBanner.timerSec - dtSec) }
      : null;

    const events = { ...emptyEvents };
    const leaderCar = prev.cars.find((c) => !c.dnf) || prev.cars[0];
    const currentLeaderLap = leaderCar ? leaderCar.lap : 1;

    const setBanner = (text, color = '#f59e0b', duration = 4.2) => {
      broadcastBanner = { text, color, timerSec: duration };
    };

    const pushLog = (category, message, lap = currentLeaderLap) => {
      logs.unshift({ id: `log-${elapsedSec.toFixed(2)}-${Math.random().toString(36).slice(2, 6)}`, lap, timeSec: elapsedSec, category, message });
      if (logs.length > 90) logs.pop();
    };

    const emitFx = (item) => { if (fxQueue) fxQueue.push(item); };

    // Red Flag suspension
    if (flagStatus === 'RED_FLAG') {
      flagTimerSec -= dtSec;
      if (flagTimerSec <= 0) {
        flagStatus = 'GREEN';
        events.flagChanged = true;
        emitFx({ type: 'CLEAR_DEBRIS' });
        setBanner('RED FLAG LIFTED — STANDING RESTART!', '#22c55e', 5);
        pushLog('FLAG', 'RED FLAG LIFTED — Standing restart! Fresh tires & repaired wings across the grid.', currentLeaderLap);
      } else {
        return { nextState: { ...prev, elapsedSec, flagStatus, flagTimerSec, broadcastBanner, logs }, events };
      }
    }

    // VSC / Safety Car countdown
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
        setBanner(endedFlag === 'SC' ? 'SAFETY CAR IN — GREEN FLAG!' : 'VSC ENDING — GREEN FLAG!', '#22c55e', 4.5);
        pushLog('FLAG', `${endedFlag === 'SC' ? 'SAFETY CAR IN THIS LAP' : 'VSC ENDING'} — Racing resumes!`, currentLeaderLap);
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
        setBanner(`WEATHER SHIFT: ${weather.replace('_', ' ')}`, '#38bdf8', 5);
        pushLog('WEATHER', `Radar Alert: Conditions shifting to ${weather.replace('_', ' ')}.`);
      }
      nextWeatherChangeSec = elapsedSec + track.baseLapTimeSec * (3.5 + Math.random() * 3.5);
    }

    const targetWet = TARGET_WETNESS[weather];
    const wetRate = targetWet > trackWetness ? 1.45 : 0.75;
    if (trackWetness < targetWet) trackWetness = Math.min(targetWet, trackWetness + wetRate * dtSec);
    else if (trackWetness > targetWet) trackWetness = Math.max(targetWet, trackWetness - wetRate * dtSec);

    if (trackWetness > 25) trackRubber = Math.max(12, trackRubber - dtSec * 0.42);
    else trackRubber = Math.min(100, trackRubber + dtSec * 0.14);

    // Torrential rain Red Flag
    if (flagStatus === 'GREEN' && trackWetness > 88 && redFlagCount === 0 && currentLeaderLap > 3 && currentLeaderLap < track.totalLaps - 3 && Math.random() < 0.0018 * dtSec) {
      flagStatus = 'RED_FLAG';
      flagTimerSec = 14;
      redFlagCount += 1;
      events.flagChanged = true;
      events.isRedFlag = true;
      setBanner('RED FLAG — TORRENTIAL RAIN & STANDING WATER', '#ef4444', 10);
      pushLog('FLAG', 'RED FLAG! Standing water exceeds safe limits. Cars return to pit lane.');

      const gridResetCars = prev.cars.map((c, idx) => {
        if (c.dnf) return c;
        const baseLap = Math.max(1, currentLeaderLap);
        const gridProg = -0.005 * (idx + 1);
        return {
          ...c, lap: baseLap, lapProgress: gridProg, totalDistance: baseLap - 1 + gridProg,
          tire: 'WET', tireWear: 0, tireAgeLaps: 0, wingDamage: 0, inPit: false, pitRequested: false,
          battleState: 'CLEAR', spinAngle: 0, lateralOffset: idx % 2 === 0 ? -7 : 7,
        };
      });

      return {
        nextState: { ...prev, elapsedSec, weather, forecast, nextWeatherChangeSec, trackWetness, trackRubber, flagStatus, flagTimerSec, redFlagCount, broadcastBanner, cars: gridResetCars, logs },
        events,
      };
    }

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    const preRankMap = new Map();
    prev.cars.forEach((c, idx) => preRankMap.set(c.driverId, idx + 1));

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
      const turnLabel = wp.turnNumber > 0 ? `Turn ${wp.turnNumber}` : 'the apex';

      // Pit stop service (also serves pending 5s penalty & replaces broken wing)
      if (car.inPit) {
        const nextTimer = car.pitTimerSec - dtSec;
        if (nextTimer <= 0) {
          const refuelTarget = Math.min(110, Math.max(car.fuelKg, (track.totalLaps - car.lap + 1) * 2.15 + 3));
          const repairedWing = car.wingDamage > 0;
          if (isPlayer) {
            events.radioAlert = true;
            events.pitStopSound = true;
            setBanner(`${driver.code} PIT EXIT ON FRESH ${car.nextTire} TIRES`, '#f59e0b', 3.5);
            pushLog('PIT', `${driver.code} released on fresh ${car.nextTire} tires${repairedWing ? ' + new front wing' : ''}.`, car.lap);
          }
          return {
            ...car, inPit: false, pitTimerSec: 0, pitRequested: false, tire: car.nextTire,
            tireWear: 0, tireAgeLaps: 0, tireTemp: 82, wingDamage: 0, penaltySec: 0,
            fuelKg: refuelTarget, pitStopsCount: car.pitStopsCount + 1,
            lapProgress: 0.015, totalDistance: car.lap - 1 + 0.015,
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

      let ersMode = car.ersMode;
      let battleStance = car.battleStance;
      let ersBattery = car.ersBattery;

      if (!isPlayer) {
        if (flagStatus !== 'GREEN') {
          ersMode = 'HARVEST';
          battleStance = 'NEUTRAL';
        } else if (gapAheadSec < 1.05 && ersBattery > 25) {
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

      const lapFractionEst = dtSec / track.baseLapTimeSec;
      if (ersMode === 'OVERTAKE') {
        ersBattery = Math.max(0, ersBattery - lapFractionEst * 38);
        if (ersBattery <= 1 && isPlayer) ersMode = 'BALANCED';
      } else if (ersMode === 'HARVEST') {
        ersBattery = Math.min(100, ersBattery + lapFractionEst * 27);
      } else {
        ersBattery = Math.min(100, Math.max(0, ersBattery + lapFractionEst * 4));
      }

      // Tire Temperature Physics
      const tireSpec = TIRE_SPECS[car.tire];
      const paceHeatTarget = car.paceMode === 'ATTACK' ? 114 : car.paceMode === 'CONSERVE' ? 84 : 96;
      const wetCooling = trackWetness * 0.24;
      const scCooling = flagStatus !== 'GREEN' ? 16 : 0;
      const dirtyAirHeat = inDirtyAir ? 5.5 : 0;
      const dryWetCompoundHeat = (car.tire === 'INTER' || car.tire === 'WET') && trackWetness < 14 ? 26 : 0;
      const targetTemp = Math.max(52, Math.min(136, paceHeatTarget + (track.airTempC - 22) * 0.5 + dirtyAirHeat + dryWetCompoundHeat - wetCooling - scCooling));
      const tireTemp = car.tireTemp + (targetTemp - car.tireTemp) * Math.min(1, dtSec * 0.08);

      let tempDeltaSec = 0;
      if (tireTemp < tireSpec.optTempMin) tempDeltaSec = (tireSpec.optTempMin - tireTemp) * 0.045;
      else if (tireTemp > tireSpec.optTempMax) tempDeltaSec = (tireTemp - tireSpec.optTempMax) * 0.055;

      // Wheel-to-Wheel Battle & Mistake State Machine
      let battleState = car.battleState;
      let battleTimerSec = Math.max(0, car.battleTimerSec - dtSec);
      let spinAngle = car.spinAngle;
      let wingDamage = car.wingDamage;
      let trackLimitWarnings = car.trackLimitWarnings;
      let penaltySec = car.penaltySec;
      let mistakeCooldownSec = Math.max(0, car.mistakeCooldownSec - dtSec);
      let extraSpeedPenaltySec = 0;
      let extraAttackBoostSec = 0;
      let tireWearBump = 0;

      if (battleTimerSec <= 0 && ['LOCKUP', 'WIDE', 'SPIN', 'LATE_BRAKE', 'SWITCHBACK', 'DEFENDING'].includes(battleState)) {
        battleState = 'CLEAR';
        spinAngle = 0;
      }

      if (battleState === 'SPIN') {
        extraSpeedPenaltySec += 18.0;
        spinAngle += dtSec * 8.2;
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
        // Active Line Defense
        if (gapBehindSec < 0.68 && behindCar && !behindCar.inPit) {
          const defendAggression = battleStance === 'DEFEND' ? 1.0 : battleStance === 'NEUTRAL' ? 0.55 : 0.25;
          if (Math.random() < defendAggression * dtSec * 1.4 && battleState !== 'DEFENDING') {
            battleState = 'DEFENDING';
            battleTimerSec = 2.6;
          }
        }

        // Late-Braking Divebomb or Switchback Attack
        if (gapAheadSec < 0.72 && aheadCar && !aheadCar.inPit && battleState !== 'LATE_BRAKE' && battleState !== 'SWITCHBACK') {
          if (isBraking) {
            const attackBias = battleStance === 'AGGRESSIVE' ? 1.55 : battleStance === 'DEFEND' ? 0.45 : 1.0;
            const skillEdge = (driver.racecraft - 75) / 40;
            if (Math.random() < (0.48 + skillEdge) * attackBias * dtSec * 1.5) {
              const aheadDefending = aheadCar.battleState === 'DEFENDING';
              battleState = aheadDefending ? 'SWITCHBACK' : 'LATE_BRAKE';
              battleTimerSec = 2.4;
              const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
              emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 5 });

              if (isPlayer || aheadCar.teamId === playerTeamId || car.position <= 6) {
                const targetCode = driverMap.get(aheadCar.driverId).code;
                setBanner(
                  aheadDefending
                    ? `${driver.code} SWITCHBACK ON ${targetCode} AT ${turnLabel.toUpperCase()}!`
                    : `${driver.code} LATE BRAKES ${targetCode} INTO ${turnLabel.toUpperCase()}!`,
                  aheadDefending ? '#38bdf8' : '#22c55e',
                  3.2
                );
                pushLog(
                  'BATTLE',
                  aheadDefending
                    ? `${driver.code} executes a switchback underneath ${targetCode} at ${turnLabel}!`
                    : `${driver.code} sends a late-braking lunge on ${targetCode} into ${turnLabel}!`,
                  car.lap
                );
              }

              // Wheel-to-wheel collision check
              const clashRisk = (battleStance === 'AGGRESSIVE' ? 0.065 : 0.022) * (aheadCar.battleStance === 'DEFEND' ? 1.65 : 1.0);
              if (Math.random() < clashRisk && mistakeCooldownSec <= 0) {
                wingDamage = Math.min(2, wingDamage + 1);
                penaltySec += 5;
                mistakeCooldownSec = 20;
                events.crashImpact = true;
                emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 16 });
                emitFx({ type: 'DEBRIS', x: pose.x, y: pose.y, count: 7 });
                setBanner(`CONTACT AT ${turnLabel.toUpperCase()}! ${driver.code} WING DMG (+5s PEN)`, '#ef4444', 4.5);
                pushLog('INCIDENT', `CONTACT at ${turnLabel}! ${driver.code} clips ${driverMap.get(aheadCar.driverId).code} — Wing Damage & +5s Steward Penalty!`, car.lap);
              }
            }
          } else if (gapAheadSec < 0.95) {
            battleState = 'SLIPSTREAM';
          }
        } else if (battleTimerSec <= 0) {
          battleState = 'CLEAR';
        }

        if (battleState === 'LATE_BRAKE') extraAttackBoostSec += 1.5;
        if (battleState === 'SWITCHBACK') extraAttackBoostSec += 1.3;
        if (battleState === 'DEFENDING') extraSpeedPenaltySec += 0.22;

        // Driver Mistakes: Lock-Up, Running Wide (+Track Limits), Spin, Barrier Crash
        if (mistakeCooldownSec <= 0 && !['LOCKUP', 'WIDE', 'SPIN'].includes(battleState)) {
          const wearRisk = car.tireWear > 68 ? (car.tireWear - 65) * 0.0012 : 0;
          const heatRisk = tireTemp > tireSpec.optTempMax + 6 ? 0.012 : tireTemp < tireSpec.optTempMin - 10 ? 0.01 : 0;
          const wetRisk = trackWetness > 45 ? ((100 - driver.wetSkill) / 100) * 0.018 : 0;
          const modeRisk = car.paceMode === 'ATTACK' ? 0.008 : car.paceMode === 'CONSERVE' ? -0.004 : 0;
          const consistencyBase = ((100 - driver.consistency) / 100) * 0.013;
          const totalMistakeRate = Math.max(0.0015, consistencyBase + wearRisk + heatRisk + wetRisk + modeRisk);

          if (Math.random() < totalMistakeRate * dtSec * (isBraking || wp.curvature > 0.13 ? 3.0 : 0.4)) {
            mistakeCooldownSec = 18 + Math.random() * 14;
            const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
            const roll = Math.random();

            if (isBraking && roll < 0.52) {
              battleState = 'LOCKUP';
              battleTimerSec = 1.9;
              tireWearBump += 3.2;
              events.tireScreech = true;
              emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 12 });
              emitFx({ type: 'SKID', x: pose.x, y: pose.y, angle: pose.angle });
              if (isPlayer || car.position <= 6) {
                setBanner(`${driver.code} LOCKS UP INTO ${turnLabel.toUpperCase()}!`, '#fb923c', 3.0);
                pushLog('MISTAKE', `${driver.code} locks the front brakes into ${turnLabel} (+3% flat-spot wear).`, car.lap);
              }
            } else if (roll < 0.86) {
              battleState = 'WIDE';
              battleTimerSec = 2.1;
              trackLimitWarnings += 1;
              emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 6 });
              if (trackLimitWarnings >= 3) {
                penaltySec += 5;
                trackLimitWarnings = 0;
                if (isPlayer || car.position <= 8) {
                  setBanner(`STEWARDS: +5s TRACK LIMITS PENALTY FOR ${driver.code}`, '#ef4444', 4.0);
                  pushLog('INCIDENT', `STEWARDS: ${driver.code} receives +5s Time Penalty for repeated track-limit breaches!`, car.lap);
                }
              } else if (isPlayer || car.position <= 6) {
                pushLog('MISTAKE', `${driver.code} runs wide at ${turnLabel} (Track Limit Warning ${trackLimitWarnings}/3).`, car.lap);
              }
            } else {
              battleState = 'SPIN';
              battleTimerSec = 2.8;
              tireWearBump += 4.5;
              events.tireScreech = true;
              emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 18 });
              emitFx({ type: 'SKID', x: pose.x, y: pose.y, angle: pose.angle });
              setBanner(`${driver.code} SPINS AT ${turnLabel.toUpperCase()}!`, '#ef4444', 3.8);
              pushLog('MISTAKE', `${driver.code} loses rear traction and SPINS at ${turnLabel}!`, car.lap);

              if (Math.random() < (trackWetness > 40 ? 0.34 : 0.22) && car.lap > 1 && car.lap < track.totalLaps) {
                events.crashImpact = true;
                emitFx({ type: 'SPARK', x: pose.x, y: pose.y, count: 22 });
                emitFx({ type: 'DEBRIS', x: pose.x, y: pose.y, count: 12 });
                pushLog('INCIDENT', `HEAVY CRASH at ${turnLabel}! ${driver.code} (${team.shortName}) impacts the barrier — OUT!`, car.lap);

                if (flagStatus === 'GREEN' && !incidentTriggeredThisTick) {
                  incidentTriggeredThisTick = true;
                  if (redFlagCount === 0 && Math.random() < 0.36) {
                    flagStatus = 'RED_FLAG';
                    flagTimerSec = 14;
                    redFlagCount += 1;
                    events.flagChanged = true;
                    events.isRedFlag = true;
                    setBanner(`RED FLAG — ${driver.code} CRASH AT ${turnLabel.toUpperCase()}`, '#dc2626', 8);
                    pushLog('FLAG', `RED FLAG! Barrier damage at ${turnLabel} from ${driver.code}'s crash.`, car.lap);
                  } else {
                    flagStatus = 'SC';
                    flagTimerSec = track.baseLapTimeSec * 2.2;
                    safetyCarProgress = (car.lapProgress + 0.06) % 1;
                    events.flagChanged = true;
                    setBanner(`SAFETY CAR DEPLOYED — ${driver.code} CRASH`, '#eab308', 6);
                    pushLog('FLAG', `SAFETY CAR DEPLOYED — Marshals recovering ${driver.code}'s chassis at ${turnLabel}.`, car.lap);
                  }
                }

                return {
                  ...car, dnf: true, dnfReason: `Crash (${turnLabel})`, battleState: 'SPIN',
                  drsActive: false, inDirtyAir: false, isBraking: false,
                };
              }
            }
          }
        }
      }

      // Lap Time Calculation
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

      const aheadBlockingSec = aheadCar && aheadCar.battleState === 'DEFENDING' && gapAheadSec < 0.45 && battleState !== 'SWITCHBACK' ? 0.68 : 0;
      const dirtyAirDeltaSec = inDirtyAir ? (0.42 * track.overtakeDifficulty * (1 - team.car.aero / 160)) + aheadBlockingSec : 0;
      const wingDamagePenalty = wingDamage === 2 ? 2.4 : wingDamage === 1 ? 0.9 : 0;
      const outOfFuelPenalty = car.fuelKg <= 0.1 ? 9.5 : 0;
      const jitter = ((100 - driver.consistency) / 100) * (Math.random() - 0.5) * 0.26;

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
      const sectorTimes = [...car.sectorTimes];
      const sectorColors = [...car.sectorColors];
      const personalBestSectors = [...car.personalBestSectors];
      let inPit = false;
      let pitTimerSec = 0;
      let pitRequested = car.pitRequested;
      let nextTire = car.nextTire;
      let paceMode = car.paceMode;
      let dnf = false;
      let dnfReason;

      // Live Sector 1 & Sector 2 timing splits
      if (prevProgress >= 0 && prevProgress < track.sectorSplits[0] && newProgress >= track.sectorSplits[0]) {
        const s1 = Number(currentLapElapsedSec.toFixed(3));
        sectorTimes[0] = s1;
        if (flagStatus === 'GREEN' && (sessionBestSectors[0] === null || s1 < sessionBestSectors[0])) {
          sessionBestSectors[0] = s1;
          sectorColors[0] = 'PURPLE';
        } else if (personalBestSectors[0] === null || s1 < personalBestSectors[0]) {
          sectorColors[0] = 'GREEN';
        } else {
          sectorColors[0] = 'YELLOW';
        }
        if (personalBestSectors[0] === null || s1 < personalBestSectors[0]) personalBestSectors[0] = s1;
      }
      if (prevProgress >= 0 && prevProgress < track.sectorSplits[1] && newProgress >= track.sectorSplits[1]) {
        const s2 = Number((currentLapElapsedSec - (sectorTimes[0] || currentLapElapsedSec * 0.33)).toFixed(3));
        sectorTimes[1] = s2;
        if (flagStatus === 'GREEN' && (sessionBestSectors[1] === null || s2 < sessionBestSectors[1])) {
          sessionBestSectors[1] = s2;
          sectorColors[1] = 'PURPLE';
        } else if (personalBestSectors[1] === null || s2 < personalBestSectors[1]) {
          sectorColors[1] = 'GREEN';
        } else {
          sectorColors[1] = 'YELLOW';
        }
        if (personalBestSectors[1] === null || s2 < personalBestSectors[1]) personalBestSectors[1] = s2;
      }

      // Sparks & wet spray FX
      if (flagStatus === 'GREEN' && !car.inPit) {
        if (trackWetness > 25 && Math.random() < 0.28) {
          const pose = sampleTrackPose(track, car.lapProgress, false, 0, car.lateralOffset);
          emitFx({ type: 'SPRAY', x: pose.x, y: pose.y, angle: pose.angle });
        } else if (wp.curvature < 0.035 && Math.random() < 0.04) {
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

      // AI Pit Strategy
      if (!isPlayer) {
        const remainingLaps = track.totalLaps - newLap;
        const wrongTireForRain =
          (trackWetness >= 26 && ['SOFT', 'MEDIUM', 'HARD'].includes(car.tire)) ||
          (trackWetness >= 68 && car.tire === 'INTER') ||
          (trackWetness <= 14 && ['INTER', 'WET'].includes(car.tire));
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
        const wingExtra = wingDamage > 0 ? 5.5 : 0;
        const penExtra = penaltySec > 0 ? penaltySec : 0;
        pitTimerSec = track.pitLossSec + wingExtra + penExtra + (Math.random() - 0.5) * 1.0;
        if (isPlayer) {
          events.radioAlert = true;
          events.pitStopSound = true;
          pushLog('PIT', `${driver.code} boxing for ${nextTire}${wingExtra > 0 ? ' + Wing' : ''}${penExtra > 0 ? ` + ${penExtra}s Pen` : ''}.`, newLap);
        }
      }

      if (prevProgress < 1.0 && newProgress >= 1.0) {
        const completedLaps = Math.floor(newProgress);
        newProgress -= completedLaps;
        if (prevProgress >= 0) {
          tireAgeLaps += completedLaps;
          lastLapTimeSec = Number((currentLapElapsedSec / completedLaps).toFixed(3));
          const s3 = Number((lastLapTimeSec - (sectorTimes[0] || lastLapTimeSec * 0.33) - (sectorTimes[1] || lastLapTimeSec * 0.34)).toFixed(3));
          sectorTimes[2] = s3;
          if (flagStatus === 'GREEN' && (sessionBestSectors[2] === null || s3 < sessionBestSectors[2])) {
            sessionBestSectors[2] = s3;
            sectorColors[2] = 'PURPLE';
          } else if (personalBestSectors[2] === null || s3 < personalBestSectors[2]) {
            sectorColors[2] = 'GREEN';
          } else {
            sectorColors[2] = 'YELLOW';
          }
          if (personalBestSectors[2] === null || s3 < personalBestSectors[2]) personalBestSectors[2] = s3;

          if (bestLapTimeSec === null || lastLapTimeSec < bestLapTimeSec) bestLapTimeSec = lastLapTimeSec;
          if (flagStatus === 'GREEN' && (fastestLapTimeSec === null || lastLapTimeSec < fastestLapTimeSec)) {
            fastestLapTimeSec = lastLapTimeSec;
            fastestLapDriverId = driver.id;
          }
          if (isPlayer) events.playerLapCompleted = true;

          const attackStress = paceMode === 'ATTACK' ? 1.8 : 1.0;
          const failureProb = ((102 - team.car.reliability) / 100) * 0.0019 * attackStress * completedLaps;
          if (newLap > 2 && newLap < track.totalLaps && Math.random() < failureProb) {
            dnf = true;
            dnfReason = 'Power Unit Failure';
            events.radioAlert = isPlayer;
            const pose = sampleTrackPose(track, newProgress, false, 0, car.lateralOffset);
            emitFx({ type: 'SMOKE', x: pose.x, y: pose.y, count: 16 });
            setBanner(`${driver.code} RETIRED — POWER UNIT FAILURE`, '#ef4444', 4.5);
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

      // Expanded Track Lateral Line Choreography (wider 38px ribbon -> dramatic visible moves!)
      let targetLateral = 0;
      if (battleState === 'WIDE') targetLateral = 19.5;
      else if (battleState === 'DEFENDING') targetLateral = -11.0;
      else if (battleState === 'LATE_BRAKE') targetLateral = -12.5;
      else if (battleState === 'SWITCHBACK') targetLateral = 11.5;
      else if (car.overtakeFlashSec > 0) targetLateral = 10.0;
      else if (gapAheadSec < 0.9 && !inPit) targetLateral = aheadCar && aheadCar.lateralOffset < -4 ? 9.5 : -8.5;

      const lateralOffset = car.lateralOffset + (targetLateral - car.lateralOffset) * Math.min(1, dtSec * 5.2);
      const overtakeFlashSec = Math.max(0, car.overtakeFlashSec - dtSec);

      return {
        ...car, lap: newLap, lapProgress: newProgress, totalDistance: newLap - 1 + newProgress,
        tireWear, tireTemp, tireAgeLaps, fuelKg, paceMode, ersMode, battleStance, ersBattery,
        drsActive, inDirtyAir, isBraking, battleState, battleTimerSec,
        lateralOffset, spinAngle, wingDamage, trackLimitWarnings, penaltySec,
        overtakeFlashSec, mistakeCooldownSec,
        inPit, pitTimerSec, pitRequested, nextTire,
        lastLapTimeSec, bestLapTimeSec, currentLapElapsedSec,
        sectorTimes, sectorColors, personalBestSectors, dnf, dnfReason,
      };
    });

    // Sort classification (apply unserved time penalties when race finishes!)
    const provisionallyFinished = updatedCars.some((c) => !c.dnf && c.lap > track.totalLaps);
    const sortedCars = [...updatedCars].sort((a, b) => {
      if (a.dnf && !b.dnf) return 1;
      if (!a.dnf && b.dnf) return -1;
      const distA = provisionallyFinished ? a.totalDistance - a.penaltySec / track.baseLapTimeSec : a.totalDistance;
      const distB = provisionallyFinished ? b.totalDistance - b.penaltySec / track.baseLapTimeSec : b.totalDistance;
      return distB - distA;
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
            if (isPlayerInvolved || newPos <= 6) {
              const moveTag =
                car.battleState === 'LATE_BRAKE' ? ' [LATE BRAKE]' :
                car.battleState === 'SWITCHBACK' ? ' [SWITCHBACK]' :
                car.drsActive ? ' [DRS]' :
                car.ersMode === 'OVERTAKE' ? ' [ERS]' : '';
              setBanner(`OVERTAKE! ${d1.code} PASSES ${d2.code} FOR P${newPos}${moveTag}`, '#10b981', 3.4);
              pushLog('OVERTAKE', `${d1.code} passes ${d2.code} for P${newPos}${moveTag}!`, car.lap);
              if (isPlayerInvolved) events.overtakeEvent = true;
            }
          }
        }
      }
    }

    const finished = Boolean(provisionallyFinished);
    if (finished && !prev.finished) {
      const winner = driverMap.get(sortedCars[0].driverId);
      setBanner(`CHEQUERED FLAG! ${winner.name.toUpperCase()} WINS!`, '#f59e0b', 10);
      pushLog('RACE', `CHEQUERED FLAG! ${winner.name} (${winner.code}) wins at ${track.name}!`, track.totalLaps);
      events.radioAlert = true;
    }

    return {
      nextState: {
        ...prev, elapsedSec, weather, forecast, nextWeatherChangeSec, trackWetness, trackRubber,
        flagStatus, flagTimerSec, safetyCarProgress, redFlagCount, sessionBestSectors,
        broadcastBanner, cars: sortedCars, logs, fastestLapDriverId, fastestLapTimeSec, finished,
      },
      events,
    };
  }

  // Expose full engine namespace globally for Part 2/2 (app.js)
  window.GOWS = {
    TRACK_W,
    TRACK_H,
    TIRE_SPECS,
    POINTS_SYSTEM,
    PRIZE_MONEY_MILLIONS,
    INITIAL_TEAMS,
    INITIAL_DRIVERS,
    SaveManager,
    createFreshCareer,
    soundEngine,
    generateProceduralTrack,
    isProgressInDrsZone,
    getWaypointAt,
    sampleTrackPose,
    generateInitialWeather,
    chooseOptimalTireForWetness,
    createQualifyingState,
    dispatchQualiDriver,
    stepQualifyingSimulation,
    advanceQualiStage,
    createInitialRaceState,
    stepRaceSimulation,
  };
})();