import React, { useMemo, useState, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, LabelList } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { WordCloud } from '../components/ui/WordCloud';
import { CategorizedSummary } from '../components/ui/CategorizedSummary';
import { X, Lightbulb, Target } from 'lucide-react';

export function PrincipaisNecessidades() {
  const { filteredData } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-slate-400">Nenhum dado encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  const identifiedData = filteredData.filter(d => !d.isAnonymous);
  const anonData = filteredData.filter(d => d.isAnonymous);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
        <header className="mb-4">
          <h1 className="text-4xl font-serif italic text-white mb-2 leading-tight">Principais Necessidades & Direcionadores</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Análise aprofundada das respostas qualitativas e comportamentais cruzadas com dados anônimos estruturais para planos de ação de RH assertivos.
          </p>
        </header>
        <ExportButtons captureRef={captureRef} filename="principais-necessidades" />
      </div>
      
      <div ref={captureRef} className="flex flex-col gap-10 p-1 -m-1">
      {/* Visão Macro - Ambas as Pesquisas */}
      <section className="space-y-6">
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target size={120} />
          </div>
          <h2 className="text-xl font-serif italic text-indigo-300 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">RH</span>
            Diagnóstico Geral de Clima (Visão Macro)
          </h2>
          <p className="text-sm text-indigo-100/80 leading-relaxed max-w-4xl relative z-10">
            Esta área reúne insights fundamentais da cultura organizacional da Central Mesh. Notamos que para construir uma cultura de alta performance sustentável, precisamos investir fortemente nos relatórios identificados para planos sucessórios e nas dores crônicas vindas da base anônima para resolver problemas estruturais. Atenda as necessidades primárias abaixo para impulsionar o índice geral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">De Modo Geral, Gosto de Trabalhar Na Empresa (q29)</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie data={[{name: 'Sim (Promotores)', value: anonData.filter(d => d.scores['q29'] >= 4).length}, {name: 'Não (Detratores)', value: anonData.filter(d => d.scores['q29'] < 3).length}, {name: 'Neutro', value: anonData.filter(d => d.scores['q29'] === 3).length}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({name, value, percent}) => value > 0 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Média de Satisfação com a Gestão Direta (q6, q9, q15)</h2>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie data={[{name: 'Satisfeito', value: anonData.filter(d => ((d.scores['q6'] + d.scores['q9'] + d.scores['q15']) / 3) >= 4).length}, {name: 'Insatisfeito', value: anonData.filter(d => ((d.scores['q6'] + d.scores['q9'] + d.scores['q15']) / 3) < 3).length}, {name: 'Neutro', value: anonData.filter(d => (((d.scores['q6'] + d.scores['q9'] + d.scores['q15']) / 3) >= 3 && ((d.scores['q6'] + d.scores['q9'] + d.scores['q15']) / 3) < 4)).length}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({name, value, percent}) => value > 0 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#64748b" />
                  </Pie>
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Visões Separadas */}
      <div className="w-full h-px bg-slate-800 my-4" />
      
      {identifiedData.length > 0 && <NecessidadesIdentificada data={identifiedData} />}
      
      <div className="w-full h-px bg-slate-800 my-4" />
      
      {anonData.length > 0 && <NecessidadesAnonima data={anonData} />}
      </div>
    </div>
  );
}

