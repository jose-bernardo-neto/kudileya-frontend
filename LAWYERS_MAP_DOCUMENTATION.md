# Documentação do Componente LawyersMap

## Visão Geral

O componente `LawyersMap` exibe um mapa interativo mostrando tribunais e escritórios de advocacia em Angola. Utiliza a Google Maps JavaScript API e a Places API para fornecer uma experiência de busca dinâmica e localização em tempo real.

## Tecnologias Utilizadas

- **Google Maps JavaScript API**: Para renderização do mapa
- **Google Places API**: Para buscar tribunais e escritórios dinamicamente
- **Geolocation API**: Para obter a localização do usuário
- **React + TypeScript**: Framework e tipagem
- **shadcn/ui**: Componentes de UI (Card, Button, Badge, etc.)

## Funcionalidades Principais

### 1. Geolocalização com Fallback

```typescript
const getUserLocation = (): Promise<google.maps.LatLngLiteral> => {
  // Tenta obter localização do usuário
  // Timeout: 5 segundos
  // Fallback: Luanda (-8.839987, 13.289436)
}
```

**Comportamento:**
- Solicita permissão de geolocalização ao usuário
- Timeout de 5 segundos
- Se falhar ou usuário negar: usa coordenadas de Luanda
- Exibe mensagem no console sobre o status

**Coordenadas de Fallback:**
```typescript
const LUANDA_COORDS = { lat: -8.839987, lng: 13.289436 };
const GEO_TIMEOUT = 5000; // 5 segundos
```

### 2. Busca Dinâmica com Places API

```typescript
const searchPlaces = async (searchType: SearchType) => {
  // searchType: 'tribunais' | 'escritorios'
  
  // Termos de busca:
  // - Tribunais: 'tribunal'
  // - Escritórios: 'escritório advocacia'
  
  // Raio de busca: 20km do centro do mapa
}
```

**Tipos de Busca:**

| Tipo | Keyword | Cor do Marcador | Ícone |
|------|---------|-----------------|-------|
| Tribunais | `tribunal` | Vermelho | Red Dot |
| Escritórios | `escritório advocacia` | Azul | Blue Dot |

**Funcionalidades:**
- Limpa marcadores anteriores
- Busca num raio de 20km do centro atual do mapa
- Cria marcadores com animação DROP
- Ajusta bounds para mostrar todos os resultados
- Loading state durante a busca

### 3. Interface do Usuário

#### Botões de Busca

Localização: Canto superior esquerdo do mapa

```tsx
<Card className="absolute top-4 left-4 z-10">
  <Button onClick={() => searchPlaces('tribunais')}>
    🔴 Tribunais
  </Button>
  <Button onClick={() => searchPlaces('escritorios')}>
    🔵 Escritórios
  </Button>
</Card>
```

**Estados dos Botões:**
- **Ativo**: Background colorido (vermelho/azul) + texto bold
- **Inativo**: Outline (borda)
- **Loading**: Ícone de loading spinner
- **Disabled**: Durante busca ou antes do mapa carregar

#### Card de Informação do Lugar

Aparece quando usuário clica em um marcador:

```tsx
{selectedPlace && (
  <Card className="absolute bottom-4 left-4 right-4 z-10">
    - Nome do lugar
    - Tipo (Tribunal/Escritório)
    - Endereço
    - Telefone (clicável: tel:)
    - Website (clicável: nova aba)
    - Avaliação (estrelas)
    - Botão "Obter Direções" (abre Google Maps)
  </Card>
)}
```

**Campos Exibidos:**
- ✅ **Nome**: sempre exibido
- ✅ **Endereço**: sempre exibido
- ❔ **Telefone**: apenas se disponível
- ❔ **Website**: apenas se disponível
- ❔ **Avaliação**: apenas se disponível (1-5 estrelas)

#### Estados de Loading

```tsx
{!isLoaded && (
  <div className="loading">
    <Loader2 />
    Carregando mapa...
    Obtendo sua localização...
  </div>
)}
```

#### Tela de Erro

Exibida quando há falha ao carregar a API:

```tsx
if (hasError) {
  return (
    <Card>
      <AlertCircle /> Erro no Mapa
      {errorMessage}
      
      Possíveis soluções:
      - Verificar se a API Key está configurada
      - Habilitar Maps JavaScript API e Places API
      - Verificar conexão com internet
      
      <Button>Tentar Novamente</Button>
    </Card>
  );
}
```

## Estrutura de Dados

### Interface Place

```typescript
interface Place {
  id: string;                    // place_id do Google ou timestamp
  name: string;                  // Nome do lugar
  address: string;               // Endereço (vicinity)
  phone?: string;                // formatted_phone_number
  website?: string;              // Website URL
  rating?: number;               // Avaliação 1-5
  position: LatLng | LatLngLiteral;  // Coordenadas
}
```

### Type SearchType

```typescript
type SearchType = 'tribunais' | 'escritorios';
```

## Fluxo de Funcionamento

### 1. Inicialização

