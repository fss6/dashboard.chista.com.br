# Componentes Reutilizáveis

## LoadingSpinner

Componente de loading reutilizável com animações e design consistente com a marca Chista. **Agora funciona como um modal transparente que cobre toda a tela.**

### Uso Básico

```jsx
import LoadingSpinner from "../components/LoadingSpinner";

// Uso simples
<LoadingSpinner />

// Com mensagem personalizada
<LoadingSpinner 
  message="Carregando dados..." 
  subtitle="Aguarde um momento"
/>
```

### Props Disponíveis

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `message` | string | "Carregando..." | Mensagem principal do loading |
| `subtitle` | string | "Aguarde enquanto processamos suas informações" | Subtítulo explicativo |
| `showLogo` | boolean | true | Se deve mostrar o logo da Chista no centro |
| `size` | "small" \| "default" \| "large" | "default" | Tamanho do spinner e textos |

### Exemplos de Uso

#### Loading Padrão
```jsx
<LoadingSpinner />
```

#### Loading Personalizado para Batches
```jsx
<LoadingSpinner 
  message="Carregando batches..." 
  subtitle="Aguarde enquanto buscamos suas informações"
/>
```

#### Loading Pequeno (para componentes menores)
```jsx
<LoadingSpinner 
  size="small"
  message="Salvando..."
  showLogo={false}
/>
```

#### Loading Grande (para telas de inicialização)
```jsx
<LoadingSpinner 
  size="large"
  message="Inicializando aplicação..."
  subtitle="Carregando todos os recursos necessários"
/>
```

### Características

- ✅ **Modal Transparente**: Cobre toda a tela com overlay transparente
- ✅ **Backdrop Blur**: Efeito de desfoque no fundo para melhor foco
- ✅ **Responsivo**: Adapta-se a diferentes tamanhos de tela
- ✅ **Animado**: Spinner giratório + pontos com bounce
- ✅ **Branding**: Cores e logo da Chista integrados
- ✅ **Customizável**: Múltiplas opções de personalização
- ✅ **Acessível**: Textos descritivos para screen readers
- ✅ **Performance**: Otimizado com CSS puro
- ✅ **Z-Index Alto**: Garante que fique sobre outros elementos

### Implementação em Páginas

#### Página Principal
```jsx
if (isLoading) return <LoadingSpinner message="Carregando..." subtitle="Inicializando aplicação" />;
```

#### Página de Batches
```jsx
if (isLoading || (isAuthenticated && !batches && !error)) {
  return (
    <LoadingSpinner 
      message="Carregando batches..." 
      subtitle="Aguarde enquanto buscamos suas informações"
    />
  );
}
```

#### Componente Menor
```jsx
<LoadingSpinner 
  size="small"
  message="Processando..."
  showLogo={false}
/>
```

### Design do Modal

O componente agora funciona como um modal com:
- **Overlay**: `bg-black/20` com `backdrop-blur-sm`
- **Card**: `bg-white/95` com `backdrop-blur-md` e bordas arredondadas
- **Sombra**: `shadow-2xl` para destaque
- **Z-Index**: `z-50` para ficar sobre outros elementos
- **Posicionamento**: `fixed inset-0` para cobrir toda a tela 