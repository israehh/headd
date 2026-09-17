import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeDiffViewerProps {
  file: string;
  description: string;
  currentCode: string;
  improvedCode: string;
  technicalExplanation: string;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  file,
  description,
  currentCode,
  improvedCode,
  technicalExplanation
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'improved' | 'current'>('comparison');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-semibold text-cyan-300">{file}</span>
          <span className="hidden sm:inline text-xs text-slate-500">|</span>
          <span className="hidden sm:inline text-xs text-slate-400">{description}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab selector */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'comparison' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comparativa
            </button>
            <button
              onClick={() => setActiveTab('improved')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'improved' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Código Optimizado
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'current' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Código Original
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            title="Copiar código optimizado"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4">
        {activeTab === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Code */}
            <div className="rounded-lg border border-rose-950/60 bg-rose-950/10 p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/40 text-xs font-mono font-medium text-rose-400">
                <span>[X] CÓDIGO ACTUAL (Con Cuello de Botella)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                  GC Stutter / Lento
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950/90 rounded border border-slate-900 leading-relaxed max-h-96">
                <code>{currentCode}</code>
              </pre>
            </div>

            {/* Improved Code */}
            <div className="rounded-lg border border-emerald-950/60 bg-emerald-950/10 p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40 text-xs font-mono font-medium text-emerald-400">
                <span>[✓] CÓDIGO MEJORADO (AAA Indie)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                  60 FPS / TypedArray
                </span>
              </div>
              <pre className="text-xs font-mono text-emerald-200 overflow-x-auto p-2 bg-slate-950/90 rounded border border-slate-900 leading-relaxed max-h-96">
                <code>{improvedCode}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'improved' && (
          <div className="rounded-lg border border-emerald-950/60 bg-emerald-950/10 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40 text-xs font-mono text-emerald-400">
              <span>SOLUCIÓN OPTIMIZADA COMPLETA PARA PRODUCCIÓN</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                Listo para copiar
              </span>
            </div>
            <pre className="text-xs font-mono text-emerald-200 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-900 leading-relaxed max-h-[500px]">
              <code>{improvedCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'current' && (
          <div className="rounded-lg border border-rose-950/60 bg-rose-950/10 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/40 text-xs font-mono text-rose-400">
              <span>CÓDIGO ORIGINAL SIN OPTIMIZAR</span>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-3 bg-slate-950 rounded border border-slate-900 leading-relaxed max-h-[500px]">
              <code>{currentCode}</code>
            </pre>
          </div>
        )}

        {/* Technical Explanation Box */}
        <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 flex items-start space-x-3">
          <div className="p-1 rounded bg-cyan-900/40 text-cyan-400 mt-0.5">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300 font-mono">Explicación Técnica: </strong>
            {technicalExplanation}
          </div>
        </div>
      </div>
    </div>
  );
};
