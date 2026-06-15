import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InfoTooltip({ text, className, placement = 'top' }: { text: string, className?: string, placement?: 'top' | 'top-right' | 'bottom' | 'left' | 'right' }) {
  let placementClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2";
  let arrowClasses = "-bottom-1 left-1/2 -translate-x-1/2 border-b border-r rotate-45";
  
  if (placement === 'top-right') {
    placementClasses = "bottom-full right-0 mb-2";
    arrowClasses = "-bottom-1 right-2 border-b border-r rotate-45";
  } else if (placement === 'bottom') {
    placementClasses = "top-full left-1/2 -translate-x-1/2 mt-2";
    arrowClasses = "-top-1 left-1/2 -translate-x-1/2 border-t border-l rotate-45";
  } else if (placement === 'left') {
    placementClasses = "right-full top-1/2 -translate-y-1/2 mr-2";
    arrowClasses = "-right-1 top-1/2 -translate-y-1/2 border-t border-r rotate-45";
  } else if (placement === 'right') {
    placementClasses = "left-full top-1/2 -translate-y-1/2 ml-2";
    arrowClasses = "-left-1 top-1/2 -translate-y-1/2 border-b border-l rotate-45";
  }

  return (
    <span className={cn("group relative inline-flex items-center", className)}>
      <Info size={14} className="text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <span className={cn("absolute w-max max-w-[280px] p-3 bg-slate-800/95 backdrop-blur-sm border border-slate-700 text-xs text-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none normal-case tracking-normal font-normal text-left leading-relaxed whitespace-normal break-words", placementClasses)}>
        {text}
        <span className={cn("absolute w-2 h-2 bg-slate-800/95 border-slate-700 z-[-1]", arrowClasses)}></span>
      </span>
    </span>
  );
}
