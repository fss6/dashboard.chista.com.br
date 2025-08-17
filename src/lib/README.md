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