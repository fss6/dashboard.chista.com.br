# Dashboard CHISTA

Este é um projeto [Next.js](https://nextjs.org) para o dashboard do CHISTA, bootstrapped com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Funcionalidades

### 📊 Dashboard
- Visualização de insights e métricas
- Análise de dados de interações com clientes
- Relatórios e indicadores de satisfação

### 💬 Chat com IA
- Interface de chat moderna e responsiva
- Integração com API CHISTA para respostas inteligentes
- Histórico de conversas persistente
- Renderização de markdown para respostas formatadas
- Gerenciamento de conversas (criar, visualizar, deletar)

### 🔐 Autenticação
- Integração com Auth0
- Tokens JWT para API CHISTA
- Controle de acesso baseado em usuário

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# URL base da API do CHISTA (para buscar dados)
NEXT_PUBLIC_CHISTA_API_BASE_URL=http://localhost:3001

# URL base do próprio app React (para recursos estáticos como logo)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Getting Started

Primeiro, instale as dependências:

```bash
npm install
```

Em seguida, execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

Você pode começar a editar a página modificando `app/page.tsx`. A página atualiza automaticamente conforme você edita o arquivo.

## Chat com IA

O sistema inclui um chat inteligente integrado com a API CHISTA:

### Funcionalidades do Chat
- **Interface Moderna**: Design responsivo com sidebar para histórico de conversas
- **Respostas Inteligentes**: Integração direta com a API CHISTA para respostas contextuais
- **Histórico Persistente**: Conversas salvas no backend para acesso de qualquer dispositivo
- **Markdown Support**: Renderização de texto formatado (negrito, listas, código, etc.)
- **Gerenciamento de Conversas**: 
  - Criar novas conversas
  - Visualizar histórico
  - Deletar conversas antigas
  - Títulos automáticos baseados na primeira mensagem

### Como Usar
1. Acesse o menu "Chat" na navegação principal
2. Digite sua pergunta no campo de entrada
3. Pressione Enter para enviar
4. A IA responderá com informações baseadas nos dados do CHISTA
5. Use o botão "Nova Conversa" para iniciar um novo tópico

### Estrutura de Dados
- **Conversas**: Armazenadas no backend com `id`, `title`, `created_at`
- **Mensagens**: Vinculadas às conversas com `role` (user/assistant), `content`, `timestamp`
- **Autenticação**: Token JWT da API CHISTA para acesso seguro

### Arquitetura Técnica
- **Frontend**: React com Next.js 15, componentes funcionais e hooks
- **UI**: Interface customizada com Tailwind CSS, sem dependências externas de chat
- **Markdown**: `react-markdown` com `remark-gfm` para renderização rica
- **API Integration**: Funções centralizadas em `src/lib/api.js`
- **Estado**: Gerenciamento local com `useState` e `useEffect`
- **Persistência**: Backend Rails com endpoints RESTful
- **Autenticação**: Auth0 + JWT tokens para API CHISTA

Este projeto usa [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para otimizar e carregar automaticamente [Geist](https://vercel.com/font), uma nova família de fontes para Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
