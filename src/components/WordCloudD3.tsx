"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import cloud from 'd3-cloud';

interface WordCloudProps {
  text?: string;
  width?: number;
  height?: number;
  className?: string;
}

interface WordData {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
}

const WordCloudD3: React.FC<WordCloudProps> = ({ 
  text, 
  width = 800, 
  height = 400, 
  className = "" 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lista extensa de stopwords em português e inglês
  const stopWords = new Set([
    // English stopwords
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'this', 'but', 'they',
    'have', 'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if', 'up', 'out', 'many',
    'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him',
    'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who',
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
    'vosso', 'vossa', 'vossos', 'vossas', 'dele', 'dela', 'deles', 'delas', 'me', 'te',
    'nos', 'vos', 'lhe', 'lhes', 'mim', 'ti', 'si', 'nós', 'vós', 'eles', 'elas', 'eu', 'tu',
    'ele', 'ela', 'ser', 'estar', 'ter', 'haver', 'ir', 'vir', 'ver', 'dar', 'saber', 'poder',
    'querer', 'fazer', 'dizer', 'falar', 'pôr', 'trazer', 'levar', 'ficar', 'passar', 'chegar',
    'sair', 'voltar', 'entrar', 'começar', 'acabar', 'parar', 'continuar', 'seguir', 'deixar',
    'tomar', 'encontrar', 'procurar', 'olhar', 'muito', 'pouco', 'mais', 'menos', 'tanto',
    'quanto', 'tão', 'bem', 'mal', 'melhor', 'pior', 'maior', 'menor', 'grande', 'pequeno',
    'novo', 'velho', 'jovem', 'primeiro', 'último', 'próximo', 'anterior', 'seguinte', 'outro',
    'mesmo', 'próprio', 'certo', 'errado', 'verdadeiro', 'falso', 'possível', 'impossível',
    'fácil', 'difícil', 'simples', 'complicado', 'importante', 'necessário', 'suficiente', 'bastante'
  ]);

  // Paleta de cores harmonizada com o brand
  const colors = [
    '#174A8B', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
    '#1E40AF', '#1D4ED8', '#2DD4BF', '#06B6D4', '#0891B2'
  ];
  
  const getColor = (index: number) => colors[index % colors.length];

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

    // Converte para array, ordena e limita
    const wordArray = Object.entries(wordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Máximo 100 palavras

    // Calcula tamanhos de fonte usando escala logarítmica
    const maxValue = Math.max(...wordArray.map(w => w.value));
    const minValue = Math.min(...wordArray.map(w => w.value));
    
    return wordArray.map(word => ({
      text: word.text,
      size: Math.max(12, Math.min(60, 12 + ((word.value - minValue) / (maxValue - minValue || 1)) * 48))
    }));
  }, [text]);

  useEffect(() => {
    if (!isClient || !svgRef.current || !processedWords.length) return;

    setIsLoading(true);
    
    // Limpa o SVG
    const svg = svgRef.current;
    svg.innerHTML = '';

    // Configuração do layout d3-cloud
    const layout = cloud()
      .size([width, height])
      .words(processedWords)
      .padding(5)
      .rotate(() => ~~(Math.random() * 6 - 3) * 20) // Rotação entre -60 e 60 graus
      .font("Inter, system-ui, sans-serif")
      .fontSize(d => d.size)
      .spiral("archimedean") // Spiral archimedean é mais eficiente
      .random(() => 0.5) // Seed fixo para consistência
      .on("end", (words: WordData[]) => {
        // Cria grupo centralizado
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${width/2},${height/2})`);
        svg.appendChild(g);

        // Renderiza as palavras
        words.forEach((word, index) => {
          const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
          
          // Atributos básicos
          textElement.setAttribute("x", "0");
          textElement.setAttribute("y", "0");
          textElement.setAttribute("text-anchor", "middle");
          textElement.setAttribute("dominant-baseline", "central");
          textElement.setAttribute("transform", `translate(${word.x},${word.y})rotate(${word.rotate})`);
          
          // Estilos
          textElement.style.fontSize = `${word.size}px`;
          textElement.style.fontFamily = "Inter, system-ui, sans-serif";
          textElement.style.fontWeight = word.size > 30 ? "bold" : "normal";
          textElement.style.fill = getColor(index);
          textElement.style.cursor = "pointer";
          textElement.style.transition = "all 0.2s ease";
          
          // Texto
          textElement.textContent = word.text;
          
          // Tooltip
          const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
          const originalWord = processedWords.find(w => w.text === word.text);
          const frequency = originalWord ? Math.round(originalWord.size / 12) : 1;
          title.textContent = `"${word.text}" aparece ${frequency} vez${frequency > 1 ? 'es' : ''}`;
          textElement.appendChild(title);
          
          // Eventos de hover
          textElement.addEventListener("mouseenter", () => {
            textElement.style.opacity = "0.7";
            textElement.style.transform = `translate(${word.x}px,${word.y}px)rotate(${word.rotate}deg) scale(1.1)`;
          });
          
          textElement.addEventListener("mouseleave", () => {
            textElement.style.opacity = "1";
            textElement.style.transform = `translate(${word.x}px,${word.y}px)rotate(${word.rotate}deg) scale(1)`;
          });
          
          g.appendChild(textElement);
        });

        setIsLoading(false);
      });

    // Inicia o layout
    layout.start();

  }, [isClient, processedWords, width, height, getColor]);

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
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center text-gray-500">
            <div className="animate-spin text-2xl mb-2">⚙️</div>
            <p>Gerando nuvem de palavras...</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ background: 'white' }}
        />
      </div>
      
      {/* Legenda */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{processedWords.length} palavras únicas encontradas</span>
          <span>Powered by D3-Cloud • Hover para detalhes</span>
        </div>
      </div>
    </div>
  );
};

export default WordCloudD3;
