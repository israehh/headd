import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Crosshair, Sparkles, 
  Layers, Sun, Eye, ArrowUp, ArrowDown, ArrowLeft, 
  ArrowRight, Shield, Disc, Zap, Volume2, VolumeX 
} from 'lucide-react';
import { RenderOptions, PerformanceMetrics } from '../types';

interface IsometricEngineDemoProps {
  renderOptions: RenderOptions;
  activeCharacter: 'head' | 'heels' | 'combined';
  onSwitchCharacter: (char: 'head' | 'heels' | 'combined') => void;
  onUpdateMetrics: (metrics: PerformanceMetrics) => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Projectile {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  life: number;
}

export const IsometricEngineDemo: React.FC<IsometricEngineDemoProps> = ({
  renderOptions,
  activeCharacter,
  onSwitchCharacter,
  onUpdateMetrics
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player World Coordinates in 2.5D Isometric Grid
  const [playerPos, setPlayerPos] = useState({ x: 3, y: 3, z: 1 });
  const [isJumping, setIsJumping] = useState(false);
  const [cratePos, setCratePos] = useState({ x: 5, y: 3, z: 0 });
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Refs for animation loop
  const animRef = useRef<number | null>(null);
  const playerRef = useRef({ 
    x: 3, y: 3, z: 0, 
    vz: 0, isGrounded: true, 
    facing: 'SE' as 'SE' | 'SW' | 'NE' | 'NW' 
  });
  const crateRef = useRef({ x: 5, y: 3, z: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const droneRef = useRef({ x: 2, y: 6, z: 2.5, angle: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(performance.now());
  const portalPulseRef = useRef<number>(0);

  // Audio tone generator for retro-futuristic sound effects without external assets
  const playRetroTone = useCallback((freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        triggerJump();
      }
      if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'e') {
        shootDonut();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const next = activeCharacter === 'head' ? 'heels' : activeCharacter === 'heels' ? 'combined' : 'head';
        onSwitchCharacter(next);
        playRetroTone(660, 'sine', 0.15);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeCharacter, onSwitchCharacter, playRetroTone]);

  // Jump Action
  const triggerJump = () => {
    if (playerRef.current.isGrounded) {
      // Heels jumps higher (0.18) than Head (0.12, but Head can glide)
      const jumpPower = activeCharacter === 'heels' ? 0.22 : activeCharacter === 'combined' ? 0.24 : 0.14;
      playerRef.current.vz = jumpPower;
      playerRef.current.isGrounded = false;
      setIsJumping(true);
      playRetroTone(activeCharacter === 'head' ? 440 : 280, 'triangle', 0.2);

      // Jump dust/sparks particles
      if (renderOptions.energyParticles) {
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: playerRef.current.x,
            y: playerRef.current.y,
            z: 0.1,
            vx: (Math.random() - 0.5) * 0.08,
            vy: (Math.random() - 0.5) * 0.08,
            vz: Math.random() * 0.05,
            life: 0.4 + Math.random() * 0.3,
            maxLife: 0.7,
            color: activeCharacter === 'head' ? '#38BDF8' : '#34D399',
            size: 2 + Math.random() * 2
          });
        }
      }
    }
  };

  // Shoot Donut / Energy Ring
  const shootDonut = () => {
    if (activeCharacter === 'heels') return; // Only Head or Combined can shoot hooter donuts
    playRetroTone(880, 'sawtooth', 0.18);
    let vx = 0;
    let vy = 0;
    if (playerRef.current.facing === 'SE') { vx = 0.15; vy = 0.15; }
    else if (playerRef.current.facing === 'SW') { vx = -0.15; vy = 0.15; }
    else if (playerRef.current.facing === 'NE') { vx = 0.15; vy = -0.15; }
    else if (playerRef.current.facing === 'NW') { vx = -0.15; vy = -0.15; }

    projectilesRef.current.push({
      x: playerRef.current.x,
      y: playerRef.current.y,
      z: playerRef.current.z + 0.5,
      vx, vy,
      life: 1.2
    });
  };

  // Main 2.5D Isometric Engine Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d', { alpha: false });
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let isRunning = true;

    // Standard Dimetric 2:1 Constants
    const TILE_W = 64;
    const TILE_H = 32;
    const HEIGHT_SCALE = 32;

    // Room Layout (Grid: 8x8 blocks)
    // Structure with White Titanium floor, Dark Industrial pillars, and blocks
    const gridWidth = 9;
    const gridLength = 9;

    const renderLoop = (time: number) => {
      if (!isRunning) return;
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      // Handle Resize smoothly
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }

      portalPulseRef.current += dt * 3;

      // --- 1. Player Physics & Controls ---
      const p = playerRef.current;
      const speed = (activeCharacter === 'heels' ? 3.8 : activeCharacter === 'combined' ? 4.2 : 2.6) * dt;
      let dx = 0;
      let dy = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) {
        dx -= speed * 0.707;
        dy -= speed * 0.707;
        p.facing = 'NW';
      }
      if (keysRef.current['s'] || keysRef.current['arrowdown']) {
        dx += speed * 0.707;
        dy += speed * 0.707;
        p.facing = 'SE';
      }
      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        dx -= speed * 0.707;
        dy += speed * 0.707;
        p.facing = 'SW';
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        dx += speed * 0.707;
        dy -= speed * 0.707;
        p.facing = 'NE';
      }

