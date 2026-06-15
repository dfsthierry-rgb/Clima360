import React, { useMemo, useState, useRef } from 'react';
import { User, Heart, Target, Brain, Activity, Battery, BatteryFull, BatteryMedium, BatteryLow, Zap, AlertTriangle, ShieldCheck, Flame, Droplets, Compass, Clock, MessageSquare, Users, Copy, Check, Image as ImageIcon, Download } from 'lucide-react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { PILLARS, QUESTIONS } from '../data/mockData';

function getArchetypeForDepartment(deptName: string) {
  const name = deptName.toLowerCase();
  if (name.includes('opera') || name.includes('técni') || name.includes('produ') || name.includes('manuten') || name.includes('logíst') || name.includes('quali') || name.includes('veículo') || name.includes('frota')) {
    return { name: 'O Motor Operacional', theme: 'blue', desc: 'Foco na execução, dinamismo e resolução prática de problemas diários.' };
  }
  if (name.includes('admin') || name.includes('finan') || name.includes('fatur') || name.includes('control') || name.includes('conta')) {
    return { name: 'O Guardião Analítico', theme: 'emerald', desc: 'Foco em processos, segurança da informação e estabilidade da operação.' };
  }
  if (name.includes('rh') || name.includes('recursos') || name.includes('pessoas')) {
    return { name: 'O Conector Humano', theme: 'rose', desc: 'Foco na cultura, engajamento e bem-estar das equipes e do ambiente.' };
  }
  if (name.includes('venda') || name.includes('comercial') || name.includes('mkt') || name.includes('market') || name.includes('negócio') || name.includes('trade')) {
    return { name: 'O Impulsionador', theme: 'amber', desc: 'Foco em metas, crescimento externo e relacionamento com o mercado.' };
  }
  if (name.includes('ti') || name.includes('tech') || name.includes('desenvolvim') || name.includes('sistem') || name.includes('inov')) {
    return { name: 'O Inovador Digital', theme: 'purple', desc: 'Foco em evolução tecnológica, agilidade e otimização de rotinas.' };
  }
  if (name.includes('dir') || name.includes('exec') || name.includes('c-level')) {
    return { name: 'O Estrategista', theme: 'indigo', desc: 'Foco no longo prazo, visão de negócio e tomada de decisões.' };
  }
  
  return { name: 'O Integrador Multitarefa', theme: 'slate', desc: 'Atuação versátil, cobrindo múltiplas frentes para garantir a fluidez da empresa.' };
}

function getMostFrequent(arr: string[]): string {
  if (arr.length === 0) return 'Indisponível';
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let maxCount = 0;
  let mostFrequent = '';
  
  for (const [key, count] of Object.entries(counts)) {
    const k = key ? key.trim().toLowerCase() : '';
    if (count > maxCount && k && k !== 'não informado' && k !== '-' && k !== 'sem resposta' && k !== 'sempre') {
      maxCount = count;
      mostFrequent = key;
    }
  }
  
  return mostFrequent || 'Indisponível';
}

function getEnpsDna(eNPS: number) {
  if (eNPS >= 50) return "Um time altamente engajado e dinâmico, guiado por propósitos fortes e ritmo de realizações. Eles valorizam o ambiente em que estão e buscam evolução constante e transparência na entrega. A cultura é vibrante e propensa a inovações.";
  if (eNPS > 10) return "Uma equipe estável e equilibrada, focada em manter o ritmo seguro das entregas. Respondem bem a incentivos claros e processos bem definidos, mas podem se desengajar se a rotina se tornar excessivamente burocrática ou repetitiva.";
  return "Um grupo em momento de cautela, que sinaliza possíveis desgastes operacionais ou desalinhamento com as expectativas. Exigem escuta ativa, clareza na comunicação e ações rápidas da liderança para restaurar o vínculo de confiança.";
}

