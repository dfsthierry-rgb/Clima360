import React, { useState } from 'react';
import { Image as ImageIcon, Download, Check, Copy } from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';

interface ExportButtonsProps {
  captureRef: React.RefObject<HTMLDivElement>;
  filename: string;
  onCopyText?: () => void;
  isCopiedText?: boolean;
}

export function ExportButtons({ captureRef, filename, onCopyText, isCopiedText }: ExportButtonsProps) {
  const [isCopiedImage, setIsCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopyImage = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(captureRef.current, {
        backgroundColor: '#020617', // Match the dark background
        cacheBust: true,
      });
      if (blob) {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': blob })
        ]);
        setIsCopiedImage(true);
        setTimeout(() => setIsCopiedImage(false), 2000);
      }
    } catch (err) {
      console.error('Falha ao copiar imagem:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: '#020617', // Match the dark background
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Falha ao exportar imagem:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      {onCopyText && (
        <button
          onClick={onCopyText}
          className="flex-1 sm:flex-none flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wide justify-center"
          title="Copiar Texto"
        >
          {isCopiedText ? <Check size={14} /> : <Copy size={14} />}
          {isCopiedText ? 'Texto' : 'Texto'}
        </button>
      )}
      <button
        onClick={handleCopyImage}
        disabled={isExporting}
        className="flex-1 sm:flex-none flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors text-[10px] font-bold uppercase tracking-wide justify-center disabled:opacity-50"
        title="Copiar Imagem"
      >
        {isCopiedImage ? <Check size={14} /> : <ImageIcon size={14} />}
        {isCopiedImage ? 'Copiado!' : isExporting ? '...' : 'Imagem'}
      </button>
      <button
        onClick={handleDownloadImage}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors text-[10px] uppercase font-bold justify-center disabled:opacity-50 w-9"
        title="Baixar Imagem"
      >
        <Download size={14} />
      </button>
    </div>
  );
}
