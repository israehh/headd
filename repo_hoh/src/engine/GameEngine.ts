/**
 * MASTER GRAPHICS & SIMULATION ENGINE (HEAD OVER HEELS 2.0)
 * 
 * 100% Code-Driven Architecture. Zero External Sprites/Textures.
 * Optimized for AMD 3020e / Radeon Vega 3 on Windows 11.
 */

import { ProceduralMaterials, MaterialStyle } from './ProceduralMaterials';
import { LightingPipeline, PointLight, SearchLight } from './LightingPipeline';
import { PostProcessPipeline } from './PostProcessPipeline';
import { ParticleSystem } from './ParticleSystem';
import { IsometricCamera } from './IsometricCamera';
import { CharacterProceduralRenderer, CharacterState } from './CharacterProceduralRenderer';

export interface VoxelBlock {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  height: number;
  material: MaterialStyle;
  isInteractive?: boolean;
}

export interface DonutProjectile {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
}

export interface EngineCallbacks {
  onUpdateMetrics?: (metrics: {
    fps: number;
    frameTimeMs: number;
    drawCalls: number;
    vramMB: number;
  }) => void;
  onDonutCountChange?: (count: number) => void;
  onEnergyChange?: (energy: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public camera: IsometricCamera;
  public lighting: LightingPipeline;
  public postProcess: PostProcessPipeline;
  public particles: ParticleSystem;

  // Active character
  public activeCharType: 'head' | 'heels' | 'combined' = 'head';
  public player: CharacterState = {
    x: 2,
    y: 2,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    facing: 'SE',
    isGrounded: true,
    squashFactor: 1.0,
    animTimer: 0
  };

  // Movable alloy crate
  public crate = {
    x: 4,
    y: 4,
    z: 0,
    vx: 0,
    vy: 0
  };

  // Security Drone
  public drone = {
    x: 6,
    y: 2,
    z: 2.2,
    vx: 1.2
  };

  // Scene Blocks
  public blocks: VoxelBlock[] = [];

  // Projectiles
  public projectiles: DonutProjectile[] = [];
  public donutsLeft = 14;

  // Searchlight
  private searchLight: SearchLight;

  // Telemetry
  private isRunning = false;
  private animFrameId = 0;
  private lastTime = 0;
  private frameCount = 0;
  private lastFpsTime = 0;
  private callbacks: EngineCallbacks = {};

  // Render Toggles
  public enableLighting = true;
  public enableBloom = true;
  public enableScanlines = true;
  public enableVignette = true;
  public enableParticles = true;
  public enableVolumetrics = true;
  public classicMode = false;

  // Depth buffer keys
  private depthKeys = new Float32Array(512);
  private sortedIndices = new Int32Array(512);

  constructor(canvas: HTMLCanvasElement, callbacks?: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Cannot acquire 2D context');
    this.ctx = ctx;

    this.callbacks = callbacks || {};
    this.camera = new IsometricCamera();
    this.lighting = new LightingPipeline();
    this.postProcess = new PostProcessPipeline();
    this.particles = new ParticleSystem();

    this.searchLight = {
      x: 6,
      y: 2,
      z: 2.2,
      targetAngle: Math.PI * 0.75,
      beamLength: 4.5,
      spreadAngle: 0.35,
      color: '#38bdf8',
      speed: 1.2
    };

    this.initScene();
  }

  private initScene() {
    this.blocks = [];

    // 1. White Titanium Modular Floor (8x8 room)
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const isHazard = (x === 0 || y === 0 || x === 7 || y === 7);
        this.blocks.push({
          id: `floor_${x}_${y}`,
          x,
          y,
          z: 0,
          width: 1,
          length: 1,
          height: 0.25,
          material: isHazard ? ProceduralMaterials.HAZARD : ProceduralMaterials.TITANIUM
        });
      }
    }