function getFaixaEtaria(idadeStr: string): string {
  if (!idadeStr) return '';
  const match = idadeStr.match(/\d+/);
  if (!match) return idadeStr;
  const num = parseInt(match[0], 10);
  if (num >= 18 && num <= 24) return "18 a 24 anos";
  if (num >= 25 && num <= 34) return "25 a 34 anos";
  if (num >= 35 && num <= 44) return "35 a 44 anos";
  if (num >= 45 && num <= 54) return "45 a 54 anos";
  if (num >= 55) return "55+ anos";
  return idadeStr;
}

function analyzeThemes(texts: string[]): string[] {
  const groups: Record<string, string[]> = {
    'Reconhecimento & Salário': ['salário', 'salario', 'pagamento', 'benefício', 'beneficio', 'dinheiro', 'va', 'vale', 'vr', 'remuneração', 'reconhecimento', 'plr', 'plano'],
    'Clima & Coleguismo': ['ambiente', 'clima', 'equipe', 'colegas', 'amigos', 'amizade', 'pessoas', 'clima bom', 'união', 'uniao', 'companheirismo'],
    'Estrutura Física & Ferramentas': ['banheiro', 'vestiário', 'calor', 'equipamento', 'cadeira', 'ar condicionado', 'estrutura', 'computador', 'sistema', 'ferramenta', 'limpeza', 'refeitório'],
    'Liderança & Direcionamento': ['gestor', 'líder', 'lider', 'chefe', 'liderança', 'gestão', 'feedback', 'diretoria', 'coordenação', 'gerência', 'comunicação'],
    'Crescimento & Oportunidades': ['carreira', 'promoção', 'crescimento', 'estudo', 'curso', 'treinamento', 'pdi', 'oportunidade', 'desafios', 'desenvolvimento', 'cargo'],
    'Flexibilidade & Equilíbrio': ['horário', 'escala', 'flexibilidade', 'folga', 'home office', 'trabalho em casa', 'vida pessoal', 'híbrido', 'qualidade de vida'],
    'Segurança & Estabilidade': ['estabilidade', 'segurança', 'sustento', 'manter', 'emprego', 'família', 'pagamento em dia', 'confiança'],
    'Burocracia & Sobrecarga': ['processos', 'organização', 'tarefas', 'burocracia', 'pressão', 'cobrança', 'sobrecarga', 'demanda', 'fluxo', 'rotina', 'excesso', 'estresse']
  };

  const counts: Record<string, number> = {};
  
  texts.forEach(text => {
    if (!text || text === '-' || text.toLowerCase() === 'não informado' || text.toLowerCase().length < 4) return;
    const lower = text.toLowerCase();
    
    let matched = false;
    Object.entries(groups).forEach(([group, words]) => {
      if (words.some(w => lower.includes(w))) {
        counts[group] = (counts[group] || 0) + 1;
        matched = true;
      }
    });

    if (!matched && lower.length > 5) {
      const words = lower.split(/[\s,.;]+/);
      const firstWord = words.find(w => w.length > 5 && !['ficar', 'para', 'fazer', 'muito', 'sobre', 'estar', 'porque', 'quando', 'primeiramente', 'primeiro', 'acredito', 'sempre', 'também', 'tambem', 'trocar', 'melhorar', 'algumas', 'alguns', 'muitas', 'certas', 'coisas', 'dentro', 'apenas', 'assim'].includes(w));
      if (firstWord) {
        counts[firstWord] = (counts[firstWord] || 0) + 1;
      }
    }
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
}

function TemperatureBadge({ eNPS }: { eNPS: number }) {
  if (eNPS >= 50) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
      <BatteryFull size={16} /> <span className="text-xs font-bold uppercase tracking-wide">Engajamento Alto (+{eNPS})</span>
    </div>
  );
  if (eNPS > 10) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
      <BatteryMedium size={16} /> <span className="text-xs font-bold uppercase tracking-wide">Engajamento Estável ({eNPS})</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
      <BatteryLow size={16} className="animate-pulse" /> <span className="text-xs font-bold uppercase tracking-wide">Atenção Crítica ({eNPS})</span>
    </div>
  );
}

