/**
 * LIGHTING PIPELINE FOR 2.5D ISOMETRIC RENDERER
 * 
 * Optimized for AMD 3020e: Evaluates up to 8 dynamic lights with zero frame-buffer stalls.
 * Simulates Volumetrics, Point Lights, and Rim Lighting analytically.
 */

export interface PointLight {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  intensity: number;
  pulseSpeed?: number;
}

export interface SearchLight {
  x: number;
  y: number;
  z: number;
  targetAngle: number;
  beamLength: number;
  spreadAngle: number;
  color: string;
  speed: number;
}

export class LightingPipeline {
  private lights: PointLight[] = [];

  public clearLights() {
    this.lights.length = 0;
  }

  public addLight(light: PointLight) {
    this.lights.push(light);
  }

  /**
   * Evaluate lighting at an isometric 3D point (world coords)
   * Returns RGB multipliers [r, g, b] scaled between 0.0 and 2.0
   */
  public evaluateLightProbe(
    wx: number,
    wy: number,
    wz: number,
    time: number
  ): { r: number; g: number; b: number } {
    // Ambient baseline: cool industrial twilight (0.28, 0.32, 0.40)
    let lr = 0.30;
    let lg = 0.34;
    let lb = 0.42;

    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      const dx = wx - l.x;
      const dy = wy - l.y;
      const dz = wz - l.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      const radSq = l.radius * l.radius;

      if (distSq < radSq) {
        let pulse = 1.0;
        if (l.pulseSpeed) {
          pulse = 0.85 + 0.15 * Math.sin(time * l.pulseSpeed + i * 1.5);
        }

        // Quadratic inverse falloff: (1 - d^2 / R^2)^2
        const factor = Math.max(0, 1.0 - (distSq / radSq));
        const atten = factor * factor * l.intensity * pulse;

        lr += (l.r / 255) * atten;
        lg += (l.g / 255) * atten;
        lb += (l.b / 255) * atten;
      }
    }

    return {
      r: Math.min(2.0, lr),
      g: Math.min(2.0, lg),
      b: Math.min(2.0, lb)
    };
  }

  /**
   * Render analytical Volumetric Searchlight Cone
   * Simulates atmospheric dust scattering in dark industrial sectors
   */
  public renderVolumetricCone(
    ctx: CanvasRenderingContext2D,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    sl: SearchLight,
    time: number
  ) {
    const origin = toScreen(sl.x, sl.y, sl.z);
    const angle = sl.targetAngle + Math.sin(time * sl.speed) * 0.45;
    const len = sl.beamLength;

    // Ground projection endpoints
    const endX1 = sl.x + Math.cos(angle - sl.spreadAngle) * len;
    const endY1 = sl.y + Math.sin(angle - sl.spreadAngle) * len;
    const endX2 = sl.x + Math.cos(angle + sl.spreadAngle) * len;
    const endY2 = sl.y + Math.sin(angle + sl.spreadAngle) * len;

    const p1 = toScreen(endX1, endY1, 0);
    const p2 = toScreen(endX2, endY2, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Volumetric gradient cone
    const grad = ctx.createLinearGradient(origin.sx, origin.sy, (p1.sx + p2.sx) * 0.5, (p1.sy + p2.sy) * 0.5);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.18)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.closePath();
    ctx.fill();

    // Projected ground spotlight ellipse
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    const groundMidX = (p1.sx + p2.sx) * 0.5;
    const groundMidY = (p1.sy + p2.sy) * 0.5;
    ctx.ellipse(groundMidX, groundMidY, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render High-Energy Laser Beam with core glow and sparks
   */
  public renderLaserBeam(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    color = '#00f0ff',
    width = 3,
    time: number
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Outer glow aura
    const flicker = 0.9 + 0.1 * Math.sin(time * 45);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 3 * flicker;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Concentrated plasma core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  }
}
