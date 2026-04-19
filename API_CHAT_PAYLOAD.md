# KudiChat — Especificação do Payload da API

> **Endpoint:** `POST /api/v1/ask`
> **Content-Type:** `application/json`

---

## Estrutura Actual (frontend envia)

```json
{
	"question": "string",
	"context": [
		{ "role": "user", "content": "string" },
		{ "role": "assistant", "content": "string" }
	]
}
```

### Campos

| Campo               | Tipo                    | Obrigatório | Descrição                                                                                   |
| ------------------- | ----------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `question`          | `string`                | ✅          | A nova pergunta do utilizador                                                               |
| `context`           | `array`                 | ✅          | Janela de contexto com as últimas **5 mensagens** da conversa (excluindo a pergunta actual) |
| `context[].role`    | `"user" \| "assistant"` | ✅          | Quem enviou a mensagem: `user` = utilizador, `assistant` = IA                               |
| `context[].content` | `string`                | ✅          | Conteúdo da mensagem                                                                        |

### Regras de contexto (implementadas no frontend)

- O array `context` contém no máximo **5 mensagens** anteriores (`CONTEXT_WINDOW = 5`)
- A ordem é **cronológica** (mais antiga primeiro, mais recente por último)
- A nova `question` **não** aparece dentro de `context` — é sempre o campo raiz
- Se a conversa tiver menos de 5 mensagens, `context` terá menos itens (pode ser array vazio `[]` na primeira mensagem)

---

## Exemplo completo de payload

```json
{
	"question": "E se o contrato não especificar o período de aviso prévio?",
	"context": [
		{
			"role": "user",
			"content": "Tenho direito a aviso prévio ao ser demitido?"
		},
		{
			"role": "assistant",
			"content": "Sim. Segundo a Lei Geral do Trabalho de Angola (Lei n.º 7/15), o aviso prévio mínimo é de 30 dias para contratos por tempo indeterminado."
		},
		{
			"role": "user",
			"content": "Esse prazo muda para contratos a prazo certo?"
		},
		{
			"role": "assistant",
			"content": "Para contratos a prazo certo o aviso prévio é de 15 dias, salvo estipulação contratual em sentido contrário."
		},
		{
			"role": "user",
			"content": "Qual é a penalidade para o empregador que não cumprir o aviso prévio?"
		}
	]
}
```

---

## Resposta esperada da API

```json
{
	"answer": "string",
	"timestamp": "ISO-8601",
	"provider": "string"
}
```

| Campo       | Tipo     | Descrição                                                         |
| ----------- | -------- | ----------------------------------------------------------------- |
| `answer`    | `string` | Resposta gerada pela IA                                           |
| `timestamp` | `string` | Data/hora da resposta em formato ISO-8601                         |
| `provider`  | `string` | Identificador do modelo/provedor usado (ex: `"openai"`, `"mock"`) |

---

## Alterações necessárias na API

A API actualmente recebe apenas `{ "question": "..." }`.
Para suportar contexto, é necessário:

1. **Actualizar o handler** de `POST /api/v1/ask` para ler o campo `context` do body
2. **Passar o contexto** ao modelo de linguagem — exemplo com LangChain / OpenAI:

```python
# Exemplo Python
messages_for_llm = []

for msg in payload["context"]:
    if msg["role"] == "user":
        messages_for_llm.append(HumanMessage(content=msg["content"]))
    else:
        messages_for_llm.append(AIMessage(content=msg["content"]))

# Adicionar a nova pergunta no final
messages_for_llm.append(HumanMessage(content=payload["question"]))

response = llm.invoke(messages_for_llm)
```

```typescript
// Exemplo Node.js / TypeScript (OpenAI SDK)
const messages = [
	{ role: 'system', content: 'Você é Kudi, assistente jurídico angolano.' },
	...payload.context.map((msg) => ({
		role: msg.role, // 'user' | 'assistant'
		content: msg.content,
	})),
	{ role: 'user', content: payload.question },
];

const completion = await openai.chat.completions.create({
	model: 'gpt-4o',
	messages,
});
```

3. **Validação sugerida** (Zod / Joi):

```typescript
const AskSchema = z.object({
	question: z.string().min(1).max(2000),
	context: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1).max(4000),
			}),
		)
		.max(10)
		.default([]), // aceita até 10, frontend envia max 5
});
```

---

## Constantes do frontend (referência)

```typescript
// src/components/KudiChat.tsx
const STORAGE_KEY = 'kudileya-chat-history';
const MAX_MESSAGES = 50; // máx. de mensagens guardadas no localStorage
const CONTEXT_WINDOW = 5; // mensagens enviadas como contexto para a API
```

---

_Última actualização: Abril 2026_