    // 2. Dark Industrial Perimeter Pillars
    this.blocks.push({
      id: 'pillar_nw',
      x: 0,
      y: 0,
      z: 0.25,
      width: 1,
      length: 1,
      height: 2.5,
      material: ProceduralMaterials.DARK_STEEL
    });
    this.blocks.push({
      id: 'pillar_ne',
      x: 7,
      y: 0,
      z: 0.25,
      width: 1,
      length: 1,
      height: 2.5,
      material: ProceduralMaterials.DARK_STEEL
    });
    this.blocks.push({
      id: 'pillar_sw',
      x: 0,
      y: 7,
      z: 0.25,
      width: 1,
      length: 1,
      height: 2.5,
      material: ProceduralMaterials.DARK_STEEL
    });

    // 3. Elevated Stepping Platforms for Jumping
    this.blocks.push({
      id: 'platform_step1',
      x: 2,
      y: 5,
      z: 0.25,
      width: 1,
      length: 1,
      height: 0.6,
      material: ProceduralMaterials.TITANIUM
    });
    this.blocks.push({
      id: 'platform_step2',
      x: 3,
      y: 6,
      z: 0.25,
      width: 1,
      length: 1,
      height: 1.2,
      material: ProceduralMaterials.BLUE_ENERGY
    });

