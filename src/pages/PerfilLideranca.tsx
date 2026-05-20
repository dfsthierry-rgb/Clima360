import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function PerfilLideranca() {
  const { filteredData, leaders, departamentos } = useAppContext();
  const [localDept, setLocalDept] = useState<string>('Todos');

  const localFilteredData = useMemo(() => {
    return filteredData.filter(d => {
      if (localDept !== 'Todos' && d.department !== localDept) return false;
      return true;
    });
  }, [filteredData, localDept]);

  // Local filter for department or just show all
  const leaderStats = useMemo(() => {
    return leaders.map(lider => {
      const data = localFilteredData.filter(d => d.leader === lider);
      let scoreSum = 0;
      let qCount = 0;
      let promoters = 0;
      let detractors = 0;

      data.forEach(d => {
        Object.values(d.scores).forEach(s => {
          scoreSum += s as number;
          qCount++;
        });
        if (d.enpsScore >= 9) promoters++;
        else if (d.enpsScore <= 6) detractors++;
      });

      const avg = qCount > 0 ? scoreSum / qCount : 0;
      const enps = data.length > 0 ? Math.round(((promoters - detractors) / data.length) * 100) : 0;

      return {
        name: lider,
        responses: data.length,
        avg: Number(avg.toFixed(2)),
        enps
      };
    }).filter(s => s.responses > 0).sort((a,b) => b.enps - a.enps);
  }, [localFilteredData]);

  // Make copies to sort appropriately
  const avgStats = [...leaderStats].sort((a,b) => b.avg - a.avg);
  const respStats = [...leaderStats].sort((a,b) => b.responses - a.responses);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Perfil de Liderança</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Visão geral do desempenho, engajamento e participação das pessoas colaboradoras divididas por líder.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">Departamento</span>
            <select 
              value={localDept}
              onChange={(e) => setLocalDept(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 outline-none border-none py-1 px-2 cursor-pointer"
            >
              <option value="Todos" className="bg-slate-900">Todos</option>
              {departamentos.map((d: string) => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            eNPS por Líder <InfoTooltip text="Net Promoter Score ordenado do maior para o menor." className="ml-1.5" />
          </h2>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={leaderStats} layout="vertical" margin={{ top: 10, right: 40, left: 60, bottom: 0 }}>
                 <XAxis type="number" domain={[-100, 100]} hide />
                 <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                 <Bar dataKey="enps" radius={[0, 4, 4, 0]}>
                   {
                     leaderStats.map((entry, index) => (
                       <Cell fill={entry.enps >= 0 ? "#10b981" : "#f43f5e"} key={`cell-${index}`} />
                     ))
                   }
                   <LabelList dataKey="enps" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} formatter={(val: number) => val} />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Média Geral por Líder
          </h2>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={avgStats} layout="vertical" margin={{ top: 10, right: 40, left: 60, bottom: 0 }}>
                 <XAxis type="number" domain={[0, 5]} hide />
                 <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                 <Bar dataKey="avg" fill="#818cf8" radius={[0, 4, 4, 0]}>
                   <LabelList dataKey="avg" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} formatter={(val: number) => val} />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Volume de Respostas <InfoTooltip text="Total de respostas obtidas por cada líder" className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={respStats} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                 <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                 <Bar dataKey="responses" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                   <LabelList dataKey="responses" position="top" fill="#94a3b8" fontSize={10} fontWeight={600} />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
