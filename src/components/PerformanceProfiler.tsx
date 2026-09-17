import React from 'react';
import { Cpu, Activity, Zap, HardDrive, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PerformanceMetrics, RenderOptions } from '../types';

interface PerformanceProfilerProps {
  metrics: PerformanceMetrics;
  renderOptions: RenderOptions;
  onToggleOption: (key: keyof RenderOptions) => void;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  metrics,
  renderOptions,
  onToggleOption
}) => {
  const isHealthy = metrics.fps >= 55;
  const frameBudgetPercent = Math.min(100, Math.round((metrics.frameTimeMs / 16.66) * 100));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl backdrop-blur-md">
      {/* Profiler Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
              AMD 3020e Hardware Telemetry
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Dual-Core Zen @ 2.6GHz | Radeon Vega 3 (3 CUs) | 8GB DDR4
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {isHealthy ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono font-semibold text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>60 FPS PASS</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[10px] font-mono font-semibold text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>OVERBUDGET</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {/* FPS */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-mono uppercase text-slate-400">Tasa de Cuadros</div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className={`text-xl font-mono font-black ${metrics.fps >= 58 ? 'text-emerald-400' : metrics.fps >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
              {metrics.fps}
            </span>
            <span className="text-[10px] font-mono text-slate-500">/ 60 FPS</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${metrics.fps >= 58 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${(metrics.fps / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Frame Time */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-mono uppercase text-slate-400">Tiempo Frame CPU/GPU</div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-mono font-black text-cyan-400">
              {metrics.frameTimeMs.toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">ms (16.6ms max)</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${frameBudgetPercent < 60 ? 'bg-cyan-400' : frameBudgetPercent < 85 ? 'bg-amber-400' : 'bg-rose-400'}`}
              style={{ width: `${frameBudgetPercent}%` }}
            />
          </div>
        </div>

        {/* Draw Calls */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-mono uppercase text-slate-400">Draw Calls Batch</div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-mono font-black text-indigo-400">
              {metrics.drawCalls}
            </span>
            <span className="text-[10px] font-mono text-slate-500">llamadas</span>
          </div>
          <div className="text-[9px] font-mono text-emerald-400 mt-1">
            Optimizado (Límite: 350)
          </div>
        </div>

        {/* VRAM Footprint */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-mono uppercase text-slate-400">VRAM Compartida</div>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-xl font-mono font-black text-purple-400">
              {metrics.vramUsageMB}
            </span>
            <span className="text-[10px] font-mono text-slate-500">MB (Budget: 350MB)</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-1">
            Atlas comprimido 2.5D
          </div>
        </div>
      </div>

      {/* Real-time Feature Pipeline Toggles */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wide">
            Pipeline Visual & Efectos en Tiempo Real
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            Haz clic para alternar sistemas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <button
            onClick={() => onToggleOption('ambientOcclusion')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.ambientOcclusion
                ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Vertex AO</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.ambientOcclusion ? 'bg-cyan-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Oclusión esquinas</div>
          </button>

          <button
            onClick={() => onToggleOption('rimLighting')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.rimLighting
                ? 'bg-blue-950/50 border-blue-500/50 text-blue-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Rim Light</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.rimLighting ? 'bg-blue-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Biselado titanio</div>
          </button>

          <button
            onClick={() => onToggleOption('energyParticles')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.energyParticles
                ? 'bg-sky-950/50 border-sky-500/50 text-sky-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Partículas SoA</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.energyParticles ? 'bg-sky-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pool Float32Array</div>
          </button>

          <button
            onClick={() => onToggleOption('volumetricLights')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.volumetricLights
                ? 'bg-teal-950/50 border-teal-500/50 text-teal-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Volumetría 2.5D</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.volumetricLights ? 'bg-teal-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Conos trapezoidales</div>
          </button>

          <button
            onClick={() => onToggleOption('lightBloom')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.lightBloom
                ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Bloom 1/4 Res</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.lightBloom ? 'bg-indigo-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kawase 2-pass</div>
          </button>

          <button
            onClick={() => onToggleOption('scanlines')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.scanlines
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Scanlines CRT</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.scanlines ? 'bg-amber-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Overlay retro-sci-fi</div>
          </button>

          <button
            onClick={() => onToggleOption('holographicUI')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.holographicUI
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">HUD Diagético</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.holographicUI ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Telemetría en juego</div>
          </button>

          <button
            onClick={() => onToggleOption('classicMode')}
            className={`p-2 rounded-lg border text-left transition-all ${
              renderOptions.classicMode
                ? 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Modo 8-Bit Flat</span>
              <span className={`w-2 h-2 rounded-full ${renderOptions.classicMode ? 'bg-rose-400' : 'bg-slate-700'}`} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {renderOptions.classicMode ? 'Modo clásico activo' : 'Modo AAA activo'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
