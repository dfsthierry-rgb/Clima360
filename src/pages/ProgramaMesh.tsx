import React, { useMemo, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { Target, TrendingUp, Heart, BatteryCharging, ShieldCheck, GraduationCap, Users, Zap, Briefcase, Cog } from 'lucide-react';
import { PILLARS, QUESTIONS } from '../data/mockData';

export function ProgramaMesh() {
  const { filters, filteredData } = useAppContext();
  const captureRef = useRef<HTMLDivElement>(null);
  const cicloStr = filters.ciclo === 'Todos' ? 'ao longo da série histórica' : `no ciclo ${filters.ciclo}`;
  const cicloVereditoStr = filters.ciclo === 'Todos' ? 'Avaliando toda a trajetória da empresa' : `Com os dados isolados do ciclo ${filters.ciclo}`;

  const pillarScores = useMemo(() => {
    return PILLARS.map(p => {
      let sum = 0, count = 0;
      filteredData.forEach(d => {
        QUESTIONS.filter(q => q.pillarId === p.id).forEach(q => {
          if (d.scores && d.scores[q.id]) {
            sum += d.scores[q.id];
            count++;
          }
        });
      });
      return { name: p.name, score: count > 0 ? sum / count : 0 };
    });
  }, [filteredData]);

  const sortedPillars = [...pillarScores].sort((a, b) => b.score - a.score);
  const topStrength = sortedPillars[0] || { name: 'Engajamento e Propósito', score: 0 };
  const topWeaknesses = sortedPillars.slice(-3).reverse() || [];

  const getStrengthMotrizText = (name: string) => {
    const prefix = filters.ciclo === 'Todos' ? 'Em todos os ciclos documentados' : `Especialmente neste ciclo (${filters.ciclo})`;
    switch(name) {
      case 'Relacionamento Interpessoal': return `${prefix}, o maior ativo da empresa não é tecnológico, mas humano: a forte Cultura de Relacionamento e Senso de Comunidade. As áreas atuam como células familiares unidas e colaborativas.`;
      case 'Desenvolvimento Profissional': return `${prefix}, destacamos a forte percepção de oportunidade e crescimento. Os colaboradores veem a organização como uma verdadeira escola, valorizando imensamente o espaço de autonomia.`;
      case 'Liderança e Gestão': return `${prefix}, a confiança nos gestores é a nossa grande fortaleza. A base atesta um estilo de liderança que não apenas comanda, mas inspira, orienta e blinda o time sob estresse.`;
      case 'Remuneração e Benefícios': return `${prefix}, os pacotes de recompensa da empresa atuam como principal blindador de talentos. A equipe sente-se valorizada positivamente em relação às ofertas do mercado.`;
      case 'Ambiente e Estrutura': return `${prefix}, a estrutura física e funcional provida é o nosso grande diferencial tangível. O ambiente de trabalho seguro e equipado permite alta performance diária.`;
      case 'Engajamento e Propósito': return `${prefix}, existe um enraizamento profundo da missão. O colaborador sente real orgulho e se identifica com o nosso produto principal, transcendendo o vínculo empregatício comum.`;
      default: return `${prefix}, nossos indicadores mostram resiliência robusta nas dinâmicas interpessoais e de processos.`;
    }
  };

  const getWeaknessDiagnosticText = () => {
    const names = topWeaknesses.map(w => w.name);
    let str = `Forte foco de atenção identificado ${cicloStr} sobre `;
    if (names.includes('Remuneração e Benefícios')) str += `pressão inflacionária percebida na **Remuneração e Benefícios**, requerendo ajuste de rota. `;
    if (names.includes('Liderança e Gestão')) str += `Ruídos severos na jornada diária atrelados a falhas na **Liderança e Gestão** tática. `;
    if (names.includes('Desenvolvimento Profissional')) str += `Sensação crônica de estancamento provocada pela ausência de clareza no **Desenvolvimento Profissional** interno. `;
    if (names.includes('Relacionamento Interpessoal')) str += `Surgimento de atritos severos de **Relacionamento Interpessoal** no campo de atuação corporativa, fragmentando a união departamental. `;
    if (names.includes('Ambiente e Estrutura')) str += `Desconforto sistêmico apontado no **Ambiente e Estrutura** da organização, impactando passivamente a segurança mental da base. `;
    if (names.includes('Engajamento e Propósito')) str += `Ruptura abrupta de identificação no eixo **Engajamento e Propósito**, onde áreas inteiras perdem o senso da centralidade do seu trabalho. `;
    
    return <span>{str.split('**').map((text, i) => i % 2 === 1 ? <strong key={i}>{text}</strong> : text)}</span>;
  };

  const getModuleData = (pillarName: string) => {
    switch(pillarName) {
      case 'Remuneração e Benefícios':
        return {
          icon: <BatteryCharging size={24} />, title: "Reengenharia de Benefícios e Total Rewards",
          desc: "Mudar o modelo mental de 'pagador' para 'provedor de segurança percebida'. O pacote de recompensas deve refletir necessidades demográficas.", colorClass: "text-amber-400 bg-amber-500/10", itemColor: "bg-amber-500",
          items: [
            "Benefícios Flexíveis: Permitir que os colaboradores aloquem pontos entre combustível, alimentação e saúde de forma flexibilizada.",
            "VA/VR Dinâmico: Estudar atrelamentos à inflação local para conter insatisfações na base da pirâmide.",
            "Atenção Integral: Ofertar assistências ampliadas em saúde bucal, mental (terapias) ou financeira corporativa."
          ]
        };
      case 'Desenvolvimento Profissional':
        return {
          icon: <GraduationCap size={24} />, title: "Universidade Corporativa e Planos de Acensão",
          desc: "Curar o complexo de estagnação operacional. É fundamental converter a empresa em um ecossistema de aprendizado visível.", colorClass: "text-indigo-400 bg-indigo-500/10", itemColor: "bg-indigo-500",
          items: [
            "PDIs Auditáveis: Todo talento deverá possuir um Plano Individual de Desenvolvimento com acesso fácil 100% online.",
            "Trilhas de Sucessão: Demarcar claramente o que separa o escopo de uma posição Jr, Pleno e Sênior.",
            "Capacitação On-The-Job: Instituir blocos dedicados para estudo e reciclagem tecnológica em horário operacional aprovado."
          ]
        };
      case 'Liderança e Gestão':
        return {
          icon: <Users size={24} />, title: "Governança Regenerativa e Líderes Mentores",
          desc: "Desarmar modelos de liderança predatórios baseados em comando, substituindo-os pelo perfil de líder apoiador e estrategista.", colorClass: "text-sky-400 bg-sky-500/10", itemColor: "bg-sky-500",
          items: [
            "Protocolo de Feedback Quinzenal: Obrigatoriedade de check-ins 1:1 focados exclusivamente em alinhamento de carreiras e bem-estar.",
            "Termômetro Descendente: Líderes serão avaliados não apenas pela entrega bruta, mas pela sustentabilidade emocional dos times sob seu controle.",
            "Treinamento Anti-Viés: Fóruns contínuos para a média gestão acerca de Comunicação Não-Violenta (CNV)."
          ]
        };
      case 'Ambiente e Estrutura':
        return {
          icon: <Briefcase size={24} />, title: "Comitê Fast-Fix de Ergonomia Logística",
          desc: "Uma estrutura precária é comunicada para o time como desrespeito ou desdém. Elevar o padrão básico do workspace diário.", colorClass: "text-rose-400 bg-rose-500/10", itemColor: "bg-rose-500",
          items: [
            "Micro-Orçamentos de Infraestrutura: Coordenadores com verba simplificada para reparos emergenciais e compra de EPIs adequados.",
            "Design das Pausas (Refeitórios e Copas): Dignidade plena nos intervalos garantindo cadeiras confortáveis, máquinas úteis e climatização adequada.",
            "Atualização Sistêmica: Remover a sobrecarga decorrente de computadores arcaicos e softwares excessivamente defasados que atrasam processos."
          ]
        };
      case 'Relacionamento Interpessoal':
        return {
          icon: <Heart size={24} />, title: "Programa Inter-Elos: Destruindo Silos Organizacionais",
          desc: "Fomentar a solidariedade lateral unindo departamentos em metas cruzadas para combater atritos passivos em comunicação.", colorClass: "text-pink-400 bg-pink-500/10", itemColor: "bg-pink-500",
          items: [
            "Eventos Cross-Funcionais: Integrar equipes historicamente não-relacionadas a desafios de inovação internos com pequenos prêmios.",
            "Canais Oficiais Claros: Padronizar o canal principal de requerimentos evitando pedidos de WhatsApp informais que geram urgências falsas.",
            "Empatia Reversa Corporativa: Job Rotation simulado num dia em que um funcionário acompanha as 'dores' de outro departamento crucial."
          ]
        };
      case 'Engajamento e Propósito':
      default:
        return {
          icon: <Target size={24} />, title: "Campanha 'Nossa Marca, Nossa Missão'",
          desc: "Devolver a percepção mágica da operação diária, conectando as minúcias de trás dos bastidores ao orgulho da entrega na ponta da linha.", colorClass: "text-emerald-400 bg-emerald-500/10", itemColor: "bg-emerald-500",
          items: [
            "Vitrine dos Clientes: Apresentar mensalmente casos de impacto e depoimentos de vida no qual nossa infraestrutura foi essencial.",
            "Endomarketing Comportamental: Celebrar as pessoas em aniversários de companhia focando nas transformações reais que elas ajudaram a construir.",
            "Programa Identidade Mesh: Embaixadores internos recebendo bonificação para propagar orgulho genuíno do ambiente ao seu redor e recrutar semelhantes."
          ]
        };
    }
  };

  const programModules = [
    ...topWeaknesses.map(w => getModuleData(w.name)),
    getModuleData(topStrength.name)
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest w-fit">
            <TrendingUp size={14} /> Solução Expert RH
          </div>
          <h1 className="text-4xl font-serif text-white leading-tight">
            Programa Felicidade Corporativa: <span className="italic text-emerald-400">Mesh 360°</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
            Com base no profundo cruzamento de dados analíticos e de sentimento do ecossistema <strong>{cicloStr}</strong>, o <strong>Chief Happiness Officer (CHO)</strong> arquitetou este programa estruturado. O foco é a transformação cultural propositiva adaptável ao atual diagnóstico detectado.
          </p>
        </header>
        <ExportButtons captureRef={captureRef} filename="programa-mesh" />
      </div>

      <div ref={captureRef} className="flex flex-col gap-8 p-1 -m-1">
      {/* Diagnóstico */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Target size={120} />
        </div>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-indigo-400" /> Diagnóstico Avançado de Baseline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wide">Forças Motrizes (Para Escalar)</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {getStrengthMotrizText(topStrength.name)}
            </p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-rose-300 mb-2 uppercase tracking-wide">Focos de Tensão (Para Mitigação)</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {getWeaknessDiagnosticText()}
            </p>
          </div>
        </div>
      </section>

      {/* Pilares do Programa */}
      <h2 className="text-2xl font-serif text-white mt-4 border-b border-slate-800 pb-4">
        Arquitetura de Soluções Práticas: "Módulos de Correção"
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programModules.map((module, idx) => (
          <div key={idx} className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${module?.colorClass || ''}`}>
              {module?.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-3">{idx + 1}. {module?.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {module?.desc}
            </p>
            <ul className="space-y-3">
              {module?.items.map((item, i) => {
                const sepIndex = item.indexOf(':');
                const title = sepIndex > 0 ? item.substring(0, sepIndex + 1) : '';
                const desc = sepIndex > 0 ? item.substring(sepIndex + 1) : item;
                
                return (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${module.itemColor}`} />
                    <span>{title ? <strong>{title}</strong> : ''} {desc}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Módulo Fixo de Inovação */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors border-l-4 border-l-purple-500 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-purple-400" size={20} />
            <h3 className="text-lg font-bold text-slate-200">Acelerador Cultural: Central Mesh "Innovation Hub"</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Como sugestão matricial {cicloStr}, precisamos gerar gatilhos frequentes de reconhecimento público das ideias e soluções formuladas por quem está diariamente nas operações táticas para mitigar as fraquezas identificadas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-purple-400 font-bold text-xs uppercase mb-1">Shark Tank Interno</span>
              <p className="text-xs text-slate-300">Promover trimestralmente apresentações onde equipes operacionais pleiteiam melhorias nos seus setores com propostas técnicas vinculadas aos orçamentos pré-aprovados da empresa.</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-purple-400 font-bold text-xs uppercase mb-1">Cadeira Executiva Rotativa</span>
              <p className="text-xs text-slate-300">A cada reunião executiva estendida, convocar 1 ou 2 embaixadores de ciclo (pessoas destacadas da operação base) para assistirem à arquitetura de tomadas de decisão.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-900/20 border border-emerald-500/30 rounded-3xl p-8 mt-4">
        <h2 className="text-xl font-serif text-white mb-6 flex items-center justify-center gap-3">
          <Heart className="text-rose-400" size={24} /> O Veredito Acionável
        </h2>
        <p className="text-sm text-slate-200 w-full mb-6 leading-relaxed max-w-4xl mx-auto text-center">
          "{cicloVereditoStr}, a maturidade da organização reflete um ponto de extrema resiliência atrelado primariamente às virtudes sentidas em <strong>{topStrength.name}</strong>. Contudo, para desbloqueamos a excelência humana (World-Class Workplace), urge um ataque intensivo aos principais sangramentos: {topWeaknesses.length > 0 ? <strong>{topWeaknesses.map(w => w.name).join(' e ')}</strong> : 'diversos fatores de tensão transversal'}. Ao equilibrarmos as frentes em risco com as fortalezas vigentes, destravaremos efetivamente as bases sólidas da felicidade corporativa."
        </p>
        <div className="flex gap-4 items-center justify-center border-t border-emerald-500/20 pt-6">
           <div className="flex flex-col text-center">
              <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Impacto Estimado eNPS</span>
              <span className="text-3xl font-bold text-white">{filters.ciclo === 'Todos' ? '+18 pts (Global)' : '+18 pts (Ciclo)'}</span>
           </div>
           <div className="h-10 w-px bg-emerald-500/20"></div>
           <div className="flex flex-col text-center">
              <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Horizonte Cíclico ({filters.ciclo})</span>
              <span className="text-2xl font-bold text-white">4 a 6 meses</span>
           </div>
        </div>
      </div>

      </div>
    </div>
  );
}

