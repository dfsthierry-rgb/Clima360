import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, LabelList } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export function PerfilColaboradores() {
  const { filteredData, departamentos, generos } = useAppContext();
  const [localDept, setLocalDept] = useState<string>('Todos');
  const [localGenero, setLocalGenero] = useState<string>('Todos');

  const localFilteredData = useMemo(() => {
    return filteredData.filter(d => {
      if (localDept !== 'Todos' && d.department !== localDept) return false;
      if (localGenero !== 'Todos' && d.genero !== localGenero) return false;
      return true;
    });
  }, [filteredData, localDept, localGenero]);

  const getCounts = (key: keyof typeof localFilteredData[0]) => {
    const counts: Record<string, number> = {};
    localFilteredData.forEach(d => {
      const val = d[key] as string;
      if (val && val.trim() !== "") {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const generoData = useMemo(() => getCounts('genero'), [localFilteredData]);
  const moradiaData = useMemo(() => getCounts('moradia').slice(0, 8), [localFilteredData]);
  
  // Sort age dynamically
  const idadeData = useMemo(() => {
    const data = getCounts('idade');
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [localFilteredData]);

  const tempoCasaData = useMemo(() => {
    return getCounts('tempoCasa');
  }, [localFilteredData]);

  const escolaridadeData = useMemo(() => {
    return getCounts('escolaridade');
  }, [localFilteredData]);

  const cursosData = useMemo(() => {
    return getCounts('cursoDesejado').slice(0, 8);
  }, [localFilteredData]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-white leading-tight">Perfil dos Colaboradores</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Radiografia demográfica do grupo. Entenda "quem somos nós" nesta visão segmentada.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2">Departamento</span>
            <select 
              value={localDept}
              onChange={(e) => setLocalDept(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 outline-none border-none py-1 px-2 cursor-pointer"
            >
              <option value="Todos" className="bg-slate-900">Todos</option>
              {departamentos.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
            </select>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Genre Donut */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Gênero
            <InfoTooltip text="Distribuição percentual de gênero entre os respondentes." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={generoData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }}>
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
              <PieChart>
                <Pie data={moradiaData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, value}) => value > 0 ? `${value}` : ''} labelLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {moradiaData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index+2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Histogram */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center">
            Distribuição de Idade
            <InfoTooltip text="Histograma vertical das faixas etárias da população pesquisada." className="ml-1.5" />
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={idadeData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
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
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosData} layout="vertical" margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={120} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={16}>
                  <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
