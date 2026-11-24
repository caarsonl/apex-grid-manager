// ============================================================================
// APEX GRID MANAGER — GLOBAL OPEN-WHEEL SERIES (GOWS)
// Part 2/2: Broadcast Canvas, Qualifying Q1/Q2/Q3 UI, Stint Strategy Planner,
//           Team Orders, Save Manager Modal, Garage HQ & Race Pit-Wall
// ============================================================================

const { useState, useEffect, useMemo, useRef } = React;

const {
  TRACK_W,
  TRACK_H,
  TIRE_SPECS,
  POINTS_SYSTEM,
  PRIZE_MONEY_MILLIONS,
  SaveManager,
  createFreshCareer,
  soundEngine,
  generateProceduralTrack,
  isProgressInDrsZone,
  sampleTrackPose,
  generateInitialWeather,
  createQualifyingState,
  dispatchQualiDriver,
  stepQualifyingSimulation,
  advanceQualiStage,
  createInitialRaceState,
  stepRaceSimulation,
} = window.GOWS;

function formatLapTime(sec) {
  if (sec === null || sec === undefined || !Number.isFinite(sec)) return '--:--.---';
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${rem < 10 ? '0' : ''}${rem.toFixed(3)}`;
}

function formatClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

// ============================================================================
// 1. SHARED OPEN-WHEEL CAR & TRACK DRAWING ENGINE (NO CLUTTERED POPUP WORDS)
// ============================================================================
function drawOpenWheelCar(ctx, x, y, angle, primaryColor, tireColor, opts) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (opts.spinAngle || 0));

  // Slipstream aero wake lines
  if (opts.slipstream) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(15, -6); ctx.lineTo(30, -9);
    ctx.moveTo(15, 6); ctx.lineTo(30, 9);
    ctx.stroke();
  }

  // Highlight Ring (Overtake / Defend / Player / Focus)
  if (opts.overtaking) {
    ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.92)'; ctx.lineWidth = 2.4; ctx.stroke();
  } else if (opts.defending) {
    ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)'; ctx.setLineDash([5, 3]); ctx.lineWidth = 2.0; ctx.stroke();
    ctx.setLineDash([]);
  } else if (opts.isPlayer) {
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)'; ctx.lineWidth = 1.8; ctx.stroke();
  }

  // ERS MGU-K Boost Flame
  if (opts.ersOvertake) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-14, -2.8); ctx.lineTo(-24, 0); ctx.lineTo(-14, 2.8);
    ctx.closePath(); ctx.fill();
  }

  // Carbon Brake Disc Glow & Rear Rain/Harvest Light
  if (opts.isBraking || opts.lateBrake) {
    ctx.fillStyle = opts.lateBrake ? '#ff1e1e' : '#f97316';
    ctx.beginPath(); ctx.arc(8.2, -7.0, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8.2, 7.0, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-15.5, -1.6, 2.4, 3.2);
  }

  // 4 Open-Wheel Tires (compound colored)
  ctx.fillStyle = tireColor;
  ctx.fillRect(5.6, -9.2, 5.4, 3.2);
  ctx.fillRect(5.6, 6.0, 5.4, 3.2);
  ctx.fillRect(-10.8, -9.6, 6.0, 3.6);
  ctx.fillRect(-10.8, 6.0, 6.0, 3.6);

  // Front Wing (shortened red stub if damaged)
  ctx.fillStyle = opts.wingDamage >= 2 ? '#ef4444' : '#e2e8f0';
  if (opts.wingDamage >= 2) {
    ctx.fillRect(11.6, -4.4, 2.8, 8.8);
  } else {
    ctx.fillRect(11.6, -8.5, 3.0, 17.0);
  }

  // Monocoque & Sculpted Sidepods
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(13.5, -2.0);
  ctx.lineTo(2.8, -5.8);
  ctx.lineTo(-10.8, -4.5);
  ctx.lineTo(-12.2, 0);
  ctx.lineTo(-10.8, 4.5);
  ctx.lineTo(2.8, 5.8);
  ctx.lineTo(13.5, 2.0);
  ctx.closePath();
  ctx.fill();

  // Cockpit Halo & Helmet
  ctx.fillStyle = '#020617';
  ctx.beginPath(); ctx.arc(0.6, 0, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath(); ctx.arc(1.0, 0, 1.3, 0, Math.PI * 2); ctx.fill();

  // Rear Wing (emerald green when DRS flap opens)
  ctx.fillStyle = opts.drsActive ? '#22c55e' : '#cbd5e1';
  ctx.fillRect(-14.2, -7.4, 3.0, 14.8);

  ctx.restore();
}

function drawCircuitGeometry(ctx, track, flagStatus, trackWetness, trackRubber, skids, debris) {
  const pts = track.waypoints;
  if (!pts || pts.length === 0) return;

  const traceMainLoop = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
  };

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Wide Gravel / Runoff Perimeter
  traceMainLoop();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 56;
  ctx.stroke();

  // Apex Kerbs (reactive to Flag Status)
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].curvature > 0.135) {
      const next = pts[(i + 1) % pts.length];
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(next.x, next.y);
      if (flagStatus === 'SC' || flagStatus === 'VSC') ctx.strokeStyle = i % 2 === 0 ? '#eab308' : '#0f172a';
      else if (flagStatus === 'RED_FLAG') ctx.strokeStyle = i % 2 === 0 ? '#ef4444' : '#0f172a';
      else ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#f8fafc';
      ctx.lineWidth = 44;
      ctx.stroke();
    }
  }

  // Parallel Pit Lane
  if (track.pitWaypoints && track.pitWaypoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(track.pitWaypoints[0].x, track.pitWaypoints[0].y);
    for (let i = 1; i < track.pitWaypoints.length; i++) {
      ctx.lineTo(track.pitWaypoints[i].x, track.pitWaypoints[i].y);
    }
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Wide 38px Asphalt Ribbon
  traceMainLoop();
  const wetRatio = Math.min(1, trackWetness / 100);
  ctx.strokeStyle = wetRatio > 0.25 ? '#263547' : '#334155';
  ctx.lineWidth = 38;
  ctx.stroke();

  // Rubbered-In Darker Racing Groove
  traceMainLoop();
  ctx.strokeStyle = `rgba(15, 23, 42, ${0.14 + (trackRubber / 100) * 0.24})`;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Wet Sheen
  if (wetRatio > 0.15) {
    traceMainLoop();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 + wetRatio * 0.26})`;
    ctx.lineWidth = 24;
    ctx.stroke();
  }

  // DRS Activation Zones
  if (flagStatus === 'GREEN' && trackWetness < 22) {
    for (let i = 0; i < pts.length; i++) {
      if (isProgressInDrsZone(track, pts[i].progress)) {
        const next = pts[(i + 1) % pts.length];
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.34)';
        ctx.lineWidth = 5;
        ctx.stroke();
      }
    }
  }

  // Persistent Tire Skid Marks
  if (skids && skids.length > 0) {
    skids.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = `rgba(2, 6, 23, ${s.alpha})`;
      ctx.fillRect(-8, -5, 16, 2.2);
      ctx.fillRect(-8, 2.8, 16, 2.2);
      ctx.restore();
    });
  }

  // Carbon Crash Debris
  if (debris && debris.length > 0) {
    debris.forEach((d) => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-d.size, -d.size * 0.5, d.size * 2, d.size);
      ctx.restore();
    });
  }

  // Numbered Turn Badges (T1, T2...) positioned cleanly outside apex
  if (track.turns) {
    const cx = TRACK_W * 0.5;
    const cy = TRACK_H * 0.5;
    track.turns.forEach((turn) => {
      const dx = turn.x - cx;
      const dy = turn.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const bx = turn.x + (dx / len) * 38;
      const by = turn.y + (dy / len) * 38;

      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = 'bold 9px ui-monospace, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`T${turn.number}`, bx, by);
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Sector Split Lines
  track.sectorSplits.forEach((splitProg, idx) => {
    const sPos = sampleTrackPose(track, splitProg, false, 0, 0);
    ctx.beginPath();
    ctx.arc(sPos.x, sPos.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = idx === 0 ? '#06b6d4' : '#a855f7';
    ctx.fill();
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`S${idx + 2}`, sPos.x + 11, sPos.y - 8);
  });

  // Checkered Start / Finish Line
  const sf = pts[0];
  const { nx, ny } = track.startNormal;
  ctx.save();
  ctx.translate(sf.x, sf.y);
  ctx.rotate(Math.atan2(ny, nx));
  for (let r = -18; r < 18; r += 6) {
    for (let c = -4; c < 4; c += 4) {
      ctx.fillStyle = ((r + c) / 2) % 2 === 0 ? '#ffffff' : '#0f172a';
      ctx.fillRect(r, c, 6, 4);
    }
  }
  ctx.restore();
  ctx.restore();
}

// ============================================================================
// 2. BROADCAST RACE TRACK CANVAS (LARGE 1400x820 STAGE)
// ============================================================================
function TrackCanvas({ raceState, teams, drivers, playerTeamId, fxQueueRef, cameraMode, focusDriverId }) {
  const canvasRef = useRef(null);
  const rainRef = useRef([]);
  const particlesRef = useRef([]);
  const skidsRef = useRef([]);
  const debrisRef = useRef([]);
  const camRef = useRef({ x: TRACK_W * 0.5, y: TRACK_H * 0.5, zoom: 1 });

  useEffect(() => {
    const drops = [];
    for (let i = 0; i < 160; i++) {
      drops.push({ x: Math.random() * TRACK_W, y: Math.random() * TRACK_H, len: 10 + Math.random() * 12, speed: 7 + Math.random() * 7 });
    }
    rainRef.current = drops;
  }, []);

  useEffect(() => {
    while (fxQueueRef.current.length > 0) {
      const ev = fxQueueRef.current.shift();
      if (ev.type === 'CLEAR_DEBRIS') {
        debrisRef.current = [];
      } else if (ev.type === 'SKID') {
        skidsRef.current.push({ x: ev.x, y: ev.y, angle: ev.angle, alpha: 0.52 });
        if (skidsRef.current.length > 140) skidsRef.current.shift();
      } else if (ev.type === 'DEBRIS') {
        for (let i = 0; i < (ev.count || 6); i++) {
          debrisRef.current.push({
            x: ev.x + (Math.random() - 0.5) * 32,
            y: ev.y + (Math.random() - 0.5) * 32,
            size: 2 + Math.random() * 3,
            rot: Math.random() * Math.PI,
          });
        }
        if (debrisRef.current.length > 80) debrisRef.current.splice(0, 15);
      } else if (ev.type === 'SMOKE') {
        for (let i = 0; i < (ev.count || 4); i++) {
          particlesRef.current.push({
            kind: 'SMOKE',
            x: ev.x + (Math.random() - 0.5) * 8,
            y: ev.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            r: 4 + Math.random() * 5,
            life: 1.0,
          });
        }
      } else if (ev.type === 'SPARK') {
        for (let i = 0; i < (ev.count || 4); i++) {
          particlesRef.current.push({
            kind: 'SPARK',
            x: ev.x, y: ev.y,
            vx: (Math.random() - 0.5) * 5.0,
            vy: (Math.random() - 0.5) * 5.0,
            r: 2.0, life: 1.0,
          });
        }
      } else if (ev.type === 'SPRAY') {
        particlesRef.current.push({
          kind: 'SPRAY',
          x: ev.x - Math.cos(ev.angle) * 14,
          y: ev.y - Math.sin(ev.angle) * 14,
          vx: -Math.cos(ev.angle) * 1.8 + (Math.random() - 0.5),
          vy: -Math.sin(ev.angle) * 1.8 + (Math.random() - 0.5),
          r: 4.5, life: 0.72,
        });
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { track, cars, weather, trackWetness, trackRubber, flagStatus, safetyCarProgress } = raceState;

    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        r: p.kind === 'SMOKE' ? p.r + 0.42 : p.r,
        life: p.life - (p.kind === 'SPARK' ? 0.11 : 0.055),
      }))
      .filter((p) => p.life > 0);
    if (particlesRef.current.length > 240) particlesRef.current.splice(0, particlesRef.current.length - 240);

    // Smooth camera interpolation
    let targetX = TRACK_W * 0.5;
    let targetY = TRACK_H * 0.5;
    let targetZoom = 1.0;

    if (cameraMode === 'BATTLE') {
      const targetCar =
        cars.find((c) => c.driverId === focusDriverId && !c.dnf) ||
        cars.find((c) => !c.dnf && ['LATE_BRAKE', 'SWITCHBACK', 'DEFENDING'].includes(c.battleState)) ||
        cars.find((c) => c.teamId === playerTeamId && !c.dnf) ||
        cars[0];
      if (targetCar) {
        const pose = sampleTrackPose(track, targetCar.lapProgress, targetCar.inPit, targetCar.pitTimerSec, targetCar.lateralOffset);
        targetX = pose.x;
        targetY = pose.y;
        targetZoom = 1.95;
      }
    }

    camRef.current.x += (targetX - camRef.current.x) * 0.14;
    camRef.current.y += (targetY - camRef.current.y) * 0.14;
    camRef.current.zoom += (targetZoom - camRef.current.zoom) * 0.12;

    // Background
    ctx.clearRect(0, 0, TRACK_W, TRACK_H);
    const bgGrad = ctx.createRadialGradient(TRACK_W * 0.5, TRACK_H * 0.5, 90, TRACK_W * 0.5, TRACK_H * 0.5, 860);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, TRACK_W, TRACK_H);

    ctx.save();
    ctx.translate(TRACK_W * 0.5, TRACK_H * 0.5);
    ctx.scale(camRef.current.zoom, camRef.current.zoom);
    ctx.translate(-camRef.current.x, -camRef.current.y);

    // Subtle telemetry grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.18)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= TRACK_W; gx += 70) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, TRACK_H); ctx.stroke();
    }
    for (let gy = 0; gy <= TRACK_H; gy += 70) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(TRACK_W, gy); ctx.stroke();
    }

    drawCircuitGeometry(ctx, track, flagStatus, trackWetness, trackRubber, skidsRef.current, debrisRef.current);

    // Pit-Exit Rejoin Ghost Markers for Player Cars requesting a pit stop
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
        ctx.arc(ghostPose.x, ghostPose.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#22d3ee';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(8, 51, 68, 0.92)';
        ctx.fillRect(ghostPose.x + 16, ghostPose.y - 12, 74, 16);
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText(`${drv.code}→P${rejoinPosRank}`, ghostPose.x + 20, ghostPose.y - 1);
        ctx.restore();
      });

    // Safety Car
    if (flagStatus === 'SC') {
      const scPose = sampleTrackPose(track, safetyCarProgress, false, 0, 0);
      drawOpenWheelCar(ctx, scPose.x, scPose.y, scPose.angle, '#f8fafc', '#eab308', {});
      ctx.fillStyle = '#eab308';
      ctx.fillRect(scPose.x + 14, scPose.y - 16, 26, 13);
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillStyle = '#020617';
      ctx.fillText('SC', scPose.x + 19, scPose.y - 6);
    }

    // Smoke / Sparks / Wet Spray
    particlesRef.current.forEach((p) => {
      if (p.kind === 'SMOKE') {
        ctx.fillStyle = `rgba(226, 232, 240, ${p.life * 0.45})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'SPRAY') {
        ctx.fillStyle = `rgba(125, 211, 252, ${p.life * 0.35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'SPARK') {
        ctx.fillStyle = `rgba(251, 191, 36, ${p.life})`;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
    });

    // Render Open-Wheel Cars
    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    const drawOrder = [...cars]
      .filter((c) => !c.dnf)
      .sort((a, b) => {
        const aP = a.teamId === playerTeamId ? 1 : 0;
        const bP = b.teamId === playerTeamId ? 1 : 0;
        if (aP !== bP) return aP - bP;
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

      // Clean minimal 3-letter tag (no cluttered popup words!)
      const tagX = pose.x + 16;
      const tagY = pose.y - 9;
      ctx.fillStyle =
        car.overtakeFlashSec > 0
          ? 'rgba(16, 185, 129, 0.95)'
          : isPlayer
            ? 'rgba(245, 158, 11, 0.95)'
            : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(tagX - 3, tagY - 10, 32, 14);

      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillStyle = isPlayer || car.overtakeFlashSec > 0 ? '#020617' : '#f8fafc';
      ctx.fillText(driver.code, tagX, tagY);
    });

    ctx.restore();

    // Screen-space Rain Overlay
    if (weather === 'LIGHT_RAIN' || weather === 'HEAVY_RAIN') {
      const activeDrops = weather === 'HEAVY_RAIN' ? 160 : 65;
      const speedMult = weather === 'HEAVY_RAIN' ? 1.55 : 0.9;
      ctx.strokeStyle = weather === 'HEAVY_RAIN' ? 'rgba(125, 211, 252, 0.45)' : 'rgba(125, 211, 252, 0.25)';
      ctx.lineWidth = weather === 'HEAVY_RAIN' ? 1.6 : 1;
      for (let i = 0; i < activeDrops; i++) {
        const drop = rainRef.current[i];
        drop.x -= drop.speed * 0.35 * speedMult;
        drop.y += drop.speed * speedMult;
        if (drop.y > TRACK_H) { drop.y = -12; drop.x = Math.random() * TRACK_W; }
        if (drop.x < 0) drop.x += TRACK_W;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - drop.len * 0.35, drop.y + drop.len);
        ctx.stroke();
      }
    }

    // Minimal Corner Telemetry HUD
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.fillRect(16, 16, 390, 48);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, 390, 48);

    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${track.name.toUpperCase()} // ${track.lengthKm.toFixed(2)} KM`, 28, 36);

    ctx.font = '11px ui-monospace, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(
      `GRIP: ${Math.round(trackRubber)}% · WET: ${Math.round(trackWetness)}% · DRS: ${flagStatus === 'GREEN' && trackWetness < 22 ? 'ENABLED' : 'OFF'}`,
      28,
      54
    );

    if (flagStatus !== 'GREEN') {
      ctx.fillStyle = flagStatus === 'RED_FLAG' ? 'rgba(220, 38, 38, 0.94)' : 'rgba(234, 179, 8, 0.94)';
      ctx.fillRect(TRACK_W - 280, 16, 264, 36);
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.fillStyle = flagStatus === 'RED_FLAG' ? '#ffffff' : '#020617';
      const label = flagStatus === 'RED_FLAG' ? 'RED FLAG — SESSION HALTED' : flagStatus === 'SC' ? 'SAFETY CAR DEPLOYED' : 'VIRTUAL SAFETY CAR';
      ctx.fillText(label, TRACK_W - 264, 39);
    }
  }, [raceState, teams, drivers, playerTeamId, cameraMode, focusDriverId]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 broadcast-glow">
      {/* Single Clean Broadcast Event Ticker */}
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-950 px-4 py-2 font-mono text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full animate-pulse"
            style={{ backgroundColor: raceState.broadcastBanner ? raceState.broadcastBanner.color : '#22c55e' }}
          />
          <span
            className="font-bold tracking-wide truncate"
            style={{ color: raceState.broadcastBanner ? raceState.broadcastBanner.color : '#cbd5e1' }}
          >
            {raceState.broadcastBanner
              ? raceState.broadcastBanner.text
              : `LIVE TELEMETRY — LAP ${Math.min(raceState.cars[0]?.lap ?? 1, raceState.track.totalLaps)} OF ${raceState.track.totalLaps}`}
          </span>
        </div>
        <span className="shrink-0 text-[11px] text-slate-400">
          CAM: <strong className="text-amber-300">{cameraMode === 'BATTLE' ? '1.95X ZOOM' : 'FULL CIRCUIT'}</strong>
        </span>
      </div>

      <canvas ref={canvasRef} width={TRACK_W} height={TRACK_H} className="block h-auto w-full select-none" />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/90 px-4 py-2 text-[11px] text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />Player / Defending</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />DRS / Overtake</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />ERS / Slipstream</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-cyan-400" />Pit Rejoin Ghost</span>
        </div>
        <div>Air {raceState.track.airTempC}°C · Pit Loss ~{raceState.track.pitLossSec}s</div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. QUALIFYING CANVAS & 3-STAGE KNOCKOUT UI (Q1 / Q2 / Q3)
