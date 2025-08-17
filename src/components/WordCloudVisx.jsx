"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';

const WordCloudVisx = ({ text, width = 800, height = 400, className = "" }) => {
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

  const processText = (text) => {
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
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Converte para array e ordena
    return Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Limita a 100 palavras
  };

  const words = useMemo(() => processText(text), [text]);

  const colors = [
    '#174A8B', // Azul principal
    '#2563EB', // Azul secundário
    '#3B82F6', // Azul médio
    '#60A5FA', // Azul claro
    '#93C5FD', // Azul muito claro
    '#1E40AF', // Azul escuro
    '#1D4ED8', // Azul intermediário
    '#2DD4BF', // Verde-azulado
    '#06B6D4', // Ciano
    '#0891B2'  // Ciano escuro
  ];

  // Função simples para tamanhos de fonte
  const fontSizeSetter = useMemo(() => {
    if (words.length === 0) return () => 16;
    
    const minValue = Math.min(...words.map((w) => w.value));
    const maxValue = Math.max(...words.map((w) => w.value));
    
    // Escala linear simples
    return (datum) => {
      const normalizedValue = (datum.value - minValue) / (maxValue - minValue);
      return Math.max(14, Math.min(50, 14 + normalizedValue * 36));
    };
  }, [words]);

  const fixedValueGenerator = () => 0.5;

  const getRotationDegree = () => {
    const rand = Math.random();
    const degree = rand > 0.5 ? 30 : -30;
    return rand * degree;
  };

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
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="white" rx={8} />
        <Wordcloud
          words={words}
          width={width}
          height={height}
          fontSize={fontSizeSetter}
          font="Inter, system-ui, sans-serif"
          padding={2}
          spiral="archimedean"
          rotate={getRotationDegree}
          random={fixedValueGenerator}
        >
          {(cloudWords) =>
            cloudWords.map((word, index) => (
              <text
                key={word.text}
                fill={colors[index % colors.length]}
                textAnchor="middle"
                transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                fontSize={word.size}
                fontFamily={word.font}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
                title={`"${word.text}" aparece ${word.value} vez${word.value > 1 ? 'es' : ''}`}
              >
                {word.text}
              </text>
            ))
          }
        </Wordcloud>
      </svg>
      
      {/* Legenda */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{words.length} palavras únicas encontradas</span>
          <span>Hover para ver frequência</span>
        </div>
      </div>
    </div>
  );
};

export default WordCloudVisx;
