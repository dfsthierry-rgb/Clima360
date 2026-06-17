import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Users, FileDown } from 'lucide-react';

export function GlobalFilters() {
  const { filters, setFilters, filteredData, isDataLoading, ciclos, empresas } = useAppContext();
  const navigate = useNavigate();

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openReport = (theme: 'light' | 'dark') => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const base = path.endsWith('/') ? path : path + '/';
    const url = `${origin}${base}#/relatorio?theme=${theme}&ciclo=${encodeURIComponent(filters.ciclo)}&empresa=${encodeURIComponent(filters.empresa)}`;
    window.open(url, '_blank');
  };

  if (isDataLoading) return null;

  return (
    <header className="fixed top-0 left-[72px] right-0 h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50 flex items-center px-8 gap-6 z-40 no-print">
      <div className="flex gap-6 items-center">
        <FilterSelect 
          label="Ciclo"
          value={filters.ciclo}
          options={["Todos", ...ciclos]}
          onChange={(v) => handleFilterChange('ciclo', v)}
        />
        <div className="h-8 w-px bg-slate-800"></div>
        <FilterSelect 
          label="Empresa"
          value={filters.empresa}
          options={["Todos", ...empresas]}
          onChange={(v) => handleFilterChange('empresa', v)}
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button 
           onClick={() => openReport('light')}
           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold text-slate-300 border border-slate-700"
        >
          <FileDown size={14} /> Relatório (Claro)
        </button>
        <button 
           onClick={() => openReport('dark')}
           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold text-slate-300 border border-slate-700"
        >
          <FileDown size={14} /> Relatório (Escuro)
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-emerald-400">{filteredData.length} Respostas Ativas</span>
        </div>
      </div>
    </header>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</span>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-semibold border-none outline-none focus:ring-0 p-0 pr-6 text-white appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
        ))}
      </select>
    </div>
  );
}
