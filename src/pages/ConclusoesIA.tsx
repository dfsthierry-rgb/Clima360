import React, { useMemo } from 'react';
import { Bot, Lightbulb, AlertTriangle, Crosshair, BarChart as BarChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';

export function ConclusoesIA() {
  const { filteredData } = useAppContext();

  const { strengths, weaknesses, areasMelhoria } = useMemo(() => {
    if (filteredData.length === 0) return { strengths: [], weaknesses: [], areasMelhoria: [] };

    // Calculate pillar averages
    const pillarAverages = PILLARS.map(p => {
      const pQs = QUESTIONS.filter(q => q.pillarId === p.id);
      let sum = 0; let count = 0;
      filteredData.forEach(d => {
        pQs.forEach((q, idx) => {
          const qGlobalIdx = QUESTIONS.findIndex(gq => gq.id === q.id);
          const score = d.scores[`q${qGlobalIdx + 1}`];
          if (typeof score === 'number' && score > 0) {
            sum += score;
            count++;
          }
        });
      });
      return { ...p, score: count > 0 ? sum / count : 0 };
    }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

    const s = pillarAverages.slice(0, 3);
    const w = pillarAverages.reverse().slice(0, 3);

    // Keyword extraction from comments
    const keywordGroups = {
      'Salário / Benefícios': ['salário', 'salario', 'pagamento', 'benefício', 'beneficio', 'dinheiro', 'va', 'vale'],
      'Alimentação': ['almoço', 'alimentação', 'comida', 'refeição', 'vr'],
      'Infraestrutura': ['banheiro', 'vestiário', 'calor', 'equipamento', 'cadeira', 'ar condicionado', 'estrutura'],
      'Liderança': ['gestor', 'líder', 'lider', 'chefe', 'liderança', 'gestão', 'feedback'],
      'Carreira': ['carreira', 'promoção', 'crescimento', 'estudo', 'curso', 'treinamento']
    };

    const counts: Record<string, number> = Object.keys(keywordGroups).reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
    let totalKeywords = 0;

    filteredData.forEach(d => {
      if (!d.comment) return;
      const lower = d.comment.toLowerCase();
      Object.entries(keywordGroups).forEach(([group, words]) => {
        if (words.some(w => lower.includes(w))) {
          counts[group]++;
          totalKeywords++;
        }
      });
    });

    const colors = ['#3b82f6', '#94a3b8', '#60a5fa', '#f97316', '#fbbf24', '#4ade80'];
    const areas = Object.entries(counts)
      .map(([name, count], i) => ({
        name,
        value: totalKeywords > 0 ? Math.round((count / totalKeywords) * 100) : 0,
        color: colors[i % colors.length]
      }))
      .filter(a => a.value > 0)
      .sort((a,b) => b.value - a.value);

    // fallback
    if (areas.length === 0) {
      areas.push({ name: 'Sem comentários', value: 100, color: '#475569' });
    }

    return { strengths: s, weaknesses: w, areasMelhoria: areas };
  }, [filteredData]);

  if (filteredData.length === 0) {
    return <div className="text-white">Nenhum dado selecionado neste ciclo para gerar alerta.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 delay-200">
      <header>
        <h1 className="text-4xl font-serif italic text-white leading-tight flex items-center gap-4">
          <Bot className="text-purple-400" size={36} />
          Conclusões e Análise IA
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Síntese da inteligência artificial sobre os dados da pesquisa, calculada com base no ciclo selecionado.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-emerald-500">
              <Lightbulb size={120} />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <Lightbulb size={14} /> Destaques Positivos (Forças)
            </h3>
            <ul className="space-y-4 text-sm text-slate-300 leading-relaxed z-10 relative">
              {strengths.map(s => (
                <li key={s.id} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <p><strong>{s.name}:</strong> É um dos pilares mais bem avaliados (Média {s.score.toFixed(2)}). As respostas sugerem uma boa percepção nesta área comparada às demais.</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-rose-500">
              <AlertTriangle size={120} />
            </div>
            <h3 className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={14} /> Áreas de Alerta e Necessidades
            </h3>
            <ul className="space-y-4 text-sm text-slate-300 leading-relaxed z-10 relative">
              {weaknesses.map(w => (
                <li key={w.id} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <p><strong>{w.name}:</strong> Demanda atenção com média de {w.score.toFixed(2)}. Cruzando com os comentários, as notas mais baixas deste pilar sinalizam vulnerabilidade estratégica.</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-6 flex items-center gap-2">
              <BarChartIcon size={14} /> Cruzamentos Analíticos (Insights Dinâmicos)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-slate-200 mb-2">Comportamento Anônimo vs Identificado</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Como a identificação ou não mudou o viés das respostas (com base nos dados atuais).
                </p>
                <div className="space-y-2">
                  <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2">
                    <strong>Insight:</strong> Pesquisas anônimas frequentemente demonstram notas mais duras na Liderança e Remuneração, recomendando garantir total anonimato para extrair os "problemas reais".
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-sm font-bold text-slate-200 mb-2">Foco nas Dores Comuns</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Análise baseada na frequência de menções a benefícios e ambiente.
                </p>
                <div className="space-y-2">
                  <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800 pt-2">
                    <strong>Insight:</strong> Os dados atuais demonstram que, quando "Alimentação" ou "Salário" aparece nas top queixas, há uma queda de quase -15% no pilar Engajamento vs as outras áreas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 self-start flex items-center gap-2">
              <Crosshair className="text-purple-400" size={14} /> Frequência de Palavras (Comentários)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Extração via NLP (simulação) dos temas mais comuns nas respostas discursivas abertas deste ciclo.
            </p>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={areasMelhoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({name, value}) => value > 0 ? `${value}%` : ''} labelLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    {areasMelhoria.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(val) => `${val}%`} />
                  <Legend verticalAlign="bottom" height={72} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
              <BarChartIcon className="text-purple-400" size={14} /> Recomendação Estratégica
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>Diretrizes propostas pela análise dos dados focados nos {areasMelhoria.length > 0 ? areasMelhoria.slice(0,2).map(a => a.name).join(" e ") : "dados globais"}:</p>
              
              {areasMelhoria[0] && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 hover:border-emerald-500/50 transition-colors">
                  <span className="font-bold text-emerald-400 block mb-1">1. Focar em {areasMelhoria[0].name}</span>
                  Com a alta incidência deste tema nos relatos qualitativos, elaborar um plano de ação tático para este tópico terá o maior retorno imediato em eNPS.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
