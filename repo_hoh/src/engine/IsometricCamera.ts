/**
 * ISOMETRIC CAMERA WITH DYNAMIC CINEMATIC TILT & TRAUMA SHAKE
 * 
 * Implements 2:1 dimetric projection with subpixel stability.
 * Adds dynamic camera lag, micro-tilt, and trauma-based screen shake.
 */

export class IsometricCamera {
  public x = 0;
  public y = 0;
  public targetX = 0;
  public targetY = 0;

  // Smoothing parameter (0.05 to 0.20)
  public smoothFactor = 0.12;

  // Trauma shake parameters
  private trauma = 0.0;
  private maxShakeOffset = 10;
  private maxShakeAngle = 0.03;

  // Micro-tilt on movement
  public tiltX = 0;
  public tiltY = 0;

  public update(dt: number, followX: number, followY: number) {
    this.targetX = followX;
    this.targetY = followY;

    // Exponential smoothing
    this.x += (this.targetX - this.x) * this.smoothFactor;
    this.y += (this.targetY - this.y) * this.smoothFactor;

    // Decay trauma linearly
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.8);
    }
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  /**
   * Apply camera transform to canvas context
   */
  public applyTransform(
    ctx: CanvasRenderingContext2D,
    viewportW: number,
    viewportH: number
  ) {
    const shake = this.trauma * this.trauma; // Non-linear response
    const offsetX = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
    const offsetY = (Math.random() * 2 - 1) * this.maxShakeOffset * shake;
    const angle = (Math.random() * 2 - 1) * this.maxShakeAngle * shake;

    const cx = viewportW * 0.5;
    const cy = viewportH * 0.5;

    ctx.save();
    ctx.translate(cx + offsetX, cy + offsetY);
    if (angle !== 0) {
      ctx.rotate(angle);
    }
    ctx.translate(-this.x, -this.y);
  }

  public restoreTransform(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  /**
   * 2:1 Dimetric World-to-Screen Projection Formula
   * @param wx World X coordinate
   * @param wy World Y coordinate
   * @param wz World Z coordinate (Height)
   */
  public static project(wx: number, wy: number, wz: number, halfW = 32, halfH = 16, heightScale = 32) {
    return {
      sx: (wx - wy) * halfW,
      sy: (wx + wy) * halfH - (wz * heightScale)
    };
  }
}
