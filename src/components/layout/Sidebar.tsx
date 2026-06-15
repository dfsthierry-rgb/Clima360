import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users2, Target, MessageSquare, LineChart, Settings, Lightbulb, TrendingUp, ScanFace } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Painel Executivo' },
  { path: '/perfil', icon: Users2, label: 'Perfil dos Colaboradores' },
  { path: '/lideranca', icon: Users2, label: 'Perfil da Liderança' },
  { path: '/pilares', icon: Target, label: 'Análise de Pilares' },
  { path: '/necessidades', icon: MessageSquare, label: 'Principais Necessidades' },
  { path: '/voz', icon: MessageSquare, label: 'A Voz da Equipe' },
  { path: '/historico', icon: LineChart, label: 'Séries Históricas' },
  { path: '/persona', icon: ScanFace, label: 'Persona por Área' },
  { path: '/conclusoes', icon: Lightbulb, label: 'Conclusões e Análise Especialista RH' },
  { path: '/programa', icon: TrendingUp, label: 'Programa RH' },
  { path: '/config', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] flex flex-col items-center py-6 border-r border-slate-800/50 bg-[#080b14] z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] no-print">
      <div className="mb-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-black text-xs italic tracking-tighter text-white">360°</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-4 w-full px-3 mb-6 shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={cn(
                "relative flex items-center justify-center transition-all duration-300 group mx-auto",
                isActive 
                  ? "p-2 bg-indigo-500/10 rounded-lg text-indigo-400" 
                  : "p-2 text-slate-500 hover:text-indigo-400"
              )}
            >
              <Icon size={20} className={cn("transition-transform duration-300", isActive && "scale-110")} />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