```
┌─────────────────────────────────────┐
│  useEffect (mount)                  │
├─────────────────────────────────────┤
│  1. loadGoogleMaps()                │
│     - Verifica se API já carregada  │
│     - Cria script tag se necessário │
│     - Aguarda carregamento          │
│                                     │
│  2. initMap()                       │
│     - getUserLocation()             │
│       * Tenta geolocalização        │
│       * Timeout: 5s                 │
│       * Fallback: Luanda            │
│     - Cria instância do mapa        │
│     - Adiciona marcador do usuário  │
│     - Inicializa Places Service     │
│     - searchPlaces('tribunais')     │
└─────────────────────────────────────┘
```

### 2. Busca de Lugares

```
┌─────────────────────────────────────┐
│  searchPlaces(searchType)           │
├─────────────────────────────────────┤
│  1. setIsSearching(true)            │
│  2. clearMarkers()                  │
│  3. placesService.nearbySearch()    │
│     - location: center do mapa      │
│     - radius: 20000 (20km)          │
│     - keyword: tribunal/escritório  │
│                                     │
│  4. Callback com resultados:        │
│     - Cria marcadores               │
│     - Adiciona click listeners      │
│     - Ajusta bounds                 │
│  5. setIsSearching(false)           │
└─────────────────────────────────────┘
```

### 3. Interação com Marcador

```
┌─────────────────────────────────────┐
│  marker.addListener('click')        │
├─────────────────────────────────────┤
│  1. Cria objeto Place               │
│     - id, name, address             │
│     - phone, website, rating        │
│     - position                      │
│                                     │
│  2. setSelectedPlace(placeData)     │
│  3. map.panTo(position)             │
│  4. map.setZoom(15)                 │
│                                     │
│  → Card de info aparece na tela     │
└─────────────────────────────────────┘
```

## Configuração Necessária

### 1. Variável de Ambiente

Adicionar no arquivo `.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 2. Google Cloud Console

Habilitar as seguintes APIs:

1. **Maps JavaScript API**
   - Para renderização do mapa
   
2. **Places API**
   - Para busca de lugares (nearbySearch)

3. **Geolocation API** (opcional)
   - Para melhorar precisão da localização

**Configurar restrições de API Key:**
- Tipo: Aplicações web
- Referenciadores HTTP: adicionar domínio do site
- APIs restritas: Maps JavaScript API, Places API

### 3. URL do Script

```typescript
const script = document.createElement('script');
const apiKey = servicesConfig.googleMapsApiKey;
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
```

**Parâmetros importantes:**
- `key`: API Key do Google Maps
- `libraries=places`: Carrega biblioteca Places
- `loading=async`: Carregamento assíncrono

## Tratamento de Erros

### 1. Geolocalização

```typescript
// Cenários tratados:
- navigator.geolocation não disponível
- Usuário negou permissão
- Timeout (5 segundos)
- Erro desconhecido

// Solução: Fallback para Luanda
resolve(LUANDA_COORDS);
```

### 2. Carregamento da API

```typescript
// Cenários tratados:
- Script não carrega (network error)
- API Key inválida
- API não habilitada

// Solução: Exibe tela de erro com sugestões
setHasError(true);
setErrorMessage(error.message);
```

### 3. Places API

```typescript
// Cenários tratados:
- ZERO_RESULTS: nenhum lugar encontrado
- OVER_QUERY_LIMIT: limite de quota excedido
- REQUEST_DENIED: API Key inválida
- INVALID_REQUEST: parâmetros incorretos

// Solução: Log no console, não exibe erro visual
console.log('Nenhum resultado encontrado:', status);
```

## Otimizações

### 1. Refs para Performance

```typescript
const googleMapRef = useRef<google.maps.Map | null>(null);
const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
const markersRef = useRef<google.maps.Marker[]>([]);
```

**Motivo**: Evitar re-renders desnecessários ao manipular objetos do Google Maps

### 2. Cleanup de Marcadores

```typescript
const clearMarkers = () => {
  markersRef.current.forEach((marker) => marker.setMap(null));
  markersRef.current = [];
};

