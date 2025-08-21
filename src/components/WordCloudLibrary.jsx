"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
import { scaleLog } from '@visx/scale';
import { Text } from '@visx/text';

const WordCloudLibrary = ({ text = '', title = 'Nuvem de Palavras' }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const processedWords = useMemo(() => {
    try {
      if (!text || typeof text !== 'string') return [];

    // Stopwords em português e inglês
    const stopWords = new Set([
      // Português
      'a', 'o', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por', 'que', 'se', 'na', 'no',
      'ao', 'as', 'os', 'das', 'dos', 'pela', 'pelo', 'pelos', 'pelas', 'ele', 'ela', 'eles', 'elas', 'eu',
      'tu', 'nós', 'vós', 'meu', 'minha', 'teu', 'tua', 'seu', 'sua', 'nosso', 'nossa', 'este', 'esta',
      'esse', 'essa', 'aquele', 'aquela', 'são', 'está', 'foi', 'ser', 'ter', 'estar', 'muito', 'mais',
      'bem', 'já', 'só', 'também', 'ainda', 'quando', 'onde', 'como', 'porque', 'então', 'mas', 'ou',
      'não', 'você', 'sim', 'vezes', 'até', 'pra',
      // Inglês
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
      'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i',
      'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
      'its', 'our', 'their'
    ]);

    // Limpar e dividir o texto
    const words = text
      .toLowerCase()
      .replace(/[^\w\sçãáéíóúâêîôûàèìòùäëïöü]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word)
      );

    // Contar frequência
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Converter para formato da @visx/wordcloud
    return Object.entries(frequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 40); // Top 40 palavras
    } catch (error) {
      console.error('Erro ao processar texto para word cloud:', error);
      return [];
    }
  }, [text]);

  // Configurações seguindo o padrão @visx/wordcloud
  const colors = ['#143059', '#2F6B9A', '#82a6c2', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];
  
  const fontScale = useMemo(() => {
    if (processedWords.length === 0) return () => 14;
    
    return scaleLog({
      domain: [
        Math.min(...processedWords.map((w) => w.value)), 
        Math.max(...processedWords.map((w) => w.value))
      ],
      range: [14, 48],
    });
  }, [processedWords]);
  
  const fontSizeSetter = (datum) => fontScale(datum.value);
  
  const getRotationDegree = () => {
    const rand = Math.random();
    const degree = rand > 0.5 ? 45 : -45;
    return rand * degree;
  };
  
  const fixedValueGenerator = () => 0.5; // Para evitar valores aleatórios no SSR

  if (processedWords.length === 0) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-[#174A8B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Nenhum texto disponível para gerar a nuvem de palavras</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-[#174A8B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <p className="text-sm text-gray-600 mb-4">
          {processedWords.length} palavras mais relevantes • Nuvem de palavras baseada na frequência
        </p>
        <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden flex items-center justify-center">
        {isClient && processedWords.length > 0 ? (
          <Wordcloud
            words={processedWords}
            width={500}
            height={300}
            fontSize={fontSizeSetter}
            font="Inter"
            padding={2}
            spiral="archimedean"
            rotate={getRotationDegree}
            random={fixedValueGenerator}
          >
            {(cloudWords) =>
              cloudWords.map((w, i) => (
                <Text
                  key={w.text}
                  fill={colors[i % colors.length]}
                  textAnchor="middle"
                  transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                  style={{ cursor: 'default' }}
                  title={`"${w.text}" aparece ${w.value} vez${w.value > 1 ? 'es' : ''}`}
                >
                  {w.text}
                </Text>
              ))
            }
          </Wordcloud>
        ) : !isClient ? (
          <div className="animate-pulse text-gray-500">Carregando nuvem de palavras...</div>
        ) : (
          <div className="text-gray-500">Nenhum texto relevante para gerar a nuvem de palavras.</div>
        )}
        </div>
      </div>
    </div>
  );
};

export default WordCloudLibrary;
