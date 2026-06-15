import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';

interface WordCloudProps {
  data: string[];
  onWordClick?: (word: string, originalResponses: string[]) => void;
  className?: string;
  ignoreWords?: string[];
}

export function WordCloud({ data, onWordClick, className, ignoreWords = ["eu", "a", "o", "e", "é", "de", "do", "da", "em", "um", "uma", "para", "com", "não", "os", "as", "que", "na", "no", "por"] }: WordCloudProps) {
  const { words, fullMap } = useMemo(() => {
    const counts: Record<string, number> = {};
    const wordToOriginal: Record<string, string[]> = {};

    data.forEach(response => {
      if (!response || response === '-' || response === 'Não Informado') return;
      
      const wordsInResponse = response.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")
        .split(/\s+/)
        .filter(w => w.length > 2 && !ignoreWords.includes(w));
      
      const uniqueWords = Array.from(new Set(wordsInResponse));
      uniqueWords.forEach(w => {
        counts[w] = (counts[w] || 0) + 1;
        if (!wordToOriginal[w]) wordToOriginal[w] = [];
        wordToOriginal[w].push(response);
      });
    });

    const wordsArr = Object.keys(counts).map(w => ({ text: w, value: counts[w] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 40); // top 40 words
    
    // Normalize size
    const maxVal = Math.max(...wordsArr.map(w => w.value));
    wordsArr.forEach(w => {
      w.value = maxVal > 0 ? (w.value / maxVal) : 1;
    });

    return { words: wordsArr, fullMap: wordToOriginal };
  }, [data, ignoreWords]);

  if (words.length === 0) {
    return <div className="text-slate-500 text-sm italic py-4">Não há dados suficientes para exibir.</div>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 items-center justify-center p-4", className)}>
      {words.map((word, i) => {
        const fontSize = 12 + (word.value * 28); // 12px to 40px
        const opacity = 0.5 + (word.value * 0.5); // 0.5 to 1.0
        return (
          <button
            key={i}
            onClick={() => onWordClick && onWordClick(word.text, fullMap[word.text])}
            className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 cursor-pointer"
            style={{ fontSize: `${fontSize}px`, opacity }}
          >
            {word.text}
          </button>
        );
      })}
    </div>
  );
}
