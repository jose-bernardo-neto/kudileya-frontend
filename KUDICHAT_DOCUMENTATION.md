# KudiChat - Documentação Técnica

## Visão Geral

O KudiChat é um componente de chat inteligente que permite aos usuários fazer perguntas e receber respostas de uma IA. O componente oferece funcionalidades avançadas como reconhecimento de voz, síntese de fala e persistência do histórico de conversas.

## Arquitetura

### Componentes Principais

```
KudiChat/
├── Interface de Mensagens
├── Sistema de Envio de Perguntas
├── Histórico em LocalStorage
├── Reconhecimento de Voz (Speech Recognition)
└── Síntese de Fala (Text-to-Speech)
```

## Sistema de Mensagens

### Interface de Mensagem

```typescript
interface Message {
	id: string; // ID único da mensagem (timestamp)
	content: string; // Conteúdo da mensagem
	sender: 'user' | 'ai'; // Remetente da mensagem
	timestamp: Date; // Data/hora da mensagem
}
```

### Fluxo de Comunicação

#### 1. Envio de Pergunta para a API

```typescript
const sendMessage = async () => {
	// 1. Criar mensagem do usuário
	const userMessage: Message = {
		id: Date.now().toString(),
		content: input.trim(),
		sender: 'user',
		timestamp: new Date(),
	};

	// 2. Adicionar ao estado de mensagens
	setMessages((prev) => [...prev, userMessage]);

	// 3. Enviar para a API
	const response = await fetch(apiHelpers.getApiUrl('/api/v1/ask'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			question: userMessage.content,
		}),
	});

	// 4. Processar resposta
	const data = await response.json();

	// 5. Criar mensagem da IA
	const aiMessage: Message = {
		id: (Date.now() + 1).toString(),
		content: data.answer,
		sender: 'ai',
		timestamp: new Date(),
	};

	// 6. Adicionar resposta ao histórico
	setMessages((prev) => [...prev, aiMessage]);
};
```

#### Payload de Requisição

```json
{
	"question": "Quando tenho direito a férias?"
}
```

#### Resposta da API

```json
{
	"answer": "Esta é uma resposta simulada para: \"Quando tenho direito a férias?\". Em produção, esta resposta seria gerada por uma IA real (Gemini ou OpenAI).",
	"timestamp": "2026-04-14T09:15:09.152Z",
	"provider": "mock"
}
```

## Histórico em LocalStorage

### Como Funciona

O KudiChat utiliza o `localStorage` do navegador para persistir o histórico de conversas entre sessões. Isso permite que o usuário feche a página e retorne posteriormente sem perder suas conversas anteriores.

### Estrutura de Dados no LocalStorage

**Key**: `kudileya-chat-history`

**Valor**: Array JSON de mensagens

```json
[
	{
		"id": "1713084909152",
		"content": "Quando tenho direito a férias?",
		"sender": "user",
		"timestamp": "2026-04-14T09:15:09.152Z"
	},
	{
		"id": "1713084909153",
		"content": "Você tem direito a férias após 12 meses de trabalho...",
		"sender": "ai",
		"timestamp": "2026-04-14T09:15:10.500Z"
	}
]
```

### Operações de LocalStorage

#### 1. Carregar Histórico (Component Mount)

```typescript
React.useEffect(() => {
	const savedMessages = localStorage.getItem('kudileya-chat-history');
	if (savedMessages) {
		try {
			const parsed = JSON.parse(savedMessages);
			setMessages(
				parsed.map((msg: any) => ({
					...msg,
					timestamp: new Date(msg.timestamp), // Reconverter string para Date
				})),
			);
		} catch (error) {
			console.error('Error loading chat history:', error);
		}
	}
}, []);
```

#### 2. Salvar Histórico (Toda mudança nas mensagens)

```typescript
React.useEffect(() => {
	if (messages.length > 0) {
		localStorage.setItem('kudileya-chat-history', JSON.stringify(messages));
	}
}, [messages]);
```