function NecessidadesIdentificada({ data }: { data: any[] }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-emerald-400 tracking-tight">Comportamentos Mapeados (Pesquisa Identificada)</h2>
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6">Plano de Sucessão e Interesses: Time Identificado</h2>
        <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg font-semibold w-10">#</th>
                <th className="px-4 py-3 font-semibold">Dados Pessoais - Nome</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Cursos Desejados</th>
                <th className="px-4 py-3 font-semibold">Maior Sonho</th>
                <th className="px-4 py-3 rounded-tr-lg font-semibold">Próximos Passos (Ação RH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 border-t border-slate-800">
              {data.map((d, i) => (
                <tr key={i} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-emerald-400">{d.nomeFuncionario || 'Não Informado'}</td>
                  <td className="px-4 py-3 text-xs">{d.empresa || '-'}</td>
                  <td className="px-4 py-3">{d.cursoDesejado || d.cursoAtual || '-'}</td>
                  <td className="px-4 py-3 italic">{d.maiorSonho || '-'}</td>
                  <td className="px-4 py-3 text-slate-400">{d.proximoPassoSonho || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function NecessidadesAnonima({ data }: { data: any[] }) {
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWordClick = (word: string, items: string[], title: string) => {
    setModalTitle(`${title}: ${word}`);
    setModalItems(items);
    setIsModalOpen(true);
  };

  const motivos = useMemo(() => data.map(d => String(d.motivoPermanencia || '')).filter(Boolean), [data]);
  const lugarBom = useMemo(() => data.map(d => String(d.oQueTornaBomLugar || '')).filter(Boolean), [data]);
  const melhorias = useMemo(() => data.map(d => String(d.oQuePodeMelhorar || '')).filter(Boolean), [data]);
  const ondeQuerEstar5Anos = useMemo(() => data.map(d => String(d.ondeQuerEstar5Anos || '')).filter(Boolean), [data]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-rose-400 tracking-tight">Vozes Retidas & Estruturais (Pesquisa Anônima)</h2>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          <strong className="text-rose-400">Diagnóstico Estrutural IA:</strong> Os comentários abertos foram categorizados através de processamento de palavras-chave. Clique nos temas abaixo para ler as respostas exatas dos colaboradores associadas àquela classificação analítica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-inner ring-1 ring-inset ring-indigo-500/10 h-full">
          <h2 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-6">Ancoragem Positiva (Motivo para Permanecer)</h2>
          <CategorizedSummary 
            title="Ancoragem Positiva"
            data={motivos} 
            onCategoryClick={handleWordClick} 
          />
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-inner ring-1 ring-inset ring-teal-500/10 h-full">
          <h2 className="text-[10px] uppercase tracking-widest text-teal-400 font-bold mb-6">Pontos Fortes Percebidos (Bom Lugar)</h2>
          <CategorizedSummary 
            title="Pontos Fortes Percebidos"
            data={lugarBom} 
            onCategoryClick={handleWordClick} 
            customKeywordGroups={{
              '🤝 Ambiente, Clima e Equipe': ['ambiente', 'clima', 'pessoas', 'equipe', 'colegas', 'amigos', 'família', 'convivência', 'unidos', 'parceria', 'respeito', 'união'],
              '💼 Benefícios e Estabilidade': ['salário', 'benefício', 'beneficio', 'pagamento em dia', 'certinho', 'vr', 'va', 'convênio', 'plano', 'estabilidade', 'segurança'],
              '🏢 Estrutura e Localização': ['estrutura', 'local', 'perto', 'instalações', 'ferramentas', 'limpeza', 'refeitório', 'comida'],
              '👑 Liderança, Flexibilidade e Autonomia': ['liderança', 'gestor', 'patrões', 'chefe', 'aberto', 'feedback', 'flexibilidade', 'horário', 'compreensão', 'liberdade', 'autonomia', 'confiança', 'escuta'],
              '📈 Oportunidades e Aprendizado': ['chance', 'crescimento', 'desenvolvimento', 'oportunidade', 'aprender', 'ensinam', 'treinamento', 'evolução']
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-inner ring-1 ring-inset ring-rose-500/10">
          <h2 className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-6">Dores Crônicas / Pontos de Atrito (Precisa Melhorar)</h2>
          <CategorizedSummary 
              title="Dores Crônicas"
              data={melhorias} 
              onCategoryClick={handleWordClick} 
          />
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-inner ring-1 ring-inset ring-amber-500/10">
          <h2 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-6 text-left">Visão de Futuro (Onde quer estar daqui a 5 anos?)</h2>
          <CategorizedSummary 
            title="5 Anos"
            data={ondeQuerEstar5Anos} 
            onCategoryClick={handleWordClick} 
            customKeywordGroups={{
              '📈 Crescimento e Liderança': ['crescer', 'promoção', 'liderança', 'cargo', 'supervisão', 'coordenação', 'gerência', 'lider', 'líder', 'carreira', 'evolução'],
              '🎓 Formação e Estudo': ['estudar', 'faculdade', 'curso', 'graduação', 'formado', 'especialização', 'mestrado'],
              '🏠 Estabilidade Pessoal': ['casa própria', 'estabilidade', 'aposentado', 'família', 'casado', 'filhos', 'meu cantinho'],
              '🏢 Oportunidades na Empresa': ['aqui', 'na empresa', 'no grupo', 'neste lugar', 'onde estou', 'na mesma empresa'],
              '💰 Retorno Financeiro': ['ganhando bem', 'salário melhor', 'dinheiro', 'financeiro', 'rico', 'bem de vida']
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#080b14] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-medium text-white">{modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
              {modalItems.map((item, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-xl text-slate-300 text-sm leading-relaxed border border-slate-800/50">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