// Chamado em:
// - Nova busca (antes de adicionar novos marcadores)
// - useEffect cleanup (unmount)
```

### 3. Debounce na Busca Inicial

```typescript
setTimeout(() => {
  searchPlaces('tribunais');
}, 500);
```

**Motivo**: Aguardar mapa renderizar completamente antes de buscar lugares

## Personalização do Mapa

```typescript
googleMapRef.current = new google.maps.Map(mapRef.current, {
  center: location,           // Localização do usuário
  zoom: 12,                   // Nível de zoom inicial
  disableDefaultUI: false,    // Mantém controles padrão
  zoomControl: true,          // Botões de zoom
  mapTypeControl: false,      // Sem botão satélite/mapa
  streetViewControl: false,   // Sem Street View
  styles: [                   // Remove POIs padrão
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
});
```

## Marcadores

### Cores e Ícones

```typescript
// Tribunal (vermelho)
icon: {
  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  scaledSize: new google.maps.Size(40, 40),
}

// Escritório (azul)
icon: {
  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  scaledSize: new google.maps.Size(40, 40),
}

// Localização do usuário (verde)
icon: {
  url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  scaledSize: new google.maps.Size(32, 32),
}
```

### Animação

```typescript
animation: google.maps.Animation.DROP
```

Marcadores "caem" do topo quando criados.

## Exemplo de Uso

### Fluxo Típico do Usuário

1. **Página carrega**
   - Browser solicita permissão de localização
   - Mapa centraliza na localização do usuário (ou Luanda)
   - Marcador verde mostra posição do usuário
   - Busca automática por tribunais num raio de 20km

2. **Usuário clica em "Escritórios"**
   - Botão fica azul (ativo)
   - Marcadores antigos são removidos
   - Loading spinner aparece
   - Novos marcadores azuis aparecem no mapa
   - Mapa ajusta zoom para mostrar todos

3. **Usuário clica em um marcador**
   - Card aparece na parte inferior
   - Mostra nome, endereço, telefone, etc.
   - Mapa faz pan para o marcador
   - Zoom aumenta para 15

4. **Usuário clica em "Obter Direções"**
   - Abre Google Maps em nova aba
   - Rota do ponto atual até o destino

## Logs de Depuração

O componente registra informações úteis no console:

```typescript
// Geolocalização
console.log('Localização obtida:', coords);
console.log('Erro ao obter localização:', error.message);
console.log('Timeout de geolocalização - usando Luanda');

// Places API
console.log(\`Encontrados \${results.length} lugares para \${searchType}\`);
console.log('Nenhum resultado encontrado:', status);
console.warn('Mapa ou Places Service não inicializado');

// Erros
console.error('Erro ao inicializar mapa:', error);
```

## Limitações e Considerações

### 1. Quotas da Places API

- **Nearby Search**: $32 por 1000 requisições
- **Place Details** (se implementado): $17 por 1000 requisições
- Quota gratuita: $200/mês

**Recomendação**: Monitorar uso no Google Cloud Console

### 2. Precisão da Geolocalização

- Depende do dispositivo e browser
- Pode ser imprecisa em áreas urbanas densas
- Fallback para Luanda sempre funciona

### 3. Qualidade dos Resultados

- Depende dos dados do Google Maps para Angola
- Alguns lugares podem não ter telefone/website
- Avaliações podem estar ausentes

### 4. Performance

- Busca limitada a 20 resultados por padrão (Google Places)
- Raio de 20km pode retornar muitos ou poucos resultados
- Marcar muitos pontos pode deixar o mapa lento

## Melhorias Futuras

### Possíveis Features

1. **Filtros Avançados**
   - Filtrar por avaliação mínima
   - Filtrar por distância máxima
   - Mostrar apenas abertos agora

2. **Informações Adicionais**
   - Horário de funcionamento
   - Fotos do lugar
   - Reviews dos usuários

3. **Clustering de Marcadores**
   - Agrupar marcadores próximos
   - Melhorar performance com muitos pontos

4. **Direções no Próprio Mapa**
   - Exibir rota sem abrir Google Maps
   - Usar Directions API

5. **Salvar Favoritos**
   - LocalStorage ou backend
   - Lista de lugares salvos pelo usuário

6. **Compartilhar Localização**
   - Link direto para um lugar específico
   - URL com parâmetros de query

## Problemas Conhecidos e Soluções

### 1. "Google Maps API não carregada"

**Causa**: Script não carregou a tempo

**Solução**:
```typescript
// Já implementado: verificação de script existente
const existingScript = document.querySelector(
  'script[src*="maps.googleapis.com"]'
);
```

### 2. "Geolocalização não suportada"

**Causa**: Browser antigo ou HTTPS não configurado

**Solução**: Fallback para Luanda sempre funciona

### 3. Marcadores não aparecem

**Causa**: 
- Places API não encontrou resultados
- API Key sem permissão para Places API

**Solução**: Verificar logs do console e configuração da API

### 4. Card de info não fecha

**Causa**: Estado React não atualiza

**Solução**: Botão × chama `setSelectedPlace(null)`

## Contato e Suporte

Para questões sobre o componente:

- Verificar logs do console browser
- Conferir configuração da API Key
- Testar em modo incógnito (permissões limpas)
- Revisar quotas no Google Cloud Console

## Changelog

### Versão 2.0 (Atual)

- ✅ Implementada geolocalização do usuário
- ✅ Fallback para Luanda (-8.839987, 13.289436)
- ✅ Integração com Places API (nearbySearch)
- ✅ Botões de busca (Tribunais/Escritórios)
- ✅ Remoção de dados mockados
- ✅ Interface responsiva com loading states
- ✅ Tratamento robusto de erros
- ✅ Marcador da localização do usuário (verde)
- ✅ Card de informações detalhadas
- ✅ Link para direções no Google Maps

### Versão 1.0 (Anterior)

- Dados mockados hardcoded
- Centro fixo em Lisboa
- Sem busca dinâmica
- Sem geolocalização
