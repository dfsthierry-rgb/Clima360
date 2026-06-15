import React, { useMemo, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { Bot, Lightbulb, AlertTriangle, Crosshair, BarChart as BarChartIcon, Brain, Cpu, Users, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';

const getStrengthText = (name: string) => {
  switch (name) {
    case 'Relacionamento Interpessoal':
      return { 
        text: 'O clima entre as equipes é percebido como muito positivo e colaborativo, propiciando um ambiente de apoio mútuo.',
        action: 'Ação CHO: Promover eventos de integração cross-funcionais para usar as conexões já estabelecidas na criação de times multidisciplinares.'
      };
    case 'Desenvolvimento Profissional':
      return {
        text: 'Os colaboradores valorizam as oportunidades de aprendizado e enxergam claro espaço para crescimento profissional.',
        action: 'Ação CHO: Criar programas de mentoria com talentos internos e dar visibilidade aos recentes casos de promoção e mobilidade.'
      };
    case 'Liderança e Gestão':
      return {
        text: 'A liderança da empresa é vista como acessível, justa e inspiradora pelas equipes.',
        action: 'Ação CHO: Transformar os líderes de destaque em multiplicadores corporativos em fóruns internos de desenvolvimento de gestores.'
      };
    case 'Remuneração e Benefícios':
      return {
        text: 'A percepção do pacote de recompensas mostra que o time se sente valorizado em relação às práticas de mercado.',
        action: 'Ação CHO: Utilizar os benefícios mais valorizados como forte atrativo de Employer Branding na jornada de novos talentos.'
      };
    case 'Ambiente e Estrutura':
      return {
        text: 'Nossa estrutura, recursos de trabalho providos e segurança do ambiente favorecem uma alta qualidade de entrega diária.',
        action: 'Ação CHO: Manter o acompanhamento e feedbacks preventivos para sustentar o padrão ergonômico e ferramentas essenciais.'
      };
    case 'Engajamento e Propósito':
      return {
        text: 'A maior parte da base demonstra um profundo alinhamento corporativo com a missão da empresa e sentem orgulho real do que fazem.',
        action: 'Ação CHO: Transformar defensores chaves em embaixadores da marca (Employee Advocacy) em campanhas no LinkedIn e comunicação.'
      };
    default:
      return {
        text: 'Nossa base demonstra um forte alinhamento corporativo neste pilar. Os colaboradores percebem isso como diferencial.',
        action: 'Ação CHO: Reconhecer as equipes que mantêm resultados excepcionais neste eixo.'
      };
  }
};

const getWeaknessText = (name: string) => {
  switch (name) {
    case 'Relacionamento Interpessoal':
      return {
        text: 'Sinais sistêmicos de silos entre departamentos ou conflitos de comunicação não resolvidos afetando o clima e fluxo de processos.',
        risk: 'Risco Diagnosticado: Clima velado de desconfiança propiciando atrasos generalizados e interrupção na inovação colaborativa.'
      };
    case 'Desenvolvimento Profissional':
      return {
        text: 'Predomina sensação de engessamento e falta de trilhas claras de progressão de carreira dentro da organização.',
        risk: 'Risco Diagnosticado: Fuga iminente de talentos e Key People (high performers) para concorrentes atraídos por melhor plano em 3 a 6 meses.'
      };
    case 'Liderança e Gestão':
      return {
        text: 'O cruzamento dos dados qualitativos aponta sérias rupturas vinculadas a falta de comunicação ou estilo microgerenciador.',
        risk: 'Risco Diagnosticado: Altíssima probabilidade de "Quiet Quitting" e Turnover voluntário de bons profissionais sob estresse direto.'
      };
    case 'Remuneração e Benefícios':
      return {
        text: 'Detrator constante por defasagem percebida na remuneração ou ausência de flexibilidade de benefícios vis-a-vis mercado.',
        risk: 'Risco Diagnosticado: Perda de poder de atração em processos de hunting vitais para a operação, além de desmotivação persistente.'
      };
    case 'Ambiente e Estrutura':
      return {
        text: 'Condições do ambiente, gargalos nos equipamentos ou deficiências na infraestrutura estão limitando a produtividade plena.',
        risk: 'Risco Diagnosticado: Aumento passivo de acidentes, erros sistêmicos por lentidão de recursos e possível impacto em Burnout corporativo.'
      };
    case 'Engajamento e Propósito':
      return {
        text: 'Desconexão letárgica com o sentido e missão da cultura da empresa limitando a geração de novas ideias ou empenho corporativo.',
        risk: 'Risco Diagnosticado: Perda grave de pertencimento, impactando e gerando o efeito contágio do "apenas fazer o mínimo".'
      };
    default:
      return {
        text: 'Este pilar vem atuando como forte detrator e ponto focal de queixas internas segundo nossas análises semânticas.',
        risk: 'Risco Diagnosticado: Alta insatisfação que poderá culminar em demissões caso não seja corrigida brevemente.'
      };
  }
};

export function ConclusoesIA() {
  const { filteredData, filters } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);
  
  const cicloStr = filters.ciclo === 'Todos' ? 'ao longo da série histórica' : `no ciclo ${filters.ciclo}`;

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
      'Infraestrutura / Acervo Médico': ['banheiro', 'vestiário', 'calor', 'equipamento', 'cadeira', 'ar condicionado', 'estrutura', 'acervo'],
      'Liderança e C-Level': ['gestor', 'líder', 'lider', 'chefe', 'liderança', 'gestão', 'feedback', 'diretoria', 'coordenação'],
      'Carreira / PDI': ['carreira', 'promoção', 'crescimento', 'estudo', 'curso', 'treinamento', 'pdi'],
      'Saúde Mental / Bem-estar': ['pressão', 'cansativo', 'stress', 'ansiedade', 'harmonia', 'família']
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
      areas.push({ name: 'Sem comentários suficientes', value: 100, color: '#475569' });
    }

    return { strengths: s, weaknesses: w, areasMelhoria: areas };
  }, [filteredData]);

  if (filteredData.length === 0) {
    return <div className="text-white">Nenhum dado selecionado neste ciclo para gerar o diagnóstico.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 delay-200 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <header>
          <h1 className="text-4xl font-serif italic text-white leading-tight flex items-center gap-4">
            <Brain className="text-indigo-400" size={36} />
            Conclusões e Análise Especialista RH
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Síntese do diagnóstico sobre os dados da pesquisa, calculada com base no ciclo selecionado.
            <br /><span className="text-emerald-400 font-medium mt-1 inline-block">Análise assinada por: Chief Happiness Officer (CHO) da Central Mesh.</span>
          </p>
        </header>
        <ExportButtons captureRef={captureRef} filename="conclusoes-ia" />
      </div>

      <div ref={captureRef} className="flex flex-col gap-6 p-1 -m-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-emerald-500">
            <Lightbulb size={120} />
          </div>
          <h3 className="text-sm uppercase tracking-widest text-emerald-400 font-bold mb-6 flex items-center gap-2">
            <Lightbulb size={16} /> Destaques Positivos (Forças da Cultura)
          </h3>
          <ul className="space-y-6 text-sm text-slate-300 leading-relaxed z-10 relative flex-1">
            {strengths.map((s, i) => {
              const texts = getStrengthText(s.name);
              return (
              <li key={s.id} className="flex items-start gap-4">
                <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">{i+1}</span>
                <p>
                  <strong className="text-emerald-300">{s.name} (Média {s.score.toFixed(2)}):</strong> {texts.text}
                  <br /><span className="text-slate-400 text-xs mt-1 block">{texts.action}</span>
                </p>
              </li>
              );
            })}
            {strengths.length < 3 && (
              <li className="flex items-start gap-4">
                <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">+</span>
                <p>
                  <strong className="text-emerald-300">Orgulho de Pertencer (Dados Qualitativos):</strong> Através da pesquisa anônima, identificou-se que parte majoritária da base sente forte ligação emocional com o produto/serviço hospitalar.
                  <br /><span className="text-slate-400 text-xs mt-1 block">Ação CHO: Reforçar as campanhas de Endomarketing ressaltando o Propósito Corporativo.</span>
                </p>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-rose-500">
            <AlertTriangle size={120} />
          </div>
          <h3 className="text-sm uppercase tracking-widest text-rose-400 font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={16} /> Focos de Atenção e Diagnóstico de Risco
          </h3>
          <ul className="space-y-6 text-sm text-slate-300 leading-relaxed z-10 relative flex-1">
            {weaknesses.map((w, i) => {
              const texts = getWeaknessText(w.name);
              return (
              <li key={w.id} className="flex items-start gap-4">
                <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold shrink-0">{i+1}</span>
                <p>
                  <strong className="text-rose-300">{w.name} (Média {w.score.toFixed(2)}):</strong> {texts.text}
                  <br /><span className="text-slate-400 text-xs mt-1 block">{texts.risk}</span>
                </p>
              </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col items-center mt-6 shadow-inner ring-1 ring-inset ring-indigo-500/10">
        <h3 className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-6 self-start flex items-center gap-2">
          <Crosshair size={14} /> Frequência de Palavras Críticas no Ciclo
        </h3>
        <div className="w-full h-[250px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie data={areasMelhoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({name, value}) => value > 0 ? `${value}%` : ''} labelLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }}>
                {areasMelhoria.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(val) => `${val}%`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recomendações Estratégicas Expandidas embaixo */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 mt-6">
        <h3 className="text-xl font-serif italic text-white mb-8 flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <Target className="text-emerald-400" size={24} /> 
          Recomendações Estratégicas do CHO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weaknesses.map((w, idx) => {
            const getRecommendation = (name: string) => {
              switch (name) {
                case 'Relacionamento Interpessoal':
                  return {
                     short: "Interpessoal", color: "pink",
                     title: "Programa Inter-Elos e Eventos Cross",
                     desc: "Os dados indicam baixo entrosamento e silos de comunicação prejudicando os processos diários.",
                     actions: ["Mapear e intervir nos silos corporativos.", "Promover metas unificadas inter-departamentos.", "Realizar job-rotation curto para gerar empatia."]
                  };
                case 'Desenvolvimento Profissional':
                  return {
                     short: "Carreira", color: "indigo",
                     title: "Programas de Aceleração / PDI",
                     desc: "Foi evidenciado na pesquisa que grande parte almeja crescimento acadêmico e financeiro que não estão bem canalizados no sistema atual.",
                     actions: ["Atrelar planos de carreira às metas dos cursos desejados pela base.", "Transparência na trilha ('Como chegar lá').", "Café de Carreira bimensal com Diretoria."]
                  };
                case 'Liderança e Gestão':
                  return {
                     short: "Liderança", color: "emerald",
                     title: "Re-Onboarding da Liderança",
                     desc: "Os dados de insatisfação cruzados com o nível de escolaridade mostram uma lacuna na comunicação tática e gestão de pessoas.",
                     actions: ["Workshops obrigatórios sobre Escuta Ativa para Coordenadores.", "Ciclos de Feedback de 360 Graus a cada semestre.", "Implementar programa de Mentorias Reversas."]
                  };
                case 'Remuneração e Benefícios':
                  return {
                     short: "Recompensas", color: "amber",
                     title: "Auditoria de Total Rewards",
                     desc: "A pressão atrelada à remuneração base e inflação exige uma reavaliação de pacotes alternativos ou metas.",
                     actions: ["Adoção de cartão de Benefícios Flexíveis.", "Ajuste na visibilidade dos benefícios já oferecidos.", "Gympass / Parcerias de Saúde."]
                  };
                case 'Ambiente e Estrutura':
                  return {
                     short: "Estrutura", color: "rose",
                     title: "Redesenho Submencionado de Espaço Físico",
                     desc: "Falhas higiênicas crônicas na estrutura e equipamentos contaminam a percepção de reconhecimento do indivíduo e retardam operações.",
                     actions: ["Montar comitê de melhoria contínua de zeladoria.", "Revisão imediata dos orçamentos de manutenção predial.", "Atualização preventiva em softwares legados."]
                  };
                case 'Engajamento e Propósito':
                  return {
                     short: "Propósito", color: "sky",
                     title: "Resgate da Identidade Corporativa",
                     desc: "Sinais de fadiga de sentido. A base precisa voltar a identificar o impacto de seu trabalho na nossa entrega final.",
                     actions: ["Endomarketing com depoimentos reais de usuários.", "Abertura dos resultados corporativos mensais.", "Campanha destacando 'heróis anônimos' do último ciclo."]
                  };
                default:
                  return {
                     short: "Cultura", color: "gray",
                     title: "Ações de Fortalecimento",
                     desc: "Atuar nos ofensores diagnosticados para reter talentos e melhorar a estabilidade corporativa.",
                     actions: ["Criar grupos focais de discussão.", "Planejamento Tático com Recursos Humanos."]
                  };
              }
            };
            
            const rec = getRecommendation(w.name);
            return (
              <div key={w.id} className={`bg-[#080b14] p-6 rounded-2xl border border-slate-800 shadow-xl relative group hover:border-${rec.color}-500/30 transition-colors`}>
                <span className={`absolute -top-3 -right-3 bg-${rec.color}-500/20 text-${rec.color}-400 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-${rec.color}-500/30`}>{rec.short}</span>
                <h4 className="text-base font-bold text-slate-200 mb-3">{rec.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {rec.desc}
                </p>
                <div className="mt-auto space-y-2 pt-4 border-t border-slate-800/80">
                  <span className={`block text-${rec.color}-400 font-bold text-xs uppercase mb-1`}>Ações Táticas:</span>
                  <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                    {rec.actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                </div>
              </div>
            );
          })}
          
          <div className="bg-[#080b14] p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-3 border-l-4 border-l-purple-500 mt-2">
             <div className="flex items-center gap-2 mb-3">
               <Cpu className="text-purple-400" size={18} />
               <h4 className="text-base font-bold text-white">Estratégia Definitiva de Segurança Psicológica</h4>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed">
               As análises cruzadas indicam um padrão claro {cicloStr}: problemas pontuais com líderes tendem a surgir de formas assimétricas nas respostas quando comparadas à confiança declarada formalmente. Isso traduz a necessidade contínua de assegurar a **Segurança Psicológica Plena** no período. Se o sentimento em torno deste ciclo não for abordado transparentemente, a cultura do pertencimento (Felicidade Corporativa) precisa trabalhar a perda do medo.
             </p>
             <p className="text-sm text-slate-300 leading-relaxed mt-4">
               <strong>Solução Máxima:</strong> Contratação de serviço de Ouvidoria Externa imparcial ou formalização de um fluxo de garantias pelo RH que protejam de forma indelével a anonimização de queixas estruturais identificadas em pesquisas mistas (aplicável às fragilidades de {cicloStr}).
             </p>
          </div>

        </div>
      </div>

      </div>
    </div>
  );
}
