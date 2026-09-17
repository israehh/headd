/**
 * PROCEDURAL MATERIALS & SHADING SYSTEM (HEAD OVER HEELS 2.0)
 * 
 * 100% Procedural - Zero external textures/sprites/images used.
 * Optimized for AMD 3020e / Radeon Vega 3 (DDR4 Shared Memory).
 */

export interface MaterialStyle {
  topColor: string;
  leftColor: string;
  rightColor: string;
  rimColor: string;
  bevelColor: string;
  emissiveColor?: string;
  patternType?: 'plain' | 'titanium_panel' | 'carbon_grid' | 'hazard_stripes' | 'circuit_matrix' | 'plasma_core';
}

export class ProceduralMaterials {
  /**
   * Facet luminance factors for 2.5D dimetric isometric projection
   * Top face (diffuse direct): 1.15x
   * Left face (ambient light): 0.85x
   * Right face (occluded shadow): 0.60x
   */
  public static readonly LUM_TOP = 1.15;
  public static readonly LUM_LEFT = 0.85;
  public static readonly LUM_RIGHT = 0.60;

  /**
   * Material 1: White Titanium Technology
   * High specular reflection, clean ceramic titanium look, micro-bevels
   */
  public static readonly TITANIUM: MaterialStyle = {
    topColor: '#ffffff',
    leftColor: '#cbd5e1',
    rightColor: '#94a3b8',
    rimColor: 'rgba(255, 255, 255, 0.85)',
    bevelColor: 'rgba(255, 255, 255, 0.45)',
    patternType: 'titanium_panel'
  };

  /**
   * Material 2: Dark Industrial Structure
   * Cold rolled steel, dark graphite, subtle blue undertone
   */
  public static readonly DARK_STEEL: MaterialStyle = {
    topColor: '#273244',
    leftColor: '#1a2230',
    rightColor: '#0f172a',
    rimColor: 'rgba(56, 189, 248, 0.35)',
    bevelColor: 'rgba(255, 255, 255, 0.12)',
    patternType: 'carbon_grid'
  };

  /**
   * Material 3: Blue Energy Conductor
   * Emissive plasma crystal, energized power node
   */
  public static readonly BLUE_ENERGY: MaterialStyle = {
    topColor: '#38bdf8',
    leftColor: '#0284c7',
    rightColor: '#0369a1',
    rimColor: '#00f0ff',
    bevelColor: '#7dd3fc',
    emissiveColor: '#00f0ff',
    patternType: 'plasma_core'
  };

  /**
   * Material 4: Industrial Hazard Warning
   * High contrast diagonal hazard stripes for elevators and lethal perimeters
   */
  public static readonly HAZARD: MaterialStyle = {
    topColor: '#fbbf24',
    leftColor: '#d97706',
    rightColor: '#b45309',
    rimColor: 'rgba(255, 255, 255, 0.6)',
    bevelColor: 'rgba(0, 0, 0, 0.4)',
    patternType: 'hazard_stripes'
  };

  /**
   * Render procedural details on top of isometric faces without texture assets
   */
  public static renderFaceDetails(
    ctx: CanvasRenderingContext2D,
    pattern: MaterialStyle['patternType'],
    sx: number,
    sy: number,
    hw: number,
    hh: number,
    hPix: number,
    time: number
  ) {
    if (!pattern || pattern === 'plain') return;

    if (pattern === 'titanium_panel') {
      // Micro-panel division line on top face
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - hw * 0.4, sy + hh * 0.6 - hPix);
      ctx.lineTo(sx + hw * 0.4, sy + hh * 1.4 - hPix);
      ctx.stroke();

      // Corner rivet dots
      ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.fillRect(sx - hw * 0.6, sy + hh - hPix - 1, 2, 2);
      ctx.fillRect(sx + hw * 0.6, sy + hh - hPix - 1, 2, 2);
    } else if (pattern === 'hazard_stripes') {
      // High-contrast diagonal hazard stripes on top face
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let offset = -hw; offset <= hw; offset += 10) {
        ctx.moveTo(sx + offset, sy - hPix + (hh * (offset / hw)));
        ctx.lineTo(sx + offset + 6, sy + (hh * 2) - hPix + (hh * (offset / hw)));
      }
      ctx.stroke();
    } else if (pattern === 'plasma_core') {
      // Oscillating inner energy core
      const pulse = Math.sin(time * 6) * 0.25 + 0.75;
      ctx.fillStyle = `rgba(0, 240, 255, ${pulse * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy + hh - hPix, hw * 0.5, hh * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Compute Vertex & Wall-Joint Ambient Occlusion Multiplier
   * Analyzes 6 neighboring grid cells to darken corners without post-processing
   */
  public static computeVertexAO(
    hasNorthNeighbor: boolean,
    hasWestNeighbor: boolean,
    hasCornerNeighbor: boolean
  ): number {
    let occlusion = 0.0;
    if (hasNorthNeighbor) occlusion += 0.22;
    if (hasWestNeighbor) occlusion += 0.22;
    if (hasCornerNeighbor && !hasNorthNeighbor && !hasWestNeighbor) occlusion += 0.12;
    return Math.max(0.45, 1.0 - occlusion);
  }
}
