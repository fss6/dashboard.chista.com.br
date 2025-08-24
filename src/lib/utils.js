import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Status management for insights
export const INSIGHT_STATUSES = {
  AWAITING_UPLOAD: 'awaiting_upload',
  READY_TO_PROCESS: 'ready_to_process',
  READY_TO_ANALYZE: 'ready_to_analyze',
  SENT_TO_PROCESS: 'sent_to_process',
  ANALYZED: 'analyzed',
  ERROR: 'error'
};

export const getStatusTranslation = (status) => {
  switch (status) {
    case INSIGHT_STATUSES.AWAITING_UPLOAD:
      return 'Aguardando Upload';
    case INSIGHT_STATUSES.READY_TO_PROCESS:
      return 'Aguardando Processamento';
    case INSIGHT_STATUSES.READY_TO_ANALYZE:
      return 'Pronto para análise';
    case INSIGHT_STATUSES.SENT_TO_PROCESS:
      return 'Processando';
    case INSIGHT_STATUSES.ANALYZED:
      return 'Analizado';
    case INSIGHT_STATUSES.ERROR:
      return 'Erro';
    default:
      return status || 'Desconhecido';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case INSIGHT_STATUSES.AWAITING_UPLOAD:
      return 'bg-gray-100 text-gray-800';
    case INSIGHT_STATUSES.READY_TO_PROCESS:
      return 'bg-green-100 text-green-800';
    case INSIGHT_STATUSES.READY_TO_ANALYZE:
      return 'bg-yellow-100 text-yellow-800';
    case INSIGHT_STATUSES.SENT_TO_PROCESS:
      return 'bg-blue-100 text-blue-800';
    case INSIGHT_STATUSES.ANALYZED:
      return 'bg-purple-100 text-purple-800';
    case INSIGHT_STATUSES.ERROR:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 