# Kudileya — Assistente Jurídico com IA para Angola

> **Democratizando o acesso ao conhecimento jurídico através da Inteligência Artificial**

Kudileya é uma aplicação web que traduz a complexidade da linguagem jurídica angolana em respostas claras e acessíveis para qualquer cidadão. Combina um assistente de IA conversacional, um sistema de FAQs dinâmico, documentos jurídicos úteis e um mapa interativo de tribunais e escritórios de advocacia.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack Técnica](#stack-técnica)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projecto](#estrutura-do-projecto)
- [API — Integração com o Backend](#api--integração-com-o-backend)
- [Componentes Principais](#componentes-principais)
- [Scripts](#scripts)

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **KudiChat** | Chat com IA jurídica, reconhecimento e síntese de voz, histórico persistente no `localStorage`, renderização de respostas em Markdown |
| **FAQs** | Perguntas frequentes organizadas por categoria, carregadas via API com fallback estático |
| **Mapa Jurídico** | Mapa Mapbox com tribunais e escritórios de advocacia em Angola, ordenados por distância via fórmula Haversine, sidebar com lista rankada |
| **Documentos Úteis** | Listagem, filtro por categoria e download de documentos jurídicos em PDF via API |
| **Multilíngue** | Suporte completo a Português e Inglês |
| **Tema** | Modo claro / escuro |
| **Responsivo** | Navegação Pinterest no desktop + bottom nav no mobile |

---

## Stack Técnica

### Core
- **React 18** + **TypeScript 5** — UI e tipagem estática
- **Vite 5** — build tool
- **React Router 6** — navegação SPA

### UI
- **Tailwind CSS 3** + **@tailwindcss/typography** — estilização e prose
- **shadcn/ui** + **Radix UI** — componentes acessíveis
- **Lucide React** — ícones

### Funcionalidades
- **Mapbox GL JS 3** — mapas interativos
- **react-markdown** + **remark-gfm** — renderização de Markdown nas respostas da IA
- **Speech Recognition API** (nativa) — voz para texto
- **Speech Synthesis API** (nativa) — texto para voz
- **React Query** — cache e fetching de dados

---

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/jose-bernardo-neto/kudileya-frontend.git
cd kudileya-frontend

# 2. Instalar dependências (recomendado pnpm)
pnpm install

# 3. Criar ficheiro de ambiente
cp .env.example .env   # editar com os valores reais

# 4. Iniciar em desenvolvimento
pnpm dev
```

Aceder em `http://localhost:5173`

---

## Variáveis de Ambiente

Criar um ficheiro `.env` na raiz do projecto com as seguintes variáveis:

### API

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | URL da API em desenvolvimento | `http://localhost:3000` |
| `VITE_API_PROD_URL` | URL da API em produção | `http://172.209.209.203` |
| `VITE_API_TIMEOUT` | Timeout das requisições (ms) | `10000` |
| `VITE_API_RETRY_COUNT` | Tentativas em caso de falha | `2` |
| `VITE_API_CACHE_TIME` | Tempo de cache React Query (ms) | `300000` |

### Mapbox

| Variável | Descrição |
|----------|-----------|
| `VITE_MAPBOX_ACCESS_TOKEN` | Token de acesso Mapbox — obter em [account.mapbox.com](https://account.mapbox.com/access-tokens/) |

### Contacto

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_WHATSAPP_NUMBER` | Número WhatsApp (sem espaços) | `924643714` |
| `VITE_WHATSAPP_MESSAGE` | Mensagem pré-preenchida | `Olá! Gostaria de saber mais...` |
| `VITE_SUPPORT_EMAIL` | Email de suporte | `contato@kudileya.com` |

### Feature Flags

| Variável | Padrão | Efeito quando `false` |
|----------|--------|-----------------------|
| `VITE_ENABLE_MAP` | `true` | Remove o separador do mapa da navegação |
| `VITE_ENABLE_DOCUMENTS` | `true` | Remove o separador de documentos da navegação |
| `VITE_ENABLE_WHATSAPP` | `false` | Oculta o botão flutuante do WhatsApp |
| `VITE_DEBUG_API` | `false` | Desactiva logs de API na consola |
| `VITE_DEV_MODE` | `false` | Desactiva helpers de desenvolvimento |

### UI

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_DEFAULT_LANGUAGE` | Idioma inicial (`pt` / `en`) | `pt` |
| `VITE_BRAND_PRIMARY_COLOR` | Cor primária da marca | `#F0A22E` |
| `VITE_WHATSAPP_COLOR` | Cor do botão WhatsApp | `#25D366` |

---

## Estrutura do Projecto

```
src/
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── KudiChat.tsx            # Chat com IA + voz + Markdown
│   ├── FAQs.tsx                # Perguntas frequentes via API
│   ├── LawyersMap.tsx          # Mapa Mapbox + sidebar Haversine
│   ├── DocumentsUseful.tsx     # Documentos jurídicos em PDF
│   ├── Welcome.tsx             # Ecrã de boas-vindas
│   ├── Layout.tsx              # Layout + navegação (desktop/mobile)
│   └── LanguageSelector.tsx    # Seletor de idioma
├── contexts/
│   ├── LanguageContext.tsx     # i18n (pt/en)
│   └── ThemeContext.tsx        # Tema claro/escuro
├── hooks/
│   ├── useSpeechRecognition.ts # Voz → texto (Web Speech API)
│   ├── useSpeechSynthesis.ts   # Texto → voz (Web Speech API)
│   └── use-toast.ts
├── lib/
│   ├── config.ts               # Configuração centralizada (env vars)
│   └── utils.ts
└── pages/
    ├── Index.tsx               # Página principal (router de ecrãs)
    └── NotFound.tsx
```

---

## API — Integração com o Backend

Todos os endpoints usam `VITE_API_BASE_URL` (dev) ou `VITE_API_PROD_URL` (prod), gerido em `src/lib/config.ts` via `apiHelpers.getApiUrl()`.

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/ask` | Pergunta ao assistente IA (KudiChat) |
| `GET` | `/api/v1/faqs` | Lista de perguntas frequentes |
| `GET` | `/api/v1/documents` | Lista de documentos disponíveis |
| `GET` | `/api/v1/documents/:id` | Download de documento (stream PDF) |

### Payload do KudiChat — `POST /api/v1/ask`

O frontend envia a nova pergunta **mais uma janela de contexto** das últimas 5 mensagens para dar memória à IA (que é stateless):

```json
{
  "question": "E se o contrato não especificar o aviso prévio?",
  "context": [
    { "role": "user",      "content": "Tenho direito a aviso prévio?" },
    { "role": "assistant", "content": "Sim, o mínimo legal é 30 dias..." },
    { "role": "user",      "content": "E para contratos a prazo certo?" },
    { "role": "assistant", "content": "Para contratos a prazo o aviso é 15 dias..." },
    { "role": "user",      "content": "Qual a penalidade para o empregador?" }
  ]
}
```

**Resposta esperada:**

```json
{
  "answer": "string (pode conter Markdown)",
  "timestamp": "ISO-8601",
  "provider": "string"
}
```

**Alteração necessária no backend** — o handler de `/api/v1/ask` precisa de ler `context` e passá-lo ao modelo:

```typescript
// Node.js / TypeScript (OpenAI SDK)
const messages = [
  { role: 'system', content: 'Você é Kudi, assistente jurídico angolano.' },
  ...payload.context.map(msg => ({ role: msg.role, content: msg.content })),
  { role: 'user', content: payload.question },
];
const completion = await openai.chat.completions.create({ model: 'gpt-4o', messages });
```

```python
# Python (LangChain)
msgs = []
for msg in payload["context"]:
    msgs.append(HumanMessage(content=msg["content"]) if msg["role"] == "user"
                else AIMessage(content=msg["content"]))
msgs.append(HumanMessage(content=payload["question"]))
response = llm.invoke(msgs)
```

---

## Componentes Principais

### KudiChat

- Histórico persistente em `localStorage` (`kudileya-chat-history`)
- Limite de **50 mensagens** — as mais antigas são descartadas gradualmente (`slice(-50)`)
- **5 mensagens de contexto** enviadas à API em cada pedido (`context` no payload)
- Respostas da IA renderizadas como **Markdown** (negrito, listas, tabelas, blocos de código, etc.)
- Reconhecimento de voz (Português `pt-BR` / Inglês `en-US`)
- Síntese de voz para leitura das respostas

### LawyersMap

- **Dados estáticos**: 10 tribunais + 10 escritórios em Angola (sem chamadas de geocoding)
- **Haversine**: distância em metros entre a posição do utilizador e cada local; lista ordenada do mais próximo
- **Geolocalização**: timeout de 6s, fallback para Luanda `[13.289436, -8.839987]`
- **Sidebar** com tabs (Tribunais / Escritórios), scroll com rank numérico e distância formatada
- **flyTo** (zoom 15, 1,2s) ao seleccionar item; popup com botão "Como Chegar" (Google Maps Directions)
- Marcadores coloridos: tribunais = vermelho `#ef4444`, escritórios = azul `#3b82f6`, utilizador = verde `#22c55e`

### FAQs

- Carregamento via `GET /api/v1/faqs` com fallback para dados estáticos
- Botão "Explicar com IA" → navega para KudiChat com a questão pré-preenchida

### DocumentsUseful

- Filtro por 6 categorias + pesquisa em tempo real por título/descrição
- Download directo via stream da API
- Documentos `isUseful: true` aparecem com estrela e em primeiro lugar

---

## Scripts

```bash
pnpm dev          # Servidor de desenvolvimento (localhost:5173)
pnpm build        # Build de produção (dist/)
pnpm preview      # Pré-visualizar build localmente
pnpm lint         # Linting ESLint + TypeScript
```

---

*Feito com ❤️ pela equipa Kudileya — democratizando o acesso à justiça em Angola*