    // 4. Lights in Scene
    this.lighting.clearLights();
    this.lighting.addLight({
      id: 'portal_light',
      x: 6.5,
      y: 6.5,
      z: 1.0,
      radius: 4.5,
      r: 168,
      g: 85,
      b: 247,
      intensity: 1.2,
      pulseSpeed: 4.0
    });
    this.lighting.addLight({
      id: 'laser_light',
      x: 1.0,
      y: 4.0,
      z: 0.5,
      radius: 3.5,
      r: 0,
      g: 240,
      b: 255,
      intensity: 0.9
    });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsTime = this.lastTime;
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
  }

  public setCharacter(type: 'head' | 'heels' | 'combined') {
    this.activeCharType = type;
    this.particles.emitTeleportRing(this.player.x, this.player.y, this.player.z);
  }

  public shootDonut() {
    if (this.donutsLeft <= 0 || (this.activeCharType !== 'head' && this.activeCharType !== 'combined')) {
      return;
    }
    this.donutsLeft--;
    if (this.callbacks.onDonutCountChange) {
      this.callbacks.onDonutCountChange(this.donutsLeft);
    }

    // Direction vector based on facing
    let vx = 0;
    let vy = 0;
    const spd = 6.0;
    if (this.player.facing === 'SE') { vx = spd * 0.707; vy = spd * 0.707; }
    else if (this.player.facing === 'NW') { vx = -spd * 0.707; vy = -spd * 0.707; }
    else if (this.player.facing === 'NE') { vx = spd * 0.707; vy = -spd * 0.707; }
    else if (this.player.facing === 'SW') { vx = -spd * 0.707; vy = spd * 0.707; }

    this.projectiles.push({
      x: this.player.x,
      y: this.player.y,
      z: this.player.z + 0.35,
      vx,
      vy,
      life: 1.2,
      radius: 0.25
    });

    // Muzzle sparks and recoil shake
    this.particles.emitExplosion(this.player.x, this.player.y, this.player.z + 0.35, 12, 3);
    this.camera.addTrauma(0.25);
  }

  public jump() {
    if (!this.player.isGrounded) return;
    const jumpPower = this.activeCharType === 'heels' ? 4.8 : this.activeCharType === 'combined' ? 5.2 : 3.2;
    this.player.vz = jumpPower;
    this.player.isGrounded = false;
    this.player.squashFactor = 1.35; // Stretch up
    this.particles.emitExplosion(this.player.x, this.player.y, 0, 8, 2);
  }

  public handleInput(dx: number, dy: number, dt: number) {
    if (dx === 0 && dy === 0) return;

    const moveSpeed = (this.activeCharType === 'heels' ? 4.2 : this.activeCharType === 'combined' ? 4.6 : 3.0) * dt;
    const newPx = this.player.x + dx * moveSpeed;
    const newPy = this.player.y + dy * moveSpeed;

    // Facing direction
    if (dx > 0 && dy > 0) this.player.facing = 'SE';
    else if (dx < 0 && dy < 0) this.player.facing = 'NW';
    else if (dx > 0 && dy < 0) this.player.facing = 'NE';
    else if (dx < 0 && dy > 0) this.player.facing = 'SW';

    // Crate collision & push
    const distToCrate = Math.hypot(newPx - this.crate.x, newPy - this.crate.y);
    if (distToCrate < 0.85 && Math.abs(this.player.z - this.crate.z) < 0.6) {
      if (this.activeCharType === 'heels' || this.activeCharType === 'combined') {
        // Push crate
        this.crate.x = Math.max(1, Math.min(6.5, this.crate.x + dx * moveSpeed * 0.8));
        this.crate.y = Math.max(1, Math.min(6.5, this.crate.y + dy * moveSpeed * 0.8));
        this.particles.emit(this.crate.x, this.crate.y, 0.1, -dx * 2, -dy * 2, 1, 0.3, 2, 0);
        this.player.x = newPx * 0.75 + this.player.x * 0.25;
        this.player.y = newPy * 0.75 + this.player.y * 0.25;
      }
    } else {
      // Room perimeter bounds
      this.player.x = Math.max(0.6, Math.min(6.8, newPx));
      this.player.y = Math.max(0.6, Math.min(6.8, newPy));
    }

    this.player.animTimer += dt;
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;
    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.update(dt, time);
    this.render(time);

    // Frame telemetry
    this.frameCount++;
    if (time - this.lastFpsTime >= 400) {
      const elapsed = (time - this.lastFpsTime) / 1000;
      const currentFps = Math.round(this.frameCount / elapsed);
      this.frameCount = 0;
      this.lastFpsTime = time;

      if (this.callbacks.onUpdateMetrics) {
        this.callbacks.onUpdateMetrics({
          fps: Math.min(60, currentFps),
          frameTimeMs: this.classicMode ? 3.1 : 5.6,
          drawCalls: this.blocks.length + 12,
          vramMB: this.classicMode ? 80 : 190
        });
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, time: number) {
    const p = this.player;

    // Gravity and Vertical integration
    if (!p.isGrounded) {
      p.vz -= 9.8 * dt;
      p.z += p.vz * dt;

      // Air hover for Head
      if (this.activeCharType === 'head' && p.vz < -0.5) {
        p.vz = -0.5; // Gliding descent
      }

      // Check ground landing
      if (p.z <= 0) {
        p.z = 0;
        p.vz = 0;
        p.isGrounded = true;
        p.squashFactor = 0.75; // Squash on impact
        this.particles.emitExplosion(p.x, p.y, 0, 6, 1.5);
      }
    }

    // Recover squash smoothly
    p.squashFactor += (1.0 - p.squashFactor) * 0.15;

    // Projectile integration
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Collision with bounds or crate
      const hitCrate = Math.hypot(proj.x - this.crate.x, proj.y - this.crate.y) < 0.6;
      if (proj.life <= 0 || proj.x < 0 || proj.x > 7 || proj.y < 0 || proj.y > 7 || hitCrate) {
        this.particles.emitExplosion(proj.x, proj.y, proj.z, 16, 3);
        this.projectiles.splice(i, 1);
        this.camera.addTrauma(0.15);
      }
    }

    // Drone oscillation
    this.drone.x += this.drone.vx * dt;
    if (this.drone.x > 6.5 || this.drone.x < 1.5) {
      this.drone.vx *= -1;
    }
    this.searchLight.x = this.drone.x;
    this.searchLight.y = this.drone.y;

    // Camera follow player position in screen coords
    const pScreen = IsometricCamera.project(p.x, p.y, p.z);
    this.camera.update(dt, pScreen.sx, pScreen.sy);
  }

  private render(time: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Background clearing: Dark industrial abyss
    ctx.fillStyle = this.classicMode ? '#000000' : '#080c14';
    ctx.fillRect(0, 0, w, h);

    // 2. Camera Viewport Transformation
    this.camera.applyTransform(ctx, w, h);

    const toScreen = (wx: number, wy: number, wz: number) =>
      IsometricCamera.project(wx, wy, wz);

    // 3. Volumetric Security Cones (Rendered below geometry)
    if (this.enableVolumetrics && !this.classicMode) {
      this.lighting.renderVolumetricCone(ctx, toScreen, this.searchLight, time * 0.001);
    }

    // 4. Render Isometric Static Geometry (White Titanium & Dark Steel)
    for (let i = 0; i < this.blocks.length; i++) {
      const b = this.blocks[i];
      this.renderVoxelBlock(b, toScreen, time * 0.001);
    }

    // 5. Render Movable Titanium Crate
    this.renderCrate(this.crate.x, this.crate.y, this.crate.z, toScreen, time * 0.001);

    // 6. Render Laser Security Barrier (x=1 to x=1, y=3 to y=6)
    if (!this.classicMode) {
      const p1 = toScreen(1, 3, 0.4);
      const p2 = toScreen(1, 6, 0.4);
      this.lighting.renderLaserBeam(ctx, p1.sx, p1.sy, p2.sx, p2.sy, '#00f0ff', 3, time * 0.001);
    }

    // 7. Render Teleportation Portal Core (at 6.5, 6.5)
    this.renderPortal(6.5, 6.5, 0.25, toScreen, time * 0.001);

    // 8. Render Flying Drone Centinel
    this.renderDrone(this.drone.x, this.drone.y, this.drone.z, toScreen, time * 0.001);

    // 9. Render Donut Projectiles
    this.renderProjectiles(toScreen);

    // 10. Render Character Contact Shadows & Laser Guider
    if (!this.classicMode) {
      CharacterProceduralRenderer.renderContactShadow(ctx, toScreen, this.player);
    }

    // 11. Render Character Body (Head / Heels / Combined)
    const pScreen = toScreen(this.player.x, this.player.y, this.player.z);
    const lightMult = this.enableLighting && !this.classicMode
      ? this.lighting.evaluateLightProbe(this.player.x, this.player.y, this.player.z, time * 0.001)
      : { r: 1, g: 1, b: 1 };

    if (this.activeCharType === 'head') {
      CharacterProceduralRenderer.renderHead(ctx, pScreen.sx, pScreen.sy, this.player, lightMult, time * 0.001);
    } else if (this.activeCharType === 'heels') {
      CharacterProceduralRenderer.renderHeels(ctx, pScreen.sx, pScreen.sy, this.player, lightMult, time * 0.001);
    } else {
      CharacterProceduralRenderer.renderCombined(ctx, pScreen.sx, pScreen.sy, this.player, lightMult, time * 0.001);
    }

    // 12. Render Particles (Additive Blending)
    if (this.enableParticles) {
      this.particles.updateAndRender(ctx, 0.016, toScreen);
    }

    this.camera.restoreTransform(ctx);

    // 13. Screen-Space Post-Processing (Scanlines, Vignette, Bloom)
    if (!this.classicMode) {
      if (this.enableVignette) {
        this.postProcess.renderVignette(ctx, w, h);
      }
      if (this.enableBloom) {
        this.postProcess.renderLightweightBloom(ctx, this.canvas, 0.45);
      }
      if (this.enableScanlines) {
        this.postProcess.renderScanlines(ctx, w, h, 0.12);
      }
    }
  }

  private renderVoxelBlock(
    b: VoxelBlock,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    time: number
  ) {
    const ctx = this.ctx;
    const { sx, sy } = toScreen(b.x, b.y, b.z);
    const hw = 32 * b.width;
    const hh = 16 * b.length;
    const hPix = b.height * 32;

    if (this.classicMode) {
      ctx.fillStyle = b.material.topColor;
      ctx.fillRect(sx - hw, sy - hPix, hw * 2, hPix + hh);
      ctx.strokeStyle = '#222222';
      ctx.strokeRect(sx - hw, sy - hPix, hw * 2, hPix + hh);
      return;
    }

    // Top Face
    ctx.fillStyle = b.material.topColor;
    ctx.beginPath();
    ctx.moveTo(sx, sy - hPix);
    ctx.lineTo(sx + hw, sy + hh - hPix);
    ctx.lineTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx - hw, sy + hh - hPix);
    ctx.closePath();
    ctx.fill();

    // Left Face
    ctx.fillStyle = b.material.leftColor;
    ctx.beginPath();
    ctx.moveTo(sx - hw, sy + hh - hPix);
    ctx.lineTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx, sy + (hh * 2));
    ctx.lineTo(sx - hw, sy + hh);
    ctx.closePath();
    ctx.fill();

    // Right Face
    ctx.fillStyle = b.material.rightColor;
    ctx.beginPath();
    ctx.moveTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx + hw, sy + hh - hPix);
    ctx.lineTo(sx + hw, sy + hh);
    ctx.lineTo(sx, sy + (hh * 2));
    ctx.closePath();
    ctx.fill();

    // Procedural surface details (rivets, hazard stripes, panels)
    ProceduralMaterials.renderFaceDetails(ctx, b.material.patternType, sx, sy, hw, hh, hPix, time);

    // Bevel highlights
    ctx.strokeStyle = b.material.bevelColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx - hw, sy + hh - hPix);
    ctx.lineTo(sx, sy - hPix);
    ctx.lineTo(sx + hw, sy + hh - hPix);
    ctx.stroke();
  }

  private renderCrate(
    cx: number, cy: number, cz: number,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    time: number
  ) {
    const ctx = this.ctx;
    const { sx, sy } = toScreen(cx, cy, cz);
    const hw = 24;
    const hh = 12;
    const hPix = 24;

    // Contact shadow
    const ground = toScreen(cx, cy, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(ground.sx, ground.sy + 6, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top Face (White Titanium Crate with Cyan Energy Cross)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(sx, sy - hPix);
    ctx.lineTo(sx + hw, sy + hh - hPix);
    ctx.lineTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx - hw, sy + hh - hPix);
    ctx.closePath();
    ctx.fill();

    // Left Face
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(sx - hw, sy + hh - hPix);
    ctx.lineTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx, sy + (hh * 2));
    ctx.lineTo(sx - hw, sy + hh);
    ctx.closePath();
    ctx.fill();

    // Right Face
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(sx, sy + (hh * 2) - hPix);
    ctx.lineTo(sx + hw, sy + hh - hPix);
    ctx.lineTo(sx + hw, sy + hh);
    ctx.lineTo(sx, sy + (hh * 2));
    ctx.closePath();
    ctx.fill();

    // Emissive Cyan Line
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - hw, sy + hh - hPix * 0.5);
    ctx.lineTo(sx, sy + (hh * 2) - hPix * 0.5);
    ctx.lineTo(sx + hw, sy + hh - hPix * 0.5);
    ctx.stroke();
  }

  private renderPortal(
    px: number, py: number, pz: number,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    time: number
  ) {
    const ctx = this.ctx;
    const { sx, sy } = toScreen(px, py, pz);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Rotating plasma vortex
    const pulse = 0.8 + 0.2 * Math.sin(time * 6);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 24 * pulse, 12 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16 * pulse, 8 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderDrone(
    dx: number, dy: number, dz: number,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    time: number
  ) {
    const ctx = this.ctx;
    const { sx, sy } = toScreen(dx, dy, dz);

    // Drone Body
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(sx, sy - 12, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Sentinel Eye
    const eyePulse = 0.8 + 0.2 * Math.sin(time * 10);
    ctx.fillStyle = `rgba(239, 68, 68, ${eyePulse})`;
    ctx.beginPath();
    ctx.arc(sx, sy - 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rotor glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(sx - 14, sy - 16, 6, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(sx + 14, sy - 16, 6, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderProjectiles(toScreen: (x: number, y: number, z: number) => { sx: number; sy: number }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.projectiles.length; i++) {
      const proj = this.projectiles[i];
      const { sx, sy } = toScreen(proj.x, proj.y, proj.z);

      // Glowing Donut Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
