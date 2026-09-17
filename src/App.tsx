import React, { useState } from 'react';
import { 
  Gamepad2, Cpu, BookOpen, Layers, Sparkles, 
  Terminal, ShieldCheck, Download, Zap, Radio, 
  Sliders, Eye, HelpCircle, CheckCircle
} from 'lucide-react';
import { IsometricEngineDemo } from './components/IsometricEngineDemo';
import { HolographicHUD } from './components/HolographicHUD';
import { PerformanceProfiler } from './components/PerformanceProfiler';
import { AuditReportViewer } from './components/AuditReportViewer';
import { RenderOptions, PerformanceMetrics } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'hud' | 'audit' | 'compare'>('simulator');
  const [activeCharacter, setActiveCharacter] = useState<'head' | 'heels' | 'combined'>('head');

  // Real-time Engine Render Options
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    ambientOcclusion: true,
    rimLighting: true,
    specularTitanium: true,
    volumetricLights: true,
    energyParticles: true,
    lightBloom: true,
    scanlines: true,
    holographicUI: true,
    cameraTilt: true,
    classicMode: false
  });

  // Simulated / Measured Live Performance Telemetry
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTimeMs: 5.8,
    drawCalls: 48,
    trianglesOrQuads: 192,
    vramUsageMB: 195,
    bandwidthUsageGBs: 4.2,
    vega3BudgetPercent: 35
  });

  const toggleRenderOption = (key: keyof RenderOptions) => {
    setRenderOptions(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // If toggling classicMode to true, turn off complex shaders
      if (key === 'classicMode' && updated.classicMode) {
        updated.ambientOcclusion = false;
        updated.rimLighting = false;
        updated.volumetricLights = false;
        updated.energyParticles = false;
        updated.lightBloom = false;
      } else if (key === 'classicMode' && !updated.classicMode) {
        updated.ambientOcclusion = true;
        updated.rimLighting = true;
        updated.volumetricLights = true;
        updated.energyParticles = true;
        updated.lightBloom = true;
      }
      return updated;
    });
  };

  const applyPreset = (preset: 'aaa' | 'classic' | 'eco') => {
    if (preset === 'aaa') {
      setRenderOptions({
        ambientOcclusion: true,
        rimLighting: true,
        specularTitanium: true,
        volumetricLights: true,
        energyParticles: true,
        lightBloom: true,
        scanlines: true,
        holographicUI: true,
        cameraTilt: true,
        classicMode: false
      });
    } else if (preset === 'classic') {
      setRenderOptions({
        ambientOcclusion: false,
        rimLighting: false,
        specularTitanium: false,
        volumetricLights: false,
        energyParticles: false,
        lightBloom: false,
        scanlines: false,
        holographicUI: false,
        cameraTilt: false,
        classicMode: true
      });
    } else if (preset === 'eco') {
      setRenderOptions({
        ambientOcclusion: true,
        rimLighting: true,
        specularTitanium: false,
        volumetricLights: false,
        energyParticles: false,
        lightBloom: false,
        scanlines: false,
        holographicUI: true,
        cameraTilt: false,
        classicMode: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Futuristic Header Bar */}
      <header className="border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-mono font-black tracking-wider text-slate-100 uppercase">
                  HEAD OVER HEELS 2.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-bold">
                  AAA TECH AUDIT
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Lead Technical Artist & Isometric Engineering Suite
              </div>
            </div>
          </div>

          {/* Hardware Profile Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Target HW:</span>
            <span className="text-emerald-400 font-bold">AMD 3020e</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Vega 3 (3 CUs)</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">8GB DDR4</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <button
              onClick={() => applyPreset('aaa')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                !renderOptions.classicMode && renderOptions.ambientOcclusion
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Preset AAA Indie
            </button>
            <button
              onClick={() => applyPreset('classic')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                renderOptions.classicMode
                  ? 'bg-rose-950 border-rose-500 text-rose-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              8-Bit 1987 Flat
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex space-x-2 overflow-x-auto border-t border-slate-800/80 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>1. Simulador Motor 2.5D</span>
          </button>

          <button
            onClick={() => setActiveTab('hud')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'hud'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>2. HUD Holográfico Diagético</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Informe Técnico Completo (9 Secciones)</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'compare'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4. Comparativa Clásico vs AAA</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Tab 1: Live 2.5D Isometric Simulation & Telemetry */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Isometric Game Canvas (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <IsometricEngineDemo
                  renderOptions={renderOptions}
                  activeCharacter={activeCharacter}
                  onSwitchCharacter={setActiveCharacter}
                  onUpdateMetrics={setMetrics}
                />

                {/* Quick Interactive Instructions */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                      CONTROLES
                    </span>
                    <span>WASD / Flechas: Moverse | Espacio: Saltar | F: Disparar Donut | Tab: Cambiar personaje</span>
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    Heels empuja cajas y salta alto | Head planea y dispara
                  </div>
                </div>
              </div>

              {/* Real-time Hardware Profiler & Telemetry (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <PerformanceProfiler
                  metrics={metrics}
                  renderOptions={renderOptions}
                  onToggleOption={toggleRenderOption}
                />

                {/* Architectural Key Takeaways */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-mono font-bold text-cyan-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Leyes de Rendimiento en AMD 3020e</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-400 font-mono text-[11px]">
                    <li className="flex items-start space-x-1.5">
                      <span className="text-cyan-400">•</span>
                      <span><strong>0% Post-SSAO:</strong> Se usa Vertex AO prehorneado para no estrangular el ancho de banda DDR4.</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-cyan-400">•</span>
                      <span><strong>Proyección 2:1:</strong> Dimétrico exacto a 26.565° elimina el temblor de píxeles (shimmering).</span>
                    </li>
                    <li className="flex items-start space-x-1.5">
                      <span className="text-cyan-400">•</span>
                      <span><strong>Zero Allocations:</strong> Toda la física y partículas corren sobre <code className="text-slate-200">Float32Array</code> continuo.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Futuristic Sci-Fi Diagetic HUD Showcase */}
        {activeTab === 'hud' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/40 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold">REDISEÑO VISUAL DE INTERFAZ (SECCIÓN #5): </span>
                <span className="text-slate-300">HUD Holográfico Retro-Futurista inspirado en Alien: Isolation y Dead Space.</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                100% Interactivo
              </span>
            </div>

            <HolographicHUD
              activeCharacter={activeCharacter}
              onSwitchCharacter={setActiveCharacter}
              health={5}
              energy={88}
              donuts={14}
              securityLevel="MED"
            />
          </div>
        )}

        {/* Tab 3: Complete Technical Audit (All 9 Sections) */}
        {activeTab === 'audit' && (
          <AuditReportViewer />
        )}

        {/* Tab 4: Side-by-Side Classic vs AAA Comparison */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
              <h2 className="text-base font-bold text-slate-100 mb-1">
                Comparativa de Arquitectura: Classic 8-Bit Flat vs Modern AAA Indie
              </h2>
              <p className="text-slate-400">
                Análisis de por qué el enfoque original genera ambigüedad espacial y cómo las técnicas de nueva generación resuelven la jugabilidad manteniendo los 60 FPS en hardware modesto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Classic 8-Bit */}
              <div className="rounded-xl border border-rose-950/80 bg-rose-950/10 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-900/40">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    [X] ENFOQUE CLÁSICO 1987 / PROTOTIPO PLANO
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    Desorientación Espacial
                  </span>
                </div>

                <div className="h-44 rounded-lg bg-black border border-slate-900 flex items-center justify-center p-4 text-center font-mono text-xs text-slate-500">
                  <div>
                    <div className="w-20 h-20 mx-auto border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      Flat Cube
                    </div>
                    <span>Iluminación plana monocromática sin profundidad Z</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs font-mono text-slate-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span><strong>Ambigüedad en Saltos:</strong> El jugador no sabe si cae en una plataforma o en el vacío inferior.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span><strong>GC Stuttering:</strong> Ordenación mediante <code className="text-rose-300">Array.sort()</code> cada frame destruye la tasa de refresco en CPU 2 núcleos.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span><strong>Pixel Shimmering:</strong> Ángulos arbitrarios fuera de la relación 2:1 producen vibración de píxeles al moverse la cámara.</span>
                  </li>
                </ul>
              </div>

              {/* AAA Retro-Futuristic */}
              <div className="rounded-xl border border-cyan-950/80 bg-cyan-950/10 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    [✓] PIPELINE AAA INDIE (RETRO-FUTURISTA)
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    60 FPS en AMD 3020e
                  </span>
                </div>

                <div className="h-44 rounded-lg bg-slate-950 border border-cyan-950 flex items-center justify-center p-4 text-center font-mono text-xs text-cyan-300 relative overflow-hidden">
                  <div className="absolute inset-0 holo-grid opacity-20" />
                  <div className="relative z-10">
                    <div className="w-24 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-400 border border-white shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center justify-center text-slate-950 font-bold mb-2 rounded-sm">
                      Titanium 3D
                    </div>
                    <span>Facet Shading (1.15x / 0.85x / 0.60x) + Rim Light + Guía Láser Z</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs font-mono text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Proyección Ortogonal a 45°:</strong> Sombra de contacto dinámica y haz láser vertical garantizan precisión milimétrica en saltos.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Zero GC Overhead:</strong> Ordenación mediante QuickSort en <code className="text-cyan-300">Int32Array</code> y partículas en <code className="text-cyan-300">Float32Array</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span><strong>Estética Cinemática:</strong> Paleta White Titanium, Blue Energy y Dark Industrial Structures inspirada en <em>The Ascent</em> y <em>Dead Space</em>.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Head Over Heels 2.0 Technical Art & Visual Engineering Dossier</span>
          <span className="text-cyan-400">Optimizado para AMD 3020e / Radeon Vega 3 / Windows 11</span>
        </div>
      </footer>
    </div>
  );
}
