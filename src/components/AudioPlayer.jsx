"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, RotateCcw, FastForward } from 'lucide-react';

const AudioPlayer = ({ audioUrl, title = "Áudio", className = "" }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Formatação de tempo
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Teste de conectividade da URL
  useEffect(() => {
    if (audioUrl) {
      console.log('Testing audio URL connectivity:', audioUrl);
      
      // Fazer um HEAD request para testar se a URL está acessível
      fetch(audioUrl, { method: 'HEAD' })
        .then(response => {
          console.log('Audio URL test response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
        })
        .catch(error => {
          console.error('Audio URL test failed:', error);
        });
    }
  }, [audioUrl]);

  // Event listeners do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log('Setting up audio element with URL:', audioUrl);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Audio error details:', {
        error: e,
        audioUrl: audioUrl,
        errorCode: e.target?.error?.code,
        errorMessage: e.target?.error?.message,
        networkState: e.target?.networkState,
        readyState: e.target?.readyState
      });
      
      // Mapear códigos de erro para mensagens mais específicas
      let errorMessage = 'Erro ao carregar o áudio';
      if (e.target?.error) {
        switch(e.target.error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMessage = 'Carregamento do áudio foi cancelado';
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMessage = 'Erro de rede ao carregar o áudio';
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMessage = 'Erro ao decodificar o áudio';
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMessage = 'Formato de áudio não suportado';
            break;
          default:
            errorMessage = 'Erro desconhecido ao carregar o áudio';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // Controles do player
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
        setError('Erro ao reproduzir o áudio');
      });
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleRewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, currentTime - 10);
  };

  const handleFastForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Arquivo de áudio não disponível</p>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    
    if (audioRef.current) {
      // Force reload do áudio
      audioRef.current.load();
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-red-600">
          <Volume2 className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm mb-3">{error}</p>
          <div className="space-y-2">
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
              {audioUrl && (
                <button
                  onClick={() => window.open(audioUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Abrir Diretamente
                </button>
              )}
            </div>
            {audioUrl && (
              <div className="text-xs text-gray-600">
                <p>URL: {audioUrl.substring(0, 50)}...</p>
                <p>Tentativas: {retryCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Elemento de áudio */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin={retryCount > 0 ? "use-credentials" : "anonymous"}
        controls={false}
        key={`${audioUrl}-${retryCount}`}
      />

      {/* Controles principais */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Botão Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 bg-[#174A8B] text-white rounded-full hover:bg-[#123456] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>

        {/* Controles de navegação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRewind}
            className="p-2 text-gray-600 hover:text-[#174A8B] transition-colors"
            title="Voltar 10s"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleFastForward}
            className="p-2 text-gray-600 hover:text-[#174A8B] transition-colors"
            title="Avançar 10s"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #174A8B 0%, #174A8B ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Botão de download */}
        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-[#174A8B] transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Informações do áudio */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {duration > 0 && (
              <div>
                <span className="text-gray-500">Duração:</span>
                <span className="ml-2 font-medium text-gray-900">{formatTime(duration)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isLoading && (
              <span className="text-xs text-gray-500">Carregando...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