// ============================================================================
function QualifyingTrackCanvas({ qualiState, teams, drivers, playerTeamId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { track, entries, trackWetness, trackEvolution } = qualiState;
    ctx.clearRect(0, 0, TRACK_W, TRACK_H);
    const bgGrad = ctx.createRadialGradient(TRACK_W * 0.5, TRACK_H * 0.5, 90, TRACK_W * 0.5, TRACK_H * 0.5, 860);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, TRACK_W, TRACK_H);

    drawCircuitGeometry(ctx, track, 'GREEN', trackWetness, trackEvolution, [], []);

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    entries
      .filter((e) => !e.eliminatedIn && e.status !== 'GARAGE')
      .forEach((entry) => {
        const team = teamMap.get(entry.teamId);
        const driver = driverMap.get(entry.driverId);
        const pose = sampleTrackPose(track, entry.lapProgress, false, 0, entry.lateralOffset);
        const isFlying = entry.status === 'FLYING_LAP';
        const isPlayer = team.id === playerTeamId;

        drawOpenWheelCar(ctx, pose.x, pose.y, pose.angle, team.primaryColor, TIRE_SPECS[entry.tire].color, {
          isPlayer,
          drsActive: isFlying && isProgressInDrsZone(track, entry.lapProgress) && trackWetness < 22,
          ersOvertake: isFlying,
          overtaking: isFlying,
        });

        const tagX = pose.x + 16;
        const tagY = pose.y - 9;
        ctx.fillStyle = isFlying ? 'rgba(168, 85, 247, 0.94)' : 'rgba(15, 23, 42, 0.86)';
        ctx.fillRect(tagX - 3, tagY - 10, 32, 14);
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(driver.code, tagX, tagY);
      });

    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.fillRect(16, 16, 370, 44);
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${qualiState.stage} QUALIFYING // ${track.name.toUpperCase()}`, 28, 35);
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`TRACK EVOLUTION GRIP: ${Math.round(trackEvolution)}% · WET: ${Math.round(trackWetness)}%`, 28, 52);
  }, [qualiState, teams, drivers, playerTeamId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 broadcast-glow">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 font-mono text-xs">
        <span className="font-bold" style={{ color: qualiState.banner?.color || '#22c55e' }}>
          {qualiState.banner?.text || `${qualiState.stage} SESSION LIVE`}
        </span>
        <span className="text-slate-400">
          PURPLE = SESSION BEST · GREEN = PERSONAL BEST · YELLOW = OFF PACE
        </span>
      </div>
      <canvas ref={canvasRef} width={TRACK_W} height={TRACK_H} className="block h-auto w-full select-none" />
    </div>
  );
}

