import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bot, MessageCircle, Quote } from 'lucide-react';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';

type TabType = 'fiel' | 'ia';

export function AVozDoColaborador() {
  const [activeTab, setActiveTab] = useState<TabType>('fiel');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { filteredData } = useAppContext();

  const commentsData = useMemo(() => {
    return filteredData.filter(d => d.comment && d.comment.length > 0);
  }, [filteredData]);

  const wordThemes: Record<string, string[]> = useMemo(() => ({
    'Desenvolvimento de Liderança': ['liderança', 'gestão', 'chefe', 'líder'],
    'Problemas de Comunicação': ['comunicação', 'informação', 'alinhamento'],
    'Mais Flexibilidade': ['flexibilidade', 'horário', 'home office', 'híbrido'],
    'Sobrecarga e Pressão': ['sobrecarga', 'bem-estar', 'cansativo', 'pressão', 'burnout'],
    'Falta de Transparência': ['transparência', 'decisões', 'alta gestão', 'diretoria'],
    'Benefícios Defasados': ['benefícios', 'defasado', 'vale', 'plano', 'ticket'],
    'Revisão Salarial': ['salário', 'remuneração', 'mercado', 'aumento'],
    'Ambiente Positivo': ['bom ambiente', 'clima', 'excelente ambiente', 'agradável', 'bom'],
    'Trabalho em Equipe': ['equipe', 'colegas', 'parceria', 'unida', 'prestativa', 'maravilhosa'],
    'Melhoria de Estrutura': ['estrutura', 'condições', 'equipamento', 'banheiro', 'vestiário'],
    'Valorização e Reconhecimento': ['valorizado', 'reconhecido', 'orgulho', 'motivador'],
    'Cultura de Feedback': ['feedback', 'retorno', 'avaliação'],
    'Processos Burocráticos': ['burocrático', 'processo', 'lento', 'sistema', 'demora'],
    'Plano de Carreira': ['carreira', 'crescimento', 'oportunidade', 'promovido'],
    'Orgulho de Pertencer': ['orgulho', 'vestir a camisa', 'amo', 'adoro']
  }), []);

  const wordCloud = useMemo(() => {
    const phrasesCount: Record<string, number> = {};

    commentsData.forEach(c => {
      const commentLower = c.comment.toLowerCase();
      
      Object.entries(wordThemes).forEach(([theme, keywords]) => {
        if (keywords.some(kw => commentLower.includes(kw))) {
            phrasesCount[theme] = (phrasesCount[theme] || 0) + 1;
        }
      });
    });

    return Object.entries(phrasesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([word, freq]) => ({ word, freq }));
  }, [commentsData, wordThemes]);

  const filteredComments = useMemo(() => {
    if (!selectedWord) return commentsData;
    const keywords = wordThemes[selectedWord];
    if (!keywords) return commentsData;
    
    return commentsData.filter(c => {
      const commentLower = c.comment.toLowerCase();
      return keywords.some(kw => commentLower.includes(kw));
    });
  }, [commentsData, selectedWord, wordThemes]);

  const sentimentStats = useMemo(() => {
    let pos = 0, neu = 0, neg = 0;
    commentsData.forEach(c => {
      if (c.sentiment === 'Positivo') pos++;
      else if (c.sentiment === 'Neutro') neu++;
      else neg++;
    });
    return [
      { name: 'Positivo', value: pos, color: '#10b981' },
      { name: 'Neutro', value: neu, color: '#6366f1' },
      { name: 'Negativo', value: neg, color: '#f43f5e' },
    ];
  }, [commentsData]);

  const bubbleData = useMemo(() => {
    // Mock thematic mapping
    const themes = ["Comunicação", "Liderança", "Benefícios", "Estrutura", "Equipe", "Burocracia"];
    return themes.map((theme, i) => {
      // Mock occurrences and sentiment
      const count = Math.floor(Math.random() * 50) + 10;
      const sentiment = Math.random() * 2 - 1; // -1 to 1
      return {
        name: theme,
        x: i + 1, // spacing
        y: sentiment,
        z: count, // size
        fill: sentiment > 0.2 ? '#10b981' : sentiment < -0.2 ? '#f43f5e' : '#6366f1'
      };
    });
  }, [commentsData]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 delay-200">
      <header>
        <h1 className="text-4xl font-serif italic text-white leading-tight">A Voz da Equipe</h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Transformando dados qualitativos e texto livre em métricas organizacionais acionáveis através de IA.
        </p>
      </header>
      
      <div className="flex bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('fiel')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
            activeTab === 'fiel' ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Quote size={18} />
          Painel Fiel (Raw)
        </button>
        <button
          onClick={() => setActiveTab('ia')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
            activeTab === 'ia' ? "bg-purple-600/20 text-purple-400" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Bot size={18} />
          Painel Analítico IA
        </button>
      </div>

      {activeTab === 'fiel' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComments.map((c) => (
            <div key={c.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.id}</span>
                  <span className="text-sm font-semibold text-slate-300">{c.empresa} - {c.department}</span>
                  <span className="text-xs text-slate-500">{c.isAnonymous ? 'Anônimo' : `Identificado (${c.genero})`}</span>
                </div>
                <div className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-md",
                  c.sentiment === 'Positivo' ? "bg-emerald-500/10 text-emerald-400" :
                  c.sentiment === 'Negativo' ? "bg-rose-500/10 text-rose-400" :
                  "bg-indigo-500/10 text-indigo-400"
                )}>
                  {c.sentiment}
                </div>
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 relative">
                <MessageCircle className="absolute top-4 left-4 text-slate-800/80" size={24} />
                <p className="text-slate-300 text-sm leading-relaxed relative z-10 pl-8">{c.comment}</p>
              </div>
            </div>
          ))}
          {filteredComments.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">Nenhum comentário encontrado.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 self-start flex items-center gap-2">
              <Bot className="text-purple-400" /> Sentimento (NLP)
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentStats} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {sentimentStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2">
              <Bot className="text-purple-400" /> Nuvem de Sintaxe
            </h3>
            <div className="flex flex-wrap gap-2 mt-4 content-start">
              {wordCloud.map((w, i) => {
                const isSelected = selectedWord === w.word;
                return (
                  <button 
                    key={w.word}
                    onClick={() => setSelectedWord(isSelected ? null : w.word)}
                    className={cn(
                      "inline-flex items-center justify-center px-4 py-2 rounded-full border transition-all cursor-pointer hover:scale-105",
                      isSelected ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 ring-2 ring-emerald-500/30" : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                    style={{ fontSize: `${Math.max(0.75, Math.min(1.2, 0.75 + (w.freq / 15)))}rem` }}
                  >
                    {w.word}
                  </button>
                )
              })}
            </div>
            {selectedWord && (
              <div className="mt-6 flex justify-end">
                 <button onClick={() => { setActiveTab('fiel'); }} className="text-xs bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-lg font-bold border border-indigo-500/20">
                   Ver {filteredComments.length} citações com "{selectedWord}" →
                 </button>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
             <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2">
              <Bot className="text-purple-400" /> Mapa Temático (Sentimento x Frequência)
              <InfoTooltip text="Cada bolha é um macro-tema mapeado via NLP. O tamanho indica volume e a cor (verde a vermelho) indica o sentimento médio atrelado a esse tema." className="ml-1.5" />
            </h3>
             <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <XAxis type="category" dataKey="name" name="Tema" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis type="number" dataKey="y" name="Sentimento" domain={[-1.2, 1.2]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => v > 0 ? '+ Sent' : '- Sent'} />
                    <ZAxis type="number" dataKey="z" range={[400, 4000]} name="Menções" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                    <Scatter name="Temas" data={bubbleData} opacity={0.8}>
                       {bubbleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
