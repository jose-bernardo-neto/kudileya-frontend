# 🏛️ Kudi Chat Navigator

<div align="center">

![Kudi Chat Navigator](https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1200&h=400&fit=crop&crop=center)

**Democratizando o Conhecimento Jurídico através da Inteligência Artificial**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **Kudi Chat Navigator** é uma aplicação web inovadora que utiliza inteligência artificial para democratizar o acesso ao conhecimento jurídico. Desenvolvido especialmente para o mercado angolano e lusófono, o projeto traduz a complexidade da linguagem jurídica em explicações claras e acessíveis para qualquer cidadão.

### 🌟 Missão

Tornar os direitos e deveres legais compreensíveis para todos, eliminando as barreiras do jargão jurídico e promovendo o acesso democrático à justiça.

## ⚡ Funcionalidades

### 🤖 KudiChat - Assistente IA Jurídica
- **Chat Inteligente**: Conversas naturais sobre questões jurídicas
- **Reconhecimento de Voz**: Interação por comandos de voz (Português/Inglês)
- **Síntese de Voz**: Respostas faladas para melhor acessibilidade
- **Histórico Persistente**: Conversas salvas localmente

### 📚 Sistema de FAQ Dinâmico
- **Perguntas Categorizadas**: Organização por temas jurídicos
- **API Integrada**: Conteúdo atualizado automaticamente
- **Fallback Inteligente**: Sistema de backup para garantir disponibilidade

### 🗺️ Mapa Interativo
- **Localização de Tribunais**: Visualização de tribunais em Portugal
- **Escritórios de Advocacia**: Mapa de escritórios especializados
- **Informações Detalhadas**: Contatos, horários e especialidades

### 🌍 Recursos de Acessibilidade
- **Multilíngue**: Suporte completo para Português e Inglês
- **Design Responsivo**: Perfeito em desktop e móvel
- **Tema Claro/Escuro**: Conforto visual personalizado
- **Interface Inclusiva**: Design acessível para todos os usuários

## 🛠️ Tecnologias

### Frontend Core
- **React 18.3.1** - Biblioteca de interface de usuário
- **TypeScript 5.6.2** - Tipagem estática para JavaScript
- **Vite 6.0.5** - Build tool moderna e rápida

### UI/UX
- **Tailwind CSS 3.4.1** - Framework CSS utilitário
- **shadcn/ui** - Componentes modernos e acessíveis
- **Radix UI** - Primitivos de UI para acessibilidade
- **Lucide React** - Ícones elegantes e consistentes

### Funcionalidades Avançadas
- **Speech Recognition API** - Reconhecimento de voz nativo
- **Speech Synthesis API** - Síntese de voz
- **React Query** - Gerenciamento de estado servidor
- **React Router** - Navegação SPA
- **Google Maps API** - Mapas interativos

### Desenvolvimento
- **ESLint** - Linting e qualidade de código
- **PostCSS** - Processamento CSS avançado
- **Bun** - Runtime JavaScript rápido (lockfile)

## 🚀 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm, pnpm ou bun

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/kudi-chat-navigator.git
cd kudi-chat-navigator
```

2. **Instale as dependências**
```bash
# Com npm
npm install

# Com pnpm (recomendado)
pnpm install

# Com bun
bun install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis necessárias no arquivo .env
# Principais configurações:
```

**Variáveis Essenciais**:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PROD_URL=https://kudileya-app-backend.onrender.com

# Contact Information  
VITE_WHATSAPP_NUMBER=924643714
VITE_SUPPORT_EMAIL=contato@kudileya.com

# Feature Flags
VITE_ENABLE_WHATSAPP=true
VITE_ENABLE_DOCUMENTS=true
VITE_DEBUG_API=true
```

> 📋 **Documentação completa**: Veja [ENV_DOCS.md](ENV_DOCS.md) para todas as variáveis disponíveis.

4. **Execute em desenvolvimento**
```bash
npm run dev
# ou
pnpm dev
# ou
bun dev
```

5. **Acesse a aplicação**
```
http://localhost:5173
```

## 📖 Uso

### Navegação Principal

1. **Tela de Boas-Vindas**: Introdução ao projeto com carrossel informativo
2. **FAQ**: Perguntas frequentes organizadas por categoria
3. **KudiChat**: Chat com IA especializada em direito
4. **Mapa**: Localização de tribunais e escritórios

### Usando o KudiChat

1. Digite sua pergunta ou use o microfone 🎤
2. Aguarde a resposta da IA
3. Use o botão de áudio 🔊 para ouvir a resposta
4. Limpe o histórico quando necessário

### Alternação de Idiomas

Use o seletor de idiomas no header para alternar entre Português e Inglês.

## 📁 Estrutura do Projeto

