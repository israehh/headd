import React, { useState } from 'react';
import { 
  Shield, Zap, Crosshair, Radar, Radio, Database, 
  ChevronRight, Terminal, AlertOctagon, Disc, Footprints, 
  ArrowUpCircle, BatteryCharging, Orbit
} from 'lucide-react';

interface HolographicHUDProps {
  activeCharacter: 'head' | 'heels' | 'combined';
  onSwitchCharacter: (char: 'head' | 'heels' | 'combined') => void;
  health: number;
  energy: number;
  donuts: number;
  securityLevel: 'LOW' | 'MED' | 'HIGH' | 'MAX';
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({
  activeCharacter,
  onSwitchCharacter,
  health,
  energy,
  donuts,
  securityLevel
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string>('Egyptus');

  const planets = [
    { name: 'Egyptus', crowns: 1, status: 'LIBERADO', color: 'text-cyan-400' },
    { name: 'Penitentiary', crowns: 0, status: 'INFILTRACIÓN', color: 'text-amber-400' },
    { name: 'Safari', crowns: 0, status: 'BLOQUEADO', color: 'text-slate-500' },
    { name: 'Book World', crowns: 0, status: 'BLOQUEADO', color: 'text-slate-500' },
    { name: 'Blacktooth', crowns: 0, status: 'CIUDADELA', color: 'text-rose-500' }
  ];

  return (
    <div className="relative w-full rounded-2xl border border-cyan-900/60 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Background Hologram Grid */}
      <div className="absolute inset-0 holo-grid opacity-20 pointer-events-none" />

      {/* Top Telemetry Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-cyan-900/40">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span className="font-bold tracking-widest uppercase">MU-TH-UR 6000 // TACTICAL HUD</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>SYS.VER:</span>
            <span className="text-cyan-300 font-semibold">2.0.4-TITANIUM</span>
          </div>
        </div>

        {/* Security Alert Level */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">Nivel de Seguridad:</span>
          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-xs font-bold border ${
            securityLevel === 'LOW' 
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
              : securityLevel === 'MED'
              ? 'bg-amber-950/70 border-amber-800 text-amber-300'
              : 'bg-rose-950/70 border-rose-800 text-rose-300 animate-pulse'
          }`}>
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{securityLevel}</span>
          </div>
        </div>
      </div>

      {/* Main HUD Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Character Biometrics & Character Switcher (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Character Selector */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span>Operador Activo</span>
              <span className="text-cyan-400">[Tecla TAB]</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onSwitchCharacter('head')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  activeCharacter === 'head'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ArrowUpCircle className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-xs font-mono font-bold">HEAD</span>
                <span className="text-[9px] font-mono text-slate-400">Planeo / Disparo</span>
              </button>

              <button
                onClick={() => onSwitchCharacter('heels')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  activeCharacter === 'heels'
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Footprints className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-xs font-mono font-bold">HEELS</span>
                <span className="text-[9px] font-mono text-slate-400">Salto / Carga</span>
              </button>

              <button
                onClick={() => onSwitchCharacter('combined')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  activeCharacter === 'combined'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Zap className="w-5 h-5 mb-1 text-purple-400" />
                <span className="text-xs font-mono font-bold">FUSIÓN</span>
                <span className="text-[9px] font-mono text-slate-400">Poder Total</span>
              </button>
            </div>
          </div>

          {/* Biometrics Gauges */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            {/* Health Cells */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Celdas de Escudo Criogénico</span>
                </span>
                <span className="text-cyan-300 font-bold">{health} / 6</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-3 rounded-sm border transition-all duration-300 ${
                      idx < health
                        ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Energy Condenser */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400 flex items-center space-x-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reactor Deuterio (Propulsión)</span>
                </span>
                <span className="text-blue-300 font-bold">{energy}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Donut Hooter Ammo */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-950/70 border border-sky-800 text-sky-400">
                  <Disc className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-200">Hooter Ammo (Donuts)</div>
                  <div className="text-[10px] font-mono text-slate-400">Proyectiles paralizantes de Head</div>
                </div>
              </div>
              <div className="text-lg font-mono font-black text-sky-400">
                {donuts} <span className="text-xs text-slate-500">disp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Tactical Scanner Mini-Radar & Room Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center space-x-1.5">
                <Radar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scanner Táctico Isométrico</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">ACTIVO // 180° SWEEP</span>
            </div>

            {/* Radar Scope */}
            <div className="relative w-44 h-44 rounded-full border-2 border-cyan-900/80 bg-slate-950 flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]">
              {/* Radar Rings */}
              <div className="absolute inset-4 rounded-full border border-cyan-900/40" />
              <div className="absolute inset-10 rounded-full border border-cyan-900/30" />
              <div className="absolute w-full h-[1px] bg-cyan-900/40" />
              <div className="absolute h-full w-[1px] bg-cyan-900/40" />

              {/* Rotating Sweep Beam */}
              <div 
                className="absolute inset-0 origin-center pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.4) 360deg)',
                  animation: 'spin 3s linear infinite'
                }}
              />

              {/* Blips */}
              {/* Active Player */}
              <div className="absolute w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_8px_#00F0FF] z-10" />
              {/* Drone Threat */}
              <div className="absolute top-10 right-12 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <div className="absolute top-10 right-12 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              {/* Teleport Portal */}
              <div className="absolute bottom-9 left-11 w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-200 shadow-[0_0_8px_#c084fc]" />
              {/* Interactive Console */}
              <div className="absolute top-14 left-10 w-2 h-2 rounded-sm bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            </div>

            {/* Radar Legend */}
            <div className="w-full grid grid-cols-3 gap-1 mt-3 text-[10px] font-mono text-center">
              <div className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                ● Operador
              </div>
              <div className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-400">
                ● Dron
              </div>
              <div className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-400">
                ● Portal
              </div>
            </div>
          </div>

          {/* Quick Terminal Telemetry */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>UBICACIÓN:</span>
              <span className="text-cyan-300 font-bold">SECTOR 04 // SALA DEL REACTOR</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>GRAVEDAD LOCAL:</span>
              <span className="text-slate-200 font-bold">0.82 G (ESTABILIZADA)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>RED DE LÁSERES:</span>
              <span className="text-amber-400 font-bold">3 BARRERAS ACTIVAS</span>
            </div>
          </div>
        </div>

        {/* Right Column: Planet Liberation Matrix & Objective Tracker (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center space-x-1.5">
                <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Imperio Blacktooth (Matriz)</span>
              </span>
              <span className="text-cyan-400 text-[10px]">1 / 5 Coronas</span>
            </div>

            <div className="space-y-1.5">
              {planets.map((planet) => (
                <button
                  key={planet.name}
                  onClick={() => setSelectedPlanet(planet.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                    selectedPlanet === planet.name
                      ? 'bg-cyan-950/50 border-cyan-700 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${planet.crowns > 0 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono font-medium">{planet.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold ${planet.color}`}>
                    {planet.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sci-Fi Feed Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-1 text-slate-400 mb-1.5 text-[10px]">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>TERMINAL FEED // TELEMETRÍA</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-900 text-emerald-400 text-[11px] leading-relaxed">
              &gt; HEAD: Planeador de titanio presurizado.<br />
              &gt; HEELS: Exo-resortes calibrados para salto Z+2.<br />
              &gt; ALERTA: Bobina de plasma lista para activación.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
