import React, { useMemo, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function PerfilLideranca() {
  const { filteredData, departamentos } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);

  // Generate department-based stats
  const deptBlocks = useMemo(() => {
    return departamentos.map(dept => {
      const dataDept = filteredData.filter(d => d.department === dept && d.isAnonymous);
      if (dataDept.length === 0) return null;

      let enpsScoreSum = 0; let enpsScoreCount = 0;
      let q6Sum = 0; let q6Count = 0;
      let q9Sum = 0; let q9Count = 0;
      let q15Sum = 0; let q15Count = 0;
      let q18Sum = 0; let q18Count = 0;

      let q6Dist = {1:0, 2:0, 3:0, 4:0, 5:0};
      let q9Dist = {1:0, 2:0, 3:0, 4:0, 5:0};
      let q15Dist = {1:0, 2:0, 3:0, 4:0, 5:0};
      let q18Dist = {1:0, 2:0, 3:0, 4:0, 5:0};

      dataDept.forEach(d => {
         if (d.scores['q6'] !== undefined) { const s = d.scores['q6']; q6Sum += s; q6Count++; if(s>=1&&s<=5) q6Dist[s as keyof typeof q6Dist]++; }
         if (d.scores['q9'] !== undefined) { const s = d.scores['q9']; q9Sum += s; q9Count++; if(s>=1&&s<=5) q9Dist[s as keyof typeof q9Dist]++; }
         if (d.scores['q15'] !== undefined) { const s = d.scores['q15']; q15Sum += s; q15Count++; if(s>=1&&s<=5) q15Dist[s as keyof typeof q15Dist]++; }
         if (d.scores['q18'] !== undefined) { const s = d.scores['q18']; q18Sum += s; q18Count++; if(s>=1&&s<=5) q18Dist[s as keyof typeof q18Dist]++; }
         if (d.enpsScore !== undefined && !isNaN(d.enpsScore)) {
           enpsScoreSum += d.enpsScore;
           enpsScoreCount++;
         }
      });
      const q6AvgNum = q6Count > 0 ? Number((q6Sum / q6Count).toFixed(2)) : 0;
      const q9AvgNum = q9Count > 0 ? Number((q9Sum / q9Count).toFixed(2)) : 0;
      const q15AvgNum = q15Count > 0 ? Number((q15Sum / q15Count).toFixed(2)) : 0;
      const q18AvgNum = q18Count > 0 ? Number((q18Sum / q18Count).toFixed(2)) : 0;

      const sumAvgs = q6AvgNum + q9AvgNum + q15AvgNum + q18AvgNum;
      const avg = sumAvgs > 0 ? (q6AvgNum * q6AvgNum + q9AvgNum * q9AvgNum + q15AvgNum * q15AvgNum + q18AvgNum * q18AvgNum) / sumAvgs : 0;
      
      const mediaRecomendacao = enpsScoreCount > 0 ? Number((enpsScoreSum / enpsScoreCount).toFixed(1)) : 0;

      return { 
        dept, 
        responses: dataDept.length, 
        avg: Number(avg.toFixed(2)), 
        mediaRecomendacao, 

        q6Avg: q6AvgNum,
        q9Avg: q9AvgNum,
        q15Avg: q15AvgNum,
        q18Avg: q18AvgNum,

        q6Count,
        q9Count,
        q15Count,
        q18Count,

        q6Dist,
        q9Dist,
        q15Dist,
        q18Dist
      };
    }).filter(Boolean);
  }, [filteredData, departamentos]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <header className="flex flex-col md:items-start justify-between gap-4 border-b border-slate-800 pb-6 w-full">
          <div className="flex justify-between w-full">
            <h1 className="text-4xl font-serif italic text-white leading-tight">Perfil de Liderança <span className="text-indigo-400">CHO View</span></h1>
            <ExportButtons captureRef={captureRef} filename="perfil-lideranca" />
          </div>
          <div className="flex flex-col gap-2 relative">
            <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
              Visão avançada do engajamento e percepção da liderança por Departamento, medindo categorias específicas para a equipe (Base Sem Identificação).
            </p>
            <div className="mt-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">Como estas notas são compostas?</h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li><strong className="text-indigo-400">Comunicação:</strong> Média baseada em "Posso fazer qualquer pergunta razoável ao líder de área e obter respostas diretas".</li>
              <li><strong className="text-emerald-400">Reconhecimento:</strong> Média baseada em "O líder de área agradece o bom trabalho e o esforço extra".</li>
              <li><strong className="text-amber-400">Transparência:</strong> Média baseada em "O líder de área me mantêm informado sobre assuntos importantes e sobre mudanças na organização".</li>
              <li><strong className="text-sky-400">Coordenação:</strong> Média baseada em "O líder de área sabe coordenar pessoas e distribuir tarefas adequadamente".</li>
            </ul>
          </div>
        </div>
      </header>
      </div>

      <div ref={captureRef} className="flex flex-col gap-8 p-1 -m-1">
      {deptBlocks.length === 0 && (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <p className="text-slate-400">Nenhum dado de liderança encontrado na planilha sem identificação para os filtros atuais.</p>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deptBlocks.map((block: any, idx: number) => (
           <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/40 transition-colors flex flex-col gap-6 relative group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="text-9xl font-serif">"</div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-200">{block.dept}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{block.responses} {block.responses === 1 ? 'Avaliação' : 'Avaliações'}</p>
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 mb-1">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Média Ponderada</span>
                       <InfoTooltip text="Média final ponderada pelas quantidades e notas obtidas nas categorias (0 a 5)." className="!ml-0" placement="top-right" />
                   </div>
                   <div className={cn(
                      "px-3 py-1 rounded-full text-base font-bold border shadow-lg backdrop-blur-sm",
                      block.avg >= 4 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20" :
                      block.avg >= 3 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-500/20" : 
                      "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20"
                   )}>
                     {block.avg.toFixed(2)} <span className="text-[10px] font-normal opacity-70">/ 5</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800 pb-2">Notas por Categoria (0-5)</span>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between items-start gap-1">
                         <div className="flex justify-between w-full">
                           <span className="text-xs text-slate-400">Comunicação</span>
                           <span className={cn("font-bold text-sm", block.q6Avg >= 4 ? "text-emerald-400" : block.q6Avg >= 3 ? "text-yellow-400" : "text-rose-400")}>{block.q6Avg}</span>
                         </div>
                         <span className="text-[9px] text-slate-500 font-medium">Respostas:</span>
                         <div className="flex flex-col w-full text-[9px] mt-1 pt-1 border-t border-slate-800/50 gap-0.5">
                           <div className="flex justify-between"><span className="text-slate-500">Sempre (5)</span> <span className="text-emerald-400">{block.q6Dist[5]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Maioria das vezes (4)</span> <span className="text-lime-400">{block.q6Dist[4]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Às vezes (3)</span> <span className="text-yellow-400">{block.q6Dist[3]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Algumas vezes (2)</span> <span className="text-orange-400">{block.q6Dist[2]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Nunca (1)</span> <span className="text-rose-400">{block.q6Dist[1]}</span></div>
                         </div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between items-start gap-1">
                         <div className="flex justify-between w-full">
                           <span className="text-xs text-slate-400">Reconhecimento</span>
                           <span className={cn("font-bold text-sm", block.q9Avg >= 4 ? "text-emerald-400" : block.q9Avg >= 3 ? "text-yellow-400" : "text-rose-400")}>{block.q9Avg}</span>
                         </div>
                         <span className="text-[9px] text-slate-500 font-medium">Respostas:</span>
                         <div className="flex flex-col w-full text-[9px] mt-1 pt-1 border-t border-slate-800/50 gap-0.5">
                           <div className="flex justify-between"><span className="text-slate-500">Sempre (5)</span> <span className="text-emerald-400">{block.q9Dist[5]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Maioria das vezes (4)</span> <span className="text-lime-400">{block.q9Dist[4]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Às vezes (3)</span> <span className="text-yellow-400">{block.q9Dist[3]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Algumas vezes (2)</span> <span className="text-orange-400">{block.q9Dist[2]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Nunca (1)</span> <span className="text-rose-400">{block.q9Dist[1]}</span></div>
                         </div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between items-start gap-1">
                         <div className="flex justify-between w-full">
                           <span className="text-xs text-slate-400">Transparência</span>
                           <span className={cn("font-bold text-sm", block.q15Avg >= 4 ? "text-emerald-400" : block.q15Avg >= 3 ? "text-yellow-400" : "text-rose-400")}>{block.q15Avg}</span>
                         </div>
                         <span className="text-[9px] text-slate-500 font-medium">Respostas:</span>
                         <div className="flex flex-col w-full text-[9px] mt-1 pt-1 border-t border-slate-800/50 gap-0.5">
                           <div className="flex justify-between"><span className="text-slate-500">Sempre (5)</span> <span className="text-emerald-400">{block.q15Dist[5]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Maioria das vezes (4)</span> <span className="text-lime-400">{block.q15Dist[4]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Às vezes (3)</span> <span className="text-yellow-400">{block.q15Dist[3]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Algumas vezes (2)</span> <span className="text-orange-400">{block.q15Dist[2]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Nunca (1)</span> <span className="text-rose-400">{block.q15Dist[1]}</span></div>
                         </div>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex flex-col justify-between items-start gap-1">
                         <div className="flex justify-between w-full">
                           <span className="text-xs text-slate-400">Coordenação</span>
                           <span className={cn("font-bold text-sm", block.q18Avg >= 4 ? "text-emerald-400" : block.q18Avg >= 3 ? "text-yellow-400" : "text-rose-400")}>{block.q18Avg}</span>
                         </div>
                         <span className="text-[9px] text-slate-500 font-medium">Respostas:</span>
                         <div className="flex flex-col w-full text-[9px] mt-1 pt-1 border-t border-slate-800/50 gap-0.5">
                           <div className="flex justify-between"><span className="text-slate-500">Sempre (5)</span> <span className="text-emerald-400">{block.q18Dist[5]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Maioria das vezes (4)</span> <span className="text-lime-400">{block.q18Dist[4]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Às vezes (3)</span> <span className="text-yellow-400">{block.q18Dist[3]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Algumas vezes (2)</span> <span className="text-orange-400">{block.q18Dist[2]}</span></div>
                           <div className="flex justify-between"><span className="text-slate-500">Nunca (1)</span> <span className="text-rose-400">{block.q18Dist[1]}</span></div>
                         </div>
                     </div>
                 </div>
              </div>
           </div>
        ))}
      </div>
      </div>
    </div>
  );
}
