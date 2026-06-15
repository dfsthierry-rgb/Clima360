import React, { useMemo } from 'react';

export function CategorizedSummary({ title, data, onCategoryClick, customKeywordGroups }: { title: string, data: string[], onCategoryClick: (cat: string, items: string[], title: string) => void, customKeywordGroups?: Record<string, string[]> }) {
  const categories = useMemo(() => {
    const keywordGroups = customKeywordGroups || {
      '💼 Salário e Benefícios': ['salário', 'salario', 'pagamento', 'benefício', 'beneficio', 'dinheiro', 'va', 'vale', 'vr', 'remuneração', 'plr', 'plano de saúde', 'plano de saude'],
      '🤝 Ambiente e Equipe': ['ambiente', 'clima', 'equipe', 'colegas', 'amigos', 'amizade', 'pessoas', 'clima bom', 'trabalhar com', 'união', 'uniao', 'companheirismo', 'coleguismo'],
      '🧱 Estrutura e Ferramentas': ['banheiro', 'vestiário', 'calor', 'equipamento', 'cadeira', 'ar condicionado', 'estrutura', 'acervo', 'computador', 'sistema', 'ferramenta', 'limpeza', 'refeitório', 'refeitorio'],
      '👑 Liderança e Gestão': ['gestor', 'líder', 'lider', 'chefe', 'liderança', 'gestão', 'feedback', 'diretoria', 'coordenação', 'gerência', 'gerente', 'comunicação', 'gestores'],
      '📈 Crescimento e Oportunidades': ['carreira', 'promoção', 'crescimento', 'estudo', 'curso', 'treinamento', 'pdi', 'reconhecimento', 'oportunidade', 'aprender', 'desafios', 'desenvolvimento', 'evolução'],
      '⚖️ Flexibilidade e Equilíbrio': ['horário', 'escala', 'flexibilidade', 'folga', 'home office', 'trabalho em casa', 'vida pessoal', 'trabalho híbrido'],
      '🛡️ Segurança e Estabilidade': ['estabilidade', 'segurança', 'sustento', 'manter', 'emprego', 'família', 'necessidade', 'pagamento em dia', 'confiança'],
      '⚙️ Processos e Rotina': ['processos', 'organização', 'tarefas', 'burocracia', 'pressão', 'cobrança', 'sobrecarga', 'demanda', 'fluxo', 'rotina'],
      '📍 Localização e Acesso': ['local', 'localização', 'transporte', 'trânsito', 'ônibus', 'estacionamento', 'acesso', 'perto de casa', 'deslocamento'],
      '💙 Propósito e Pacientes': ['propósito', 'missão', 'valores', 'orgulho', 'ajudar', 'pacientes', 'vidas', 'saúde', 'fazer o bem', 'atendimento', 'clientes']
    };

    const cats: Record<string, string[]> = {};
    let totalValidResponses = 0;
    
    data.forEach(resp => {
      if (!resp || resp === '-' || resp.toLowerCase() === 'não informado' || resp.toLowerCase() === 'sem resposta' || resp.toLowerCase() === 'nada' || resp.toLowerCase() === 'nenhum') return;
      const lower = resp.toLowerCase();
      if (lower.length <= 5 && !lower.includes('bom')) return; // Ignore useless short words

      totalValidResponses++;
      let categorized = false;
      Object.entries(keywordGroups).forEach(([group, words]) => {
        if (words.some(w => lower.includes(w))) {
          if (!cats[group]) cats[group] = [];
          cats[group].push(resp);
          categorized = true;
        }
      });

      if (!categorized) {
        if (!cats['Outros/Não Especificado']) cats['Outros/Não Especificado'] = [];
        cats['Outros/Não Especificado'].push(resp);
      }
    });

    const sortedCats = Object.entries(cats).sort((a, b) => {
      // Keep "Outros" at the bottom
      if (a[0] === 'Outros/Não Especificado') return 1;
      if (b[0] === 'Outros/Não Especificado') return -1;
      return b[1].length - a[1].length;
    });

    return { sortedCats, totalValidResponses };
  }, [data, customKeywordGroups]);

  if (!categories || categories.sortedCats.length === 0) {
    return <div className="text-slate-500 text-sm italic py-4 flex justify-center border-t border-b border-slate-800/50 my-2">Não há dados suficientes ou os comentários não possuem correspondência nas chaves analíticas.</div>;
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {categories.sortedCats.map(([catName, items]) => {
        const percentage = categories.totalValidResponses > 0 ? ((items.length / categories.totalValidResponses) * 100).toFixed(1) : 0;
        return (
          <button 
            key={catName}
            onClick={() => onCategoryClick(catName, items, title)}
            className="flex justify-between items-center text-left bg-slate-900 border border-slate-800 rounded-xl p-3 hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">{catName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{percentage}%</span>
              <div className="bg-slate-800 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                {items.length}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
