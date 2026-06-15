import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { GlobalFilters } from './GlobalFilters';
import { AppProvider } from '../../context/AppContext';

export function Layout() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500/30">
        <Sidebar />
        <GlobalFilters />
        <main className="pl-[72px] pt-20 max-w-[1920px] mx-auto min-h-screen print:pl-0 print:pt-4 print:bg-white print:text-black">
          <div className="p-8 print:p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}
