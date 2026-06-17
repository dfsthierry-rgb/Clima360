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
    // If URL has filters, override the initial ones. 
    // Otherwise just continue.
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
    
    if (updated) {
       setFilters(newFilters);
    }
    
    setReadyToPrint(true);
  }, [forceCiclo, forceEmpresa, setFilters]); // Only run on mount basically.

  useEffect(() => {
    if (!readyToPrint || isDataLoading) return;
    // Wait a bit for charts to render before triggering print
    const timer = setTimeout(() => {
      window.print();
    }, 1500);
    return () => clearTimeout(timer);
  }, [readyToPrint, isDataLoading]);

  if (!readyToPrint) return null;

  return (
    <div className={`min-h-screen p-8 ${isLight ? 'bg-[#BFBFBF] text-slate-900 print-report' : 'bg-[#0b0f19] text-slate-100'}`}>
       {/* Inject print-specific overrides directly */}
       <style dangerouslySetInnerHTML={{__html: `
         @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            * { color-adjust: exact !important; }
            .print-section { page-break-before: always; break-before: page; padding-top: 20px; }
            .print-section:first-child { page-break-before: auto; break-before: auto; }
            section, .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
            body { overflow: visible !important; height: auto !important; }
            #root { overflow: visible !important; height: auto !important; }
            
            /* Remove max-height and scrolls for tables so they print entirely */
            .max-h-96, .overflow-y-auto, .overflow-x-auto {
                max-height: none !important;
                overflow: visible !important;
            }

            ${isLight ? `
            body { background: #BFBFBF !important; }
            [class*="bg-slate-8"], [class*="bg-slate-9"], [class*="bg-[#"], [class*="bg-black"], [class*="bg-indigo-9"], [class*="bg-["] {
              background-color: white !important;
              border-color: #e2e8f0 !important;
              box-shadow: none !important;
            }
            [class*="text-slate-1"], [class*="text-slate-2"], [class*="text-slate-3"], [class*="text-slate-4"], [class*="text-slate-5"], [class*="text-white"], [class*="text-gray-"], [class*="text-indigo-1"], [class*="text-indigo-2"], [class*="text-indigo-3"], [class*="text-teal-1"], [class*="text-teal-2"], [class*="text-teal-3"], [class*="text-rose-1"], [class*="text-rose-2"], [class*="text-rose-3"], [class*="text-amber-1"], [class*="text-amber-2"], [class*="text-amber-3"], [class*="text-emerald-1"], [class*="text-emerald-2"], [class*="text-emerald-3"], [class*="text-blue-1"], [class*="text-blue-2"], [class*="text-blue-3"], [class*="text-purple-1"], [class*="text-purple-2"], [class*="text-purple-3"], [class*="text-cyan-1"], [class*="text-cyan-2"], [class*="text-cyan-3"] {
              color: #1e293b !important;
            }
            .text-indigo-400 { color: #4f46e5 !important; }
            .text-rose-400 { color: #e11d48 !important; }
            .text-emerald-400 { color: #10b981 !important; }
            .text-amber-400 { color: #d97706 !important; }
            .text-teal-400 { color: #0d9488 !important; }
            .text-cyan-400 { color: #0891b2 !important; }
            .text-purple-400 { color: #9333ea !important; }
            .text-blue-400 { color: #2563eb !important; }
            .recharts-text { fill: #0f172a !important; }
            .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke: #e2e8f0 !important; }
            ` : `
            body { background: #0b0f19 !important; }
            `}
         }
         
         /* Also apply these styles for the screen view so user sees the preview nicely (Light Theme only) */
         ${isLight ? `
         .print-report [class*="bg-slate-8"], .print-report [class*="bg-slate-9"], .print-report [class*="bg-[#"], .print-report [class*="bg-black"], .print-report [class*="bg-indigo-9"], .print-report [class*="bg-["] {
            background-color: white !important;
            border-color: #e2e8f0 !important;
            box-shadow: none !important;
         }
         .print-report [class*="text-slate-1"], .print-report [class*="text-slate-2"], .print-report [class*="text-slate-3"], .print-report [class*="text-slate-4"], .print-report [class*="text-slate-5"], .print-report [class*="text-white"], .print-report [class*="text-gray-"], .print-report [class*="text-indigo-1"], .print-report [class*="text-indigo-2"], .print-report [class*="text-indigo-3"], .print-report [class*="text-teal-1"], .print-report [class*="text-teal-2"], .print-report [class*="text-teal-3"], .print-report [class*="text-rose-1"], .print-report [class*="text-rose-2"], .print-report [class*="text-rose-3"], .print-report [class*="text-amber-1"], .print-report [class*="text-amber-2"], .print-report [class*="text-amber-3"], .print-report [class*="text-emerald-1"], .print-report [class*="text-emerald-2"], .print-report [class*="text-emerald-3"], .print-report [class*="text-blue-1"], .print-report [class*="text-blue-2"], .print-report [class*="text-blue-3"], .print-report [class*="text-purple-1"], .print-report [class*="text-purple-2"], .print-report [class*="text-purple-3"], .print-report [class*="text-cyan-1"], .print-report [class*="text-cyan-2"], .print-report [class*="text-cyan-3"] {
            color: #1e293b !important;
         }
         .print-report .recharts-text {
            fill: #0f172a !important;
         }
         .print-report .text-indigo-400 { color: #4f46e5 !important; }
         .print-report .text-rose-400 { color: #e11d48 !important; }
         .print-report .text-emerald-400 { color: #10b981 !important; }
         .print-report .text-amber-400 { color: #d97706 !important; }
         .print-report .text-teal-400 { color: #0d9488 !important; }
         .print-report .text-cyan-400 { color: #0891b2 !important; }
         .print-report .text-purple-400 { color: #9333ea !important; }
         .print-report .text-blue-400 { color: #2563eb !important; }
         .print-report .recharts-cartesian-grid-horizontal line, .print-report .recharts-cartesian-grid-vertical line {
            stroke: #e2e8f0 !important;
         }
         ` : ''}
       `}} />
       
       <div className={`mb-8 text-center border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
         <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Relatório Completo de Pesquisa de Clima Grupo Central Mesh</h1>
         <p className={isLight ? 'text-slate-500 mt-2 text-sm' : 'text-slate-400 mt-2 text-sm'}>
           Filtros Aplicados — Ciclo: <strong>{filters.ciclo}</strong> | Empresa: <strong>{filters.empresa}</strong>
         </p>
       </div>

       <div className="print-section">
         <PainelExecutivo />
       </div>
       <div className="print-section mt-12">
         <PerfilColaboradores />
       </div>
       <div className="print-section mt-12">
         <PerfilLideranca />
       </div>
       <div className="print-section mt-12">
         <AnalisePilares />
       </div>
       <div className="print-section mt-12">
         <PrincipaisNecessidades />
       </div>
       <div className="print-section mt-12">
         <AVozDoColaborador />
       </div>
       <div className="print-section mt-12">
         <ConclusoesIA />
       </div>
       <div className="print-section mt-12">
         <SeriesHistoricas />
       </div>
       <div className="print-section mt-12">
         <ProgramaMesh />
       </div>
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
