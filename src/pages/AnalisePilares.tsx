import React, { useState, useMemo, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList, LineChart, Line, CartesianGrid } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

export function AnalisePilares() {
  const { allData, filters, ciclos, departamentos } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);
  const [activePillarId, setActivePillarId] = useState(PILLARS[0].id);
  const [localDepartamento, setLocalDepartamento] = useState('Todos');
  const [localTempoCasa, setLocalTempoCasa] = useState('Todos');

  const temposCasa = useMemo(() => {
    const t = new Set<string>();
    allData.forEach(d => {
      if (d.tempoCasa && d.tempoCasa.trim() !== '' && d.tempoCasa !== '-' && d.tempoCasa !== 'Não informado') {
        t.add(d.tempoCasa);
      }
    });
    return Array.from(t).sort();
  }, [allData]);

  const dataAnonimaEvolucao = useMemo(() => {
    return allData.filter(d => {
      if (!d.isAnonymous) return false;
      if (filters.empresa !== 'Todos' && d.empresa !== filters.empresa) return false;
      if (localDepartamento !== 'Todos' && d.department !== localDepartamento) return false;
      if (localTempoCasa !== 'Todos' && d.tempoCasa !== localTempoCasa) return false;
      return true;
    });
  }, [allData, filters, localDepartamento, localTempoCasa]);

  const activePillar = PILLARS.find(p => p.id === activePillarId)!;
  const pillarQuestions = QUESTIONS.filter(q => q.pillarId === activePillarId);

  // Process counts and percentages
  const processDistribution = (data: any[], qId: string) => {
    let counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    let sum = 0;
    data.forEach(d => {
      const s = d.scores[qId] || 0;
      if (s >= 1 && s <= 5) {
        counts[s.toString() as keyof typeof counts]++;
        sum += s;
      }
    });

    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    return {
      "1 (Nunca/Discordo Totalmente)": total > 0 ? Number(((counts["1"]/total)*100).toFixed(1)) : 0,
      "2 (Raramente)": total > 0 ? Number(((counts["2"]/total)*100).toFixed(1)) : 0,
      "3 (Às Vezes/Neutro)": total > 0 ? Number(((counts["3"]/total)*100).toFixed(1)) : 0,
      "4 (Frequentemente)": total > 0 ? Number(((counts["4"]/total)*100).toFixed(1)) : 0,
      "5 (Sempre/Concordo Totalmente)": total > 0 ? Number(((counts["5"]/total)*100).toFixed(1)) : 0,
      avg: total > 0 ? sum / total : 0,
      total
    };
  };

  const currentScores = useMemo(() => {
    let sum = 0;
    let countQuestions = 0;
    
    // Sort ciclos ascending for the chart evolution
    const ciclosSorted = [...ciclos].sort((a,b) => a.localeCompare(b));
    const cycleAvgs: Record<string, { sum: number, count: number }> = {};
    ciclosSorted.forEach(c => cycleAvgs[c] = { sum: 0, count: 0 });
    
    const questionsOutput = pillarQuestions.map(q => {
      // Historical data by cycle
      const ciclosData = ciclosSorted.map(c => {
        const cFilter = dataAnonimaEvolucao.filter(d => d.yearLabel === c);
        const dist = processDistribution(cFilter, q.id);
        if (dist.total > 0) {
          cycleAvgs[c].sum += dist.avg;
          cycleAvgs[c].count++;
        }
        return { id: `Ciclo ${c} | Média: ${dist.avg.toFixed(1)}`, cycleName: c, ...dist };
      }).filter(d => d.total > 0);

      const currentCycleFilter = filters.ciclo === 'Todos' 
        ? dataAnonimaEvolucao 
        : dataAnonimaEvolucao.filter(d => d.yearLabel === filters.ciclo);
        
      const distGeral = processDistribution(currentCycleFilter, q.id);

      if (distGeral.total > 0) {
        sum += distGeral.avg;
        countQuestions++;
      }

      return { 
        id: q.id, 
        text: q.text, 
        chartData: ciclosData,
        avg: distGeral.avg 
      };
    });

    const historicalOverall = ciclosSorted.map(c => ({
      cycle: c,
      avg: cycleAvgs[c].count > 0 ? cycleAvgs[c].sum / cycleAvgs[c].count : 0
    })).filter(h => h.avg > 0);

    return { 
      overallAvg: countQuestions > 0 ? sum / countQuestions : 0,
      historicalOverall,
      questions: questionsOutput
    };
  }, [dataAnonimaEvolucao, pillarQuestions, ciclos, filters.ciclo]);

  const pillarEvolutionData = useMemo(() => {
    const ciclosSorted = [...ciclos].sort((a,b) => a.localeCompare(b));
    return ciclosSorted.map(c => {
      const cFilter = dataAnonimaEvolucao.filter(d => d.yearLabel === c);
      const row: any = { ciclo: c };
      let globalSum = 0; let globalCount = 0;
      
      PILLARS.forEach(pillar => {
        let pillarSum = 0; let pillarCount = 0;
        const pQuestions = QUESTIONS.filter(q => q.pillarId === pillar.id);
        pQuestions.forEach(q => {
           const dist = processDistribution(cFilter, q.id);
           if (dist.total > 0) { pillarSum += dist.avg; pillarCount++; globalSum += dist.avg; globalCount++; }
        });
        row[pillar.name] = pillarCount > 0 ? Number((pillarSum / pillarCount).toFixed(2)) : null;
      });
      row['Geral'] = globalCount > 0 ? Number((globalSum / globalCount).toFixed(2)) : null;
      return row;
    }).filter(row => row['Geral'] !== null);
  }, [dataAnonimaEvolucao, ciclos]);

  const PILLAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];
  const COLORS_STACK = ['#000000', '#64748b', '#94a3b8', '#ca8a04', '#854d0e']; // Darkened colors for a more serious tone like the image

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const val = payload.value;
    
    if (typeof val === 'string' && val.includes(' | Média: ')) {
      const [name, avgPart] = val.split(' | Média: ');
      const numAvg = parseFloat(avgPart);
      const avgColor = numAvg >= 4 ? '#34d399' : numAvg >= 3 ? '#facc15' : '#fb7185';
      
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={-45} y={0} dy={4} textAnchor="end" fill="#cbd5e1" fontSize={11} fontWeight="bold">
            {name}
          </text>
          <rect x={-40} y={-8} width={36} height={16} fill="#0f172a" rx={4} stroke={avgColor} strokeWidth={1} />
          <text x={-22} y={0} dy={4} textAnchor="middle" fill={avgColor} fontSize={10} fontWeight="bold">
            {avgPart}
          </text>
        </g>
      );
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="end" fill="#cbd5e1" fontSize={11} fontWeight="bold">
          {val}
        </text>
      </g>
    );
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0 || width < 20) return null;
    return (
      <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fontWeight: 'bold' }}>
        {value}%
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
        <div>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Análise de Pilares</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Navegação profunda pelos componentes estruturais do clima corporativo. Resultados em porcentagem.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 min-w-[250px]">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="flex flex-col w-full md:w-auto min-w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex justify-between">
                <span>Departamento</span>
              </span>
              <select
                className="bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors w-full"
                value={localDepartamento}
                onChange={(e) => setLocalDepartamento(e.target.value)}
              >
                <option value="Todos">Global (Todos Departament.)</option>
                {departamentos.map((d, idx) => (
                  <option key={idx} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col w-full md:w-auto min-w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex justify-between">
                <span>Tempo de Casa</span>
              </span>
              <select
                className="bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors w-full"
                value={localTempoCasa}
                onChange={(e) => setLocalTempoCasa(e.target.value)}
              >
                <option value="Todos">Global (Todos Tempos)</option>
                {temposCasa.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 md:mt-0 w-full md:w-auto">
            <ExportButtons captureRef={captureRef} filename="analise-pilares" />
          </div>
        </div>
      </header>

      <div ref={captureRef} className="flex flex-col gap-6 p-1 -m-1">
      
      {/* Evolução dos Pilares (Overview) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:p-8">
        <h3 className="text-xl font-serif italic text-white mb-6">Comparativo de Notas (Evolução Ano a Ano)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pillarEvolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="ciclo" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="Geral" name="Geral" stroke="#f8fafc" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              {PILLARS.map((p, idx) => (
                <Line 
                  key={p.id} 
                  type="monotone" 
                  dataKey={p.name} 
                  name={p.name} 
                  stroke={PILLAR_COLORS[idx % PILLAR_COLORS.length]} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pillar Selector Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-1.5 rounded-2xl w-fit border border-slate-800">
        {PILLARS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePillarId(p.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
              activePillarId === p.id 
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* AI CHO Insight Box */}
      <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-3xl p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ChevronDown size={120} />
        </div>
        <h3 className="text-xl font-serif italic text-indigo-300 mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black not-italic text-xs">AI</span>
          Análise do Especialista CHO (Chief Happiness Officer)
        </h3>
        <p className="text-sm text-indigo-100/80 leading-relaxed max-w-4xl relative z-10">
          <strong>Cenário do Pilar {activePillar.name}:</strong> Observamos que a aderência estrutural deste pilar está com média <strong>{currentScores.overallAvg.toFixed(2)}</strong> para o ciclo selecionado. 
          Analisando os gráficos abaixo, é possível visualizar a evolução histórica ciclo a ciclo. Note como as ações aplicadas impactam na transição de detratores para neutros e promotores ao longo do tempo.
          <br /><br />
          Recomendo verificarmos se houve uma evolução positiva dos promotores (barras verdes) nas perguntas chave abaixo. Se um ciclo regredir, precisaremos montar planos de ação táticos rápidos. É fundamental manter a transparência das entregas!
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Overall Scorecard */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sticky top-28 text-center flex flex-col items-center">
             <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Índice do Pilar</h2>
             <h3 className="text-xl font-bold text-slate-200 mb-6">{activePillar.name}</h3>
             
             <div className="w-40 h-40 rounded-full border-[12px] border-slate-800 flex items-center justify-center relative mb-4">
               {/* Just a decorative circular border representing a gauge visually */}
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="50%" cy="50%" r="48%" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="300" strokeDashoffset={300 - (300 * (currentScores.overallAvg / 5))} className="transition-all duration-1000 ease-out" />
               </svg>
               <span className="text-5xl font-light text-emerald-400">{currentScores.overallAvg.toFixed(1)}</span>
             </div>
             
             <p className="text-xs text-slate-500 font-medium mb-6">Meta Desejada: <span className="text-slate-300">4.5</span></p>

             {/* Historical Overall Scores */}
             <div className="w-full mt-4 border-t border-slate-800/50 pt-4 flex flex-col gap-2">
               <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Histórico por Ciclo</span>
               {currentScores.historicalOverall.map(h => (
                 <div key={h.cycle} className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-medium">{h.cycle}</span>
                   <span className={cn("font-bold", h.avg >= 4 ? "text-emerald-400" : h.avg >= 3 ? "text-yellow-400" : "text-rose-400")}>
                     {h.avg.toFixed(2)}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Stacked Bars for Questions */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          {currentScores.questions.map((q, idx) => {
            // dynamic height based on number of bars (5 bars per group now)
            const height = 80 + q.chartData.length * 90;

            return (
              <div key={q.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-visible">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h4 className="text-sm font-semibold text-slate-200 leading-relaxed uppercase tracking-wider">{idx+1}. {q.text}</h4>
                  <div className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap">Média {q.avg.toFixed(1)}</div>
                </div>

                {/* Stacked Bar Distribution */}
                <div className="w-full" style={{ height: `${80 + q.chartData.length * 50}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={q.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 190, bottom: 0 }} barCategoryGap="20%">
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis type="category" dataKey="id" tick={<CustomYAxisTick />} axisLine={false} tickLine={false} width={180} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                        formatter={(val: number) => [`${val}%`, '']}
                        labelFormatter={(label) => typeof label === 'string' ? label.split(' | ')[0] : label}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '12px' }} 
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingBottom: '10px' }} />
                      <Bar dataKey="1 (Nunca/Discordo Totalmente)" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]}>
                         <LabelList dataKey="1 (Nunca/Discordo Totalmente)" content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="2 (Raramente)" stackId="a" fill="#f97316">
                         <LabelList dataKey="2 (Raramente)" content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="3 (Às Vezes/Neutro)" stackId="a" fill="#0ea5e9">
                         <LabelList dataKey="3 (Às Vezes/Neutro)" content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="4 (Frequentemente)" stackId="a" fill="#8b5cf6">
                         <LabelList dataKey="4 (Frequentemente)" content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="5 (Sempre/Concordo Totalmente)" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]}>
                         <LabelList dataKey="5 (Sempre/Concordo Totalmente)" content={renderCustomLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

