"use client";
import React from 'react';
import { TrendingUp, Zap, Heart } from 'lucide-react';

export default function SatisfactionIndicators({ indicators }) {
  // Se indicators for uma string, tenta fazer parse
  let parsedIndicators = indicators;
  if (typeof indicators === 'string') {
    try {
      parsedIndicators = JSON.parse(indicators);
    } catch (error) {
      console.error('Erro ao fazer parse dos indicators:', error);
    }
  }
  
  if (!parsedIndicators || typeof parsedIndicators !== 'object') {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
          <TrendingUp className="w-full h-full" />
        </div>
        <p>Nenhum indicador de satisfação disponível</p>
        <p className="text-sm mt-2">Os indicadores serão calculados automaticamente após o processamento</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-green-200 dark:divide-gray-700">
          
          {/* NPS - Net Promoter Score */}
          <div className="p-6">
             <div className="text-center mb-4">
               <div className="flex items-center justify-center mb-2">
                 <div className="flex items-center space-x-1 mr-3">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 </div>
                 <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">NPS</span>
               </div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Net Promoter Score</p>
             </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">De 0 a 10, o quanto você recomendaria a empresa para um amigo ou familiar?</p>
              </div>
              
                             {parsedIndicators.nps && (
                 <div className="text-center">
                   <div className={`text-3xl font-bold mb-2 ${
                     parsedIndicators.nps.pontuacao >= 9 
                       ? 'text-green-600' 
                       : parsedIndicators.nps.pontuacao >= 7 
                         ? 'text-yellow-600' 
                         : 'text-red-600'
                   }`}>
                     {parsedIndicators.nps.pontuacao}/10
                   </div>
                   <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     {parsedIndicators.nps.pontuacao >= 9 
                       ? 'Promotor' 
                       : parsedIndicators.nps.pontuacao >= 7 
                         ? 'Neutro' 
                         : 'Detrator'
                     }
                   </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {parsedIndicators.nps.justificativa}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CES - Customer Effort Score */}
          <div className="p-6">
             <div className="text-center mb-4">
               <div className="flex items-center justify-center mb-2">
                 <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                 </div>
                 <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">CES</span>
               </div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Customer Effort Score</p>
             </div>
            
            <div className="space-y-4">
                             <div className="text-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Mede o esforço necessário para resolver uma situação ou completar uma tarefa.</p>
               </div>
              
                             {parsedIndicators.ces && (
                 <div className="text-center">
                   <div className={`text-3xl font-bold mb-2 ${
                     parsedIndicators.ces.pontuacao >= 6 
                       ? 'text-green-600' 
                       : parsedIndicators.ces.pontuacao >= 4 
                         ? 'text-yellow-600' 
                         : 'text-red-600'
                   }`}>
                     {parsedIndicators.ces.pontuacao}/7
                   </div>
                   <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     {parsedIndicators.ces.pontuacao === 7 
                       ? 'Muito Fácil' 
                       : parsedIndicators.ces.pontuacao >= 5 
                         ? 'Fácil' 
                         : parsedIndicators.ces.pontuacao >= 3 
                           ? 'Neutro'
                           : 'Difícil'
                     }
                   </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {parsedIndicators.ces.justificativa}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CSAT - Customer Satisfaction Score */}
          <div className="p-6">
             <div className="text-center mb-4">
               <div className="flex items-center justify-center mb-2">
                 <div className="flex items-center space-x-1 mr-3">
                   <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                     <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                     <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                   </div>
                 </div>
                 <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSAT</span>
               </div>
               <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction Score</p>
             </div>
            
            <div className="space-y-4">
                             <div className="text-center">
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Mede o nível de satisfação geral com a experiência do cliente.</p>
               </div>
              
                             {parsedIndicators.csat && (
                 <div className="text-center">
                   <div className={`text-3xl font-bold mb-2 ${
                     parsedIndicators.csat.pontuacao >= 4 
                       ? 'text-green-600' 
                       : parsedIndicators.csat.pontuacao >= 3 
                         ? 'text-yellow-600' 
                         : 'text-red-600'
                   }`}>
                     {parsedIndicators.csat.pontuacao}/5
                   </div>
                   <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                     {parsedIndicators.csat.pontuacao === 5 
                       ? 'Muito Satisfeito' 
                       : parsedIndicators.csat.pontuacao === 4 
                         ? 'Satisfeito' 
                         : parsedIndicators.csat.pontuacao === 3 
                           ? 'Neutro'
                           : parsedIndicators.csat.pontuacao === 2 
                             ? 'Insatisfeito'
                             : 'Muito Insatisfeito'
                     }
                   </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {parsedIndicators.csat.justificativa}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
