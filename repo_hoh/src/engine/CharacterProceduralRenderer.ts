/**
 * PROCEDURAL CHARACTER RENDERING PIPELINE (HEAD, HEELS, COMBINED)
 * 
 * 100% Code-driven Vector & Shading Geometry.
 * Zero external sprite sheets or image assets required.
 * Generates White Titanium, Blue Energy and Robotic Articulation procedurally.
 */

export interface CharacterState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  facing: 'NE' | 'NW' | 'SE' | 'SW';
  isGrounded: boolean;
  squashFactor: number;
  animTimer: number;
}

export class CharacterProceduralRenderer {
  /**
   * Render procedural Contact Shadow and Vertical Z Laser Guider
   */
  public static renderContactShadow(
    ctx: CanvasRenderingContext2D,
    toScreen: (x: number, y: number, z: number) => { sx: number; sy: number },
    char: CharacterState,
    color = 'rgba(56, 189, 248, 0.45)'
  ) {
    const ground = toScreen(char.x, char.y, 0);
    const charPos = toScreen(char.x, char.y, char.z);

    // Height-based shadow attenuation
    const shadowScale = Math.max(0.35, 1.0 - char.z * 0.22);
    const shadowAlpha = Math.max(0.15, 0.55 - char.z * 0.12);

    // 1. Soft Elliptical Contact Shadow
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(ground.sx, ground.sy + 8, 16 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Collimated Vertical Laser Guiding Line (Eliminates Jump Ambiguity)
    if (char.z > 0.15) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(ground.sx, ground.sy + 8);
      ctx.lineTo(charPos.sx, charPos.sy);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Render Head: White Titanium Drone Biomorph with Glider Wings & Pneumatic Hooter
   */
  public static renderHead(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    state: CharacterState,
    lightMult: { r: number; g: number; b: number },
    time: number
  ) {
    ctx.save();
    const bob = state.isGrounded ? Math.sin(time * 6) * 1.5 : Math.sin(time * 12) * 2.5;
    const syBob = sy + bob;
    const squash = state.squashFactor;

    // Apply procedural squash & stretch
    ctx.translate(sx, syBob);
    ctx.scale(1 / squash, squash);

    // 1. Blue Energy Glider Wings (Deploy when airborne)
    const wingFlap = !state.isGrounded ? Math.sin(time * 18) * 4 : 0;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    // Left Wing
    ctx.moveTo(-16, -22 + wingFlap);
    ctx.lineTo(-8, -16);
    ctx.lineTo(-12, -10);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(16, -22 + wingFlap);
    ctx.lineTo(8, -16);
    ctx.lineTo(12, -10);
    ctx.closePath();
    ctx.fill();

    // 2. Head Titanium Aero-Capsule (White Titanium with Specular Bevel)
    const rCol = Math.min(255, 248 * lightMult.r) | 0;
    const gCol = Math.min(255, 250 * lightMult.g) | 0;
    const bCol = Math.min(255, 252 * lightMult.b) | 0;
    ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
    ctx.beginPath();
    ctx.arc(0, -18, 14, 0, Math.PI * 2);
    ctx.fill();

    // Rim light on head top
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -18, 13.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // 3. Cybernetic Visor & Expressive Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, -20, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyan glowing pupils
    const eyeScan = Math.sin(time * 4) * 2;
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-4 + eyeScan, -21, 3, 2);
    ctx.fillRect(2 + eyeScan, -21, 3, 2);

    // 4. Pneumatic Hooter Snout (Donut Cannon)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-3, -14, 6, 5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-2, -12, 4, 2);

    // 5. Thruster Glow when hovering
    if (!state.isGrounded) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, -4, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render Heels: Dark Industrial Robotics with Heavy Exo-Spring Shock Absorber Legs
   */
  public static renderHeels(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    state: CharacterState,
    lightMult: { r: number; g: number; b: number },
    time: number
  ) {
    ctx.save();
    const squash = state.squashFactor;
    ctx.translate(sx, sy);
    ctx.scale(1 / squash, squash);

    // 1. Exo-Spring Hydraulic Legs
    const stepAnim = Math.sin(state.animTimer * 14) * 4;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;

    // Left Spring Leg
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-8, -8 + (state.isGrounded ? stepAnim : 0));
    ctx.lineTo(-6, -2);
    ctx.stroke();

    // Right Spring Leg
    ctx.beginPath();
    ctx.moveTo(6, -14);
    ctx.lineTo(8, -8 - (state.isGrounded ? stepAnim : 0));
    ctx.lineTo(6, -2);
    ctx.stroke();

    // Heavy Traction Feet
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -3, 6, 3);
    ctx.fillRect(4, -3, 6, 3);

    // 2. Chassis Body (Dark Industrial Alloy & Titanium Plate)
    const rCol = Math.min(255, 30 * lightMult.r) | 0;
    const gCol = Math.min(255, 41 * lightMult.g) | 0;
    const bCol = Math.min(255, 59 * lightMult.b) | 0;
    ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
    ctx.fillRect(-10, -26, 20, 14);

    // Front Green Energy Core
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-4, -22, 8, 5);
    ctx.fillStyle = '#6ee7b7';
    ctx.fillRect(-2, -21, 4, 3);

    // 3. Magnetic Backpack Carrier Basket
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -30, 24, 6);

    ctx.restore();
  }

  /**
   * Render Combined: Head Docked onto Heels Backpack
   */
  public static renderCombined(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    state: CharacterState,
    lightMult: { r: number; g: number; b: number },
    time: number
  ) {
    // Render Heels lower chassis
    this.renderHeels(ctx, sx, sy, state, lightMult, time);
    // Render Head positioned on top
    this.renderHead(ctx, sx, sy - 18, state, lightMult, time);

    // Unified Energy Shield Aura
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.8 + 0.2 * Math.sin(time * 8);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(sx, sy - 22, 18, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
