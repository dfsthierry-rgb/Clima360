import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function AnaliseComparativa() {
  const { filteredData, empresas, departamentos } = useAppContext();

  const companyRankData = useMemo(() => {
    return empresas.map(empresa => {
      const data = filteredData.filter(d => d.empresa === empresa);
      let score = 0;
      if (data.length > 0) {
        let sum = 0;
        data.forEach(d => Object.values(d.scores).forEach(s => sum += s as number));
        score = sum / (data.length * QUESTIONS.length);
      }
      return { name: empresa, score: Number(score.toFixed(2)) };
    }).sort((a, b) => b.score - a.score);
  }, [filteredData, empresas]);

  const deptRankData = useMemo(() => {
    return departamentos.map(dept => {
      const data = filteredData.filter(d => d.department === dept);
      let score = 0;
      if (data.length > 0) {
        let sum = 0;
        data.forEach(d => Object.values(d.scores).forEach(s => sum += s as number));
        score = sum / (data.length * QUESTIONS.length);
      }
      return { name: dept, score: Number(score.toFixed(2)) };
    }).sort((a, b) => b.score - a.score);
  }, [filteredData, departamentos]);

  const matrixData = useMemo(() => {
    return empresas.map(empresa => {
      const row: any = { empresa };
      const eData = filteredData.filter(d => d.empresa === empresa);
      
      PILLARS.forEach(pillar => {
        const pQuestions = QUESTIONS.filter(q => q.pillarId === pillar.id);
        let score = 0;
        if (eData.length > 0) {
          let sum = 0;
          eData.forEach(d => {
            pQuestions.forEach(q => sum += (d.scores[q.id] || 0));
          });
          score = sum / (eData.length * pQuestions.length);
        }
        row[pillar.id] = score;
      });
      return row;
    });
  }, [filteredData, empresas]);

  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'bg-slate-800/50 text-slate-500';
    if (score >= 4.2) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 3.4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 delay-100">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Ranking por Unidade */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Ranking por Unidade
            <InfoTooltip text="Média geral do clima organizacional segregada por empresa filial, ponderada pelo volume de respostas em cada uma." className="ml-1.5" />
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyRankData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {companyRankData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#10b981' : entry.score >= 3.5 ? '#6366f1' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking por Departamento */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Ranking por Departamento
            <InfoTooltip text="Desdobramento hierárquico da média do ciclo através das diferentes diretorias e departamentos." className="ml-1.5" />
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRankData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={140} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {deptRankData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 4 ? '#10b981' : entry.score >= 3.5 ? '#8b5cf6' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Matriz Térmica Estratégica */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 overflow-hidden">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
          Análise Matricial de Pilares Estratégicos
          <InfoTooltip text="Mapa de calor (Heatmap) cruzando o desempenho de cada pilar temático (Liderança, Cultura, etc.) contra as unidades de negócio." className="ml-1.5" />
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-slate-500 border-b border-slate-800/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Unidade de Negócio</th>
                {PILLARS.map(p => (
                  <th key={p.id} className="px-6 py-4 font-bold text-center whitespace-nowrap">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {matrixData.map((row) => (
                <tr key={row.empresa} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-100">{row.empresa}</td>
                  {PILLARS.map(p => {
                    const score = row[p.id];
                    return (
                      <td key={p.id} className="px-6 py-3">
                        <div className={`flex justify-center items-center h-10 rounded-md border font-bold ${getHeatmapColor(score)}`}>
                          {score > 0 ? score.toFixed(2) : '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
