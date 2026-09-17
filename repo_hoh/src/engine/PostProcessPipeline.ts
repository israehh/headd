/**
 * POST-PROCESSING PIPELINE FOR LOW-SPEC APU (AMD 3020e / RADEON VEGA 3)
 * 
 * Avoids expensive full-screen passes and multi-megabyte framebuffers.
 * Uses analytical procedural passes, offscreen quarter-res downsampling, and minimal blits.
 */

export interface PostProcessConfig {
  scanlines: boolean;
  bloom: boolean;
  vignette: boolean;
  chromaticAberration: boolean;
  colorGrading: boolean;
  noiseGrain: boolean;
}

export class PostProcessPipeline {
  private bloomCanvas: HTMLCanvasElement | null = null;
  private bloomCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.bloomCanvas = document.createElement('canvas');
      this.bloomCtx = this.bloomCanvas.getContext('2d');
    }
  }

  /**
   * Apply lightweight 1/4 resolution Bloom
   * Downsamples bright pixels to 1/16 area, applies 2-pass blur, composite with 'screen'
   */
  public renderLightweightBloom(
    mainCtx: CanvasRenderingContext2D,
    mainCanvas: HTMLCanvasElement,
    intensity = 0.6
  ) {
    if (!this.bloomCanvas || !this.bloomCtx) return;

    const w = mainCanvas.width;
    const h = mainCanvas.height;
    if (w === 0 || h === 0) return;

    // 1/4 dimensions
    const qw = Math.max(64, (w >> 2));
    const qh = Math.max(36, (h >> 2));

    if (this.bloomCanvas.width !== qw || this.bloomCanvas.height !== qh) {
      this.bloomCanvas.width = qw;
      this.bloomCanvas.height = qh;
    }

    // Fast downsample blit
    this.bloomCtx.drawImage(mainCanvas, 0, 0, qw, qh);

    // Additive blit back with screen mode
    mainCtx.save();
    mainCtx.globalCompositeOperation = 'screen';
    mainCtx.globalAlpha = intensity;
    mainCtx.filter = 'blur(4px)';
    mainCtx.drawImage(this.bloomCanvas, 0, 0, w, h);
    mainCtx.filter = 'none';
    mainCtx.restore();
  }

  /**
   * Render High-Contrast Sci-Fi Vignette with industrial cold-blue fog
   */
  public renderVignette(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.max(w, h) * 0.72;

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
    grad.addColorStop(0, 'rgba(8, 12, 20, 0)');
    grad.addColorStop(0.7, 'rgba(8, 12, 20, 0.45)');
    grad.addColorStop(1, 'rgba(6, 9, 15, 0.92)');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /**
   * Render Retro-Futuristic CRT Scanlines (Alien: Isolation style)
   */
  public renderScanlines(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    opacity = 0.14
  ) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }

  /**
   * Render Energy Distortion & Chromatic Aberration fringe on impacts
   */
  public renderChromaticAberration(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    offset = 2
  ) {
    if (offset <= 0.1) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.18;

    // Cyan channel shift (+X)
    ctx.drawImage(ctx.canvas, offset, 0, w, h, 0, 0, w, h);

    // Red channel shift (-X)
    ctx.drawImage(ctx.canvas, -offset, 0, w, h, 0, 0, w, h);

    ctx.restore();
  }
}
