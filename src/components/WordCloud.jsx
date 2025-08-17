"use client";
import React, { useMemo } from 'react';

const WordCloud = ({ text, width = 800, height = 400, className = "" }) => {
  // Stopwords em português mais completas
  const stopWords = new Set([
    'a', 'ao', 'aos', 'aquela', 'aquelas', 'aquele', 'aqueles', 'aquilo', 'as', 'até', 'com', 'como',
    'da', 'das', 'de', 'do', 'dos', 'e', 'é', 'ela', 'elas', 'ele', 'eles', 'em', 'entre', 'era',
    'eram', 'essa', 'essas', 'esse', 'esses', 'esta', 'está', 'estamos', 'estão', 'estar', 'estas',
    'estava', 'estavam', 'este', 'esteja', 'estejam', 'estejamos', 'estes', 'esteve', 'estive',
    'estivemos', 'estiver', 'estivera', 'estiveram', 'estiverem', 'estivermos', 'estivesse',
    'estivessem', 'estivéramos', 'estivéssemos', 'estou', 'eu', 'foi', 'fomos', 'for', 'fora',
    'foram', 'forem', 'formos', 'fosse', 'fossem', 'fui', 'fôramos', 'fôssemos', 'haja', 'hajam',
    'hajamos', 'havemos', 'havia', 'hei', 'houve', 'houvemos', 'houver', 'houvera', 'houveram',
    'houverei', 'houverem', 'houveremos', 'houveria', 'houveriam', 'houveríamos', 'houvermos',
    'houvesse', 'houvessem', 'houvéramos', 'houvéssemos', 'há', 'hão', 'isso', 'isto', 'já',
    'lhe', 'lhes', 'mais', 'mas', 'me', 'mesmo', 'meu', 'meus', 'minha', 'minhas', 'muito',
    'na', 'nas', 'nem', 'no', 'nos', 'nossa', 'nossas', 'nosso', 'nossos', 'num', 'numa',
    'não', 'nós', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'qual',
    'quando', 'que', 'quem', 'são', 'se', 'seja', 'sejam', 'sejamos', 'sem', 'ser', 'será',
    'serão', 'seria', 'seriam', 'seu', 'seus', 'só', 'sua', 'suas', 'sou', 'também', 'te',
    'tem', 'temos', 'tenha', 'tenham', 'tenhamos', 'tenho', 'ter', 'terei', 'teremos', 'teria',
    'teriam', 'teríamos', 'teu', 'teus', 'teve', 'tinha', 'tinham', 'tive', 'tivemos', 'tiver',
    'tivera', 'tiveram', 'tiverem', 'tivermos', 'tivesse', 'tivessem', 'tivéramos', 'tivéssemos',
    'tu', 'tua', 'tuas', 'tém', 'tínhamos', 'um', 'uma', 'você', 'vocês', 'vos', 'à', 'às',
    'éramos', 'então', 'sendo', 'tendo', 'vou', 'vai', 'vão', 'onde', 'agora', 'hoje', 'ontem',
    'aqui', 'ali', 'lá', 'bem', 'mal', 'sim', 'talvez', 'quero', 'quer', 'pode', 'posso',
    'deve', 'devo', 'fazer', 'dizer', 'falar', 'ver', 'saber', 'dar', 'ir', 'vir', 'ter',
    'estar', 'haver', 'sido', 'depois', 'antes', 'durante', 'sobre', 'sob', 'entre', 'contra',
    'através', 'desde', 'até', 'dentro', 'fora', 'acima', 'abaixo', 'atrás', 'frente', 'lado',
    'meio', 'vez', 'vezes', 'tempo', 'dia', 'ano', 'mês', 'hora', 'minuto', 'segundo', 'momento',
    'caso', 'forma', 'modo', 'jeito', 'maneira', 'tipo', 'coisa', 'parte', 'lugar', 'pessoa',
    'gente', 'mundo', 'vida', 'casa', 'trabalho', 'problema', 'situação', 'questão', 'resultado',
    'exemplo', 'processo', 'sistema', 'projeto', 'programa', 'serviço', 'produto', 'empresa',
    'mercado', 'cliente', 'valor', 'preço', 'custo', 'benefício', 'vantagem', 'oportunidade',
    'geral', 'pouco', 'tempo', 'seria', 'foram', 'assim', 'ainda', 'sempre', 'toda', 'todo',
    'todos', 'todas', 'cada', 'algum', 'alguma', 'alguns', 'algumas', 'outro', 'outra', 'outros',
    'outras', 'primeiro', 'primeira', 'segundo', 'segunda', 'último', 'última'
  ]);

  // Cores para as palavras
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d3', '#c7c7c7', '#dbdb8d', '#9edae5'
  ];

  // Função para posicionar palavras de forma mais inteligente
  const positionWords = (wordData, containerWidth, containerHeight) => {
    const positioned = [];
    const padding = 15;
    
    // Função para verificar se duas palavras se sobrepõem
    const checkOverlap = (word1, word2) => {
      const word1Width = word1.text.length * (word1.size * 0.6);
      const word1Height = word1.size;
      const word2Width = word2.text.length * (word2.size * 0.6);
      const word2Height = word2.size;
      
      return !(word1.x + word1Width + padding < word2.x ||
               word2.x + word2Width + padding < word1.x ||
               word1.y + word1Height + padding < word2.y ||
               word2.y + word2Height + padding < word1.y);
    };

    // Posicionar palavras uma por vez, evitando sobreposições
    wordData.forEach((word, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        let x, y;
        
        if (index === 0) {
          // Primeira palavra no centro
          x = containerWidth / 2 - (word.text.length * word.size * 0.3);
          y = containerHeight / 2;
        } else {
          // Outras palavras em espiral a partir do centro
          const angle = (attempts * 0.5) + (index * 0.8);
          const radius = 50 + (attempts * 8) + (index * 20);
          x = containerWidth / 2 + Math.cos(angle) * radius - (word.text.length * word.size * 0.3);
          y = containerHeight / 2 + Math.sin(angle) * radius;
        }
        
        // Verificar se está dentro dos limites
        const wordWidth = word.text.length * (word.size * 0.6);
        const wordHeight = word.size;
        
        if (x >= padding && 
            y >= padding && 
            x + wordWidth <= containerWidth - padding && 
            y + wordHeight <= containerHeight - padding) {
          
          const tempWord = { ...word, x, y };
          
          // Verificar sobreposição com palavras já posicionadas
          const hasOverlap = positioned.some(positionedWord => 
            checkOverlap(tempWord, positionedWord)
          );
          
          if (!hasOverlap) {
            positioned.push(tempWord);
            placed = true;
          }
        }
        
        attempts++;
      }
      
      // Se não conseguiu posicionar, coloca em posição aleatória
      if (!placed) {
        const wordWidth = word.text.length * (word.size * 0.6);
        const wordHeight = word.size;
        positioned.push({
          ...word,
          x: Math.random() * (containerWidth - wordWidth - padding * 2) + padding,
          y: Math.random() * (containerHeight - wordHeight - padding * 2) + padding
        });
      }
    });
    
    return positioned;
  };

  // Processar texto e gerar palavras
  const words = useMemo(() => {
    if (!text) return [];

    // Limpeza e normalização mais robusta
    const cleanText = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/gi, ' ') // Substitui pontuação por espaços
      .replace(/\d+/g, '') // Remove números
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Extrair palavras e filtrar
    const wordsArray = cleanText
      .split(' ')
      .filter(word => 
        word.length >= 3 && 
        !stopWords.has(word) && 
        word.trim() !== '' &&
        !/^\d+$/.test(word) // Remove números puros
      );

    // Contar frequências
    const wordCount = {};
    wordsArray.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Converter para array de objetos ordenado por frequência
    const sortedWords = Object.entries(wordCount)
      .filter(([, count]) => count >= 1) // Mínimo 1 ocorrência
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15) // Top 15 palavras para melhor layout
      .map(([word, count], index) => ({
        text: word,
        count: count,
        size: Math.max(20, Math.min(56, count * 10 + 24)), // Tamanhos maiores
        color: colors[index % colors.length],
        rotation: index % 3 === 0 ? (Math.random() - 0.5) * 30 : 0 // Algumas palavras rotacionadas
      }));

    // Posicionar palavras de forma inteligente
    return positionWords(sortedWords, width, height);
  }, [text, width, height]);

  if (!text) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <p>Nenhum texto disponível para gerar a nuvem de palavras</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <p>Não foi possível extrair palavras significativas do texto</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        style={{ width, height, minHeight: '400px' }}
      >
        {/* Background pattern sutil */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #174A8B 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Palavras */}
        {words.map((word, index) => (
          <div
            key={`${word.text}-${index}`}
            className="absolute select-none cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              fontSize: `${word.size}px`,
              color: word.color,
              fontWeight: index < 3 ? '800' : 'bold', // Palavras principais mais grossas
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transform: `rotate(${word.rotation}deg)`,
              transformOrigin: 'center left',
              textShadow: index < 3 
                ? '2px 2px 4px rgba(0,0,0,0.15)' // Sombra mais forte para palavras principais
                : '1px 1px 2px rgba(0,0,0,0.1)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
              // Gradient sutil para palavras principais
              background: index < 3 
                ? `linear-gradient(135deg, ${word.color}, ${word.color}dd)`
                : 'none',
              WebkitBackgroundClip: index < 3 ? 'text' : 'initial',
              WebkitTextFillColor: index < 3 ? 'transparent' : word.color,
              backgroundClip: index < 3 ? 'text' : 'initial'
            }}
            title={`${word.text} (${word.count} ${word.count === 1 ? 'ocorrência' : 'ocorrências'})`}
          >
            {word.text}
          </div>
        ))}
        
        {/* Overlay sutil nas bordas */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-blue-50/20" />
        </div>
      </div>
      
      {/* Estatísticas melhoradas */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>{words.length} palavras relevantes</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>{words.reduce((sum, word) => sum + word.count, 0)} ocorrências totais</span>
        </div>
      </div>
    </div>
  );
};

export default WordCloud;