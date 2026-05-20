import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { cn } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

export function AnalisePilares() {
  const { filteredData, filters, departamentos } = useAppContext();
  const [activePillarId, setActivePillarId] = useState(PILLARS[0].id);

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
    
    // Determine which departments to show
    let validDepts = departamentos;
    // We already filter filteredData by global filters (Empresa etc.)
    // So we just iterate through standard departments and see if they have data.
    
    const questionsOutput = pillarQuestions.map(q => {
      const distGeral = processDistribution(filteredData, q.id);
      
      const deptsData = validDepts.map(dept => {
        const deptFilter = filteredData.filter(d => d.department === dept);
        return { id: dept, ...processDistribution(deptFilter, q.id) };
      }).filter(d => d.total > 0);

      if (distGeral.total > 0) {
        sum += distGeral.avg;
        countQuestions++;
      }

      return { 
        id: q.id, 
        text: q.text, 
        chartData: [{ id: 'GERAL', ...distGeral }, ...deptsData],
        avg: distGeral.avg 
      };
    });
    return { 
      overallAvg: countQuestions > 0 ? sum / countQuestions : 0,
      questions: questionsOutput
    };
  }, [filteredData, pillarQuestions, departamentos]);

  const COLORS_STACK = ['#000000', '#64748b', '#94a3b8', '#ca8a04', '#854d0e']; // Darkened colors for a more serious tone like the image

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
      <header>
        <h1 className="text-4xl font-serif italic text-white leading-tight">Análise de Pilares</h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Navegação profunda pelos componentes estruturais do clima corporativo. Resultados em porcentagem.
        </p>
      </header>

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
             
             <p className="text-xs text-slate-500 font-medium">Meta Desejada: <span className="text-slate-300">4.5</span></p>
          </div>
        </div>

        {/* Stacked Bars for Questions */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          {currentScores.questions.map((q, idx) => {
            // dynamic height based on number of bars
            const height = 60 + q.chartData.length * 30;

            return (
              <div key={q.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-visible">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h4 className="text-sm font-semibold text-slate-200 leading-relaxed uppercase tracking-wider">{idx+1}. {q.text}</h4>
                  <div className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap">Média {q.avg.toFixed(1)}</div>
                </div>

                {/* Stacked Bar Distribution */}
                <div className="w-full" style={{ height: `${height}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={q.chartData} layout="vertical" margin={{ top: 0, right: 0, left: 160, bottom: 0 }} barCategoryGap="20%">
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis type="category" dataKey="id" tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 'bold' }} axisLine={false} tickLine={false} width={150} />
                      <Tooltip 
                        cursor={false} 
                        formatter={(val: number) => [`${val}%`, '']}
                        labelFormatter={(label) => `Grupo: ${label}`}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '12px' }} 
                      />
                      <Legend verticalAlign="top" height={36} iconType="square" wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingBottom: '10px' }} />
                      <Bar dataKey="1 (Nunca/Discordo Totalmente)" stackId="a" fill={COLORS_STACK[0]} radius={0}>
                         <LabelList content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="2 (Raramente)" stackId="a" fill={COLORS_STACK[1]} radius={0}>
                         <LabelList content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="3 (Às Vezes/Neutro)" stackId="a" fill={COLORS_STACK[2]} radius={0}>
                         <LabelList content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="4 (Frequentemente)" stackId="a" fill={COLORS_STACK[3]} radius={0}>
                         <LabelList content={renderCustomLabel} />
                      </Bar>
                      <Bar dataKey="5 (Sempre/Concordo Totalmente)" stackId="a" fill={COLORS_STACK[4]} radius={0}>
                         <LabelList content={renderCustomLabel} />
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
  );
}

