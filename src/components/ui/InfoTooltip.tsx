import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InfoTooltip({ text, className }: { text: string, className?: string }) {
  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      <Info size={14} className="text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[280px] p-3 bg-slate-800/95 backdrop-blur-sm border border-slate-700 text-xs text-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none normal-case tracking-normal font-normal text-left leading-relaxed whitespace-normal break-words">
        {text}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800/95 border-b border-r border-slate-700 rotate-45 z-[-1]"></span>
      </span>
    </span>
  );
}
