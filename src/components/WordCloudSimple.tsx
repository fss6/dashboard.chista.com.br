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
  rotate: number;
}

const WordCloudSimple: React.FC<WordCloudProps> = ({ text, width = 800, height = 400, className = "" }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lista de stopwords em português
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if', 'up', 'out', 'many',
    'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has',
    'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'oil',
    'sit', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
    // Portuguese stopwords
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no',
    'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'após', 'ante', 'até', 'contra',
    'entre', 'perante', 'segundo', 'durante', 'mediante', 'salvo', 'exceto', 'menos', 'conforme',
    'consoante', 'como', 'que', 'se', 'quando', 'onde', 'porque', 'porquê', 'já', 'não', 'nem',
    'mas', 'porém', 'contudo', 'todavia', 'entretanto', 'logo', 'pois', 'portanto', 'assim',
    'então', 'também', 'ainda', 'só', 'apenas', 'mesmo', 'até', 'inclusive', 'aliás', 'isto',
    'isso', 'aquilo', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
    'aquele', 'aquela', 'aqueles', 'aquelas', 'meu', 'minha', 'meus', 'minhas', 'teu', 'tua',
    'teus', 'tuas', 'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas',
    'vosso', 'vossa', 'vossos', 'vossas', 'dele', 'dela', 'deles', 'delas', 'me', 'te', 'se',
    'nos', 'vos', 'lhe', 'lhes', 'mim', 'ti', 'si', 'nós', 'vós', 'eles', 'elas', 'eu', 'tu',
    'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'ser', 'estar', 'ter', 'haver', 'ir', 'vir',
    'ver', 'dar', 'saber', 'poder', 'querer', 'fazer', 'dizer', 'falar', 'pôr', 'trazer',
    'levar', 'ficar', 'passar', 'chegar', 'sair', 'voltar', 'entrar', 'começar', 'acabar',
    'parar', 'continuar', 'seguir', 'deixar', 'tomar', 'encontrar', 'procurar', 'olhar',
    'muito', 'pouco', 'mais', 'menos', 'tanto', 'quanto', 'tão', 'bem', 'mal', 'melhor',
    'pior', 'maior', 'menor', 'grande', 'pequeno', 'novo', 'velho', 'jovem', 'primeiro',
    'último', 'próximo', 'anterior', 'seguinte', 'outro', 'mesmo', 'próprio', 'certo',
    'errado', 'verdadeiro', 'falso', 'possível', 'impossível', 'fácil', 'difícil',
    'simples', 'complicado', 'importante', 'necessário', 'suficiente', 'bastante'
  ]);

  const colors = [
    '#174A8B', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
    '#1E40AF', '#1D4ED8', '#2DD4BF', '#06B6D4', '#0891B2'
  ];

  const processText = (text: string): { text: string; value: number }[] => {
    if (!text) return [];
    
    // Limpa e divide o texto
    const words = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Conta frequência
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Converte para array e ordena
    return Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 80); // Limita a 80 palavras
  };

  const positionWords = (words: { text: string; value: number }[]): WordData[] => {
    if (words.length === 0) return [];

    const centerX = width / 2;
    const centerY = height / 2;
    const positioned: WordData[] = [];
    const padding = 20; // Maior espaçamento entre palavras

    // Calcula tamanhos de fonte baseado na frequência (escala logarítmica)
    const maxValue = Math.max(...words.map(w => w.value));
    const minValue = Math.min(...words.map(w => w.value));

    // Ordena palavras por frequência (maiores primeiro para melhor posicionamento)
    const sortedWords = [...words].sort((a, b) => b.value - a.value);

    sortedWords.forEach((word, index) => {
      // Escala mais conservadora para melhor legibilidade
      const normalizedValue = (word.value - minValue) / (maxValue - minValue || 1);
      const fontSize = Math.max(18, Math.min(42, 18 + normalizedValue * 24)); // Menos variação de tamanho
      
      // Cor baseada na frequência (palavras mais frequentes em cores mais escuras)
      const colorIndex = Math.floor((1 - normalizedValue) * (colors.length - 1));
      const color = colors[colorIndex];
      
      // Apenas rotações horizontais e verticais para melhor legibilidade
      const rotationOptions = [0, 0, 0, 0, 0, 90]; // 83% horizontal, 17% vertical
      const rotate = rotationOptions[Math.floor(Math.random() * rotationOptions.length)];

      let placed = false;
      let attempts = 0;
      const maxAttempts = 300; // Mais tentativas para melhor layout
      let x = centerX;
      let y = centerY;

      // Algoritmo spiral aprimorado (Archimedean)
      while (!placed && attempts < maxAttempts) {
        if (attempts === 0 && positioned.length === 0) {
          // Primeira palavra no centro
          x = centerX;
          y = centerY;
        } else {
          // Spiral mais espaçado para melhor distribuição
          const theta = attempts * 0.5; // Ângulo maior para mais espaçamento
          const radius = 4 * Math.sqrt(attempts); // Crescimento mais espaçado
          x = centerX + radius * Math.cos(theta);
          y = centerY + radius * Math.sin(theta);
        }

        // Estimativa mais precisa do tamanho da palavra
        const charWidth = fontSize * 0.6; // Média de largura por caractere
        const estimatedWidth = word.text.length * charWidth;
        const estimatedHeight = fontSize * 1.2; // Altura com espaçamento
        
        // Verifica limites da área com margem
        const margin = 20;
        if (x - estimatedWidth/2 > margin && 
            x + estimatedWidth/2 < width - margin &&
            y - estimatedHeight/2 > margin && 
            y + estimatedHeight/2 < height - margin) {
          
          // Verifica sobreposição com detecção melhorada
          let overlaps = false;
          for (const positioned_word of positioned) {
            // Cálculo mais preciso de bounding boxes
            const word1Box = {
              left: x - estimatedWidth/2,
              right: x + estimatedWidth/2,
              top: y - estimatedHeight/2,
              bottom: y + estimatedHeight/2
            };
            
            const word2Width = positioned_word.text.length * positioned_word.size * 0.6;
            const word2Height = positioned_word.size * 1.2;
            const word2Box = {
              left: positioned_word.x - word2Width/2,
              right: positioned_word.x + word2Width/2,
              top: positioned_word.y - word2Height/2,
              bottom: positioned_word.y + word2Height/2
            };
            
            // Verifica sobreposição de retângulos com padding
            if (!(word1Box.right + padding < word2Box.left || 
                  word1Box.left - padding > word2Box.right || 
                  word1Box.bottom + padding < word2Box.top || 
                  word1Box.top - padding > word2Box.bottom)) {
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

      // Fallback melhorado se não conseguir posicionar
      if (!placed) {
        // Tenta posições aleatórias em áreas menos densas
        for (let fallbackAttempt = 0; fallbackAttempt < 50; fallbackAttempt++) {
          const estimatedWidth = word.text.length * fontSize * 0.6;
          const estimatedHeight = fontSize * 1.2;
          const margin = 30;
          
          x = margin + Math.random() * (width - 2 * margin - estimatedWidth) + estimatedWidth/2;
          y = margin + Math.random() * (height - 2 * margin - estimatedHeight) + estimatedHeight/2;
          
          // Verifica se essa posição tem menos conflitos
          let conflicts = 0;
          for (const positioned_word of positioned) {
            const distance = Math.sqrt(
              Math.pow(x - positioned_word.x, 2) + 
              Math.pow(y - positioned_word.y, 2)
            );
            if (distance < 100) conflicts++; // Conta palavras próximas
          }
          
          if (conflicts < 3) { // Aceita posição com poucos conflitos
            placed = true;
            break;
          }
        }
      }

      // Se ainda não conseguiu, força uma posição
      if (!placed) {
        const angle = (index / sortedWords.length) * 2 * Math.PI;
        const radius = 150 + Math.random() * 100;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
        
        // Garante que está dentro dos limites
        x = Math.max(50, Math.min(width - 50, x));
        y = Math.max(30, Math.min(height - 30, y));
      }

      positioned.push({
        text: word.text,
        value: word.value,
        x,
        y,
        size: fontSize,
        color,
        rotate
      });
    });

    return positioned;
  };

  const words = useMemo(() => processText(text || ''), [text]);
  const positionedWords = useMemo(() => positionWords(words), [words, width, height]);

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

  if (!text || words.length === 0) {
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
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <svg width={width} height={height} className="w-full h-auto">
        <rect width={width} height={height} fill="white" />
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
            fontWeight={word.value > 3 ? 'bold' : 'normal'}
            transform={`rotate(${word.rotate} ${word.x} ${word.y})`}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = `rotate(${word.rotate} ${word.x} ${word.y}) scale(1.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = `rotate(${word.rotate} ${word.x} ${word.y}) scale(1)`;
            }}
          >
            {word.text}
            <title>{`"${word.text}" aparece ${word.value} vez${word.value > 1 ? 'es' : ''}`}</title>
          </text>
        ))}
      </svg>
      
      {/* Legenda */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{words.length} palavras únicas encontradas</span>
          <span>Hover para ver frequência</span>
        </div>
      </div>
    </div>
  );
};

export default WordCloudSimple;
