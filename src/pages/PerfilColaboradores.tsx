import React, { useMemo, useState, useRef } from 'react';
import { ExportButtons } from '../components/ExportButtons';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, LabelList, AreaChart, Area } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { WordCloud } from '../components/ui/WordCloud';
import { X } from 'lucide-react';

import { CategorizedSummary } from '../components/ui/CategorizedSummary';

export function PerfilColaboradores() {
  const { filteredData, departamentos, generos } = useAppContext();
  const [localGenero, setLocalGenero] = useState<string>('Todos');
  const captureRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState<string[]>([]);

  const localFilteredData = useMemo(() => {
    return filteredData.filter(d => {
      if (localGenero !== 'Todos' && d.genero !== localGenero) return false;
      return true;
    });
  }, [filteredData, localGenero]);

  const dataIdentificada = useMemo(() => localFilteredData.filter(d => !d.isAnonymous), [localFilteredData]);
  const dataAnonima = useMemo(() => localFilteredData.filter(d => d.isAnonymous), [localFilteredData]);

  const getCounts = (key: keyof typeof localFilteredData[0], data: typeof localFilteredData) => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      let val = d[key] as string;
      if (val && val.trim() !== "" && val !== "Não Informado") {
        if (key === 'rendaFamiliar') val = val.substring(0, 30); // truncate for UI
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const generoData = useMemo(() => getCounts('genero', dataIdentificada), [dataIdentificada]);
  const moradiaData = useMemo(() => getCounts('moradia', dataIdentificada).slice(0, 8), [dataIdentificada]);
  const estadoCivilData = useMemo(() => getCounts('estadoCivil', dataIdentificada).slice(0, 8), [dataIdentificada]);
  const qtdFilhosData = useMemo(() => getCounts('qtdFilhos', dataIdentificada).slice(0, 8), [dataIdentificada]);
  const rendaFamiliarData = useMemo(() => getCounts('rendaFamiliar', dataIdentificada).slice(0, 8), [dataIdentificada]);
  const estudandoAtualmenteData = useMemo(() => getCounts('estudandoAtualmente', dataIdentificada), [dataIdentificada]);
  
  const estudoQualText = useMemo(() => {
    return dataIdentificada.map(d => d.cursoAtual).filter(c => c && c.trim() !== "" && c.toLowerCase() !== "não informado" && c.toLowerCase() !== "-").join(" ");
  }, [dataIdentificada]);

  const horasVagasText = useMemo(() => {
    return dataIdentificada.map(d => d.horasVagas).filter(c => c && c.trim() !== "" && c.toLowerCase() !== "não informado" && c.toLowerCase() !== "-").join(" ");
  }, [dataIdentificada]);

  const { avgAge, idadeData } = useMemo(() => {
    let sum = 0;
    let count = 0;
    const counts: Record<string, number> = {};
    
    dataIdentificada.forEach(d => {
      let val = d.idade as string;
      if (val && val.toLowerCase() !== "não informado") {
        const match = val.match(/\d+/);
        if (match) {
          const ageNum = parseInt(match[0]);
          if (ageNum >= 14 && ageNum <= 100) {
            sum += ageNum;
            count++;
            const ageStr = ageNum.toString() + " anos";
            counts[ageStr] = (counts[ageStr] || 0) + 1;
          }
        }
      }
    });

    const data = Object.entries(counts).map(([name, value]) => ({ name, value, numName: parseInt(name) }));
    data.sort((a, b) => a.numName - b.numName);
    
    return {
      avgAge: count > 0 ? Math.round(sum / count) : 0,
      idadeData: data
    };
  }, [dataIdentificada]);

  const tempoCasaData = useMemo(() => {
    return getCounts('tempoCasa', dataAnonima);
  }, [dataAnonima]);

  const escolaridadeData = useMemo(() => {
    return getCounts('escolaridade', dataIdentificada);
  }, [dataIdentificada]);

  const cursosData = useMemo(() => {
    return getCounts('cursoDesejado', dataIdentificada).slice(0, 8);
  }, [dataIdentificada]);

  const { pcInternetStats } = useMemo(() => {
    let total = 0, hasPcAndNet = 0, onlyNet = 0, onlyPc = 0, neither = 0;
    dataIdentificada.forEach(d => {
      const pc = (d.computador && d.computador.toLowerCase().includes('sim')) ? true : false;
      const net = (d.internet && d.internet.toLowerCase().includes('sim')) ? true : false;
      
      // If none of these are empty or unrecorded. Assuming we only count valid data
      if (d.computador !== "Não Informado" && d.internet !== "Não Informado") {
        total++;
        if (pc && net) hasPcAndNet++;
        else if (!pc && net) onlyNet++;
        else if (pc && !net) onlyPc++;
        else neither++;
      }
    });
    return {
      pcInternetStats: {
        hasPcAndNet: total ? Math.round((hasPcAndNet/total)*100) : 0,
        onlyNet: total ? Math.round((onlyNet/total)*100) : 0,
        onlyPc: total ? Math.round((onlyPc/total)*100) : 0,
        neither: total ? Math.round((neither/total)*100) : 0,
        total: total
      }
    };
  }, [dataIdentificada]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
        <div>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Perfil dos Colaboradores</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Radiografia demográfica do grupo. Entenda "quem somos nós" nesta visão segmentada.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">Gênero</span>
              <select 
                value={localGenero}
                onChange={(e) => setLocalGenero(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-200 outline-none border-none py-1 px-2 cursor-pointer"
              >
                <option value="Todos" className="bg-slate-900">Todos</option>
                {generos.map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
              </select>
            </div>
          </div>
          <ExportButtons captureRef={captureRef} filename="perfil-colaboradores" />
        </div>
      </header>

      <div ref={captureRef} className="flex flex-col gap-6 p-1 -m-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Genre Donut */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Gênero
            <InfoTooltip text="Distribuição percentual de gênero entre os respondentes." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie data={generoData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {generoData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moradia Donut */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Moradia
            <InfoTooltip text="Status residencial mapeado para entender a mobilidade temporal da equipe." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie data={moradiaData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {moradiaData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado Civil */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Estado Civil
            <InfoTooltip text="Distribuição do estado civil dos respondentes." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie data={estadoCivilData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {estadoCivilData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+1) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantidade de Filhos */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Quantidade de Filhos
            <InfoTooltip text="Distribuição de dependentes/filhos." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qtdFilhosData} layout="vertical" margin={{ top: 10, right: 40, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Histogram */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Distribuição de Idade (Média: {avgAge} anos)
            <InfoTooltip text="Curva de distribuição de idades na empresa." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={idadeData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIdade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="numName" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="url(#colorIdade)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time at Company */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Tempo de Casa
            <InfoTooltip text="Análise de retenção de talentos (Senioridade na empresa)." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempoCasaData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Funnel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Escolaridade (Pipeline)
            <InfoTooltip text="Grau de instrução formal reportado pelos participantes." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={escolaridadeData} layout="vertical" margin={{ top: 10, right: 40, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={160} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cursos Desejados */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Cursos Desejados / Interesses
            <InfoTooltip text="Quais cursos ou capacitações os colaboradores gostariam de cursar." className="ml-1.5" />
          </h2>
          <div className="h-[250px] overflow-hidden relative border border-slate-800/50 bg-slate-950/30 rounded-xl p-2">
             <CategorizedSummary 
                 title="Cursos Desejados"
                 data={localFilteredData.map(d => d.cursoDesejado ? `${d.cursoDesejado} (Colaborador: ${d.nomeFuncionario || 'Anônimo'})` : '')} 
                 onCategoryClick={(cat, items) => {
                   setModalTitle(`Cursos Desejados: "${cat}"`);
                   setModalItems(items);
                   setIsModalOpen(true);
                 }} 
                 customKeywordGroups={{
                   '🎓 Administração e Negócios': ['administração', 'adm', 'negócios', 'gestão', 'rh', 'recursos humanos', 'logística', 'finanças', 'contábeis', 'contabilidade', 'economia', 'liderança', 'marketing', 'vendas'],
                   '💻 Tecnologia da Informação': ['ti', 'tecnologia', 'sistemas', 'computação', 'software', 'programação', 'dados', 'informática', 'análise', 'excel', 'informática'],
                   '🏭 Engenharia, Indústria e Produção': ['engenharia', 'produção', 'elétrica', 'mecânica', 'civil', 'automação', 'qualidade', 'processos', 'segurança do trabalho', 'metrologia', 'manutenção', 'usinagem', 'cnc', 'empilhadeira', 'solda'],
                   '🗣️ Idiomas': ['inglês', 'ingles', 'espanhol', 'idiomas', 'línguas', 'libras'],
                   '🏥 Saúde e Bem-Estar': ['psicologia', 'saúde', 'enfermagem', 'medicina', 'nutrição', 'fisioterapia', 'estética', 'farmácia', 'análises clínicas'],
                   '📚 Capacitação Pessoal e Outros': ['ensino', 'direito', 'pedagogia', 'letras', 'comunicação', 'oratório', 'oratoria', 'desenvolvimento', 'curso técnico']
                 }}
               />
          </div>
        </div>

        {/* Computadores & Internet */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Acesso Digital (Computador & Internet)
            <InfoTooltip text="Mapeamento de recursos tecnológicos na residência dos colaboradores." className="ml-1.5" />
          </h2>
          <div className="grid grid-cols-2 gap-4 h-[250px] content-center">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-emerald-400">{pcInternetStats.hasPcAndNet}%</span>
              <span className="text-xs text-slate-400 mt-2 font-medium">Possui Computador & Int.</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-sky-400">{pcInternetStats.onlyPc}%</span>
              <span className="text-xs text-slate-400 mt-2 font-medium">Somente Computador</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-amber-400">{pcInternetStats.onlyNet}%</span>
              <span className="text-xs text-slate-400 mt-2 font-medium">Internet em Casa</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-rose-400">{pcInternetStats.neither}%</span>
              <span className="text-xs text-slate-400 mt-2 font-medium">Nenhum</span>
            </div>
          </div>
        </div>

        {/* Renda Familiar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Renda Familiar
            <InfoTooltip text="Distribuição reportada da renda familiar." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rendaFamiliarData} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={120} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estudando Atualmente e WordCloud */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:col-span-2">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Estudando Atualmente / Qual Curso?
            <InfoTooltip text="Proporção de quem estuda atualmente e quais os cursos relatados." className="ml-1.5" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie data={estudandoAtualmenteData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${name}: ${value}` : ''} labelLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  {estudandoAtualmenteData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+3) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="h-full overflow-hidden border border-slate-800/50 bg-slate-950/30 rounded-xl">
               <CategorizedSummary 
                 title="Curso Atual"
                 data={dataIdentificada.map(d => d.cursoAtual ? `${d.cursoAtual} (Colaborador: ${d.nomeFuncionario || 'Anônimo'})` : '')} 
                 onCategoryClick={(cat, items) => {
                   setModalTitle(`Curso Atual: "${cat}"`);
                   setModalItems(items);
                   setIsModalOpen(true);
                 }} 
                 customKeywordGroups={{
                   '🎓 Administração e Negócios': ['administração', 'adm', 'negócios', 'gestão', 'rh', 'recursos humanos', 'logística', 'finanças', 'contábeis', 'contabilidade', 'economia', 'marketing', 'vendas'],
                   '💻 Tecnologia da Informação': ['ti', 'tecnologia', 'sistemas', 'computação', 'software', 'programação', 'dados', 'informática', 'análise', 'desenvolvimento'],
                   '🏭 Engenharia, Indústria e Produção': ['engenharia', 'produção', 'elétrica', 'mecânica', 'civil', 'automação', 'qualidade', 'processos', 'segurança do trabalho', 'metrologia', 'manutenção', 'cnc', 'usinagem', 'solda'],
                   '🗣️ Idiomas': ['inglês', 'ingles', 'espanhol', 'idiomas', 'línguas', 'libras'],
                   '🏥 Saúde e Bem-Estar': ['psicologia', 'saúde', 'enfermagem', 'medicina', 'nutrição', 'fisioterapia', 'análises clínicas', 'analises clinicas', 'estética', 'farmácia', 'ed física', 'educação física', 'ed. física'],
                   '📚 Ensino, Humanas e Direito': ['ensino', 'escola', 'estudos', 'direito', 'pedagogia', 'letras', 'história', 'geografia', 'física', 'matemática'],
                   '🛠️ Cursos Técnicos / Profissionais': ['técnico', 'tecnologo', 'curso técnico', 'curso livre', 'eletricista', 'mecânico']
                 }}
               />
            </div>
          </div>
        </div>

        {/* Horas Vagas WordCloud */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:col-span-2 text-center h-[350px] flex flex-col">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center text-left">
            O que gosta de Fazer nas Horas Vagas
            <InfoTooltip text="Quais as atividades preferidas dos colaboradores." className="ml-1.5" />
          </h2>
          <div className="flex-1 overflow-hidden relative border border-slate-800/50 bg-slate-950/30 rounded-xl p-4 text-left">
               <CategorizedSummary 
                 title="Nas Horas Vagas"
                 data={dataIdentificada.map(d => d.horasVagas ? `${d.horasVagas} (Colaborador: ${d.nomeFuncionario || 'Anônimo'})` : '')} 
                 onCategoryClick={(cat, items) => {
                   setModalTitle(`Nas Horas Vagas: "${cat}"`);
                   setModalItems(items);
                   setIsModalOpen(true);
                 }}
                 customKeywordGroups={{
                   '👨‍👩‍👧‍👦 Família e Amigos': ['família', 'familia', 'amigos', 'filho', 'filhos', 'esposa', 'marido', 'namorad', 'brincar', 'passear com'],
                   '📺 Filmes e Séries': ['filme', 'série', 'serie', 'tv', 'netflix', 'cinema', 'assistir', 'televisão'],
                   '🎮 Jogos e Games': ['jogo', 'jogos', 'videogame', 'game', 'playstation', 'pc', 'computador', 'jogar'],
                   '⚽ Esportes e Exercícios': ['futebol', 'academia', 'correr', 'caminhar', 'caminhada', 'esporte', 'bicicleta', 'pedalar', 'treinar', 'musculação', 'nadar'],
                   '📖 Leitura e Estudos': ['ler', 'leitura', 'livro', 'estudar', 'estudando', 'aprender', 'curso'],
                   '✈️ Viagens e Passeios': ['viajar', 'viagem', 'passear', 'passeio', 'praia', 'parque', 'shopping', 'sair'],
                   '🎶 Música e Arte': ['música', 'musica', 'tocar', 'cantar', 'violão', 'instrumento', 'arte', 'dançar'],
                   '🍳 Culinária e Gastronomia': ['cozinhar', 'comer', 'restaurante', 'churrasco', 'comida', 'fazer um lanche', 'gourmet'],
                   '😴 Descanso Total': ['dormir', 'descansar', 'ficar em casa', 'relaxar', 'nada']
                 }}
               />
          </div>
        </div>

      </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-medium text-white">{modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
              {modalItems.map((item, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-xl text-slate-300 text-sm leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
