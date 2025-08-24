# Otimizações de Performance

## Problema Identificado

O sistema estava fazendo requisições desnecessárias ao Auth0 a cada renderização, causando lentidão na aplicação.

## Soluções Implementadas

### 1. Cache de Token (`auth.js`)

**Problema**: O token do Auth0 era buscado a cada renderização
**Solução**: Cache do token por 5 minutos

```javascript
// Cache para o token da API
let cachedToken = null;
let tokenExpiry = null;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
```

**Benefícios**:
- ✅ Reduz requisições ao Auth0
- ✅ Token válido por 5 minutos
- ✅ Limpeza automática do cache

### 2. Cache de API (`api.js`)

**Problema**: Requisições repetidas à API sem cache
**Solução**: Cache de respostas da API por 2 minutos

```javascript
const apiCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
```

**Benefícios**:
- ✅ Reduz requisições à API
- ✅ Respostas instantâneas para dados em cache
- ✅ Cache por URL + token

### 3. Contexto de Autenticação (`AuthContext.jsx`)

**Problema**: Estado de autenticação espalhado pela aplicação
**Solução**: Contexto global com estado otimizado

```javascript
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
```

**Benefícios**:
- ✅ Estado centralizado
- ✅ Reduz re-renderizações
- ✅ Limpeza automática de cache no logout

### 4. Sistema de Loading Inteligente (`api.js`)

**Problema**: Loading não esperava dados carregarem completamente
**Solução**: Hook `useLoadingState` para gerenciar estados de loading

```javascript
const { shouldShowLoading, message, subtitle } = useLoadingState(
  isLoading,    // authLoading
  dataLoading,  // dataLoading
  !!data,       // hasData
  !!error       // hasError
);
```

**Benefícios**:
- ✅ Loading espera dados carregarem completamente
- ✅ Mensagens personalizadas por tipo de loading
- ✅ Estados de loading bem definidos

## Como Usar

### Hook de Autenticação Otimizado

```javascript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading, chistaApiToken } = useAuth();
  
  // O token já vem com cache
  // isLoading é otimizado
}
```

### Requisições com Cache

```javascript
import { fetchWithCache } from "../lib/api";

// Requisição com cache automático
const data = await fetchWithCache(url, token);
```

### Sistema de Loading Inteligente

```javascript
import { useLoadingState } from "../lib/api";

function MyPage() {
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { shouldShowLoading, message, subtitle } = useLoadingState(
    authLoading,  // Se auth está carregando
    dataLoading,  // Se dados estão carregando
    !!data,       // Se há dados
    !!error       // Se há erro
  );

  if (shouldShowLoading) {
    return <LoadingSpinner message={message} subtitle={subtitle} />;
  }
}
```

### Limpeza de Cache

```javascript
import { clearTokenCache, clearApiCache } from "../lib/auth";
import { clearApiCache } from "../lib/api";

// Limpar cache manualmente
clearTokenCache();
clearApiCache();
```

## Performance Esperada

### Antes das Otimizações
- ❌ Requisição ao Auth0 a cada renderização
- ❌ Requisição à API a cada navegação
- ❌ Loading lento e frequente
- ❌ Estado não centralizado
- ❌ Loading parava antes dos dados carregarem

### Depois das Otimizações
- ✅ Token em cache por 5 minutos
- ✅ Respostas da API em cache por 2 minutos
- ✅ Loading otimizado e inteligente
- ✅ Estado centralizado e eficiente
- ✅ Loading espera dados carregarem completamente

## Estados de Loading

### 1. Autenticação (authLoading)
- **Mensagem**: "Carregando..."
- **Subtítulo**: "Aguarde enquanto inicializamos"
- **Quando**: Durante verificação do Auth0

### 2. Dados (dataLoading)
- **Mensagem**: "Carregando dados..."
- **Subtítulo**: "Buscando informações"
- **Quando**: Durante requisições à API

### 3. Inicialização
- **Mensagem**: "Inicializando..."
- **Subtítulo**: "Preparando aplicação"
- **Quando**: Estado inicial da aplicação

## Monitoramento

### Cache de Token
- Duração: 5 minutos
- Limpeza automática no logout
- Limpeza manual disponível