#### 3. Limpar Histórico

```typescript
const clearChat = () => {
	setMessages([]);
	localStorage.removeItem('kudileya-chat-history');
	stopSpeaking(); // Para qualquer fala em andamento
	toast({
		title: 'Conversa limpa',
		description: 'Todo o histórico foi removido',
	});
};
```

### Vantagens do LocalStorage

- ✅ Persistência entre sessões
- ✅ Não requer autenticação
- ✅ Acesso instantâneo (sincronous)
- ✅ 5-10MB de capacidade
- ✅ Específico por domínio

### Limitações

- ⚠️ Dados não sincronizados entre dispositivos
- ⚠️ Pode ser limpo pelo usuário
- ⚠️ Armazenamento local (não em servidor)
- ⚠️ Limite de ~5MB em alguns navegadores

## Funcionalidades Avançadas

### 1. Reconhecimento de Voz (Speech Recognition)

Utiliza a Web Speech API para converter voz em texto.

```typescript
const {
	isListening, // Estado de escuta ativa
	transcript, // Texto transcrito
	startListening, // Iniciar escuta
	stopListening, // Parar escuta
	isSupported, // Suporte do navegador
	error, // Erros de reconhecimento
} = useSpeechRecognition('pt-BR');
```

**Como funciona:**

1. Usuário clica no botão de microfone
2. Browser solicita permissão de microfone
3. Áudio é capturado e enviado para API de reconhecimento
4. Texto transcrito é inserido no input
5. Usuário pode editar antes de enviar

### 2. Síntese de Fala (Text-to-Speech)

Converte texto das respostas em áudio.

```typescript
const {
	speak, // Função para falar texto
	stop, // Parar fala
	isSpeaking, // Estado de fala ativa
	isSupported, // Suporte do navegador
} = useSpeechSynthesis('pt-BR');
```

**Como funciona:**

1. Cada mensagem da IA tem um botão de volume
2. Ao clicar, o texto é convertido em áudio
3. Browser lê a resposta em voz alta
4. Usuário pode pausar/parar a qualquer momento

## Estados do Componente

### Estados Principais

```typescript
const [messages, setMessages] = React.useState<Message[]>([]); // Histórico de mensagens
const [input, setInput] = React.useState(''); // Input atual
const [isLoading, setIsLoading] = React.useState(false); // Estado de carregamento
```

### Ciclo de Vida de uma Pergunta

```
1. Usuário digita ou fala a pergunta
   ↓
2. Input é validado (não vazio)
   ↓
3. Mensagem do usuário é adicionada ao estado
   ↓
4. isLoading = true (mostra animação)
   ↓
5. Requisição POST para /api/v1/ask
   ↓
6. Aguarda resposta da API
   ↓
7. Resposta é adicionada ao estado
   ↓
8. isLoading = false
   ↓
9. Histórico é salvo em localStorage
   ↓
10. ScrollArea rola para o final
```

## Tratamento de Erros

### Cenários de Erro

1. **Erro de Rede**

```typescript
catch (error) {
  // Cria mensagem de fallback
  const fallbackMessage: Message = {
    id: (Date.now() + 1).toString(),
    content: 'Desculpe, não consegui processar sua pergunta no momento.',
    sender: 'ai',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, fallbackMessage]);

  // Mostra toast de erro
  toast({
    title: 'Erro de conexão',
    description: 'Não foi possível se conectar ao servidor',
    variant: 'destructive'
  });
}
```

2. **Erro de Reconhecimento de Voz**

```typescript
React.useEffect(() => {
	if (speechError) {
		toast({
			title: 'Erro no reconhecimento de voz',
			description: speechError,
			variant: 'destructive',
		});
	}
}, [speechError]);
```

3. **Erro ao Carregar Histórico**

```typescript
try {
	const parsed = JSON.parse(savedMessages);
	setMessages(
		parsed.map((msg) => ({
			...msg,
			timestamp: new Date(msg.timestamp),
		})),
	);
} catch (error) {
	console.error('Error loading chat history:', error);
	// Histórico corrompido é ignorado
}
```