      // Test Box push
      const newPx = p.x + dx;
      const newPy = p.y + dy;
      const cr = crateRef.current;

      // Distance to crate
      const distToCrate = Math.hypot(newPx - cr.x, newPy - cr.y);
      if (distToCrate < 0.8 && Math.abs(p.z - cr.z) < 0.6) {
        // Heels or Combined can push crates!
        if (activeCharacter === 'heels' || activeCharacter === 'combined') {
          cr.x = Math.max(1, Math.min(gridWidth - 2, cr.x + dx * 0.8));
          cr.y = Math.max(1, Math.min(gridLength - 2, cr.y + dy * 0.8));
          setCratePos({ x: cr.x, y: cr.y, z: cr.z });
          p.x = newPx * 0.85 + p.x * 0.15;
          p.y = newPy * 0.85 + p.y * 0.15;
        }
      } else {
        // Bounds checking
        p.x = Math.max(0.6, Math.min(gridWidth - 1.6, newPx));
        p.y = Math.max(0.6, Math.min(gridLength - 1.6, newPy));
      }

      // Jump / Gravity
      const gravity = (activeCharacter === 'head' ? 0.35 : 0.65) * dt;
      p.vz -= gravity;
      p.z += p.vz;

      // Check ground collision against floor (z = 0) and crate
      let groundZ = 0;
      if (Math.abs(p.x - cr.x) < 0.8 && Math.abs(p.y - cr.y) < 0.8) {
        groundZ = cr.z + 1.0;
      }

      if (p.z <= groundZ) {
        p.z = groundZ;
        p.vz = 0;
        if (!p.isGrounded) {
          p.isGrounded = true;
          setIsJumping(false);
          // Impact sparks
          if (renderOptions.energyParticles) {
            for (let i = 0; i < 4; i++) {
              particlesRef.current.push({
                x: p.x, y: p.y, z: groundZ,
                vx: (Math.random() - 0.5) * 0.06,
                vy: (Math.random() - 0.5) * 0.06,
                vz: Math.random() * 0.04,
                life: 0.3, maxLife: 0.3,
                color: '#38BDF8', size: 2
              });
            }
          }
        }
      }

      setPlayerPos({ x: p.x, y: p.y, z: p.z });

      // Update Drone AI patrol
      const dr = droneRef.current;
      dr.angle += dt * 0.8;
      dr.x = 4.5 + Math.cos(dr.angle) * 2.2;
      dr.y = 4.5 + Math.sin(dr.angle) * 2.2;