```
src/
├── 📁 components/          # Componentes React
│   ├── ui/                 # Componentes de UI (shadcn)
│   ├── FAQs.tsx           # Sistema de perguntas frequentes
│   ├── KudiChat.tsx       # Chat com IA
│   ├── LawyersMap.tsx     # Mapa interativo
│   ├── Layout.tsx         # Layout principal
│   ├── Welcome.tsx        # Tela de boas-vindas
│   └── LanguageSelector.tsx
├── 📁 contexts/           # Contextos React
│   ├── LanguageContext.tsx # Gerenciamento de idioma
│   └── ThemeContext.tsx    # Gerenciamento de tema
├── 📁 hooks/              # Hooks customizados
│   ├── useSpeechRecognition.ts
│   ├── useSpeechSynthesis.ts
│   └── use-toast.ts
├── 📁 lib/                # Utilitários
│   └── utils.ts
└── 📁 pages/              # Páginas da aplicação
    ├── Index.tsx          # Página principal
    └── NotFound.tsx       # Página 404
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run build:dev` - Build em modo desenvolvimento
- `npm run lint` - Executa linting
- `npm run preview` - Visualiza build local

## ⚙️ Configuração de Ambiente

### 🌍 **Variáveis de Ambiente**

O projeto utiliza um sistema robusto de configuração por variáveis de ambiente para separar informações sensíveis e configurações específicas por ambiente.

#### **Configuração Centralizada**
```typescript
// src/lib/config.ts - Sistema centralizado de configuração
import { config, apiHelpers } from '@/lib/config';

// Usar configurações
const apiUrl = apiHelpers.getApiUrl('/documents');
const whatsappUrl = apiHelpers.getWhatsAppUrl();

// Feature flags
if (config.features.enableDocuments) {
  // Funcionalidade ativada
}
```

#### **Principais Configurações**
| Categoria | Variáveis | Descrição |
|-----------|-----------|-----------|
| **API** | `VITE_API_BASE_URL`, `VITE_API_PROD_URL` | URLs de desenvolvimento e produção |
| **Contato** | `VITE_WHATSAPP_NUMBER`, `VITE_SUPPORT_EMAIL` | Informações de contato |
| **Features** | `VITE_ENABLE_*` | Flags para ativar/desativar funcionalidades |
| **UI** | `VITE_BRAND_PRIMARY_COLOR`, `VITE_DEFAULT_LANGUAGE` | Configurações de interface |
| **Debug** | `VITE_DEBUG_API`, `VITE_DEV_MODE` | Logs e modo desenvolvimento |

#### **Segurança**
- ✅ **URLs da API**: Não hardcoded, configurável por ambiente
- ✅ **Informações de contato**: Extraídas para variáveis
- ✅ **Feature flags**: Controle granular de funcionalidades
- ✅ **Valores padrão**: Fallbacks seguros para todas as configurações
- ✅ **Validação**: Verificação de tipos e formatos

> 📖 **Documentação completa:** [ENV_DOCS.md](ENV_DOCS.md)

### 🔧 **Configuração por Ambiente**

```bash
# Desenvolvimento
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG_API=true
VITE_DEV_MODE=true

# Produção  
VITE_API_BASE_URL=https://api.kudileya.com
VITE_DEBUG_API=false
VITE_SHOW_ERROR_DETAILS=false
```

## 🌐 API Integration

### **Configuração Dinâmica**
O projeto agora utiliza **configuração por ambiente** para todas as integrações:

```typescript
// Configuração automática baseada no ambiente
const apiUrl = apiHelpers.getApiUrl('/documents'); // ✅ Configurável
const whatsappUrl = apiHelpers.getWhatsAppUrl();   // ✅ Configurável

// Antes (hardcoded) ❌
// const apiUrl = 'http://localhost:3000/api/documents'; 
```

### **Endpoints Integrados**
- **📄 Documentos**: `${API_BASE_URL}/api/documents` - Listagem e download
- **❓ FAQs Dinâmicos**: `${API_BASE_URL}/faqs` - Perguntas categorizadas  
- **🤖 Chat com IA**: `${API_BASE_URL}/perguntar` - Respostas inteligentes
- **📞 Contato WhatsApp**: `wa.me/${WHATSAPP_NUMBER}` - Suporte direto

### **Configuração de Ambiente**
```bash
# Desenvolvimento
VITE_API_BASE_URL=http://localhost:3000

# Produção
VITE_API_BASE_URL=https://kudileya-app-backend.onrender.com

# Contato
VITE_WHATSAPP_NUMBER=924643714
```

> 🔧 **Flexibilidade total**: Todas as URLs e configurações são agora variáveis de ambiente.

## 🎨 Personalização

### Temas
Modifique as cores em `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: "var(--primary)",
      secondary: "var(--secondary)",
      // Adicione suas cores personalizadas
    }
  }
}
```

### Traduções
Adicione novos idiomas em `src/contexts/LanguageContext.tsx`.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Guidelines de Contribuição

- Mantenha o código TypeScript tipado
- Siga as convenções de commits convencionais
- Adicione testes quando necessário
- Mantenha a documentação atualizada

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Feito com ❤️ pela equipe Kudileya**

*Democratizando o acesso à justiça através da tecnologia*

[🌐 Website](https://kudileya.com) | [📧 Contato](mailto:contato@kudileya.com) | [🐦 Twitter](https://twitter.com/kudileya)

</div>
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/32ce7147-786c-4954-a0ac-cf84e3a88341) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
