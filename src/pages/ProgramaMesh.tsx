import React from 'react';
import { Target, TrendingUp, Heart, BatteryCharging, ShieldCheck, GraduationCap, Users } from 'lucide-react';

export function ProgramaMesh() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <header className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest w-fit">
          <TrendingUp size={14} /> Solução Expert RH
        </div>
        <h1 className="text-4xl font-serif text-white leading-tight">
          Programa Felicidade Corporativa: <span className="italic text-emerald-400">Mesh 360°</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Com base no cruzamento de dados das pesquisas recentes, propomos um programa estruturado de transformação cultural e organizacional focado nas reais dores e forças da equipe da Central Mesh e suas coligadas.
        </p>
      </header>

      {/* Diagnóstico */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Target size={120} />
        </div>
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Target className="text-indigo-400" /> Diagnóstico Base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-indigo-300 mb-2 uppercase tracking-wide">Forças Motrizes</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              O maior ativo da empresa é a <strong>Cultura de Relacionamento</strong>. Os colaboradores relatam sistematicamente que o motivo de permancência é a "amizade", "parceria", e "as pessoas". A empresa possui um celeiro altamente unido.
            </p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-rose-300 mb-2 uppercase tracking-wide">Focos de Tensão</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Há forte pressão sobre <strong>Remuneração e Benefícios</strong> (especialmente VA defasado em relação à inflação), além da falta de transparência no <strong>Plano de Carreira</strong> e limitações na <strong>Infraestrutura Física</strong> para descanso e refeições.
            </p>
          </div>
        </div>
      </section>

      {/* Pilares do Programa */}
      <h2 className="text-2xl font-serif text-white mt-4 border-b border-slate-800 pb-4">
        Estrutura do Programa: "Mesh 360°"
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pilar 1 */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
            <BatteryCharging size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">1. Remuneração Estratégica & Benefícios</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Revisão profunda no pacote de recompensas visando combater a inflação alimentar.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span><strong>Atualização do VA:</strong> Reajuste atrelado não apenas ao dissídio, mas ao custo da cesta básica local.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span><strong>Wellhub (Gympass):</strong> Implementação de pacote básico para estímulo ao bem-estar e retenção jovem.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span><strong>Bônus Desempenho / Assiduidade:</strong> Criar programa de meritocracia clara e mensal.</span>
            </li>
          </ul>
        </div>

        {/* Pilar 2 */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
            <GraduationCap size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">2. Trilha de Crescimento</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Falta de visibilidade de crescimento gera desmotivação. É preciso mapear carreiras.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Jornada de Cargos e Salários:</strong> Implementar faixas claras (e.g. Operador 1, 2 e 3) para progressão por competência.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Educação Corporativa Compartilhada:</strong> Job Rotation e banco interno de treinamentos em formato de vídeo ou manuais rápidos.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Subsídio de Educação:</strong> Ajuda de custo para técnicos ou superiores alinhados às necessidades da empresa.</span>
            </li>
          </ul>
        </div>

        {/* Pilar 3 */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 text-sky-400">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">3. Liderança e Comunicação 360</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Muitos relatam falha de sincronia e desigualdade de tratamentos. O foco é a equidade.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shrink-0" />
              <span><strong>Programa de Formação de Lideres:</strong> Lideranças técnicas precisam ser formadas na gestão humana e inteligência emocional.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shrink-0" />
              <span><strong>Canal de Boas Ideias:</strong> Ouvir ativamente o chão de fábrica – implementar sugestões exequíveis e dar crédito.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shrink-0" />
              <span><strong>Eliminação de Viés:</strong> Padronização rigorosa nos processos de feedback e isonomia nas normas da empresa para todos.</span>
            </li>
          </ul>
        </div>

        {/* Pilar 4 */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-400">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-3">4. Infraestrutura & Cultura do Bem-estar</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Adequar instalações para refletirem o cuidado que a empresa diz ter com as pessoas.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span><strong>Revitalização de Áreas de Descanso:</strong> Refeitórios mais ventilados, puffs e áreas limpas para descanso, combatendo relatos de más condições.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span><strong>Manutenção Preventiva Transparente:</strong> Resolução de tickets de manutenção de máquinas de forma ágil para proteger a ergonomia e frustração.</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span><strong>Ergonomia Tática:</strong> Melhorar EPIs, cadeiras do setor de vendas/operação e uniformes adequados ao calor.</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-900/20 border border-emerald-500/30 rounded-3xl p-8 mt-4 text-center">
        <h2 className="text-xl font-serif text-white mb-3 flex items-center justify-center gap-2">
          <Heart className="text-rose-400" size={20} /> Conclusão do Consultor de RH
        </h2>
        <p className="text-sm text-slate-300 max-w-4xl mx-auto leading-relaxed">
          A Central Mesh e empresas coligadas possuem colaboradores apaixonados pelo que fazem e extremamente engajados uns com os outros. Para elevar o eNPS, os recursos devem ser focados de imediato no <strong>Programa de Benefícios</strong> (Nutrição e Bem-estar) e na <strong>Comunicação Interna</strong> de um plano de carreira. A estruturação das lideranças para serem "mentoras" e não apenas "chefes" será o marco final da maturidade organizacional focada em performance e felicidade.
        </p>
      </div>

    </div>
  );
}
