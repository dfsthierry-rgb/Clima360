import React, { useMemo, useState, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS, SurveyResponse } from '../data/mockData';
import { Activity, BarChart2, Users, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

export function PainelExecutivo() {
  const { filteredData, filters, allData, empresas, ciclos } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);
  const [compareCycle, setCompareCycle] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const demographicStats = useMemo(() => {
    const gendersAnon: Record<string, number> = {};
    const gendersIden: Record<string, number> = {};
    const companies: Record<string, number> = {};
    const departments: Record<string, number> = {};

    filteredData.forEach(res => {
      if (res.isAnonymous) {
        gendersAnon[res.genero] = (gendersAnon[res.genero] || 0) + 1;
        departments[res.department] = (departments[res.department] || 0) + 1;
      } else {
        gendersIden[res.genero] = (gendersIden[res.genero] || 0) + 1;
        companies[res.empresa] = (companies[res.empresa] || 0) + 1;
      }
    });

    const sortDesc = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

    return {
      gendersAnon: sortDesc(gendersAnon),
      gendersIden: sortDesc(gendersIden),
      companies: sortDesc(companies),
      departments: sortDesc(departments)
    }
  }, [filteredData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return { geral: 0, enps: 0, total: 0, anonTotal: 0, idenTotal: 0, prevGeral: 0, prevEnps: 0, hasPrev: false };
    let totalScore = 0; let questionsCount = 0; let promoters = 0; let detractors = 0;
    
    let anonTotal = 0;
    let idenTotal = 0;
    filteredData.forEach(r => {
      Object.values(r.scores).forEach(s => { totalScore += s as number; questionsCount++; });
      if (r.enpsScore >= 9) promoters++;
      else if (r.enpsScore <= 6) detractors++;
      
      if (r.isAnonymous) anonTotal++;
      else idenTotal++;
    });
    
    const geral = questionsCount > 0 ? totalScore / questionsCount : 0;
    const enps = filteredData.length > 0 ? Math.round(((promoters - detractors) / filteredData.length) * 100) : 0;
    
    // Calculate previous cycle
    const currentCycleIdx = ciclos.indexOf(filters.ciclo);
    const prevCycle = ciclos[currentCycleIdx + 1]; // ciclos is descending
    let prevGeralCalc = 0;
    let prevEnpsCalc = 0;
    
    if (prevCycle) {
      const pData = allData.filter(res => {
          if (res.yearLabel !== prevCycle) return false;
          if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
          if (filters.departamento !== 'Todos' && res.department !== filters.departamento) return false;
          if (filters.genero !== 'Todos' && res.genero !== filters.genero) return false;
          if (filters.lider !== 'Todos' && res.leader !== filters.lider) return false;
          if (filters.tipoPesquisa === 'Anônima' && !res.isAnonymous) return false;
          if (filters.tipoPesquisa === 'Identificada' && res.isAnonymous) return false;
          return true;
      });
      let pTotalScore = 0; let pQuestionsCount = 0; let pPromoters = 0; let pDetractors = 0;
      pData.forEach(r => {
        Object.values(r.scores).forEach(s => { pTotalScore += s as number; pQuestionsCount++; });
        if (r.enpsScore >= 9) pPromoters++;
        else if (r.enpsScore <= 6) pDetractors++;
      });
      prevGeralCalc = pQuestionsCount > 0 ? pTotalScore / pQuestionsCount : 0;
      prevEnpsCalc = pData.length > 0 ? Math.round(((pPromoters - pDetractors) / pData.length) * 100) : 0;
    }

    return { 
      geral: geral.toFixed(2), 
      enps, 
      total: filteredData.length, 
      anonTotal,
      idenTotal,
      prevGeral: prevGeralCalc.toFixed(2), 
      prevEnps: prevEnpsCalc,
      hasPrev: !!prevCycle
    };
  }, [filteredData, filters, allData]);

  const radarData = useMemo(() => {
    return PILLARS.map(pillar => {
      const pQs = QUESTIONS.filter(q => q.pillarId === pillar.id);
      
      // Current cycle
      let sumCurrent = 0; let countCurrent = 0;
      filteredData.forEach(d => { pQs.forEach(q => { sumCurrent += d.scores[q.id] || 0; countCurrent++; }); });
      const currentAvg = countCurrent > 0 ? sumCurrent / countCurrent : 0;
      
      // Compare cycle
      let sumCompare = 0; let countCompare = 0;
      if (compareCycle) {
        const compareData = allData.filter(res => {
          if (res.yearLabel !== compareCycle) return false;
          if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
          if (filters.departamento !== 'Todos' && res.department !== filters.departamento) return false;
          if (filters.genero !== 'Todos' && res.genero !== filters.genero) return false;
          if (filters.lider !== 'Todos' && res.leader !== filters.lider) return false;
          if (filters.tipoPesquisa === 'Anônima' && !res.isAnonymous) return false;
          if (filters.tipoPesquisa === 'Identificada' && res.isAnonymous) return false;
          return true;
        });
        compareData.forEach(d => { pQs.forEach(q => { sumCompare += d.scores[q.id] || 0; countCompare++; }); });
      }
      const compareAvg = countCompare > 0 ? sumCompare / countCompare : 0;

      return { 
        subject: pillar.name, 
        current: Number(currentAvg.toFixed(2)), 
        compare: compareCycle ? Number(compareAvg.toFixed(2)) : undefined, 
        fullMark: 5 
      };
    });
  }, [filteredData, allData, compareCycle, filters]);

  const trendData = useMemo(() => {
    return [...ciclos].reverse().map(ciclo => {
      const cData = allData.filter(res => {
          if (res.yearLabel !== ciclo) return false;
          if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
          if (filters.departamento !== 'Todos' && res.department !== filters.departamento) return false;
          if (filters.genero !== 'Todos' && res.genero !== filters.genero) return false;
          if (filters.lider !== 'Todos' && res.leader !== filters.lider) return false;
          if (filters.tipoPesquisa === 'Anônima' && !res.isAnonymous) return false;
          if (filters.tipoPesquisa === 'Identificada' && res.isAnonymous) return false;
          return true;
      });
      let sum = 0, count = 0;
      cData.forEach(d => { Object.values(d.scores).forEach(s => { sum += s as number; count++; }); });
      return { name: ciclo, score: count > 0 ? Number((sum / count).toFixed(2)) : null }
    });
  }, [allData, filters]); // added filters to trend data so line updates with global filters

  const isPositiveGrowth = stats.hasPrev ? parseFloat(stats.geral) - parseFloat(stats.prevGeral) > 0 : false;
  const growthDiff = stats.hasPrev ? (parseFloat(stats.geral) - parseFloat(stats.prevGeral)).toFixed(2) : null;
  const enpsDiff = stats.hasPrev ? stats.enps - stats.prevEnps : null;
  const isEnpsPositive = enpsDiff !== null ? enpsDiff > 0 : false;

  const minCurrent = Math.min(...radarData.map(d => d.current));
  const minCompare = compareCycle ? Math.min(...radarData.filter(d => d.compare !== undefined).map(d => d.compare as number)) : 5;
  const radarDomainMin = Number(Math.max(0, Math.min(minCurrent, minCompare) - 0.2).toFixed(1));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <header>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Relatório Completo de Pesquisa de Clima Grupo Central Mesh</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">Inteligência estratégica consolidada do <span className="text-indigo-400 font-medium">{filters.empresa === 'Todos' ? 'Grupo Central Mesh' : filters.empresa}</span>.</p>
        </header>
        <ExportButtons captureRef={captureRef} filename="painel-executivo" />
      </div>

      <div ref={captureRef} className="flex flex-col gap-6 p-1 -m-1">
      <section className="flex flex-col gap-6">
        
        <div className="relative bg-slate-900/40 rounded-3xl p-8 border border-slate-800 w-full">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Users size={100} /></div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center">Total de Participantes <InfoTooltip text="Quantidade de colaboradores que responderam à pesquisa de acordo com os filtros selecionados" className="ml-1.5" /></p>
              <div className="flex items-baseline gap-8 mt-4">
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Anônima</span>
                   <h2 className="text-4xl font-light tracking-tighter">{stats.anonTotal}</h2>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>Identificada</span>
                   <h2 className="text-4xl font-light tracking-tighter">{stats.idenTotal}</h2>
                 </div>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
            <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
          </div>

          {stats.total > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Por Gênero</p>
                <div className="space-y-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {demographicStats.gendersAnon.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold text-emerald-400">Pesquisa Anônima</p>
                      {demographicStats.gendersAnon.slice(0, 4).map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 truncate pr-2 max-w-[100px]">{name}</span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {demographicStats.gendersIden.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-semibold text-indigo-400">Pesquisa Identificada</p>
                      {demographicStats.gendersIden.slice(0, 4).map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 truncate pr-2 max-w-[100px]">{name}</span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Por Empresa</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {demographicStats.companies.map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 break-words whitespace-normal break-all mr-2">{name}</span>
                      <span className="text-white font-medium shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-2">Por Área de Trabalho</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {demographicStats.departments.map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 break-words whitespace-normal break-all mr-2">{name}</span>
                      <span className="text-white font-medium shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard 
          title="Índice Geral" 
          value={stats.geral} 
          icon={BarChart2} 
          trend={growthDiff} 
          trendGood={isPositiveGrowth} 
          tooltip="Média geral das respostas em uma escala de 1 a 5. O valor de comparativo (ex: -0.07) indica a variação exata da média atual em relação ao ciclo de pesquisa anterior."
          trendSubtext={stats.hasPrev ? "vs Ciclo Anterior" : undefined}
        />
        <KpiCard 
          title="eNPS Score" 
          value={stats.enps} 
          icon={Activity} 
          trend={enpsDiff !== null ? `${enpsDiff}` : null}
          trendGood={isEnpsPositive} 
          isEnps 
          tooltip="O eNPS (Employee Net Promoter Score) varia de -100 a +100 e responde à pergunta: 'Você recomendaria a empresa como um bom lugar para trabalhar?'. É calculado subtraindo a porcentagem de Detratores (notas 0 a 6) da porcentagem de Promotores (notas 9 e 10). Valores negativos indicam que há mais detratores que promotores."
          trendSubtext={stats.hasPrev ? "vs Ciclo Anterior" : undefined}
        />
      </section>

      <section className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">Evolução Histórica do Índice Geral <InfoTooltip text="Média geral das respostas obtidas em todos os ciclos de pesquisa." className="ml-1.5" /></p>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis domain={['dataMin - 0.5', 5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} />
              <Line connectNulls type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ r: 5, fill: '#0f172a', strokeWidth: 2, stroke: '#818cf8' }} activeDot={{ r: 7, fill: '#818cf8', strokeWidth: 0 }} label={{ position: 'top', fill: '#818cf8', fontSize: 10, fontWeight: 600, dy: -10 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center">Performance por Pilar <InfoTooltip text="Radar do clima" className="ml-1.5" /></p>
          
          <div className="relative">
            <button 
              onClick={() => setIsCompareOpen(!isCompareOpen)}
              className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              {compareCycle ? `Comparando: ${compareCycle}` : 'Comparar com...'} <ChevronDown size={14} />
            </button>
            
            {isCompareOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20">
                <div className="flex flex-col">
                  <button onClick={() => { setCompareCycle(null); setIsCompareOpen(false); }} className="text-left px-4 py-2 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-b border-slate-700">
                    Remover Comparação
                  </button>
                  {ciclos.filter(c => c !== filters.ciclo).map(c => (
                    <button key={c} onClick={() => { setCompareCycle(c); setIsCompareOpen(false); }} className="text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-[550px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[1, 5]} tickCount={5} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
              <Radar name={filters.ciclo} dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} label={{ fill: '#10b981', fontSize: 18, fontWeight: 'bold' }} />
              {compareCycle && <Radar name={compareCycle} dataKey="compare" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeDasharray="5 5" strokeWidth={2} label={{ fill: '#f43f5e', fontSize: 16, fontWeight: 'bold' }} />}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, trendGood, isEnps, tooltip, trendSubtext }: any) {
  return (
    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 relative overflow-visible group flex-1 items-start justify-center flex flex-col min-h-[140px]">
      <div className="absolute -right-4 -top-4 text-slate-800/30 group-hover:text-indigo-500/10 transition-colors"><Icon size={100} /></div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center z-10">
        {title} 
        {tooltip && <InfoTooltip text={tooltip} className="ml-1.5" />}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 z-10 w-full">
        <span className={cn("text-5xl font-semibold tracking-tighter", isEnps ? "text-emerald-400" : "text-white")}>{value}</span>
        {trend && (
          <div className="flex flex-col items-start pb-1">
            <span className={cn("text-xs px-2 py-1 rounded font-bold", trendGood ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
              {trendGood ? "+" : ""}{trend}
            </span>
            {trendSubtext && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{trendSubtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
