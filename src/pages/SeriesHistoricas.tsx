import React, { useMemo, useState, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { QUESTIONS } from '../data/mockData';
import { History } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function SeriesHistoricas() {
  const { allData, filters, ciclos, departamentos } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);
  const [localDepartamento, setLocalDepartamento] = useState('Todos');

  // For historical, we ignore the Ciclo filter, but use others
  const filteredData = useMemo(() => {
    return allData.filter(res => {
      // Ignore ciclo filter here
      if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
      if (localDepartamento !== 'Todos' && res.department !== localDepartamento) return false;
      if (filters.genero !== 'Todos' && res.genero !== filters.genero) return false;
      if (filters.tipoPesquisa === 'Anônima' && !res.isAnonymous) return false;
      if (filters.tipoPesquisa === 'Identificada' && res.isAnonymous) return false;
      return true;
    });
  }, [allData, filters, localDepartamento]);

  const sortedCiclos = useMemo(() => [...ciclos].reverse(), [ciclos]);

  const historicalMatrix = useMemo(() => {
    return QUESTIONS.map(q => {
      const row: any = { question: q.text, sparklineData: [] };
      
      sortedCiclos.forEach(ciclo => {
        const cData = filteredData.filter(d => d.yearLabel === ciclo);
        let score = 0;
        if (cData.length > 0) {
          let sum = 0;
          cData.forEach(d => sum += (d.scores[q.id] || 0));
          score = sum / cData.length;
        }
        row[ciclo] = score;
        row.sparklineData.push({ val: score });
      });
      return row;
    });
  }, [filteredData, sortedCiclos]);

  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'bg-slate-800/10 text-slate-600 border-transparent';
    if (score >= 4.2) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 3.4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 delay-300">
      <div className="flex justify-end w-full">
        <ExportButtons captureRef={captureRef} filename="series-historicas" />
      </div>
      <div ref={captureRef} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 overflow-hidden p-1 -m-1">
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-4xl font-serif italic text-white leading-tight flex items-center gap-3">
              Análise Temporal Profunda
              <InfoTooltip text="Acompanhamento evolutivo das métricas ao longo dos ciclos das pesquisas (histórico de anos anteriores). Os dados aqui não respeitam o filtro global de Ciclo." className="ml-1 text-slate-400" />
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Comparativo de pilares e perguntas ao longo dos ciclos aplicáveis aos filtros demográficos atuais</p>
          </div>
          <div className="flex flex-col min-w-[200px] bg-slate-900/60 border border-slate-800 p-3 rounded-xl shadow-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">Filtrar por Departamento</span>
            <select 
              value={localDepartamento}
              onChange={(e) => setLocalDepartamento(e.target.value)}
              className="bg-transparent text-sm font-semibold border-none outline-none focus:ring-0 p-0 text-white appearance-none cursor-pointer"
            >
              <option value="Todos" className="bg-slate-900">Todos os Departamentos</option>
              {departamentos.map(dep => (
                <option key={dep} value={dep} className="bg-slate-900">{dep}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800/50 sticky top-0 z-10 bg-[#0b0f19]">
              <tr>
                <th className="px-6 py-5 font-bold w-[400px]">Item de Avaliação Oficial</th>
                {sortedCiclos.map(c => (
                  <th key={c} className="px-4 py-5 font-bold text-center w-[120px]">{c}</th>
                ))}
                <th className="px-6 py-5 font-bold text-center w-[150px] inline-flex items-center gap-1.5 justify-center">
                  Tendência (Sparkline)
                  <InfoTooltip text="Representação visual gráfica simples da evolução da nota média da pergunta ao longo do eixo temporal dos ciclos presentes." />
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {historicalMatrix.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-slate-300 font-medium line-clamp-2 leading-relaxed" title={row.question}>{row.question}</p>
                  </td>
                  {sortedCiclos.map(c => {
                    const score = row[c];
                    return (
                      <td key={c} className="px-4 py-4">
                        <div className={`flex justify-center items-center h-10 w-16 mx-auto rounded-lg border font-bold text-sm transition-all group-hover:scale-105 ${getHeatmapColor(score)}`}>
                          {score > 0 ? score.toFixed(2) : '-'}
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-6 py-2">
                    <div className="h-10 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={row.sparklineData}>
                          <YAxis domain={[0, 5]} hide />
                          <Line 
                            type="monotone" 
                            dataKey="val" 
                            stroke="#6366f1" 
                            strokeWidth={2} 
                            dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} 
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
