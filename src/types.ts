export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  trianglesOrQuads: number;
  vramUsageMB: number;
  bandwidthUsageGBs: number;
  vega3BudgetPercent: number;
}

export interface RenderOptions {
  ambientOcclusion: boolean;
  rimLighting: boolean;
  specularTitanium: boolean;
  volumetricLights: boolean;
  energyParticles: boolean;
  lightBloom: boolean;
  scanlines: boolean;
  holographicUI: boolean;
  cameraTilt: boolean;
  classicMode: boolean;
}

export interface IsometricObject {
  id: string;
  type: 'titanium_block' | 'industrial_pillar' | 'energy_portal' | 'security_laser' | 'console' | 'player_head' | 'player_heels' | 'drone';
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  height: number;
  color?: string;
  glow?: boolean;
  active?: boolean;
}

export interface AuditSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  iconName: string;
  summary: string;
  content: string;
  codeBlocks?: {
    file: string;
    description: string;
    currentCode: string;
    improvedCode: string;
    technicalExplanation: string;
  }[];
  tables?: {
    headers: string[];
    rows: string[][];
  }[];
}