### Cache de API
- Duração: 2 minutos
- Cache por URL + token
- Limpeza automática em erros

### Loading Inteligente
- Detecta se token está em cache
- Mensagens personalizadas
- Reduz tempo de espera
- **Aguarda dados carregarem completamente**

## Configuração

### Duração do Cache
```javascript
// Em auth.js
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Em api.js
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
```

### Limpeza Automática
- Logout: Limpa todos os caches
- Erro de API: Remove cache específico
- Refresh manual: Disponível via `refreshToken()`

### Estados de Loading
- **shouldShowLoading**: Determina se deve mostrar loading
- **message**: Mensagem principal do loading
- **subtitle**: Subtítulo explicativo
- **Lógica**: `authLoading || dataLoading || (!hasData && !hasError)` 

# Lib Utils - Sistema Centralizado de Status

## Status de Insights

### Constantes Disponíveis

```javascript
import { INSIGHT_STATUSES } from '../lib/utils';

// Status disponíveis:
INSIGHT_STATUSES.AWAITING_UPLOAD    // 'awaiting_upload'
INSIGHT_STATUSES.READY_TO_PROCESS   // 'ready_to_process'
INSIGHT_STATUSES.READY_TO_ANALYZE   // 'ready_to_analyze'
INSIGHT_STATUSES.SENT_TO_PROCESS    // 'sent_to_process'
INSIGHT_STATUSES.ANALYZED           // 'analyzed'
INSIGHT_STATUSES.ERROR              // 'error'
```

### Funções Utilitárias

#### `getStatusTranslation(status)`
Retorna a tradução em português do status.

```javascript
import { getStatusTranslation } from '../lib/utils';

getStatusTranslation('awaiting_upload')     // 'Aguardando Upload'
getStatusTranslation('ready_to_process')    // 'Aguardando Processamento'
getStatusTranslation('ready_to_analyze')    // 'Pronto para análise'
getStatusTranslation('sent_to_process')     // 'Processando'
getStatusTranslation('analyzed')            // 'Analizado'
getStatusTranslation('error')               // 'Erro'
```

#### `getStatusColor(status)`
Retorna as classes CSS do Tailwind para estilização do status.

```javascript
import { getStatusColor } from '../lib/utils';

getStatusColor('awaiting_upload')     // 'bg-gray-100 text-gray-800'
getStatusColor('ready_to_process')    // 'bg-green-100 text-green-800'
getStatusColor('ready_to_analyze')    // 'bg-yellow-100 text-yellow-800'
getStatusColor('sent_to_process')     // 'bg-blue-100 text-blue-800'
getStatusColor('analyzed')            // 'bg-purple-100 text-purple-800'
getStatusColor('error')               // 'bg-red-100 text-red-800'
```

### Exemplo de Uso

```javascript
import { getStatusTranslation, getStatusColor } from '../lib/utils';

// Em um componente React
<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(insight.status)}`}>
  {getStatusTranslation(insight.status)}
</span>
```

### Benefícios

1. **Centralização**: Todas as definições de status em um só lugar
2. **Consistência**: Mesmas traduções e cores em toda a aplicação
3. **Manutenibilidade**: Mudanças em um só lugar refletem em toda a app
4. **Type Safety**: Constantes predefinidas evitam erros de digitação
5. **Reutilização**: Funções podem ser usadas em qualquer componente

### Adicionando Novos Status

Para adicionar um novo status:

1. Adicione a constante em `INSIGHT_STATUSES`
2. Adicione a tradução em `getStatusTranslation()`
3. Adicione as cores em `getStatusColor()`

```javascript
// 1. Adicionar constante
export const INSIGHT_STATUSES = {
  // ... status existentes
  NEW_STATUS: 'new_status'
};

// 2. Adicionar tradução
export const getStatusTranslation = (status) => {
  switch (status) {
    // ... casos existentes
    case INSIGHT_STATUSES.NEW_STATUS:
      return 'Novo Status';
    default:
      return status || 'Desconhecido';
  }
};

// 3. Adicionar cores
export const getStatusColor = (status) => {
  switch (status) {
    // ... casos existentes
    case INSIGHT_STATUSES.NEW_STATUS:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
``` 