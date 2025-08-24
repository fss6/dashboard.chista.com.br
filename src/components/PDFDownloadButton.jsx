import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FileDown, Download } from 'lucide-react';
import CommercialReportPDF from './CommercialReportPDF';

const PDFDownloadButton = ({ insight, insightId, className = "" }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Gerar o PDF
      const blob = await pdf(<CommercialReportPDF insight={insight} insightId={insightId} />).toBlob();
      
      // Criar URL do blob
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-comercial-insight-${insightId}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Simular clique no link
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verificar se há dados suficientes para gerar o PDF
  const hasStructuredData = insight?.insight?.as_structured_json;
  const hasIndicators = insight?.insight?.sentiment_analysis?.indicadores_satisfacao;

  if (!hasStructuredData || !hasIndicators) {
    return (
      <button
        disabled
        className={`flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
        title="Dados insuficientes para gerar relatório"
      >
        <FileDown className="w-4 h-4" />
        <span>Gerar PDF</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`flex items-center space-x-2 px-4 py-2 bg-[#174A8B] text-white rounded-lg hover:bg-[#0F3A6B] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Gerando...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Gerar PDF</span>
        </>
      )}
    </button>
  );
};

export default PDFDownloadButton;
