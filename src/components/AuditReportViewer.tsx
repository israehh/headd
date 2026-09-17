import React, { useState } from 'react';
import { 
  BookOpen, Search, Download, CheckCircle2, ChevronRight, 
  Layers, Zap, Sparkles, Cpu, Layout, Flame, PackageCheck, 
  FileCode2, Milestone, ExternalLink, Copy, Check
} from 'lucide-react';
import { AUDIT_SECTIONS } from '../data/auditData';
import { CodeDiffViewer } from './CodeDiffViewer';

interface AuditReportViewerProps {
  selectedSectionId?: string;
  onSelectSection?: (id: string) => void;
}

export const AuditReportViewer: React.FC<AuditReportViewerProps> = ({
  selectedSectionId: externalSectionId,
  onSelectSection: externalOnSelectSection
}) => {
  const [internalSectionId, setInternalSectionId] = useState<string>('estado-actual');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const activeId = externalSectionId || internalSectionId;
  const setActiveId = externalOnSelectSection || setInternalSectionId;

  const currentSection = AUDIT_SECTIONS.find(s => s.id === activeId) || AUDIT_SECTIONS[0];

  // Map icon strings to Lucide components
  const renderIcon = (name: string, className = 'w-4 h-4') => {
    switch (name) {
      case 'Cpu': return <Cpu className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Layout': return <Layout className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'PackageCheck': return <PackageCheck className={className} />;
      case 'FileCode2': return <FileCode2 className={className} />;
      case 'Milestone': return <Milestone className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const downloadMarkdownReport = () => {
    let mdContent = `# AUDITORÍA TÉCNICA VISUAL Y ARQUITECTURA GRÁFICA: HEAD OVER HEELS 2.0\n`;
    mdContent += `**Lead Technical Artist AAA & Senior Isometric Game Designer**\n`;
    mdContent += `**Hardware Objetivo:** AMD 3020e (2C/2T @ 1.2-2.6GHz, Radeon Vega 3 iGPU, 8GB RAM, Windows 11)\n`;
    mdContent += `**Estilo Visual:** Retro-Futuristic Sci-Fi Isometric (White Titanium, Blue Energy, Dark Industrial Structures)\n\n`;
    mdContent += `---\n\n`;

    AUDIT_SECTIONS.forEach(sec => {
      mdContent += `## #${sec.number}. ${sec.title}\n`;
      mdContent += `*${sec.subtitle}*\n\n`;
      mdContent += `${sec.content}\n\n`;

      if (sec.tables && sec.tables.length > 0) {
        sec.tables.forEach(t => {
          mdContent += `| ${t.headers.join(' | ')} |\n`;
          mdContent += `| ${t.headers.map(() => '---').join(' | ')} |\n`;
          t.rows.forEach(r => {
            mdContent += `| ${r.join(' | ')} |\n`;
          });
          mdContent += `\n`;
        });
      }

      if (sec.codeBlocks && sec.codeBlocks.length > 0) {
        sec.codeBlocks.forEach(cb => {
          mdContent += `### Archivo: \`${cb.file}\`\n`;
          mdContent += `*${cb.description}*\n\n`;
          mdContent += `#### Código Actual:\n\`\`\`typescript\n${cb.currentCode}\n\`\`\`\n\n`;
          mdContent += `#### Código Mejorado:\n\`\`\`typescript\n${cb.improvedCode}\n\`\`\`\n\n`;
          mdContent += `> **Explicación Técnica:** ${cb.technicalExplanation}\n\n`;
        });
      }

      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AUDITORIA_TECNICA_HEAD_OVER_HEELS_2.0.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyFullMarkdown = () => {
    let mdContent = `# AUDITORÍA TÉCNICA VISUAL - HEAD OVER HEELS 2.0\n\n`;
    AUDIT_SECTIONS.forEach(sec => {
      mdContent += `## #${sec.number}. ${sec.title}\n${sec.content}\n\n`;
    });
    navigator.clipboard.writeText(mdContent);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Audit Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-mono font-bold text-slate-100 flex items-center space-x-2">
              <span>DOSSIER TÉCNICO COMPLETO (9 SECCIONES)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-normal">
                AMD 3020e Ready
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Auditoría AAA, fórmulas matemáticas, pipeline de shaders y roadmap de producción.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyFullMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedAll ? 'Copiado' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={downloadMarkdownReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-xs font-mono font-semibold text-cyan-300 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .MD</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Sidebar: 9 Sections List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800/80 bg-slate-950/60 p-3 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider px-2 py-1">
            Índice de Secciones
          </div>

          <div className="space-y-1">
            {AUDIT_SECTIONS.map((section) => {
              const isSelected = section.id === activeId;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/30 border-slate-800/60 text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                      {renderIcon(section.iconName, 'w-4 h-4')}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">
                        #{section.number}. {section.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Section Content (8 cols) */}
        <div className="lg:col-span-8 p-6 overflow-y-auto max-h-[850px] bg-slate-950/90 text-slate-200">
          {/* Section Header */}
          <div className="pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
              {renderIcon(currentSection.iconName, 'w-4 h-4')}
              <span>SECCIÓN 0{currentSection.number} // INFORME TÉCNICO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-mono font-black text-slate-100">
              #{currentSection.number}. {currentSection.title}
            </h1>
            <p className="text-sm font-mono text-slate-400 mt-1">
              {currentSection.subtitle}
            </p>
            <div className="mt-3 p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200/90 leading-relaxed font-sans">
              <strong>Resumen Ejecutivo: </strong>
              {currentSection.summary}
            </div>
          </div>

          {/* Section Body Text & Formatting */}
          <div className="space-y-4 text-sm leading-relaxed text-slate-300">
            {currentSection.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base font-mono font-bold text-cyan-300 pt-3 pb-1 border-b border-slate-800/80">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-sm font-mono font-semibold text-slate-200 pt-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="space-y-1.5 pl-4 list-disc marker:text-cyan-400">
                    {paragraph.split('\n- ').map((item, itemIdx) => (
                      <li key={itemIdx} className="text-xs text-slate-300 leading-relaxed">
                        {item.replace(/^- /, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Render Data Tables if Present */}
          {currentSection.tables && currentSection.tables.map((table, tIdx) => (
            <div key={tIdx} className="my-6 rounded-xl border border-slate-800 overflow-x-auto shadow-lg bg-slate-900/40">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-cyan-400">
                    {table.headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3 font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className={`p-3 text-slate-300 ${cIdx === 0 ? 'font-semibold text-slate-100' : ''}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Render Code Blocks & Code Diffs if Present */}
          {currentSection.codeBlocks && currentSection.codeBlocks.map((cb, cbIdx) => (
            <CodeDiffViewer
              key={cbIdx}
              file={cb.file}
              description={cb.description}
              currentCode={cb.currentCode}
              improvedCode={cb.improvedCode}
              technicalExplanation={cb.technicalExplanation}
            />
          ))}

          {/* Bottom Navigation Buttons between Sections */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800 text-xs font-mono">
            {currentSection.number > 1 ? (
              <button
                onClick={() => setActiveId(AUDIT_SECTIONS[currentSection.number - 2].id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              >
                <span>&larr; Sección #{currentSection.number - 1}</span>
              </button>
            ) : <div />}

            {currentSection.number < AUDIT_SECTIONS.length ? (
              <button
                onClick={() => setActiveId(AUDIT_SECTIONS[currentSection.number].id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold transition-colors"
              >
                <span>Sección #{currentSection.number + 1} &rarr;</span>
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
};
