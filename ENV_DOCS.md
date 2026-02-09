# Environment Variables Documentation

Este documento descreve todas as variáveis de ambiente disponíveis no projeto Kudi Chat Navigator.

## 🔧 Setup Inicial

1. **Copie o arquivo de exemplo**:
```bash
cp .env.example .env
```

2. **Configure suas variáveis**:
Edite o arquivo `.env` com os valores específicos do seu ambiente.

3. **Restart do servidor**:
Para que as mudanças tenham efeito, reinicie o servidor de desenvolvimento.

## 📋 Variáveis de Ambiente

### 🌐 **Configuração de API**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_API_BASE_URL` | URL base da API (desenvolvimento) | `http://localhost:3000` | `http://localhost:3000` |
| `VITE_API_PROD_URL` | URL base da API (produção) | `https://kudileya-app-backend.onrender.com` | `https://api.kudileya.com` |
| `VITE_API_TIMEOUT` | Timeout para requisições (ms) | `10000` | `15000` |
| `VITE_API_RETRY_COUNT` | Número de tentativas em caso de falha | `2` | `3` |
| `VITE_API_CACHE_TIME` | Tempo de cache do React Query (ms) | `300000` (5 min) | `600000` (10 min) |

### 📞 **Informações de Contato**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_WHATSAPP_NUMBER` | Número do WhatsApp (sem espaços) | `924643714` | `244987654321` |
| `VITE_WHATSAPP_MESSAGE` | Mensagem padrão do WhatsApp | `"Olá! Gostaria..."` | `"Hi! I need help..."` |
| `VITE_SUPPORT_EMAIL` | Email de suporte | `contato@kudileya.com` | `support@company.com` |
| `VITE_COMPANY_WEBSITE` | Site da empresa | `https://kudileya.com` | `https://mycompany.com` |

### 🚩 **Feature Flags**

| Variável | Descrição | Padrão | Valores |
|----------|-----------|---------|---------|
| `VITE_DEV_MODE` | Ativar modo desenvolvimento | `true` | `true` / `false` |
| `VITE_DEBUG_API` | Logs de debug da API | `true` | `true` / `false` |
| `VITE_ENABLE_WHATSAPP` | Exibir botão do WhatsApp | `true` | `true` / `false` |
| `VITE_ENABLE_MAP` | Ativar funcionalidade do mapa | `true` | `true` / `false` |
| `VITE_ENABLE_DOCUMENTS` | Ativar aba de documentos | `true` | `true` / `false` |
| `VITE_ENABLE_ANIMATIONS` | Ativar animações na UI | `true` | `true` / `false` |

### 🎨 **Configuração da Interface**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_DEFAULT_LANGUAGE` | Idioma padrão | `pt` | `pt` / `en` |
| `VITE_DEFAULT_THEME` | Tema padrão | `light` | `light` / `dark` |
| `VITE_BRAND_PRIMARY_COLOR` | Cor primária da marca | `#F0A22E` | `#1E40AF` |
| `VITE_WHATSAPP_COLOR` | Cor do botão WhatsApp | `#25D366` | `#25D366` |

### 📄 **Configuração de Documentos**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_MAX_FILE_SIZE` | Tamanho máximo de arquivo (bytes) | `50000000` (50MB) | `100000000` (100MB) |
| `VITE_ALLOWED_FILE_TYPES` | Tipos de arquivo permitidos | `application/pdf` | `application/pdf,image/*` |
| `VITE_DOCS_PER_PAGE` | Documentos por página | `12` | `20` |

### 🔒 **Configuração de Segurança**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_API_RATE_LIMIT` | Limite de requests por minuto | `60` | `100` |
| `VITE_FORCE_HTTPS` | Forçar HTTPS em produção | `false` | `true` |

### 🛠️ **Desenvolvimento**

| Variável | Descrição | Padrão | Exemplo |
|----------|-----------|---------|---------|
| `VITE_SHOW_ERROR_DETAILS` | Exibir detalhes de erro | `true` (dev) | `false` |
| `VITE_ENABLE_DEVTOOLS` | Ativar React Query DevTools | `true` (dev) | `false` |
| `VITE_MOCK_API` | Usar respostas mockadas | `false` | `true` |

## 🚀 **Configuração por Ambiente**

### **Desenvolvimento (.env.development)**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG_API=true
VITE_DEV_MODE=true
VITE_SHOW_ERROR_DETAILS=true
```

### **Staging (.env.staging)**
```bash
VITE_API_BASE_URL=https://staging-api.kudileya.com
VITE_DEBUG_API=false
VITE_DEV_MODE=false
VITE_SHOW_ERROR_DETAILS=true
```

### **Produção (.env.production)**
```bash
VITE_API_BASE_URL=https://api.kudileya.com
VITE_DEBUG_API=false
VITE_DEV_MODE=false
VITE_SHOW_ERROR_DETAILS=false
VITE_FORCE_HTTPS=true
```

## 💡 **Como Usar**

### **No Código**
```typescript
import { config, apiHelpers } from '@/lib/config';

// Acessar configurações
const apiUrl = apiHelpers.getApiUrl('/documents');
const whatsappUrl = apiHelpers.getWhatsAppUrl();

// Usar feature flags
if (config.features.enableDocuments) {
  // Mostrar aba de documentos
}

// Debug condicional
apiHelpers.debugLog('API call started');

// Error logging
apiHelpers.errorLog('API failed', error);
```

### **Verificar Configuração**
```javascript
// No console do browser
console.table(window.__KUDILEYA_CONFIG__);
```

## 🔍 **Debugging**

### **Verificar Variáveis Carregadas**
```bash
# Listar todas as variáveis VITE_
echo $VITE_API_BASE_URL
```

### **Logs de Configuração**
Quando `VITE_DEBUG_API=true`, o sistema exibe logs detalhados no console:
- ✅ Configuração carregada
- 🔄 Chamadas de API
- ❌ Erros e fallbacks

## ⚠️ **Importantes**

1. **Prefixo VITE_**: Todas as variáveis devem começar com `VITE_` para serem acessíveis no frontend.

2. **Restart Obrigatório**: Mudanças nas variáveis exigem reinicialização do servidor de desenvolvimento.

3. **Não Commitar .env**: O arquivo `.env` está no `.gitignore` e não deve ser commitado.

4. **Usar .env.example**: Mantenha sempre o `.env.example` atualizado como modelo.

5. **Produção**: Configure as variáveis no ambiente de deploy (Vercel, Netlify, etc.).

## 🛫 **Deploy**

### **Vercel**
```bash
vercel env add VITE_API_BASE_URL
vercel env add VITE_WHATSAPP_NUMBER
# ... outras variáveis
```

### **Netlify**
No painel admin: Site Settings → Environment variables

### **Docker**
```dockerfile
ENV VITE_API_BASE_URL=https://api.kudileya.com
ENV VITE_WHATSAPP_NUMBER=924643714
```

## 📝 **Validação**

O sistema valida automaticamente:
- ✅ URLs bem formadas
- ✅ Números válidos  
- ✅ Boolean strings
- ✅ Fallbacks para valores obrigatórios

Em caso de erro, valores padrão seguros são utilizados.