function QualifyingView({
  qualiState,
  teams,
  drivers,
  playerTeamId,
  simSpeed,
  setSimSpeed,
  onDispatchDriver,
  onAdvanceStage,
  onSkipToSetup,
}) {
  const [selectedTires, setSelectedTires] = useState(() => {
    const def = qualiState.trackWetness >= 60 ? 'WET' : qualiState.trackWetness >= 22 ? 'INTER' : 'SOFT';
    const map = {};
    drivers.filter((d) => d.teamId === playerTeamId).forEach((d) => { map[d.id] = def; });
    return map;
  });

  const playerDrivers = drivers.filter((d) => d.teamId === playerTeamId);
  const cutoffPos = qualiState.stage === 'Q1' ? 9 : qualiState.stage === 'Q2' ? 6 : 12;
  const bestSessionLap = qualiState.entries.find((e) => !e.eliminatedIn && e.bestLapSec !== null)?.bestLapSec || null;

  const sectorPillClass = (col) =>
    col === 'PURPLE' ? 'sector-purple' : col === 'GREEN' ? 'sector-green' : col === 'YELLOW' ? 'sector-yellow' : 'bg-slate-800 text-slate-600';

  return (
    <div className="space-y-4">
      {/* Qualifying Top Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
          <span className="rounded-lg bg-purple-600 px-3 py-1 text-sm font-black text-white">
            {qualiState.stage === 'DONE' ? 'GRID SET' : qualiState.stage}
          </span>
          <div>
            <span className="text-slate-400">CLOCK: </span>
            <span className="text-base font-black text-amber-300 tabular-nums">{formatClock(qualiState.timeRemainingSec)}</span>
          </div>
          <div>
            <span className="text-slate-400">EVOLUTION: </span>
            <span className="font-bold text-purple-300 tabular-nums">{Math.round(qualiState.trackEvolution)}%</span>
          </div>
          <div>
            <span className="text-slate-400">WEATHER: </span>
            <span className="font-bold text-cyan-300">{qualiState.weather.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[0, 1, 2, 4, 8, 16].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`rounded-lg px-2.5 py-1.5 font-bold transition ${
                simSpeed === spd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spd === 0 ? 'PAUSE' : `${spd}X`}
            </button>
          ))}

          {qualiState.stageComplete && qualiState.stage !== 'Q3' && qualiState.stage !== 'DONE' && (
            <button
              onClick={onAdvanceStage}
              className="ml-2 rounded-lg bg-purple-500 px-4 py-1.5 font-black uppercase text-white animate-pulse hover:bg-purple-400"
            >
              Start {qualiState.stage === 'Q1' ? 'Q2' : 'Q3'} →
            </button>
          )}

          {(qualiState.stage === 'DONE' || (qualiState.stageComplete && qualiState.stage === 'Q3')) && (
            <button
              onClick={onSkipToSetup}
              className="ml-2 rounded-lg bg-emerald-500 px-4 py-1.5 font-black uppercase text-slate-950 animate-pulse hover:bg-emerald-400"
            >
              Proceed to Race Strategy →
            </button>
          )}
        </div>
      </div>

      {/* Main Split: 3-Col Qualifying Classification + 9-Col Big Track */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-3 flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-950/70 px-3.5 py-2.5 flex justify-between items-center font-mono text-xs">
            <span className="font-bold uppercase text-slate-200">{qualiState.stage} Leaderboard</span>
            <span className="text-rose-400 text-[10px]">
              {qualiState.stage === 'Q1' ? 'P10-12 DROP' : qualiState.stage === 'Q2' ? 'P7-9 DROP' : 'TOP 6 POLE'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase text-slate-400">
                  <th className="py-2 pl-2.5">Pos</th>
                  <th className="py-2 px-1">Drv</th>
                  <th className="py-2 px-1 text-center">Sectors</th>
                  <th className="py-2 pr-2.5 text-right">Best / Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {qualiState.entries.map((e, idx) => {
                  const pos = idx + 1;
                  const drv = drivers.find((d) => d.id === e.driverId);
                  const team = teams.find((t) => t.id === e.teamId);
                  const inDangerZone = !e.eliminatedIn && pos > cutoffPos;
                  const gap = bestSessionLap && e.bestLapSec ? e.bestLapSec - bestSessionLap : null;

                  return (
                    <tr
                      key={e.driverId}
                      className={`${
                        e.eliminatedIn
                          ? 'opacity-40 bg-slate-950/70'
                          : inDangerZone
                            ? 'bg-rose-950/40 border-l-2 border-l-rose-500'
                            : team.isPlayer
                              ? 'bg-amber-500/10'
                              : ''
                      }`}
                    >
                      <td className="py-1.5 pl-2.5 font-bold text-slate-300">{pos}</td>
                      <td className="py-1.5 px-1">
                        <div className="flex items-center gap-1">
                          <span className="h-3 w-1 rounded" style={{ backgroundColor: team.primaryColor }} />
                          <span className={`font-bold ${team.isPlayer ? 'text-amber-300' : 'text-slate-100'}`}>{drv.code}</span>
                          {e.status === 'FLYING_LAP' && <span className="rounded bg-purple-500/30 px-1 text-[8px] font-bold text-purple-200">FLY</span>}
                          {e.status === 'OUT_LAP' && <span className="rounded bg-slate-700 px-1 text-[8px] text-slate-300">OUT</span>}
                        </div>
                      </td>
                      <td className="py-1.5 px-1">
                        <div className="flex justify-center gap-0.5">
                          {[0, 1, 2].map((sIdx) => (
                            <span key={sIdx} className={`h-2.5 w-3.5 rounded-sm ${sectorPillClass(e.lastSectorColors[sIdx])}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-1.5 pr-2.5 text-right text-[11px]">
                        {e.eliminatedIn ? (
                          <span className="text-rose-400">OUT ({e.eliminatedIn})</span>
                        ) : e.bestLapSec === null ? (
                          <span className="text-slate-500">NO TIME</span>
                        ) : pos === 1 ? (
                          <span className="font-bold text-purple-300">{formatLapTime(e.bestLapSec)}</span>
                        ) : (
                          <span className="text-slate-300">+{gap.toFixed(3)}s</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-9 space-y-4">
          <QualifyingTrackCanvas qualiState={qualiState} teams={teams} drivers={drivers} playerTeamId={playerTeamId} />

          {/* Player Garage Dispatch Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {playerDrivers.map((drv) => {
              const entry = qualiState.entries.find((e) => e.driverId === drv.id);
              const tireChoice = selectedTires[drv.id] || 'SOFT';
              const canSend = !entry.eliminatedIn && entry.status === 'GARAGE' && !qualiState.stageComplete && qualiState.timeRemainingSec > 18;

              return (
                <div key={drv.id} className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="font-mono text-xs text-amber-400">#{drv.carNumber} · {drv.code}</span>
                      <div className="font-bold text-white">{drv.name}</div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-slate-400">STATUS: <strong className="text-cyan-300">{entry.eliminatedIn ? `OUT (${entry.eliminatedIn})` : entry.status.replace('_', ' ')}</strong></div>
                      <div className="text-slate-300">BEST: <strong>{formatLapTime(entry.bestLapSec)}</strong></div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-1.5">
                      {['SOFT', 'MEDIUM', 'INTER', 'WET'].map((comp) => {
                        const spec = TIRE_SPECS[comp];
                        const active = tireChoice === comp;
                        return (
                          <button
                            key={comp}
                            disabled={!canSend}
                            onClick={() => setSelectedTires((p) => ({ ...p, [drv.id]: comp }))}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1 font-mono text-xs font-bold transition ${
                              active ? 'border-amber-400 bg-slate-800 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                            } disabled:opacity-35`}
                          >
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: spec.color }} />
                            {comp}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={!canSend}
                      onClick={() => onDispatchDriver(drv.id, tireChoice)}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 font-mono text-xs font-black uppercase text-slate-950 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      {entry.eliminatedIn ? 'Eliminated' : entry.status === 'GARAGE' ? 'Send Out on Track →' : 'On Track...'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. STINT STRATEGY PLANNER & DEGRADATION CURVE CHART
// ============================================================================
function buildStrategyPresets(track, initialWeather) {
  const L = track.totalLaps;
  if (initialWeather === 'HEAVY_RAIN') {
    return [
      { id: 'wet-safe', name: 'Full Wet Endurance', stints: [{ compound: 'WET', laps: Math.round(L * 0.55) }, { compound: 'WET', laps: L - Math.round(L * 0.55) }] },
      { id: 'wet-inter', name: 'Wet → Drying Inter', stints: [{ compound: 'WET', laps: Math.round(L * 0.48) }, { compound: 'INTER', laps: L - Math.round(L * 0.48) }] },
    ];
  }
  if (initialWeather === 'LIGHT_RAIN') {
    return [
      { id: 'inter-1stop', name: '1-Stop Inter → Inter', stints: [{ compound: 'INTER', laps: Math.round(L * 0.52) }, { compound: 'INTER', laps: L - Math.round(L * 0.52) }] },
      { id: 'inter-dry', name: 'Crossover Inter → Med', stints: [{ compound: 'INTER', laps: Math.round(L * 0.42) }, { compound: 'MEDIUM', laps: L - Math.round(L * 0.42) }] },
    ];
  }

  const s1 = Math.max(6, Math.round(L * 0.36));
  const m1 = Math.max(8, Math.round(L * 0.44));
  const a1 = Math.max(6, Math.round(L * 0.30));
  const a2 = Math.max(7, Math.round(L * 0.38));

  return [
    {
      id: '1stop-mh',
      name: '1-Stop Balanced (M → H)',
      stints: [{ compound: 'MEDIUM', laps: m1 }, { compound: 'HARD', laps: L - m1 }],
    },
    {
      id: '1stop-sh',
      name: '1-Stop Undercut (S → H)',
      stints: [{ compound: 'SOFT', laps: s1 }, { compound: 'HARD', laps: L - s1 }],
    },
    {
      id: '2stop-sms',
      name: '2-Stop Attack (S → M → S)',
      stints: [{ compound: 'SOFT', laps: a1 }, { compound: 'MEDIUM', laps: a2 }, { compound: 'SOFT', laps: Math.max(4, L - a1 - a2) }],
    },
  ];
}

function DegradationCurveCanvas({ track, stints }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 520;
    const H = 135;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    // 72% wear cliff (28% life remaining) danger line
    const cliffY = H - 20 - (28 / 100) * (H - 36);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(32, cliffY);
    ctx.lineTo(W - 10, cliffY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '9px ui-monospace, monospace';
    ctx.fillStyle = '#f87171';
    ctx.fillText('CLIFF (28%)', 36, cliffY - 4);

    // Plot life curve across all laps
    const totalLaps = track.totalLaps;
    let lapCursor = 0;

    stints.forEach((stint, sIdx) => {
      const spec = TIRE_SPECS[stint.compound];
      const degPerLap = spec.degPerLap * track.tireAbrasion;

      ctx.beginPath();
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = 2.5;

      for (let i = 0; i <= stint.laps; i++) {
        const currentLap = Math.min(totalLaps, lapCursor + i);
        const life = Math.max(0, 100 - i * degPerLap);
        const x = 32 + (currentLap / totalLaps) * (W - 44);
        const y = H - 20 - (life / 100) * (H - 36);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pit stop vertical divider
      if (sIdx > 0) {
        const px = 32 + (lapCursor / totalLaps) * (W - 44);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, 12);
        ctx.lineTo(px, H - 18);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`PIT L${lapCursor}`, px + 3, 22);
      }

      lapCursor += stint.laps;
    });

    // Axes labels
    ctx.fillStyle = '#64748b';
    ctx.fillText('100%', 4, 20);
    ctx.fillText('0%', 12, H - 18);
    ctx.fillText(`L1`, 32, H - 6);
    ctx.fillText(`L${totalLaps}`, W - 30, H - 6);
  }, [track, stints]);

  return (
    <canvas ref={canvasRef} width={520} height={135} className="w-full rounded-lg border border-slate-800 bg-slate-950" />
  );
}

function LiveStintTracker({ raceState, playerDrivers, plannedStrategies }) {
  const leaderLap = Math.min(raceState.cars[0]?.lap ?? 1, raceState.track.totalLaps);
  const totalLaps = raceState.track.totalLaps;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg">
      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span className="font-bold uppercase tracking-wider text-slate-200">Planned Stint Strategy & Pit Windows</span>
        <span className="text-slate-400">Current Race Lap: <strong className="text-amber-300">L{leaderLap} / L{totalLaps}</strong></span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {playerDrivers.map((drv) => {
          const plan = plannedStrategies[drv.id];
          const car = raceState.cars.find((c) => c.driverId === drv.id);
          if (!plan || !car) return null;

          let acc = 0;
          const pitWindows = [];
          plan.stints.slice(0, -1).forEach((s) => {
            acc += s.laps;
            pitWindows.push(acc);
          });

          const nextWindow = pitWindows.find((w) => w >= car.lap - 1);
          const inWindow = nextWindow && Math.abs(car.lap - nextWindow) <= 2 && !car.inPit;

          return (
            <div key={drv.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 font-mono text-xs">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-bold text-amber-300">{drv.code} — {plan.name}</span>
                {inWindow ? (
                  <span className="rounded bg-cyan-500/20 border border-cyan-400 px-1.5 py-0.5 text-[10px] font-black text-cyan-300 animate-pulse">
                    PIT WINDOW OPEN (L{nextWindow})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    {nextWindow ? `Target Box: Lap ${nextWindow}` : 'Final Stint to Flag'}
                  </span>
                )}
              </div>

              <div className="relative flex h-5 w-full overflow-hidden rounded-md bg-slate-900 border border-slate-800">
                {plan.stints.map((stint, idx) => {
                  const spec = TIRE_SPECS[stint.compound];
                  const widthPct = (stint.laps / totalLaps) * 100;
                  return (
                    <div
                      key={idx}
                      style={{ width: `${widthPct}%`, backgroundColor: spec.color, color: spec.textColor }}
                      className="flex items-center justify-center text-[10px] font-black border-r border-slate-950/60"
                    >
                      {spec.short} ({stint.laps}L)
                    </div>
                  );
                })}
                {/* Current Lap Marker Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_#fff]"
                  style={{ left: `${Math.min(100, (car.lap / totalLaps) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. TEAM ORDERS BAR, TIMING TOWER, PIT-WALL, RACE LOG & SAVE MODAL
// ============================================================================
function TeamOrdersBar({ playerDrivers, raceState, teamOrder, onSetTeamOrder }) {
  const carA = raceState.cars.find((c) => c.driverId === playerDrivers[0]?.id);
  const carB = raceState.cars.find((c) => c.driverId === playerDrivers[1]?.id);
  if (!carA || !carB) return null;

  const bothActive = !carA.dnf && !carB.dnf && !carA.inPit && !carB.inPit;
  const frontCar = carA.position < carB.position ? carA : carB;
  const rearCar = carA.position < carB.position ? carB : carA;
  const frontDrv = playerDrivers.find((d) => d.id === frontCar.driverId);
  const rearDrv = playerDrivers.find((d) => d.id === rearCar.driverId);
  const gapBetween = Math.abs(frontCar.totalDistance - rearCar.totalDistance) * raceState.track.baseLapTimeSec;
  const canSwap = bothActive && gapBetween <= 3.5;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-slate-900/95 px-4 py-2.5 font-mono text-xs shadow-lg">
      <div className="flex items-center gap-3">
        <span className="rounded bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300">
          PIT WALL TEAM ORDERS
        </span>
        <span className="text-slate-300">
          {bothActive
            ? `${frontDrv.code} (P${frontCar.position}) ahead of ${rearDrv.code} (P${rearCar.position}) by ${gapBetween.toFixed(2)}s`
            : 'Single-car status active'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => onSetTeamOrder('FREE')}
          className={`rounded-lg border px-3 py-1 font-bold transition ${
            teamOrder === 'FREE' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200'
          }`}
        >
          FREE TO RACE
        </button>
        <button
          disabled={!bothActive}
          onClick={() => onSetTeamOrder('HOLD')}
          className={`rounded-lg border px-3 py-1 font-bold transition ${
            teamOrder === 'HOLD' ? 'border-amber-400 bg-amber-500/20 text-amber-200' : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200'
          } disabled:opacity-40`}
        >
          HOLD POSITIONS
        </button>
        <button
          disabled={!canSwap}
          onClick={() => onSetTeamOrder('SWAP')}
          title={canSwap ? 'Instruct leading teammate to lift and let trailing teammate pass' : 'Teammates must be within 3.5s on track to swap'}
          className={`rounded-lg border px-3 py-1 font-bold transition ${
            teamOrder === 'SWAP'
              ? 'border-cyan-400 bg-cyan-500 text-slate-950 animate-pulse'
              : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
          } disabled:opacity-35`}
        >
          {teamOrder === 'SWAP' ? `SWAPPING ${frontDrv.code} ⇄ ${rearDrv.code}...` : `SWAP CARS (${rearDrv.code} PAST ${frontDrv.code})`}
        </button>
      </div>
    </div>
  );
}

function TimingTower({ raceState, teams, drivers, playerTeamId, focusDriverId, onSelectFocus }) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));

  const sectorColorClass = (c) =>
    c === 'PURPLE' ? 'sector-purple' : c === 'GREEN' ? 'sector-green' : c === 'YELLOW' ? 'sector-yellow' : 'bg-slate-800';

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/95 shadow-xl overflow-hidden h-full">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${raceState.flagStatus === 'RED_FLAG' ? 'bg-rose-500' : raceState.flagStatus !== 'GREEN' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Timing Tower</h2>
        </div>
        <span className="font-mono text-xs text-amber-300 font-bold tabular-nums">
          L{Math.min(raceState.cars[0]?.lap ?? 1, raceState.track.totalLaps)}/{raceState.track.totalLaps}
        </span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse font-mono text-[11px] tabular-nums">
          <thead>
            <tr className="border-b border-slate-800/90 bg-slate-950/40 text-[9px] uppercase text-slate-400">
              <th className="py-2 pl-2.5 pr-1">P</th>
              <th className="py-2 px-1">Drv</th>
              <th className="py-2 px-1 text-right">Int</th>
              <th className="py-2 px-1 text-center">Sec</th>
              <th className="py-2 px-1 text-center">T</th>
              <th className="py-2 pr-2.5 text-right">Life</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {raceState.cars.map((car) => {
              const team = teamMap.get(car.teamId);
              const driver = driverMap.get(car.driverId);
              const isPlayer = team.id === playerTeamId;
              const isFocused = focusDriverId === car.driverId;
              const tireSpec = TIRE_SPECS[car.tire];

              return (
                <tr
                  key={car.driverId}
                  onClick={() => onSelectFocus(car.driverId)}
                  className={`cursor-pointer transition-colors ${
                    car.dnf
                      ? 'opacity-40 bg-slate-950/60'
                      : isFocused
                        ? 'bg-cyan-500/20 ring-1 ring-inset ring-cyan-400/50'
                        : isPlayer
                          ? 'bg-amber-500/10 hover:bg-amber-500/15'
                          : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-1.5 pl-2.5 pr-1 font-bold text-slate-300">{car.dnf ? 'OUT' : car.position}</td>
                  <td className="py-1.5 px-1">
                    <div className="flex items-center gap-1">
                      <span className="inline-block h-3 w-1 rounded-sm shrink-0" style={{ backgroundColor: team.primaryColor }} />
                      <span className={`font-bold ${isPlayer ? 'text-amber-300' : 'text-slate-100'}`}>{driver.code}</span>
                      {car.drsActive && <span className="rounded bg-emerald-500/30 px-1 text-[8px] font-bold text-emerald-300">DRS</span>}
                      {car.inPit && <span className="rounded bg-amber-500/25 px-1 text-[8px] font-bold text-amber-300">PIT</span>}
                      {car.penaltySec > 0 && <span className="rounded bg-rose-600 px-1 text-[8px] font-black text-white">+{car.penaltySec}s</span>}
                    </div>
                  </td>
                  <td className="py-1.5 px-1 text-right text-slate-300">
                    {car.dnf ? 'DNF' : car.position === 1 ? 'LDR' : `+${car.intervalSec.toFixed(1)}`}
                  </td>
                  <td className="py-1.5 px-1">
                    <div className="flex justify-center gap-0.5">
                      {[0, 1, 2].map((idx) => (
                        <span key={idx} className={`h-2 w-2.5 rounded-sm ${sectorColorClass(car.sectorColors[idx])}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black" style={{ backgroundColor: tireSpec.color, color: tireSpec.textColor }}>
                      {tireSpec.short}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2.5 text-right">
                    <span className={car.tireWear > 72 ? 'text-rose-400 font-bold' : car.tireWear > 45 ? 'text-amber-300' : 'text-emerald-400'}>
                      {Math.round(100 - car.tireWear)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-[10px] text-slate-500">
        Click any driver to lock Battle Zoom Cam.
      </div>
    </div>
  );
}

function DriverPitWall({ driver, telemetry, onChangePace, onChangeErs, onChangeStance, onTogglePit }) {
  const tireLife = Math.max(0, Math.round(100 - telemetry.tireWear));
  const currentTire = TIRE_SPECS[telemetry.tire];
  const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTER', 'WET'];
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
              {telemetry.wingDamage > 0 && <span className="rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[9px] font-black text-white">WING DMG</span>}
              {telemetry.penaltySec > 0 && <span className="rounded bg-rose-500/30 border border-rose-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-200">+{telemetry.penaltySec}s PEN</span>}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {telemetry.dnf ? (
                <span className="text-rose-400 font-bold">RETIRED — {telemetry.dnfReason}</span>
              ) : (
                <>P<strong className="text-white">{telemetry.position}</strong> · Stops {telemetry.pitStopsCount} · State: <span className="text-cyan-300">{telemetry.battleState}</span></>
              )}
            </div>
          </div>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-black shadow" style={{ backgroundColor: currentTire.color, color: currentTire.textColor }}>
          {currentTire.short}
        </span>
      </div>

      {/* Telemetry Gauges */}
      <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px]">
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>TIRE</span><span className={tireLife < 28 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{tireLife}%</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full ${tireLife < 28 ? 'bg-rose-500' : tireLife < 55 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${tireLife}%` }} />
          </div>
        </div>
        <div className="rounded-lg bg-slate-950/70 p-2 border border-slate-800/80">
          <div className="flex justify-between text-slate-400 mb-1"><span>TEMP</span><span className={`${tempStatus.color} font-bold`}>{Math.round(telemetry.tireTemp)}°</span></div>
          <div className={`text-[9px] font-bold ${tempStatus.color}`}>{tempStatus.label}</div>
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

      {/* Tactical Switches */}
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase text-slate-400">Pace</div>
          <div className="grid grid-cols-3 gap-0.5">
            {[{ mode: 'CONSERVE', label: 'Save' }, { mode: 'STANDARD', label: 'Std' }, { mode: 'ATTACK', label: 'Push' }].map(({ mode, label }) => (
              <button key={mode} disabled={telemetry.dnf} onClick={() => onChangePace(driver.id, mode)} className={`rounded border py-1 text-[10px] font-bold ${telemetry.paceMode === mode ? 'border-amber-500 bg-amber-500/20 text-amber-200' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase text-slate-400">ERS Mode</div>
          <div className="grid grid-cols-3 gap-0.5">
            {[{ mode: 'HARVEST', label: 'Chrg' }, { mode: 'BALANCED', label: 'Auto' }, { mode: 'OVERTAKE', label: 'Ovt' }].map(({ mode, label }) => (
              <button key={mode} disabled={telemetry.dnf} onClick={() => onChangeErs(driver.id, mode)} className={`rounded border py-1 text-[10px] font-bold ${telemetry.ersMode === mode ? 'border-sky-500 bg-sky-500/20 text-sky-200' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[9px] font-bold uppercase text-slate-400">Stance</div>
          <div className="grid grid-cols-3 gap-0.5">
            {[{ mode: 'DEFEND', label: 'Def' }, { mode: 'NEUTRAL', label: 'Std' }, { mode: 'AGGRESSIVE', label: 'Dive' }].map(({ mode, label }) => (
              <button key={mode} disabled={telemetry.dnf} onClick={() => onChangeStance(driver.id, mode)} className={`rounded border py-1 text-[10px] font-bold ${telemetry.battleStance === mode ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pit Strategy */}
      <div className="mt-2.5 border-t border-slate-800/80 pt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Next Compound</span>
          <button
            disabled={telemetry.dnf || telemetry.inPit}
            onClick={() => onTogglePit(driver.id)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
              telemetry.inPit
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
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
            return (
              <button
                key={comp}
                disabled={telemetry.dnf}
                onClick={() => onTogglePit(driver.id, comp)}
                className={`flex flex-col items-center rounded-lg border py-1 font-mono text-xs transition ${
                  telemetry.nextTire === comp ? 'border-amber-400 bg-slate-800 ring-1 ring-amber-400/50' : 'border-slate-800 bg-slate-950/60 opacity-75 hover:opacity-100'
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black" style={{ backgroundColor: spec.color, color: spec.textColor }}>{spec.short}</span>
                <span className="mt-0.5 text-[9px] text-slate-300">{comp}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SaveManagerModal({ open, onClose, career, onLoadCareer, onNewCareer }) {
  const [slots, setSlots] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSlots(SaveManager.listSlots());
      setStatusMsg('');
    }
  }, [open]);

  if (!open) return null;

  const handleSaveSlot = (slotId) => {
    SaveManager.saveToSlot(slotId, career);
    soundEngine.playUpgradeConfirm();
    setSlots(SaveManager.listSlots());
    setStatusMsg(`Career saved to Slot ${slotId}.`);
  };

  const handleLoadSlot = (slotId) => {
    const loaded = SaveManager.loadFromSlot(slotId);
    if (loaded) {
      soundEngine.playRadioBeep();
      onLoadCareer(loaded);
      onClose();
    }
  };

  const handleDeleteSlot = (slotId) => {
    SaveManager.deleteSlot(slotId);
    setSlots(SaveManager.listSlots());
    setStatusMsg(`Slot ${slotId} cleared.`);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = SaveManager.importFromJsonText(String(reader.result || ''));
      if (parsed) {
        soundEngine.playUpgradeConfirm();
        onLoadCareer(parsed);
        onClose();
      } else {
        setStatusMsg('Invalid save JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-white">Career Save Manager</h2>
            <p className="text-xs text-slate-400">Auto-save runs continuously; use slots or JSON backup for snapshots.</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700">CLOSE</button>
        </div>

        <div className="mt-4 space-y-2.5 font-mono text-xs">
          {slots.map((s) => (
            <div key={s.slotId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div>
                <div className="font-bold text-amber-300">SLOT {s.slotId}</div>
                {s.empty ? (
                  <div className="text-slate-500">Empty Slot</div>
                ) : (
                  <div className="text-slate-300">
                    S{s.season} R{s.round} · {s.teamName} · P{s.rank} ({s.points} pts) · ${s.budget.toFixed(1)}M
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleSaveSlot(s.slotId)} className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950">SAVE</button>
                <button disabled={s.empty} onClick={() => handleLoadSlot(s.slotId)} className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-30">LOAD</button>
                <button disabled={s.empty} onClick={() => handleDeleteSlot(s.slotId)} className="rounded-lg bg-rose-500/15 border border-rose-500/40 px-2 py-1 font-bold text-rose-300 hover:bg-rose-500 hover:text-white disabled:opacity-30">DEL</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button onClick={() => SaveManager.exportToJsonFile(career)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700">
              Export .JSON File
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700">
              Import .JSON File
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </div>
          <button onClick={() => { onNewCareer(); onClose(); }} className="rounded-lg bg-rose-600/20 border border-rose-500/40 px-3 py-1.5 font-bold text-rose-300 hover:bg-rose-600 hover:text-white">
            New Career
          </button>
        </div>

        {statusMsg && <div className="mt-3 font-mono text-xs text-emerald-400">{statusMsg}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// 6. GARAGE HQ, PRE-RACE STINT STRATEGY, RACE LOG & PODIUM VIEWS
// ============================================================================
function GarageView({ season, round, teams, drivers, playerTeam, nextTrack, onUpgradeCar, onStartWeekend, onOpenSaveModal }) {
  const [standingsTab, setStandingsTab] = useState('DRIVERS');
  const sortedDrivers = [...drivers].sort((a, b) => b.points - a.points || b.pace - a.pace);
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const playerDrivers = drivers.filter((d) => d.teamId === playerTeam.id);
  const getUpgradeCost = (v) => Number((3.5 + Math.max(0, v - 65) * 0.25).toFixed(1));

  const UPGRADE_META = [
    { key: 'aero', title: 'Aerodynamics Package', subtitle: 'Downforce, DRS speed & dirty-air efficiency', accent: 'bg-cyan-500' },
    { key: 'powertrain', title: 'Hybrid Powertrain & ERS', subtitle: 'ICE power & MGU-K electrical surge', accent: 'bg-rose-500' },
    { key: 'chassis', title: 'Monocoque & Suspension', subtitle: 'Mechanical grip & late-braking stability', accent: 'bg-amber-500' },
    { key: 'reliability', title: 'Component Reliability', subtitle: 'Engine & gearbox durability under Attack mode', accent: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl md:flex-row md:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-amber-400">
            Global Open-Wheel Series · Season {season} — Round {round}
          </div>
          <h1 className="mt-1 text-2xl font-black text-white">{playerTeam.name} — Engineering HQ</h1>
          <p className="mt-1 text-sm text-slate-400">
            Next Circuit: <strong className="text-slate-200">{nextTrack.name}</strong> ({nextTrack.country} · {nextTrack.lengthKm} km · {nextTrack.totalLaps} Laps)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-mono">
            <div className="text-[10px] uppercase text-emerald-300/80">R&D Budget</div>
            <div className="text-xl font-black text-emerald-400 tabular-nums">${playerTeam.budget.toFixed(1)}M</div>
          </div>
          <button onClick={onOpenSaveModal} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-xs font-bold uppercase text-slate-200 hover:bg-slate-700">
            Save / Load
          </button>
          <button onClick={onStartWeekend} className="rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400">
            Start Qualifying Weekend →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">R&D Development</h2>
              <span className="font-mono text-xs text-slate-400">+2 Rating per Upgrade</span>
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
                        <span className="font-mono text-sm font-black text-white">{val}/99</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div className={`h-full ${item.accent}`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => onUpgradeCar(item.key, cost)}
                      className={`mt-4 w-full rounded-lg py-2 font-mono text-xs font-bold uppercase transition ${
                        canAfford ? 'bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-slate-700' : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {maxed ? 'MAX SPEC' : `DEVELOP ($${cost.toFixed(1)}M)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-200">Team Driver Lineup</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {playerDrivers.map((drv) => (
                <div key={drv.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <div className="font-sans text-base font-bold text-white">{drv.name}</div>
                      <div className="text-xs text-amber-400">#{drv.carNumber} · {drv.code}</div>
                    </div>
                    <div className="text-right"><div className="text-[10px] text-slate-400">PTS</div><div className="text-lg font-black">{drv.points}</div></div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">PACE</span><strong>{drv.pace}</strong></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">RACECRAFT</span><strong className="text-emerald-300">{drv.racecraft}</strong></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">TIRE</span><strong>{drv.tireManagement}</strong></div>
                    <div className="flex justify-between rounded bg-slate-900 px-2 py-1"><span className="text-slate-400">WET</span><strong className="text-cyan-300">{drv.wetSkill}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Championship Standings</h2>
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button onClick={() => setStandingsTab('DRIVERS')} className={`rounded-md px-2.5 py-1 text-xs font-bold ${standingsTab === 'DRIVERS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>Drivers</button>
              <button onClick={() => setStandingsTab('CONSTRUCTORS')} className={`rounded-md px-2.5 py-1 text-xs font-bold ${standingsTab === 'CONSTRUCTORS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>Constructors</button>
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
                  <th className="py-2">#</th><th className="py-2">Constructor</th><th className="py-2 text-right">Car</th><th className="py-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedTeams.map((t, idx) => {
                  const avg = Math.round((t.car.aero + t.car.powertrain + t.car.chassis + t.car.reliability) / 4);
                  return (
                    <tr key={t.id} className={t.isPlayer ? 'bg-amber-500/10 text-amber-200' : 'text-slate-200'}>
                      <td className="py-2 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 font-sans font-semibold"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: t.primaryColor }} />{t.name}</span></td>
                      <td className="py-2 text-right text-slate-400">{avg}</td>
                      <td className="py-2 text-right font-bold">{t.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function PreRaceSetup({ round, track, playerTeam, playerDrivers, initialWeather, forecast, qualiGridOrder, onBackToGarage, onStartRace }) {
  const presets = useMemo(() => buildStrategyPresets(track, initialWeather), [track, initialWeather]);
  const recommendedFuel = Math.min(110, Math.round(track.totalLaps * 2.15 + 3));

  const [driverStrategies, setDriverStrategies] = useState(() => {
    const map = {};
    playerDrivers.forEach((d, idx) => {
      const preset = presets[idx % presets.length] || presets[0];
      map[d.id] = {
        presetId: preset.id,
        name: preset.name,
        stints: JSON.parse(JSON.stringify(preset.stints)),
        fuelKg: recommendedFuel,
      };
    });
    return map;
  });

  const applyPreset = (driverId, preset) => {
    setDriverStrategies((prev) => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        presetId: preset.id,
        name: preset.name,
        stints: JSON.parse(JSON.stringify(preset.stints)),
      },
    }));
  };

  const adjustFirstStintLaps = (driverId, newLapCount) => {
    setDriverStrategies((prev) => {
      const curr = prev[driverId];
      const stints = JSON.parse(JSON.stringify(curr.stints));
      const clamped = Math.max(4, Math.min(track.totalLaps - 4, newLapCount));
      stints[0].laps = clamped;
      const remaining = track.totalLaps - clamped;
      if (stints.length === 2) {
        stints[1].laps = remaining;
      } else if (stints.length === 3) {
        stints[1].laps = Math.max(4, Math.round(remaining * 0.55));
        stints[2].laps = Math.max(3, remaining - stints[1].laps);
      }
      return { ...prev, [driverId]: { ...curr, stints } };
    });
  };

  const handleLaunch = () => {
    const setups = playerDrivers.map((d) => ({
      driverId: d.id,
      startingTire: driverStrategies[d.id].stints[0].compound,
      startingFuelKg: driverStrategies[d.id].fuelKg,
    }));
    onStartRace(setups, driverStrategies);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl md:flex-row md:items-center">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Round {round} · Race Stint Strategy & Fuel Allocation
          </div>
          <h1 className="mt-1 text-2xl font-black text-white">{track.name} — Starting Grid Ready</h1>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {track.totalLaps} Laps ({(track.lengthKm * track.totalLaps).toFixed(1)} km) · Pit Loss ~{track.pitLossSec}s · Weather: {initialWeather.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBackToGarage} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold uppercase text-slate-300 hover:bg-slate-700">← HQ</button>
          <button onClick={handleLaunch} className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400">
            Lights Out — Start Race →
          </button>
        </div>
      </div>

      {/* Weather Forecast Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Meteorological Radar Forecast</div>
        <div className="grid grid-cols-5 gap-2 font-mono text-xs">
          {forecast.map((cond, idx) => (
            <div key={idx} className={`rounded-xl border p-2.5 text-center ${idx === 0 ? 'border-amber-500/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950/70'}`}>
              <div className="text-[10px] text-slate-400">{idx === 0 ? 'START' : `PHASE +${idx}`}</div>
              <div className={`mt-1 font-bold ${cond.includes('RAIN') ? 'text-cyan-300' : 'text-slate-200'}`}>{cond.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Driver Stint Strategy Cards with Degradation Curve */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {playerDrivers.map((drv) => {
          const strat = driverStrategies[drv.id];
          const gridRank = qualiGridOrder ? qualiGridOrder.indexOf(drv.id) + 1 : 0;

          return (
            <div key={drv.id} className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-xs text-amber-400">#{drv.carNumber} · {drv.code}</span>
                  <h3 className="text-lg font-bold text-white">{drv.name}</h3>
                </div>
                {gridRank > 0 && (
                  <span className="rounded-lg bg-purple-500/20 border border-purple-500/40 px-3 py-1 font-mono text-sm font-black text-purple-200">
                    GRID P{gridRank}
                  </span>
                )}
              </div>

              {/* Strategy Presets */}
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase text-slate-400">Select Stint Plan</div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(drv.id, p)}
                      className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition ${
                        strat.presetId === p.id ? 'border-amber-400 bg-amber-500/20 text-amber-200' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stint Timeline Visual Bar */}
              <div className="flex h-6 w-full overflow-hidden rounded-lg border border-slate-800 font-mono text-[11px] font-black">
                {strat.stints.map((stint, idx) => {
                  const spec = TIRE_SPECS[stint.compound];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${(stint.laps / track.totalLaps) * 100}%`, backgroundColor: spec.color, color: spec.textColor }}
                      className="flex items-center justify-center border-r border-slate-950/60"
                    >
                      {spec.short} · {stint.laps}L
                    </div>
                  );
                })}
              </div>

              {/* Tire Degradation Curve Canvas */}
              <DegradationCurveCanvas track={track} stints={strat.stints} />

              {/* Stint 1 Pit Lap Tuner + Fuel Slider */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">1st Pit Stop Lap</span>
                    <strong className="text-amber-300">Lap {strat.stints[0].laps}</strong>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={track.totalLaps - 4}
                    value={strat.stints[0].laps}
                    onChange={(e) => adjustFirstStintLaps(drv.id, Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Fuel Load</span>
                    <strong className="text-cyan-300">{strat.fuelKg} kg (~{(strat.fuelKg / 2.05).toFixed(0)}L)</strong>
                  </div>
                  <input
                    type="range"
                    min={25}
                    max={110}
                    value={strat.fuelKg}
                    onChange={(e) => setDriverStrategies((p) => ({ ...p, [drv.id]: { ...p[drv.id], fuelKg: Number(e.target.value) } }))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
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
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Race Control, Team Radio & Stewards Feed</span>
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl space-y-6">
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
          <button onClick={onClaimAndReturnToHQ} className="rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black uppercase text-slate-950 hover:bg-amber-400">
            Collect Payout & Return to HQ →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {podium.map((car, idx) => {
          const drv = driverMap.get(car.driverId);
          const team = teamMap.get(car.teamId);
          const styles = ['border-amber-400 bg-amber-500/10', 'border-slate-400 bg-slate-400/10', 'border-orange-600 bg-orange-600/10'];
          return (
            <div key={car.driverId} className={`rounded-2xl border p-5 ${styles[idx]}`}>
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

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs tabular-nums">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
              <th className="py-2 px-3">Pos</th><th className="py-2 px-3">Grid</th><th className="py-2 px-3">Driver</th><th className="py-2 px-3">Team</th>
              <th className="py-2 px-3 text-right">Stops</th><th className="py-2 px-3 text-right">Status / Gap</th><th className="py-2 px-3 text-right">Pts</th><th className="py-2 px-3 text-right">Prize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {raceState.cars.map((car, idx) => {
              const drv = driverMap.get(car.driverId);
              const team = teamMap.get(car.teamId);
              const pts = car.dnf ? 0 : POINTS_SYSTEM[idx] ?? 0;
              const prize = PRIZE_MONEY_MILLIONS[idx] ?? 1.0;
              return (
                <tr key={car.driverId} className={team.id === playerTeamId ? 'bg-amber-500/10 text-amber-200' : 'text-slate-200'}>
                  <td className="py-2 px-3 font-bold">{car.dnf ? 'DNF' : idx + 1}</td>
                  <td className="py-2 px-3 text-slate-400">P{car.gridPos}</td>
                  <td className="py-2 px-3 font-sans font-semibold">{drv.name}</td>
                  <td className="py-2 px-3 text-slate-400">{team.shortName}</td>
                  <td className="py-2 px-3 text-right">{car.pitStopsCount}</td>
                  <td className="py-2 px-3 text-right">{car.dnf ? car.dnfReason : idx === 0 ? 'WINNER' : `+${car.gapToLeaderSec.toFixed(2)}s`}</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-300">+{pts}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">+${prize.toFixed(1)}M</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MAIN APPLICATION CONTROLLER
// ============================================================================
function App() {
  const [career, setCareer] = useState(() => SaveManager.loadAutoSave());
  const [phase, setPhase] = useState('GARAGE'); // GARAGE | QUALIFYING | PRE_RACE | RACING | POST_RACE
  const [simSpeed, setSimSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('OVERVIEW');
  const [focusDriverId, setFocusDriverId] = useState(null);
  const [teamOrder, setTeamOrder] = useState('FREE'); // FREE | HOLD | SWAP
  const [qualiState, setQualiState] = useState(null);
  const [qualiGridOrder, setQualiGridOrder] = useState(null);
  const [plannedStrategies, setPlannedStrategies] = useState({});
  const [raceState, setRaceState] = useState(null);
  const fxQueueRef = useRef([]);

  useEffect(() => {
    SaveManager.writeAutoSave(career);
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

  // Continuous engine note during active race
  useEffect(() => {
    const active = phase === 'RACING' && raceState && !raceState.finished;
    const anyErs = Boolean(raceState?.cars.some((c) => c.teamId === playerTeam.id && c.ersMode === 'OVERTAKE' && c.ersBattery > 2));
    soundEngine.updateEngineHum(active, simSpeed, raceState?.flagStatus || 'GREEN', anyErs);
    return () => { if (!active) soundEngine.stopEngineHum(); };
  }, [phase, simSpeed, raceState?.finished, raceState?.flagStatus, muted]);

  // Qualifying simulation loop
  useEffect(() => {
    if (phase !== 'QUALIFYING' || !qualiState || qualiState.stage === 'DONE' || qualiState.stageComplete || simSpeed === 0) return;
    const tickMs = 50;
    const interval = window.setInterval(() => {
      setQualiState((prev) => {
        if (!prev || prev.stageComplete || prev.stage === 'DONE') return prev;
        const dtSim = (tickMs / 1000) * 3.2 * Math.min(16, simSpeed);
        const { nextState, events } = stepQualifyingSimulation(prev, dtSim, career.teams, career.drivers, playerTeam.id);
        if (events.stageEnded) soundEngine.playFlagAlert(false);
        else if (events.radioAlert) soundEngine.playRadioBeep();
        return nextState;
      });
    }, tickMs);
    return () => window.clearInterval(interval);
  }, [phase, qualiState?.stageComplete, qualiState?.stage, simSpeed, career.teams, career.drivers, playerTeam.id]);

  // Race simulation loop (with Team Orders execution!)
  useEffect(() => {
    if (phase !== 'RACING' || !raceState || raceState.finished || simSpeed === 0) return;
    const tickMs = 50;
    const interval = window.setInterval(() => {
      setRaceState((prev) => {
        if (!prev || prev.finished) return prev;
        const subSteps = simSpeed >= 16 ? 4 : simSpeed >= 8 ? 2 : 1;
        const totalDt = (tickMs / 1000) * 2.8 * simSpeed;
        const stepDt = totalDt / subSteps;

        let curr = prev;
        for (let s = 0; s < subSteps; s++) {
          if (curr.finished) break;
          const { nextState, events } = stepRaceSimulation(curr, stepDt, career.teams, career.drivers, playerTeam.id, fxQueueRef.current);
          curr = nextState;

          // Apply active Team Orders (SWAP / HOLD) between the two player drivers
          if (teamOrder !== 'FREE' && playerDrivers.length === 2) {
            const c1 = curr.cars.find((c) => c.driverId === playerDrivers[0].id);
            const c2 = curr.cars.find((c) => c.driverId === playerDrivers[1].id);
            if (c1 && c2 && !c1.dnf && !c2.dnf && !c1.inPit && !c2.inPit) {
              const front = c1.position < c2.position ? c1 : c2;
              const rear = c1.position < c2.position ? c2 : c1;
              const gapSec = (front.totalDistance - rear.totalDistance) * curr.track.baseLapTimeSec;

              if (teamOrder === 'HOLD' && gapSec < 0.75) {
                rear.totalDistance -= (stepDt / curr.track.baseLapTimeSec) * 0.04;
                rear.lapProgress = ((rear.totalDistance % 1) + 1) % 1;
                rear.battleStance = 'NEUTRAL';
              } else if (teamOrder === 'SWAP' && gapSec < 3.6) {
                // Leading teammate lifts off throttle and pulls wide to yield cleanly
                front.lateralOffset = 15;
                front.totalDistance -= (stepDt / curr.track.baseLapTimeSec) * 0.14;
                front.lapProgress = ((front.totalDistance % 1) + 1) % 1;
                rear.totalDistance += (stepDt / curr.track.baseLapTimeSec) * 0.08;
                rear.lapProgress = ((rear.totalDistance % 1) + 1) % 1;

                if (rear.totalDistance > front.totalDistance + 0.0018) {
                  const frontDrv = playerDrivers.find((d) => d.id === front.driverId);
                  const rearDrv = playerDrivers.find((d) => d.id === rear.driverId);
                  curr.broadcastBanner = { text: `TEAM ORDER COMPLETE: ${frontDrv.code} LETS ${rearDrv.code} THROUGH`, color: '#38bdf8', timerSec: 4.0 };
                  curr.logs.unshift({
                    id: `to-${curr.elapsedSec.toFixed(2)}`,
                    lap: front.lap, timeSec: curr.elapsedSec, category: 'PIT',
                    message: `Team Order executed: ${frontDrv.code} lifts off-line and lets teammate ${rearDrv.code} past.`,
                  });
                  soundEngine.playRadioBeep();
                  setTeamOrder('FREE');
                }
              }
            }
          }

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
    }, tickMs);
    return () => window.clearInterval(interval);
  }, [phase, raceState?.finished, simSpeed, career.teams, career.drivers, playerTeam.id, teamOrder, playerDrivers]);

  // Handlers
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

  const handleStartQualifying = () => {
    soundEngine.playRadioBeep();
    const qInit = createQualifyingState(career.round, currentTrack, career.teams, career.drivers, preRaceWeather.initial, preRaceWeather.forecast);
    setQualiState(qInit);
    setSimSpeed(2);
    setPhase('QUALIFYING');
  };

  const handleDispatchQuali = (driverId, compound) => {
    soundEngine.playRadioBeep();
    setQualiState((prev) => dispatchQualiDriver(prev, driverId, compound));
  };

  const handleAdvanceQualiStage = () => {
    soundEngine.playRadioBeep();
    setQualiState((prev) => advanceQualiStage(prev));
  };

  const handleFinishQualifying = () => {
    const grid = qualiState?.finalGridOrder?.length === 12
      ? qualiState.finalGridOrder
      : qualiState.entries.map((e) => e.driverId);
    setQualiGridOrder(grid);
    setPhase('PRE_RACE');
  };

  const handleStartRace = (setups, strategies) => {
    soundEngine.playRadioBeep();
    fxQueueRef.current = [{ type: 'CLEAR_DEBRIS' }];
    setPlannedStrategies(strategies);
    setTeamOrder('FREE');
    const initial = createInitialRaceState(career.round, currentTrack, career.teams, career.drivers, setups, preRaceWeather.initial, preRaceWeather.forecast, qualiGridOrder);
    setRaceState(initial);
    setFocusDriverId(playerDrivers[0]?.id || null);
    setCameraMode('OVERVIEW');
    setSimSpeed(1);
    setPhase('RACING');
  };

  const handleSetTeamOrder = (order) => {
    soundEngine.playRadioBeep();
    setTeamOrder(order);
    if (raceState) {
      const label = order === 'SWAP' ? 'TEAM ORDER: SWAP POSITIONS ISSUED' : order === 'HOLD' ? 'TEAM ORDER: HOLD POSITIONS' : 'TEAM ORDER: FREE TO RACE';
      setRaceState((prev) => ({
        ...prev,
        broadcastBanner: { text: label, color: '#38bdf8', timerSec: 3.5 },
      }));
    }
  };

  const handleChangePace = (id, mode) => {
    soundEngine.playTelemetryTick();
    setRaceState((p) => !p ? p : { ...p, cars: p.cars.map((c) => (c.driverId === id ? { ...c, paceMode: mode } : c)) });
  };
  const handleChangeErs = (id, mode) => {
    soundEngine.playTelemetryTick();
    setRaceState((p) => !p ? p : { ...p, cars: p.cars.map((c) => (c.driverId === id ? { ...c, ersMode: mode } : c)) });
  };
  const handleChangeStance = (id, stance) => {
    soundEngine.playTelemetryTick();
    setRaceState((p) => !p ? p : { ...p, cars: p.cars.map((c) => (c.driverId === id ? { ...c, battleStance: stance } : c)) });
  };
  const handleTogglePit = (id, compound) => {
    soundEngine.playRadioBeep();
    setRaceState((p) => !p ? p : {
      ...p,
      cars: p.cars.map((c) => c.driverId !== id ? c : compound ? { ...c, nextTire: compound, pitRequested: true } : { ...c, pitRequested: !c.pitRequested }),
    });
  };

  const handleClaimAndReturnToHQ = () => {
    if (!raceState) return;
    soundEngine.playUpgradeConfirm();
    const dPts = new Map();
    const tPts = new Map();
    const tPrize = new Map();

    raceState.cars.forEach((car, idx) => {
      const pts = car.dnf ? 0 : POINTS_SYSTEM[idx] ?? 0;
      const prize = PRIZE_MONEY_MILLIONS[idx] ?? 1.0;
      dPts.set(car.driverId, (dPts.get(car.driverId) || 0) + pts);
      tPts.set(car.teamId, (tPts.get(car.teamId) || 0) + pts);
      tPrize.set(car.teamId, (tPrize.get(car.teamId) || 0) + prize);
    });

    setCareer((prev) => {
      const seasonComplete = prev.round >= 10;
      return {
        ...prev,
        season: seasonComplete ? prev.season + 1 : prev.season,
        round: seasonComplete ? 1 : prev.round + 1,
        drivers: prev.drivers.map((d) => ({ ...d, points: seasonComplete ? 0 : d.points + (dPts.get(d.id) || 0) })),
        teams: prev.teams.map((t) => {
          const aiUp = !t.isPlayer && Math.random() < 0.55 ? 1 : 0;
          return {
            ...t,
            budget: Number((t.budget + (tPrize.get(t.id) || 1.5)).toFixed(1)),
            points: seasonComplete ? 0 : t.points + (tPts.get(t.id) || 0),
            car: aiUp
              ? { aero: Math.min(98, t.car.aero + 1), powertrain: Math.min(98, t.car.powertrain + 1), chassis: Math.min(98, t.car.chassis + 1), reliability: Math.min(98, t.car.reliability + 1) }
              : t.car,
          };
        }),
      };
    });

    setRaceState(null);
    setQualiState(null);
    setQualiGridOrder(null);
    setPhase('GARAGE');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Global Broadcast Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-mono text-sm font-black text-slate-950 shadow">AG</div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white">APEX GRID MANAGER</span>
              <span className="hidden sm:inline-block rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">GOWS</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px]">
            {['GARAGE', 'QUALIFYING', 'PRE_RACE', 'RACING', 'POST_RACE'].map((p) => (
              <span key={p} className={`rounded-md px-2.5 py-1 ${phase === p ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-500'}`}>
                {p.replace('_', ' ')}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="hidden sm:inline text-slate-400">
              S{career.season} R{career.round} · <strong className="text-emerald-400">${playerTeam.budget.toFixed(1)}M</strong>
            </span>
            <button onClick={() => setSaveModalOpen(true)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-800">
              SAVES
            </button>
            <button onClick={toggleMute} className={`rounded-lg border px-3 py-1.5 font-bold transition ${muted ? 'border-slate-700 bg-slate-900 text-slate-400' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'}`}>
              {muted ? 'MUTED' : 'AUDIO ON'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-4">
        {phase === 'GARAGE' && (
          <GarageView
            season={career.season} round={career.round} teams={career.teams} drivers={career.drivers}
            playerTeam={playerTeam} nextTrack={currentTrack} onUpgradeCar={handleUpgradeCar}
            onStartWeekend={handleStartQualifying} onOpenSaveModal={() => setSaveModalOpen(true)}
          />
        )}

        {phase === 'QUALIFYING' && qualiState && (
          <QualifyingView
            qualiState={qualiState} teams={career.teams} drivers={career.drivers} playerTeamId={playerTeam.id}
            simSpeed={simSpeed} setSimSpeed={setSimSpeed} onDispatchDriver={handleDispatchQuali}
            onAdvanceStage={handleAdvanceQualiStage} onSkipToSetup={handleFinishQualifying}
          />
        )}

        {phase === 'PRE_RACE' && (
          <PreRaceSetup
            round={career.round} track={currentTrack} playerTeam={playerTeam} playerDrivers={playerDrivers}
            initialWeather={preRaceWeather.initial} forecast={preRaceWeather.forecast} qualiGridOrder={qualiGridOrder}
            onBackToGarage={() => setPhase('GARAGE')} onStartRace={handleStartRace}
          />
        )}

        {phase === 'RACING' && raceState && (
          <div className="space-y-3.5">
            {/* Top Control Strip: Flag, Weather, Camera, Speed */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-2.5 shadow-lg">
              <div className="flex flex-wrap items-center gap-3.5 font-mono text-xs">
                <span className={`rounded px-2 py-0.5 font-black ${raceState.flagStatus === 'RED_FLAG' ? 'bg-rose-600 text-white' : raceState.flagStatus !== 'GREEN' ? 'bg-yellow-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {raceState.flagStatus.replace('_', ' ')}
                </span>
                <div><span className="text-slate-400">SKY: </span><strong className={raceState.weather.includes('RAIN') ? 'text-cyan-300' : 'text-amber-300'}>{raceState.weather.replace('_', ' ')}</strong></div>
                <div><span className="text-slate-400">WET: </span><strong className="text-cyan-400 tabular-nums">{Math.round(raceState.trackWetness)}%</strong></div>

                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                  <button onClick={() => setCameraMode('OVERVIEW')} className={`rounded px-2.5 py-1 text-[10px] font-bold ${cameraMode === 'OVERVIEW' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>FULL TRACK</button>
                  <button onClick={() => setCameraMode('BATTLE')} className={`rounded px-2.5 py-1 text-[10px] font-bold ${cameraMode === 'BATTLE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>BATTLE ZOOM</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                {[0, 1, 2, 4, 8, 16, 32].map((spd) => (
                  <button key={spd} onClick={() => setSimSpeed(spd)} className={`rounded-lg px-2.5 py-1 font-bold transition ${simSpeed === spd ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                    {spd === 0 ? 'PAUSE' : `${spd}X`}
                  </button>
                ))}
                {raceState.finished && (
                  <button onClick={() => setPhase('POST_RACE')} className="ml-2 rounded-lg bg-emerald-500 px-4 py-1 font-black uppercase text-slate-950 animate-pulse hover:bg-emerald-400">
                    Proceed to Podium →
                  </button>
                )}
              </div>
            </div>

            {/* Wide Main Stage: 3-Col Timing Tower + 9-Col Huge Track Canvas */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 items-start">
              <div className="xl:col-span-3">
                <TimingTower
                  raceState={raceState} teams={career.teams} drivers={career.drivers}
                  playerTeamId={playerTeam.id} focusDriverId={focusDriverId}
                  onSelectFocus={(id) => { setFocusDriverId(id); setCameraMode('BATTLE'); }}
                />
              </div>
              <div className="xl:col-span-9">
                <TrackCanvas
                  raceState={raceState} teams={career.teams} drivers={career.drivers}
                  playerTeamId={playerTeam.id} fxQueueRef={fxQueueRef} cameraMode={cameraMode} focusDriverId={focusDriverId}
                />
              </div>
            </div>

            {/* Pit-Wall Operations Deck: Team Orders + Stint Strategy + Driver Controls + Log */}
            <TeamOrdersBar playerDrivers={playerDrivers} raceState={raceState} teamOrder={teamOrder} onSetTeamOrder={handleSetTeamOrder} />

            <LiveStintTracker raceState={raceState} playerDrivers={playerDrivers} plannedStrategies={plannedStrategies} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {playerDrivers.map((drv) => {
                const telemetry = raceState.cars.find((c) => c.driverId === drv.id);
                return (
                  <DriverPitWall
                    key={drv.id} driver={drv} telemetry={telemetry}
                    onChangePace={handleChangePace} onChangeErs={handleChangeErs}
                    onChangeStance={handleChangeStance} onTogglePit={handleTogglePit}
                  />
                );
              })}
            </div>

            <RaceLog logs={raceState.logs} />
          </div>
        )}

        {phase === 'POST_RACE' && raceState && (
          <PostRacePodium
            raceState={raceState} teams={career.teams} drivers={career.drivers}
            playerTeamId={playerTeam.id} onClaimAndReturnToHQ={handleClaimAndReturnToHQ}
          />
        )}
      </main>

      <SaveManagerModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        career={career}
        onLoadCareer={(loaded) => { setCareer(loaded); setRaceState(null); setQualiState(null); setPhase('GARAGE'); }}
        onNewCareer={() => { setCareer(createFreshCareer()); setRaceState(null); setQualiState(null); setPhase('GARAGE'); }}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);