      // Update Projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const pr = projectilesRef.current[i];
        pr.x += pr.vx;
        pr.y += pr.vy;
        pr.life -= dt;
        if (pr.life <= 0 || pr.x < 0 || pr.x > gridWidth || pr.y < 0 || pr.y > gridLength) {
          projectilesRef.current.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.z += pt.vz;
        pt.vz -= 0.002;
        pt.life -= dt;
        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Continuous Portal Energy Particles
      if (renderOptions.energyParticles && Math.random() < 0.4) {
        particlesRef.current.push({
          x: 1.5 + (Math.random() - 0.5) * 0.4,
          y: 1.5 + (Math.random() - 0.5) * 0.4,
          z: 0.1 + Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          vz: 0.03 + Math.random() * 0.03,
          life: 0.8, maxLife: 0.8,
          color: '#C084FC', size: 3
        });
      }

      // --- 2. CLEAR & RENDER PIPELINE ---
      const w = canvas.width;
      const h = canvas.height;
      const originX = w * 0.5;
      const originY = h * 0.28;

      // Dark Industrial Background
      ctx.fillStyle = renderOptions.classicMode ? '#000000' : '#080c14';
      ctx.fillRect(0, 0, w, h);

      // Vignette Gradient if not in classic mode
      if (!renderOptions.classicMode) {
        const vig = ctx.createRadialGradient(originX, originY + 120, 80, originX, originY + 120, w * 0.7);
        vig.addColorStop(0, 'rgba(12, 19, 30, 0.4)');
        vig.addColorStop(1, 'rgba(4, 6, 10, 0.95)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      }

      // Helper: 2.5D World to Screen conversion
      const toScreen = (wx: number, wy: number, wz: number) => {
        return {
          sx: originX + (wx - wy) * (TILE_W * 0.5),
          sy: originY + (wx + wy) * (TILE_H * 0.5) - (wz * HEIGHT_SCALE)
        };
      };

      // Draw Floor Tiles (Isometric Plane z = 0)
      let drawCalls = 0;
      for (let gx = 0; gx < gridWidth; gx++) {
        for (let gy = 0; gy < gridLength; gy++) {
          const { sx, sy } = toScreen(gx, gy, 0);
          drawCalls++;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + TILE_W * 0.5, sy + TILE_H * 0.5);
          ctx.lineTo(sx, sy + TILE_H);
          ctx.lineTo(sx - TILE_W * 0.5, sy + TILE_H * 0.5);
          ctx.closePath();

          if (renderOptions.classicMode) {
            ctx.fillStyle = (gx + gy) % 2 === 0 ? '#333333' : '#444444';
            ctx.fill();
            ctx.strokeStyle = '#222222';
            ctx.stroke();
          } else {
            // White Titanium Panels with subtle grid lines
            const isVent = (gx === 4 && gy === 4);
            const isPortalPad = (gx <= 2 && gy <= 2);
            
            if (isPortalPad) {
              ctx.fillStyle = '#1e1b4b'; // Deep purple portal plate
            } else if (isVent) {
              ctx.fillStyle = '#1e293b'; // Ventilation grill
            } else {
              ctx.fillStyle = (gx + gy) % 2 === 0 ? '#e2e8f0' : '#cbd5e1'; // Titanium White
            }
            ctx.fill();

            // Vertex AO simulation on floor corners
            if (renderOptions.ambientOcclusion) {
              if (gx === 0 || gy === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
                ctx.fill();
              }
            }

            // High-tech tile seam
            ctx.strokeStyle = isPortalPad ? '#6366f1' : 'rgba(15, 23, 42, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // --- 3. Sorting & Drawing Objects & Pillars ---
      // Collect renderable isometric entities for depth sorting
      interface Entity {
        type: 'pillar' | 'wall' | 'crate' | 'player' | 'portal' | 'drone' | 'laser';
        sortKey: number;
        render: () => void;
      }
      const renderQueue: Entity[] = [];

      // Walls / Dark Industrial Pillars at back edges
      for (let x = 0; x < gridWidth; x++) {
        if (x % 2 === 0) {
          renderQueue.push({
            type: 'wall',
            sortKey: (x + 0) * 1000 + 0,
            render: () => drawVoxel(x, 0, 0, 1, 1, 2.5, '#1e293b', true)
          });
        }
      }
      for (let y = 1; y < gridLength; y++) {
        if (y % 2 === 0) {
          renderQueue.push({
            type: 'wall',
            sortKey: (0 + y) * 1000 + 0,
            render: () => drawVoxel(0, y, 0, 1, 1, 2.5, '#1e293b', true)
          });
        }
      }

      // Interactive Pushable Titanium Crate
      renderQueue.push({
        type: 'crate',
        sortKey: (cr.x + cr.y) * 1000 + (cr.z * 10),
        render: () => drawVoxel(cr.x, cr.y, cr.z, 0.8, 0.8, 0.8, '#f8fafc', false, '#38bdf8')
      });

      // Energy Teleport Portal at (1.5, 1.5, 0)
      renderQueue.push({
        type: 'portal',
        sortKey: (1.5 + 1.5) * 1000 + 0,
        render: () => drawPortal(1.5, 1.5, 0)
      });

      // Drone Centinel with Volumetric Searchlight
      renderQueue.push({
        type: 'drone',
        sortKey: (dr.x + dr.y) * 1000 + (dr.z * 10),
        render: () => drawDrone(dr.x, dr.y, dr.z)
      });

      // Player (Head / Heels / Combined)
      renderQueue.push({
        type: 'player',
        sortKey: (p.x + p.y) * 1000 + (p.z * 10),
        render: () => drawPlayer(p.x, p.y, p.z)
      });

      // Security Laser Grid (Horizontal beam at y = 5, z = 0.5)
      renderQueue.push({
        type: 'laser',
        sortKey: (4 + 5) * 1000 + 5,
        render: () => drawLaserGrid()
      });

      // Sort by depth key O(N log N)
      renderQueue.sort((a, b) => a.sortKey - b.sortKey);

      // Render sorted entities
      renderQueue.forEach(e => {
        drawCalls++;
        e.render();
      });

      // Draw Donut Projectiles
      projectilesRef.current.forEach(pr => {
        drawCalls++;
        const { sx, sy } = toScreen(pr.x, pr.y, pr.z);
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      if (renderOptions.energyParticles && particlesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        particlesRef.current.forEach(pt => {
          const { sx, sy } = toScreen(pt.x, pt.y, pt.z);
          const alpha = pt.life / pt.maxLife;
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = alpha;
          ctx.fillRect(sx - pt.size * 0.5, sy - pt.size * 0.5, pt.size, pt.size);
        });
        ctx.restore();
      }

      // --- 4. Post-Process Scanlines & Bloom Mockup ---
      if (renderOptions.scanlines && !renderOptions.classicMode) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1);
        }
      }

      // --- Telemetry Profiling Calculations for AMD 3020e ---
      frameCountRef.current++;
      if (time - fpsTimeRef.current >= 400) {
        const elapsed = (time - fpsTimeRef.current) / 1000;
        const currentFps = Math.round(frameCountRef.current / elapsed);
        frameCountRef.current = 0;
        fpsTimeRef.current = time;

        const simulatedFrameTime = renderOptions.classicMode ? 3.2 : 5.8 + (renderOptions.energyParticles ? 0.8 : 0);
        onUpdateMetrics({
          fps: Math.min(60, currentFps),
          frameTimeMs: simulatedFrameTime,
          drawCalls: drawCalls,
          trianglesOrQuads: drawCalls * 4,
          vramUsageMB: renderOptions.classicMode ? 85 : 195,
          bandwidthUsageGBs: renderOptions.classicMode ? 1.8 : 4.2,
          vega3BudgetPercent: Math.round((simulatedFrameTime / 16.66) * 100)
        });
      }

      // Helper Functions Inside Render Scope
      function drawVoxel(
        vx: number, vy: number, vz: number,
        wSize: number, lSize: number, hSize: number,
        hexColor: string, isIndustrial: boolean, accentColor?: string
      ) {
        const { sx, sy } = toScreen(vx, vy, vz);
        const hw = (TILE_W * 0.5) * wSize;
        const hh = (TILE_H * 0.5) * lSize;
        const hPix = hSize * HEIGHT_SCALE;

        if (renderOptions.classicMode) {
          // Classic Flat Shading
          ctx.fillStyle = hexColor;
          ctx.fillRect(sx - hw, sy - hPix, hw * 2, hPix + hh);
          ctx.strokeStyle = '#111111';
          ctx.strokeRect(sx - hw, sy - hPix, hw * 2, hPix + hh);
          return;
        }

        // --- AAA Facet Shading ---
        // 1. Top Face (Luminance 1.15x)
        ctx.fillStyle = isIndustrial ? '#334155' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(sx, sy - hPix);
        ctx.lineTo(sx + hw, sy + hh - hPix);
        ctx.lineTo(sx, sy + (hh * 2) - hPix);
        ctx.lineTo(sx - hw, sy + hh - hPix);
        ctx.closePath();
        ctx.fill();

        // 2. Left Face (Luminance 0.85x)
        ctx.fillStyle = isIndustrial ? '#1e293b' : '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(sx - hw, sy + hh - hPix);
        ctx.lineTo(sx, sy + (hh * 2) - hPix);
        ctx.lineTo(sx, sy + (hh * 2));
        ctx.lineTo(sx - hw, sy + hh);
        ctx.closePath();
        ctx.fill();

        // 3. Right Face (Luminance 0.60x)
        ctx.fillStyle = isIndustrial ? '#0f172a' : '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(sx, sy + (hh * 2) - hPix);
        ctx.lineTo(sx + hw, sy + hh - hPix);
        ctx.lineTo(sx + hw, sy + hh);
        ctx.lineTo(sx, sy + (hh * 2));
        ctx.closePath();
        ctx.fill();

        // Rim Lighting & Specular Bevel
        if (renderOptions.rimLighting) {
          ctx.strokeStyle = accentColor || (isIndustrial ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)');
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx - hw, sy + hh - hPix);
          ctx.lineTo(sx, sy - hPix);
          ctx.lineTo(sx + hw, sy + hh - hPix);
          ctx.stroke();
        }

        // Accent energy line on crate
        if (accentColor) {
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy + (hh * 2) - hPix * 0.5);
          ctx.lineTo(sx + hw, sy + hh - hPix * 0.5);
          ctx.stroke();
        }
      }

      function drawPlayer(px: number, py: number, pz: number) {
        // --- 1. Drop Shadow & Height Laser Guider ---
        const ground = toScreen(px, py, 0);
        const { sx, sy } = toScreen(px, py, pz);

        if (!renderOptions.classicMode) {
          // Drop Blob Shadow
          const shadowScale = Math.max(0.4, 1.0 - pz * 0.2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(ground.sx, ground.sy + 8, 16 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Vertical Laser Guiding Line
          if (pz > 0.1) {
            ctx.strokeStyle = activeCharacter === 'head' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(52, 211, 153, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(ground.sx, ground.sy + 8);
            ctx.lineTo(sx, sy);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // --- 2. Character Body Rendering ---
        if (activeCharacter === 'head') {
          // Head: White Titanium Round Drone-like Biomorph with Glider Wings & Hooter
          // Head Body
          ctx.fillStyle = '#f8fafc'; // White Titanium
          ctx.beginPath();
          ctx.arc(sx, sy - 18, 14, 0, Math.PI * 2);
          ctx.fill();

          // Glider Wings
          ctx.fillStyle = '#38bdf8'; // Blue Energy Wings
          ctx.beginPath();
          ctx.moveTo(sx - 18, sy - 24);
          ctx.lineTo(sx - 10, sy - 16);
          ctx.lineTo(sx - 14, sy - 10);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(sx + 18, sy - 24);
          ctx.lineTo(sx + 10, sy - 16);
          ctx.lineTo(sx + 14, sy - 10);
          ctx.closePath();
          ctx.fill();

          // Cute Big Eyes with cyan visor
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(sx - 4, sy - 20, 3, 0, Math.PI * 2);
          ctx.arc(sx + 4, sy - 20, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(sx - 5, sy - 21, 2, 2);
          ctx.fillRect(sx + 3, sy - 21, 2, 2);

          // Hooter Gun Snout
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(sx - 3, sy - 14, 6, 5);

          // Floating bobbing effect
          if (!p.isGrounded) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        } else if (activeCharacter === 'heels') {
          // Heels: Robotic High-Jump Legs, Feet, Exo-Resorts and Backpack
          // Torso / Backpack
          ctx.fillStyle = '#059669'; // Emerald Military
          ctx.fillRect(sx - 8, sy - 26, 16, 12);

          // Big Eyes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 6, sy - 24, 4, 4);
          ctx.fillRect(sx + 2, sy - 24, 4, 4);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(sx - 5, sy - 23, 2, 2);
          ctx.fillRect(sx + 3, sy - 23, 2, 2);

          // High Jump Spring Legs
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(sx - 5, sy - 14);
          ctx.lineTo(sx - 7, sy - 7);
          ctx.lineTo(sx - 5, sy);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(sx + 5, sy - 14);
          ctx.lineTo(sx + 7, sy - 7);
          ctx.lineTo(sx + 5, sy);
          ctx.stroke();

          // Titanium Boot Plates
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 9, sy - 3, 6, 4);
          ctx.fillRect(sx + 3, sy - 3, 6, 4);
        } else {
          // Combined: Head sitting on Heels shoulders!
          // Heels legs and body
          ctx.fillStyle = '#059669';
          ctx.fillRect(sx - 8, sy - 22, 16, 12);
          // Head on top
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(sx, sy - 34, 12, 0, Math.PI * 2);
          ctx.fill();
          // Crown / Synergy Aura
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy - 34, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      function drawDrone(dx: number, dy: number, dz: number) {
        const { sx, sy } = toScreen(dx, dy, dz);
        const ground = toScreen(dx, dy, 0);

        // Volumetric Light Cone
        if (renderOptions.volumetricLights && !renderOptions.classicMode) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const coneGrad = ctx.createLinearGradient(sx, sy, ground.sx, ground.sy);
          coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
          ctx.fillStyle = coneGrad;

          ctx.beginPath();
          ctx.moveTo(sx, sy + 6);
          ctx.lineTo(ground.sx + 24, ground.sy + 12);
          ctx.lineTo(ground.sx - 24, ground.sy + 12);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Drone Sphere
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red sentinel eye
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      function drawPortal(px: number, py: number, pz: number) {
        const { sx, sy } = toScreen(px, py, pz);
        const pulse = Math.sin(portalPulseRef.current) * 3;

        // Base Ring
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 26 + pulse, 13 + pulse * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Swirling vortex
        if (!renderOptions.classicMode) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(sx, sy - 15, 20 + pulse, 35, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
          ctx.fill();

          // Sparkle core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy - 15, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawLaserGrid() {
        const p1 = toScreen(1, 5, 0.4);
        const p2 = toScreen(7, 5, 0.4);

        ctx.save();
        if (renderOptions.classicMode) {
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
        } else {
          // Double pass bloom laser
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
        }
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [renderOptions, activeCharacter, onUpdateMetrics]);

  return (
    <div className="relative w-full rounded-2xl border border-cyan-900/60 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Viewport Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">SECTOR 04 - ENGINE 2.5D SIMULATOR</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-cyan-400 hidden sm:inline">
            Proyección Dimétrica 2:1 (64x32)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
              soundEnabled ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">Audio FX</span>
          </button>

          <button
            onClick={triggerJump}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold"
          >
            Saltar [Espacio]
          </button>

          {activeCharacter !== 'heels' && (
            <button
              onClick={shootDonut}
              className="px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-700 text-sky-300 font-bold"
            >
              Disparar [F]
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div ref={containerRef} className="relative w-full h-[420px] sm:h-[480px] bg-slate-950 cursor-crosshair">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* On-screen Controls Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none text-[11px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 backdrop-blur-md text-slate-300">
          <div><strong className="text-cyan-300">Operador:</strong> {activeCharacter.toUpperCase()}</div>
          <div><strong className="text-cyan-300">Coord 2.5D:</strong> X: {playerPos.x.toFixed(1)}, Y: {playerPos.y.toFixed(1)}, Z: {playerPos.z.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Usa WASD o Flechas para moverte | Barra espaciadora para saltar</div>
        </div>

        {/* On-Screen Mobile / Click D-Pad */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onMouseDown={() => { keysRef.current['w'] = true; }}
            onMouseUp={() => { keysRef.current['w'] = false; }}
            onTouchStart={() => { keysRef.current['w'] = true; }}
            onTouchEnd={() => { keysRef.current['w'] = false; }}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Arriba / Noroeste"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex space-x-1">
            <button
              onMouseDown={() => { keysRef.current['a'] = true; }}
              onMouseUp={() => { keysRef.current['a'] = false; }}
              onTouchStart={() => { keysRef.current['a'] = true; }}
              onTouchEnd={() => { keysRef.current['a'] = false; }}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Izquierda / Sudoeste"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => { keysRef.current['s'] = true; }}
              onMouseUp={() => { keysRef.current['s'] = false; }}
              onTouchStart={() => { keysRef.current['s'] = true; }}
              onTouchEnd={() => { keysRef.current['s'] = false; }}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Abajo / Sudeste"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onMouseDown={() => { keysRef.current['d'] = true; }}
              onMouseUp={() => { keysRef.current['d'] = false; }}
              onTouchStart={() => { keysRef.current['d'] = true; }}
              onTouchEnd={() => { keysRef.current['d'] = false; }}
              className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Derecha / Noreste"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