export function PersonaMesh() {
  const { allData, filters, ciclos, departamentos, setFilters } = useAppContext();
  const [localDepartamento, setLocalDepartamento] = useState('Todos');
  const [isCopied, setIsCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // Filter global data to valid subset
  const areaData = useMemo(() => {
    const filtered = allData.filter(res => {
      if (filters.ciclo !== 'Todos' && res.yearLabel !== filters.ciclo) return false;
      if (filters.empresa !== 'Todos' && res.empresa !== filters.empresa) return false;
      if (localDepartamento !== 'Todos' && res.department !== localDepartamento) return false;
      return true;
    });

    const uniqueMap = new Map();
    const result: any[] = [];
    
    filtered.forEach(d => {
      if (d.isAnonymous) {
        result.push(d);
      } else {
        const key = d.nomeFuncionario ? d.nomeFuncionario.trim().toLowerCase() : d.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, d);
          result.push(d);
        }
      }
    });

    return result;
  }, [allData, filters, localDepartamento]);

  const globalDemographics = useMemo(() => {
    if (areaData.length === 0) return null;
    const generos = areaData.map(d => d.genero).filter(Boolean) as string[];
    const pctFeminino = Math.round((generos.filter(g => g.toLowerCase().includes('fem') || g.toLowerCase() === 'f').length / generos.length) * 100) || 0;
    const pctMasculino = Math.round((generos.filter(g => g.toLowerCase().includes('masc') || g.toLowerCase() === 'm').length / generos.length) * 100) || 0;
    const genPredominante = pctFeminino > pctMasculino ? 'Maioria Feminina' : pctMasculino > pctFeminino ? 'Maioria Masculina' : 'Equilibrado';

    const idadeModal = getMostFrequent(areaData.map(d => getFaixaEtaria(d.idade as string)).filter(Boolean));
    const tempoCasaModal = getMostFrequent(areaData.map(d => d.tempoCasa).filter(t => t && /\d/.test(t)) as string[]);

    // O que cada faixa etária pensa (general feelings based on age group mapping)
    const pensaFaixa = Array.from(new Set(areaData.map(d => getFaixaEtaria(d.idade as string)).filter(Boolean))).slice(0,3).map(faixa => {
      const dFaixa = areaData.filter(d => getFaixaEtaria(d.idade as string) === faixa);
      
      let sumScore = 0;
      let countScore = 0;
      const pillarScores: Record<string, {sum:number, count:number}> = {};
      
      dFaixa.forEach(d => {
        Object.entries(d.scores).forEach(([qId, s]) => {
          sumScore += s as number;
          countScore++;
          const q = QUESTIONS.find(qq => qq.id === qId);
          if (q) {
            if (!pillarScores[q.pillarId]) pillarScores[q.pillarId] = {sum:0, count:0};
            pillarScores[q.pillarId].sum += s as number;
            pillarScores[q.pillarId].count++;
          }
        });
      });
      
      const avgFaixa = countScore > 0 ? sumScore / countScore : 3;
      const sentimentFaixa = avgFaixa >= 4 ? "Positivo" : avgFaixa <= 3.2 ? "Negativo" : "Neutro";
      
      let oQueQuerem = '';
      const texts = dFaixa.map(d => d.oQuePodeMelhorar).filter(Boolean) as string[];
      if (texts.length > 0) {
        oQueQuerem = analyzeThemes(texts)[0];
      }
      if (!oQueQuerem) {
        let lowestPillar = "";
        let minAvg = 999;
        Object.entries(pillarScores).forEach(([pId, val]) => {
          const pAvg = val.sum / val.count;
          if (pAvg < minAvg) { minAvg = pAvg; lowestPillar = pId; }
        });
        const pObj = PILLARS.find(p => p.id === lowestPillar);
        oQueQuerem = pObj ? `Melhorias em ${pObj.name}` : 'Melhorias de processo';
      }
      
      return { faixa: faixa as string, sentiment: sentimentFaixa, focus: oQueQuerem };
    });

    const anonCount = areaData.filter(d => d.isAnonymous).length;
    const idenCount = areaData.filter(d => !d.isAnonymous).length;
    let totalResp = Math.max(anonCount, idenCount);
    if (totalResp === 0) totalResp = areaData.length;

    return {
      totalResp,
      pctFeminino,
      pctMasculino,
      genPredominante,
      idadeModal,
      tempoCasaModal,
      pensaFaixa
    };
  }, [areaData]);

  const personas = useMemo(() => {
    // If a specific department is selected, we only show one persona. Otherwise, we list all departments in the subset.
    const deptsToProcess = localDepartamento !== 'Todos' 
      ? [localDepartamento] 
      : Array.from(new Set(areaData.map(d => d.department).filter(Boolean)));

    const result = deptsToProcess.map(dept => {
      const deptData = areaData.filter(d => d.department === dept);
      if (deptData.length === 0) return null;

      const promotores = deptData.filter(d => d.enpsScore >= 9).length;
      const detratores = deptData.filter(d => d.enpsScore <= 6).length;
      const eNPS = Math.round(((promotores - detratores) / deptData.length) * 100);

      const deptPillarScores: Record<string, {sum:number, count:number}> = {};
      deptData.forEach(d => {
        Object.entries(d.scores).forEach(([qId, s]) => {
          const q = QUESTIONS.find(qq => qq.id === qId);
          if (q) {
            if (!deptPillarScores[q.pillarId]) deptPillarScores[q.pillarId] = {sum:0, count:0};
            deptPillarScores[q.pillarId].sum += s as number;
            deptPillarScores[q.pillarId].count++;
          }
        });
      });
      
      let highestPillar = "";
      let maxAvg = -1;
      let lowestPillar = "";
      let minAvg = 999;
      Object.entries(deptPillarScores).forEach(([pId, val]) => {
        const pAvg = val.sum / val.count;
        if (pAvg > maxAvg) { maxAvg = pAvg; highestPillar = pId; }
        if (pAvg < minAvg) { minAvg = pAvg; lowestPillar = pId; }
      });
      
      const pMaxObj = PILLARS.find(p => p.id === highestPillar);
      const pMinObj = PILLARS.find(p => p.id === lowestPillar);

      let impulsiona = analyzeThemes(deptData.map(d => d.motivoPermanencia).filter(Boolean) as string[]);
      let drena = analyzeThemes(deptData.map(d => d.oQuePodeMelhorar).filter(Boolean) as string[]);
      
      if (impulsiona.length === 0 && pMaxObj) impulsiona = [pMaxObj.name, 'Rotina'];
      if (drena.length === 0 && pMinObj) drena = [pMinObj.name];

      
      const archetype = getArchetypeForDepartment(dept);
      const dnaText = getEnpsDna(eNPS);
      
      return {
        dept,
        count: deptData.length,
        eNPS,
        archetype,
        dnaText,
        impulsiona: impulsiona.length > 0 ? impulsiona : ['Conexão interpessoal', 'Rotina estabelecida'],
        drena: drena.length > 0 ? drena : ['Sobrecarga pontual', 'Desalinhamento de processos'],
        prioridade: eNPS >= 50 
          ? 'Manter o ritmo de reconhecimento e proporcionar novos desafios de carreira.'
          : eNPS > 10 
            ? 'Aumentar a clareza nas metas, simplificar processos e reforçar feedbacks positivos.'
            : 'Escuta ativa urgente, revisão de carga de trabalho e presença mais forte da liderança imediata.'
      };
    }).filter(Boolean);

    return result.sort((a, b) => b!.count - a!.count);
  }, [areaData, localDepartamento]);

  const handleCopy = async () => {
    let text = `ANÁLISE DE PERSONAS POR ÁREA\n`;
    text += `Filtros: Ciclo: ${filters.ciclo} | Empresa: ${filters.empresa} | Departamento: ${localDepartamento}\n`;
    text += `=========================================\n\n`;

    if (globalDemographics) {
      text += `PERFIL DEMOGRÁFICO GERAL (${globalDemographics.totalResp} respondentes)\n`;
      text += `- Mais Comum (Idade): ${globalDemographics.idadeModal}\n`;
      text += `- Mais Comum (Tempo de Casa): ${globalDemographics.tempoCasaModal}\n`;
      text += `- Maioria (Gênero): ${globalDemographics.genPredominante} (${globalDemographics.pctFeminino}% F, ${globalDemographics.pctMasculino}% M)\n\n`;
      text += `PRINCIPAIS FOCOS POR GERAÇÃO:\n`;
      globalDemographics.pensaFaixa.forEach(fx => {
        text += `> ${fx.faixa} | Sentimento: ${fx.sentiment} | Buscam: ${fx.focus}\n`;
      });
      text += `\n=========================================\n\n`;
    }

    if (personas && personas.length > 0) {
      personas.forEach(p => {
        if (!p) return;
        text += `${p.dept.toUpperCase()} (${p.count} respondentes) | eNPS: ${p.eNPS}\n`;
        text += `Arquétipo: ${p.archetype.name}\n`;
        text += `DNA da Área: ${p.dnaText}\n`;
        text += `O que Impulsiona: ${p.impulsiona.join(', ')}\n`;
        text += `O que Drena: ${p.drena.join(', ')}\n`;
        text += `Ação Sugerida (Liderança): ${p.prioridade}\n\n`;
      });
    } else {
      text += `Nenhum dado de persona disponível para os filtros selecionados.\n`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const themesColors: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400 ring-blue-500/20',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 ring-emerald-500/20',
    rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400 ring-rose-500/20',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400 ring-amber-500/20',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400 ring-purple-500/20',
    indigo: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400 ring-indigo-500/20',
    slate: 'border-slate-500/30 bg-slate-500/5 text-slate-400 ring-slate-500/20',
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Persona por Área</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl">
            Uma visão executiva para traduzir dados de comportamento em perfis claros, permitindo 
            que a liderança entenda rapidamente o DNA, os desafios e o que motiva cada departamento.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 min-w-[250px]">
          <div className="flex flex-col w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex justify-between">
              <span>Departamento</span>
            </span>
            <select
              className="bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors w-full"
              value={localDepartamento}
              onChange={(e) => setLocalDepartamento(e.target.value)}
            >
              <option value="Todos">Global (Todos Departament.)</option>
              {departamentos.map((d, idx) => (
                <option key={idx} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <ExportButtons 
            captureRef={captureRef} 
            filename={`personas-${localDepartamento}`}
            onCopyText={handleCopy}
            isCopiedText={isCopied}
          />
        </div>
      </header>

      <div ref={captureRef} className="flex flex-col gap-6 p-1 -m-1">

      {globalDemographics && (
        <div className="bg-[#0f1423] border border-slate-700/50 rounded-2xl p-6 shadow-lg mb-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between">
            
            <div className="flex-1">
              <h4 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-6 flex items-center gap-2">
                <Users size={16} /> Perfil Demográfico Geral ({globalDemographics.totalResp} respondentes)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-[11px] text-slate-500 uppercase font-bold mb-1">Mais Comum (Idade)</span>
                  <span className="text-lg text-white font-semibold flex items-center gap-2"><Clock size={16} className="text-indigo-400" /> {globalDemographics.idadeModal}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 uppercase font-bold mb-1">Mais Comum (Tempo)</span>
                  <span className="text-lg text-white font-semibold flex items-center gap-2"><Clock size={16} className="text-emerald-400" /> {globalDemographics.tempoCasaModal}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 uppercase font-bold mb-1">Maioria (Gênero)</span>
                  <span className="text-lg text-white font-semibold">{globalDemographics.genPredominante}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">{globalDemographics.pctFeminino}% <span className="text-[10px] text-rose-400/70 border-l border-rose-500/30 pl-2 ml-1">F</span></div>
                  <div className="text-sm font-bold text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">{globalDemographics.pctMasculino}% <span className="text-[10px] text-blue-400/70 border-l border-blue-500/30 pl-2 ml-1">M</span></div>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-[45%] bg-slate-900/60 p-5 rounded-xl border border-slate-700/50">
              <span className="block text-[11px] text-slate-500 uppercase font-bold mb-4 flex items-center gap-2">Principais Focos por Geração</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {globalDemographics.pensaFaixa.map((fx, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50">
                    <span className="block text-xs font-bold text-slate-200 mb-2">{fx.faixa}</span>
                    <p className="text-[11px] text-slate-400 mb-1 leading-tight"><span className="text-indigo-400 font-medium">Sentimento:</span> {fx.sentiment}</p>
                    <p className="text-[11px] text-slate-400 leading-tight"><span className="text-emerald-400 font-medium">Buscam:</span> <span className="capitalize">{fx.focus}</span></p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {personas.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
          Dados insuficientes para gerar a Persona na área e filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {personas.map((p, idx) => {
            if (!p) return null;
            const themeClass = themesColors[p.archetype.theme] || themesColors.slate;
            
            return (
              <div key={idx} className={`bg-[#0f1423] rounded-2xl p-6 md:p-8 relative overflow-hidden ring-1 shadow-2xl transition-all ${themeClass.replace('bg-', 'hover:bg-opacity-10 ')}`}>
                 <div className={`absolute top-0 right-0 p-32 rounded-full blur-[100px] pointer-events-none opacity-20 bg-${p.archetype.theme}-500`}></div>
                 
                 <div className="relative z-10 flex flex-col xl:flex-row gap-8">
                   
                   {/* Left Column: Identify & DNA */}
                   <div className="xl:w-1/3 flex flex-col gap-6">
                     <header>
                       <div className="flex justify-between items-start mb-2">
                         <span className="text-xs uppercase tracking-widest font-bold text-white/50">{p.dept} ({p.count} resp.)</span>
                       </div>
                       <h2 className={`text-3xl font-serif italic mb-2 ${themeClass.split(' ').find(c => c.startsWith('text-'))}`}>
                         {p.archetype.name}
                       </h2>
                       <p className="text-sm font-medium text-slate-300">
                         {p.archetype.desc}
                       </p>
                     </header>

                     <div className="mt-auto">
                       <TemperatureBadge eNPS={p.eNPS} />
                     </div>

                     <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/50">
                       <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                         <Brain size={14} className="text-indigo-400" />
                         O "DNA" da Área
                       </span>
                       <p className="text-sm text-slate-300 leading-relaxed">
                         {p.dnaText}
                       </p>
                     </div>
                   </div>

                   {/* Right Column: Emoções e Motivadores */}
                   <div className="xl:w-2/3 flex flex-col gap-4">
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <Activity className="text-slate-500" /> Mapa de Emoções e Motivadores
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* O que Impulsiona */}
                       <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                         <span className="text-xs uppercase tracking-widest font-bold text-emerald-400 mb-3 flex items-center gap-2">
                           <Zap size={14} /> O que impulsiona
                         </span>
                         <ul className="space-y-2 mt-3">
                           {p.impulsiona.map((item: string, i: number) => (
                             <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                               <span className="text-emerald-500 mt-0.5">•</span> 
                               <span className="capitalize">{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>

                       {/* O que Drena */}
                       <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5">
                         <span className="text-xs uppercase tracking-widest font-bold text-rose-400 mb-3 flex items-center gap-2">
                           <AlertTriangle size={14} /> O que drena
                         </span>
                         <ul className="space-y-2 mt-3">
                           {p.drena.map((item: string, i: number) => (
                             <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                               <span className="text-rose-500 mt-0.5">•</span> 
                               <span className="capitalize">{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     </div>

                     {/* Prioridade de Gestão */}
                     <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 mt-2">
                       <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 mb-2 flex items-center gap-2">
                         <Target size={14} /> Prioridade de Gestão
                       </span>
                       <p className="text-sm text-indigo-100/90 leading-relaxed font-medium mt-1">
                         {p.prioridade}
                       </p>
                     </div>
                     
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}
      
      </div>
    </div>
  );
}
