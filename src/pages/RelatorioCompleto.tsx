import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from '../context/AppContext';
import { PainelExecutivo } from './PainelExecutivo';
import { PerfilColaboradores } from './PerfilColaboradores';
import { PerfilLideranca } from './PerfilLideranca';
import { AnalisePilares } from './AnalisePilares';
import { PrincipaisNecessidades } from './PrincipaisNecessidades';
import { AVozDoColaborador } from './AVozDoColaborador';
import { ConclusoesIA } from './ConclusoesIA';
import { SeriesHistoricas } from './SeriesHistoricas';
import { ProgramaMesh } from './ProgramaMesh';

function PrintContent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const theme = searchParams.get('theme') || 'light';
  const forceCiclo = searchParams.get('ciclo');
  const forceEmpresa = searchParams.get('empresa');
  const isLight = theme === 'light';
  
  const { filters, setFilters, isDataLoading } = useAppContext();
  const [readyToPrint, setReadyToPrint] = useState(false);

  useEffect(() => {
    let updated = false;
    const newFilters = { ...filters };
    if (forceCiclo && forceCiclo !== filters.ciclo) {
       newFilters.ciclo = forceCiclo;
       updated = true;
    }
    if (forceEmpresa && forceEmpresa !== filters.empresa) {
       newFilters.empresa = forceEmpresa;
       updated = true;
    }
    if (updated) { setFilters(newFilters); }
    setReadyToPrint(true);
  }, [forceCiclo, forceEmpresa, setFilters]);

  useEffect(() => {
    if (!readyToPrint || isDataLoading) return;
    const timer = setTimeout(() => { window.print(); }, 1500);
    return () => clearTimeout(timer);
  }, [readyToPrint, isDataLoading]);

  if (!readyToPrint) return null;

  return (
    <div className={`min-h-screen p-8 ${isLight ? 'bg-white text-black print-report' : 'bg-deep-blue text-slate-100'}`}>
       <div className={`mb-8 text-center border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
         <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Relatório Completo de Pesquisa de Clima</h1>
         <p className={isLight ? 'text-slate-500 mt-2 text-sm' : 'text-slate-400 mt-2 text-sm'}>
           Filtros Aplicados — Ciclo: <strong>{filters.ciclo}</strong> | Empresa: <strong>{filters.empresa}</strong>
         </p>
       </div>
       <div className="print-section"><PainelExecutivo /></div>
       <div className="print-section mt-12"><PerfilColaboradores /></div>
       <div className="print-section mt-12"><PerfilLideranca /></div>
       <div className="print-section mt-12"><AnalisePilares /></div>
       <div className="print-section mt-12"><PrincipaisNecessidades /></div>
       <div className="print-section mt-12"><AVozDoColaborador /></div>
       <div className="print-section mt-12"><ConclusoesIA /></div>
       <div className="print-section mt-12"><SeriesHistoricas /></div>
       <div className="print-section mt-12"><ProgramaMesh /></div>
    </div>
  );
}

export function RelatorioCompleto() {
  return (
    <AppProvider>
      <PrintContent />
    </AppProvider>
  );
}