## Interface do Usuário

### Componentes Visuais

1. **Header**
   - Logo da IA
   - Título e subtítulo
   - Botão de limpar chat

2. **Área de Mensagens**
   - ScrollArea com histórico
   - Mensagens do usuário (direita, laranja)
   - Mensagens da IA (esquerda, cinza)
   - Timestamp em cada mensagem
   - Botão de TTS em mensagens da IA

3. **Área de Input**
   - Campo de texto
   - Botão de reconhecimento de voz (se suportado)
   - Botão de enviar
   - Indicadores de suporte de funcionalidades

### Estados Visuais

- **Vazio**: Tela de boas-vindas
- **Carregando**: Animação de pontos pulsando
- **Escutando**: Botão de microfone vermelho pulsando
- **Falando**: Ícone de volume animado

## Integração com API

### Configuração

```typescript
import { apiHelpers, apiConfig } from '@/lib/config';

// URL completa é construída automaticamente
const url = apiHelpers.getApiUrl('/api/v1/ask');
// Exemplo: https://kudileya-app-backend.onrender.com/api/v1/ask
```

### Headers

```typescript
headers: {
  'Content-Type': 'application/json',
}
```

### Timeout & Retry

Configurado em `apiConfig`:

- Timeout: 10 segundos
- Retry: 2 tentativas
- Cache: 5 minutos

## Acessibilidade

- ✅ Suporte a teclado (Enter para enviar)
- ✅ ARIA labels implícitos
- ✅ Alternativas visuais para áudio
- ✅ Cores com bom contraste
- ✅ Feedback visual para estados

## Performance

### Otimizações

- `React.useRef` para scroll (evita re-renders)
- `useEffect` com dependências específicas
- LocalStorage síncrono (não bloqueia UI)
- Animações CSS (GPU-accelerated)

### Consumo de Memória

- Histórico limitado pelo localStorage (~5MB)
- Mensagens antigas não são paginadas (todas em memória)
- Recomendado: limpar chat periodicamente

## Melhorias Futuras

### Possíveis Implementações

1. **Paginação de Histórico**: Carregar mensagens antigas sob demanda
2. **Sincronização em Nuvem**: Salvar histórico em backend
3. **Contexto de Conversa**: Enviar últimas N mensagens para API
4. **Markdown Support**: Renderizar respostas formatadas
5. **Anexos**: Suporte a imagens/documentos
6. **Exportar Conversa**: Download do histórico em PDF/TXT
7. **Temas de Chat**: Personalização visual
8. **Atalhos de Teclado**: Comandos rápidos

## Debugging

### Logs Disponíveis

```typescript
apiHelpers.debugLog('Enviando pergunta:', question);
apiHelpers.errorLog('Erro ao enviar:', error);
```

### LocalStorage Inspector

```javascript
// Console do navegador
localStorage.getItem('kudileya-chat-history');
JSON.parse(localStorage.getItem('kudileya-chat-history'));
```

### Network Tab

Verificar requisições para `/api/v1/ask`:

- Status Code: 200
- Response Time: <2s ideal
- Payload size: ~100-500 bytes

## Segurança

### Considerações

- ⚠️ LocalStorage não é criptografado
- ⚠️ Histórico pode conter dados sensíveis
- ⚠️ Não armazenar tokens/senhas
- ✅ Sanitização de entrada do usuário
- ✅ HTTPS obrigatório em produção

## Conclusão

O KudiChat é um componente robusto que combina:

- Interface intuitiva
- Persistência local
- Funcionalidades de voz
- Integração com API de IA
- Tratamento de erros completo

Para mais informações, consulte:

- Código fonte: `/src/components/KudiChat.tsx`
- Hooks: `/src/hooks/useSpeechRecognition.ts` e `/src/hooks/useSpeechSynthesis.ts`
- Configuração: `/src/lib/config.ts`
