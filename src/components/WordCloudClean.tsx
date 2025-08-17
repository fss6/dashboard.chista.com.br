"use client";
import React, { useState, useEffect, useMemo } from 'react';

interface WordCloudProps {
  text?: string;
  width?: number;
  height?: number;
  className?: string;
}

interface WordData {
  text: string;
  value: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotate?: number;
}

const WordCloudClean: React.FC<WordCloudProps> = ({ 
  text, 
  width = 800, 
  height = 400, 
  className = "" 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lista de stopwords em português e inglês
  const stopWords = new Set([
    // English
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'this', 'but', 'they',
    'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if', 'up', 'out', 'many',
    'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him',
    'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who',
    // Portuguese
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no',
    'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'após', 'ante', 'até', 'contra',
    'entre', 'perante', 'segundo', 'durante', 'mediante', 'como', 'que', 'se', 'quando', 'onde',
    'porque', 'porquê', 'já', 'não', 'nem', 'mas', 'porém', 'contudo', 'todavia', 'entretanto',
    'logo', 'pois', 'portanto', 'assim', 'então', 'também', 'ainda', 'só', 'apenas', 'mesmo',
    'até', 'inclusive', 'isto', 'isso', 'aquilo', 'este', 'esta', 'estes', 'estas', 'esse',
    'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'meu', 'minha', 'meus',
    'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa',
    'nossos', 'nossas', 'dele', 'dela', 'deles', 'delas', 'me', 'te', 'nos', 'vos', 'lhe',
    'lhes', 'mim', 'ti', 'si', 'nós', 'vós', 'eles', 'elas', 'eu', 'tu', 'ele', 'ela',
    'ser', 'estar', 'ter', 'haver', 'ir', 'vir', 'ver', 'dar', 'saber', 'poder', 'querer',
    'fazer', 'dizer', 'falar', 'muito', 'pouco', 'mais', 'menos', 'tanto', 'quanto', 'bem',
    'mal', 'melhor', 'pior', 'maior', 'menor', 'grande', 'pequeno', 'novo', 'velho', 'jovem',
    'primeiro', 'último', 'outro', 'mesmo', 'próprio', 'importante', 'necessário'
  ]);

  // Paleta de cores vibrantes como nos exemplos
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#D2B4DE'
  ];

  const processedWords = useMemo(() => {
    if (!text) return [];

    // Processa o texto
    const words = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Conta frequências
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Converte para array, ordena e limita a 40 palavras
    const wordArray = Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 40);

    if (wordArray.length === 0) return [];

    // Calcula tamanhos com mais variação como nos exemplos
    const maxValue = Math.max(...wordArray.map(w => w.value));
    const minValue = Math.min(...wordArray.map(w => w.value));
    
    return wordArray.map((word, index) => {
      const normalizedValue = (word.value - minValue) / (maxValue - minValue || 1);
      // Mais variação de tamanho como nos exemplos
      const fontSize = Math.max(14, Math.min(48, 14 + normalizedValue * 34));
      // Cores aleatórias para mais dinamismo
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        text: word.text,
        value: word.value,
        size: fontSize,
        color
      };
    });
  }, [text]);

  // Layout orgânico como nos exemplos clássicos
  const positionedWords = useMemo(() => {
    if (processedWords.length === 0) return [];

    const positioned: WordData[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const padding = 12;

    // Ordena por tamanho (maiores primeiro) para posicionar no centro
    const sortedWords = [...processedWords].sort((a, b) => b.size - a.size);

    sortedWords.forEach((word, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;
      let x = centerX;
      let y = centerY;

      // Adiciona rotação como nos exemplos clássicos
      const rotationOptions = [-90, 0, 0, 0, 0, 90]; // Mais horizontais
      const rotate = rotationOptions[Math.floor(Math.random() * rotationOptions.length)];

      while (!placed && attempts < maxAttempts) {
        if (attempts === 0 && index === 0) {
          // Primeira (maior) palavra no centro
          x = centerX;
          y = centerY;
        } else {
          // Posicionamento em espiral com crescimento mais rápido
          const angle = attempts * 0.4;
          const radius = Math.sqrt(attempts) * 12;
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
        }

        // Estimativa do tamanho considerando rotação
        const charWidth = word.size * 0.6;
        let estimatedWidth = word.text.length * charWidth;
        let estimatedHeight = word.size * 1.2;
        
        // Troca dimensões se rotacionado
        if (rotate === 90 || rotate === -90) {
          [estimatedWidth, estimatedHeight] = [estimatedHeight, estimatedWidth];
        }

        // Verifica limites
        const margin = 20;
        if (x - estimatedWidth/2 > margin && 
            x + estimatedWidth/2 < width - margin &&
            y - estimatedHeight/2 > margin && 
            y + estimatedHeight/2 < height - margin) {
          
          // Verifica sobreposição com detecção mais precisa
          let overlaps = false;
          for (const posWord of positioned) {
            // Calcula dimensões da palavra atual
            const currentCharWidth = word.size * 0.6;
            let currentWidth = word.text.length * currentCharWidth;
            let currentHeight = word.size * 1.2;
            
            if (rotate === 90 || rotate === -90) {
              [currentWidth, currentHeight] = [currentHeight, currentWidth];
            }
            
            // Calcula dimensões da palavra já posicionada
            const posCharWidth = posWord.size * 0.6;
            let posWidth = posWord.text.length * posCharWidth;
            let posHeight = posWord.size * 1.2;
            
            if (posWord.rotate === 90 || posWord.rotate === -90) {
              [posWidth, posHeight] = [posHeight, posWidth];
            }
            
            // Calcula distâncias necessárias com margem mais conservadora
            const minDistanceX = (currentWidth + posWidth) / 2 + padding * 3;
            const minDistanceY = (currentHeight + posHeight) / 2 + padding * 3;
            
            const dx = Math.abs(x - posWord.x);
            const dy = Math.abs(y - posWord.y);
            
            // Verifica sobreposição
            if (dx < minDistanceX && dy < minDistanceY) {
              overlaps = true;
              break;
            }
          }
          
          if (!overlaps) {
            placed = true;
          }
        }
        
        attempts++;
      }

      // Fallback se não conseguir posicionar
      if (!placed) {
        const angle = (index / sortedWords.length) * 2 * Math.PI;
        const radius = 100 + Math.random() * 80;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
        
        x = Math.max(50, Math.min(width - 50, x));
        y = Math.max(30, Math.min(height - 30, y));
      }

      positioned.push({
        text: word.text,
        value: word.value,
        x,
        y,
        size: word.size,
        color: word.color,
        rotate
      });
    });

    return positioned;
  }, [processedWords, width, height]);

  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">☁️</div>
          <p>Carregando nuvem de palavras...</p>
        </div>
      </div>
    );
  }

  if (!text || processedWords.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <p>Nenhum texto disponível para gerar a nuvem de palavras</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${className}`}>
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ background: 'white' }}
        >
          {positionedWords.map((word, index) => (
            <text
              key={`${word.text}-${index}`}
              x={word.x}
              y={word.y}
              fontSize={word.size}
              fill={word.color}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={word.size > 35 ? 'bold' : word.size > 25 ? '600' : 'normal'}
              transform={word.rotate ? `rotate(${word.rotate} ${word.x} ${word.y})` : undefined}
              style={{ 
                userSelect: 'none'
              }}
            >
              {word.text}
            </text>
          ))}
        </svg>
      </div>
      

    </div>
  );
};

export default WordCloudClean;
