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
    <div className={`min-h-screen p-8 ${isLight ? 'bg-white text-black print-report' : 'bg-[#0b0f19] text-slate-100'}`}>
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
            body { background: white !important; }
            .bg-slate-900\\/40, .bg-slate-800, .bg-slate-900, .bg-\\[\\#0b0f19\\] {
              background-color: white !important;
              border: 1px solid #e2e8f0 !important;
              box-shadow: none !important;
            }
            .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500, .text-white {
              color: #0f172a !important;
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
            ` : `
            body { background: #0b0f19 !important; }
            `}
         }
         
         /* Also apply these styles for the screen view so user sees the preview nicely (Light Theme only) */
         ${isLight ? `
         .print-report .bg-slate-900\\/40, .print-report .bg-slate-800, .print-report .bg-slate-900 {
            background-color: white !important;
            border: 1px solid #e2e8f0 !important;
         }
         .print-report .text-slate-100, .print-report .text-slate-200, .print-report .text-slate-300, .print-report .text-slate-400, .print-report .text-slate-500 {
            color: #0f172a !important;
         }
         .print-report .recharts-text {
            fill: #0f172a !important;
         }
         ` : ''}
       `}} />
       
       <div className={`mb-8 text-center border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
         <h1 className={`text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Relatório Completo de Pesquisa de Clima</h1>
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
