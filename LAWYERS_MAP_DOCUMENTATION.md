# Documentação do Componente LawyersMap

## Visão Geral

O componente `LawyersMap` exibe um mapa interativo mostrando tribunais e escritórios de advocacia em Angola. Utiliza o **Mapbox GL JS** e a **Geocoding API** para fornecer uma experiência de busca dinâmica e localização em tempo real.

## Migração do Google Maps para Mapbox

**Mudanças Principais:**
- ✅ **API de Mapa**: Google Maps JavaScript API → Mapbox GL JS
- ✅ **API de Busca**: Google Places API → Mapbox Geocoding API  
- ✅ **Coordenadas**: `{lat, lng}` → `[lng, lat]` (ordem invertida!)
- ✅ **Marcadores**: `google.maps.Marker` → `mapboxgl.Marker` com elementos DOM
- ✅ **Configuração**: `VITE_GOOGLE_MAPS_API_KEY` → `VITE_MAPBOX_ACCESS_TOKEN`

## Tecnologias Utilizadas

- **Mapbox GL JS v3.22.0**: Renderização de mapa interativo
- **Mapbox Geocoding API**: Busca de lugares
- **Geolocation API**: Localização do usuário
- **React + TypeScript**: Framework  
- **shadcn/ui**: Componentes (Card, Button, Badge, Alert)
- **Tailwind CSS**: Estilização

## Configuração

### 1. Variáveis de Ambiente (.env)

```bash
# Mapbox Access Token
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InlvdXJ0b2tlbiJ9.abc123

# Feature flag para habilitar/desabilitar mapa
VITE_ENABLE_MAP=true
```

### 2. Obter Access Token

1. Acesse https://account.mapbox.com/access-tokens/
2. Crie uma conta ou faça login
3. Clique em "Create a token"
4. Copie o token e adicione no `.env`

**Nota:** O free tier do Mapbox oferece:
- 100,000 requisições de Geocoding por mês
- 50,000 carregamentos de mapa por mês

### 3. Instalação

```bash
pnpm add mapbox-gl
# @types/mapbox-gl não é necessário (mapbox-gl tem tipos built-in)
```

## Funcionalidades Principais

### 1. Geolocalização com Fallback

```typescript
const getUserLocation = (): Promise<[number, number]> => {
  return new Promise((resolve) => {
    // Timeout: 5 segundos
    // Fallback: Luanda [13.289436, -8.839987]
  });
};
```

**Comportamento:**
- Solicita permissão de geolocalização
- Timeout de 5 segundos  
- Fallback para Luanda se falhar
- Console.log do status
- Formato: `[longitude, latitude]` (Mapbox)

**Coordenadas:**
```typescript
const LUANDA_COORDS = { lng: 13.289436, lat: -8.839987 };
const GEO_TIMEOUT = 5000; // 5 segundos
```

### 2. Busca com Mapbox Geocoding API

```typescript
const searchPlaces = async (searchType: SearchType) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/
    ${encodeURIComponent(searchQuery)}.json?
    proximity=${center.lng},${center.lat}&
    limit=20&
    country=AO&
    access_token=${accessToken}`;
};
```

**Parâmetros:**
- `searchQuery`: "tribunal" ou "escritório advocacia"
- `proximity`: coordenadas do centro do mapa (busca próxima)
- `limit`: máximo 20 resultados
- `country=AO`: restringe a Angola

**Tipos de Busca:**

| Tipo        | Keyword                | Marcador  | Cor     |
|-------------|------------------------|-----------|---------|
| Tribunais   | `tribunal`             | Círculo   | Vermelho (#ef4444) |
| Escritórios | `escritório advocacia` | Círculo   | Azul (#3b82f6) |

### 3. Marcadores Customizados

```typescript
const el = document.createElement('div');
el.style.width = '30px';
el.style.height = '30px';
el.style.borderRadius = '50%';
el.style.backgroundColor = searchType === 'tribunais' ? '#ef4444' : '#3b82f6';
el.style.border = '3px solid white';
el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

const marker = new mapboxgl.Marker(el)
  .setLngLat([lng, lat])
  .addTo(map);
```

**Estilos:**
- Tribunais: círculo vermelho 30x30px
- Escritórios: círculo azul 30x30px
- Usuário: círculo verde 20x20px
- Borda branca 3px
- Sombra para destaque

### 4. Interface de Usuário

#### Botões de Busca (top-left)

```tsx
<Card className="absolute top-4 left-4 z-10">
  <Button 
    variant={activeSearch === 'tribunais' ? 'default' : 'outline'}
    onClick={() => searchPlaces('tribunais')}
    className={activeSearch === 'tribunais' ? 'bg-red-600 hover:bg-red-700' : ''}
  >
    {isSearching ? <Loader2 /> : <div className="w-4 h-4 bg-red-500 rounded-full" />}
    Tribunais
  </Button>
  
  <Button 
    variant={activeSearch === 'escritorios' ? 'default' : 'outline'}
    onClick={() => searchPlaces('escritorios')}
    className={activeSearch === 'escritorios' ? 'bg-blue-600 hover:bg-blue-700' : ''}
  >
    {isSearching ? <Loader2 /> : <div className="w-4 h-4 bg-blue-500 rounded-full" />}
    Escritórios
  </Button>
</Card>
```

#### Card de Informação do Lugar (bottom-center)

Aparece ao clicar em marcador:

```tsx
{selectedPlace && (
  <Card className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
    <CardTitle>{selectedPlace.name}</CardTitle>
    <Badge>{activeSearch === 'tribunais' ? 'Tribunal' : 'Escritório'}</Badge>
    
    {/* Endereço */}
    <MapPin /> {selectedPlace.address}
    
    {/* Telefone (opcional) */}
    {selectedPlace.phone && (
      <a href={`tel:${selectedPlace.phone}`}>
        <Phone /> {selectedPlace.phone}
      </a>
    )}
    
    {/* Website (opcional) */}
    {selectedPlace.website && (
      <a href={selectedPlace.website} target="_blank">
        <Globe /> {selectedPlace.website}
      </a>
    )}
    
    {/* Avaliação (opcional) */}
    {selectedPlace.rating && (
      <div>{renderStars(selectedPlace.rating)} {selectedPlace.rating}</div>
    )}
    
    {/* Botão de Direções */}
    <Button asChild>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}>
        Obter Direções
      </a>
    </Button>
  </Card>
)}
```

#### Estados Visuais

**Loading:**
```tsx
{!isLoaded && (
  <div className="absolute inset-0 flex items-center justify-center">
    <Loader2 className="animate-spin" />
    <p>Carregando mapa...</p>
    <p>Obtendo sua localização...</p>
  </div>
)}
```

**Erro:**
```tsx
if (hasError) {
  return (
    <Card>
      <AlertCircle className="text-destructive" />
      <h3>Erro no Mapa</h3>
      <AlertDescription>{errorMessage}</AlertDescription>
      
      <ul>
        <li>Verificar se VITE_MAPBOX_ACCESS_TOKEN está no .env</li>
        <li>Criar token em account.mapbox.com/access-tokens/</li>
        <li>Verificar conexão com internet</li>
      </ul>
      
      <Button onClick={() => window.location.reload()}>
        Tentar Novamente
      </Button>
    </Card>
  );
}
```

## Estrutura de Dados

### Interface Place

```typescript
interface Place {
  id: string;              // place.id ou timestamp
  name: string;            // place.text ou place.place_name
  address: string;         // place.place_name
  phone?: string;          // não disponível no Geocoding (apenas no nome)
  website?: string;        // não disponível no Geocoding
  rating?: number;         // não disponível no Geocoding
  position: [number, number]; // [lng, lat] - FORMATO MAPBOX!
}
```

**Nota:** Mapbox Geocoding API retorna dados básicos. Para telefone, website e rating, seria necessário usar o Mapbox Search API ou integrar com outra API.

### Type SearchType

```typescript
type SearchType = 'tribunais' | 'escritorios';
```

## Fluxo de Funcionamento

### 1. Inicialização

```
useEffect (mount)
├── initMap()
│   ├── Verifica servicesConfig.mapboxAccessToken
│   ├── Valida se não é 'YOUR_MAPBOX_ACCESS_TOKEN_HERE'
│   ├── Define mapboxgl.accessToken
│   ├── getUserLocation() → Promise<[lng, lat]>
│   │   ├── navigator.geolocation.getCurrentPosition()
│   │   │   ├── Success → resolve([lng, lat])
│   │   │   ├── Error → resolve(LUANDA_COORDS)
│   │   │   └── Timeout 5s → resolve(LUANDA_COORDS)
│   │   └── Duplo fallback (setTimeout 5.5s)
│   ├── new mapboxgl.Map({ container, style, center, zoom: 12 })
│   ├── map.on('load')
│   │   ├── setIsLoaded(true)
│   │   ├── Criar marcador do usuário (verde 20px)
│   │   │   └── new mapboxgl.Marker(el).setLngLat(userLocation).setPopup(...)
│   │   └── setTimeout(() => searchPlaces('tribunais'), 500)
│   ├── map.on('error') → setHasError(true)
│   └── map.addControl(new mapboxgl.NavigationControl())
└── Cleanup (unmount)
    ├── clearMarkers() → markersRef.current.forEach(m => m.remove())
    ├── userMarkerRef.current?.remove()
    └── mapRef.current?.remove()
```

### 2. Busca de Lugares

```
searchPlaces(searchType)
├── if (!mapRef.current) return
├── setIsSearching(true)
├── setActiveSearch(searchType)
├── clearMarkers()
├── const center = mapRef.current.getCenter()
├── const searchQuery = searchType === 'tribunais' ? 'tribunal' : 'escritório advocacia'
├── fetch(Mapbox Geocoding API)
│   ├── URL: https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
│   ├── Params:
│   │   ├── proximity: {center.lng},{center.lat}
│   │   ├── limit: 20
│   │   ├── country: AO
│   │   └── access_token: {token}
│   └── response.json() → { features: [...] }
├── results.forEach(place)
│   ├── const [lng, lat] = place.center
│   ├── Criar elemento DOM customizado
│   │   ├── div.custom-marker
│   │   ├── style: 30x30px, círculo, cor (vermelho/azul)
│   │   └── click listener → setSelectedPlace()
│   ├── new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map)
│   └── markersRef.current.push(marker)
├── if (markersRef.current.length > 0)
│   ├── const bounds = new mapboxgl.LngLatBounds()
│   ├── markersRef.current.forEach(m => bounds.extend(m.getLngLat()))
│   └── mapRef.current.fitBounds(bounds, { padding: 50 })
└── setIsSearching(false)
```

### 3. Interação com Marcador

```
marker.el.addEventListener('click')
├── Criar Place object
│   ├── id: place.id || String(Date.now())
│   ├── name: place.text || place.place_name || 'Sem nome'
│   ├── address: place.place_name || 'Endereço não disponível'
│   └── position: [lng, lat]
├── setSelectedPlace(placeData)
└── mapRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 })
```

## Referências de APIs

### Mapbox GL JS

- **Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **Exemplos**: https://docs.mapbox.com/mapbox-gl-js/example/
- **API Reference**: https://docs.mapbox.com/mapbox-gl-js/api/

### Mapbox Geocoding API

- **Docs**: https://docs.mapbox.com/api/search/geocoding/
- **Playground**: https://docs.mapbox.com/playground/geocoding/

### Principais Classes

```typescript
// Mapa
new mapboxgl.Map(options)
map.on(event, callback)
map.getCenter() // → LngLat
map.flyTo(options)
map.fitBounds(bounds, options)
map.addControl(control)
map.remove()

// Marcadores
new mapboxgl.Marker(element?)
marker.setLngLat([lng, lat])
marker.setPopup(popup)
marker.addTo(map)
marker.remove()
marker.getLngLat() // → LngLat

// Popups
new mapboxgl.Popup(options)
popup.setHTML(html)

// Bounds
new mapboxgl.LngLatBounds()
bounds.extend(lngLat)

// Controles
new mapboxgl.NavigationControl()
```

## Troubleshooting

### Erro: "Mapbox Access Token não configurado"

**Causa:** `VITE_MAPBOX_ACCESS_TOKEN` não definido ou ainda tem valor padrão

**Solução:**
1. Criar token em https://account.mapbox.com/access-tokens/
2. Adicionar no `.env`: `VITE_MAPBOX_ACCESS_TOKEN=pk.ey...`
3. Reiniciar dev server (`pnpm run dev`)

### Erro: "Invalid token" ou 401

**Causa:** Token inválido ou expirado

**Solução:**
1. Verificar se token está correto (começa com `pk.`)
2. Verificar se token não foi revogado
3. Criar novo token se necessário

### Mapa não carrega ou fica cinza

**Causa:** CSS do Mapbox não importado

**Solução:**
```typescript
import 'mapbox-gl/dist/mapbox-gl.css'; // OBRIGATÓRIO!
```

### Busca não retorna resultados

**Causas possíveis:**
- Query muito específica (ex: "Tribunal de Luanda Viana")
- Região sem dados cadastrados
- Limite de requisições atingido (free tier: 100k/mês)

**Soluções:**
- Usar queries mais genéricas ("tribunal", "escritório")
- Expandir área de busca (remover `proximity` ou aumentar `limit`)
- Verificar cota no dashboard Mapbox

### Coordenadas invertidas (mapa no oceano)

**Causa:** Ordem errada de coordenadas

**CORRETO (Mapbox):**
```typescript
const position: [number, number] = [longitude, latitude]; // [lng, lat]
marker.setLngLat([13.289436, -8.839987]); // [lng, lat]
```

**ERRADO:**
```typescript
marker.setLngLat([-8.839987, 13.289436]); // ❌ [lat, lng] NÃO FUNCIONA
```

## Melhorias Futuras

### 1. Dados Enriquecidos

Mapbox Geocoding API retorna dados básicos. Para informações detalhadas:

**Opção A:** Usar Mapbox Search Box API (pago)
- Inclui telefone, horário, fotos
- https://docs.mapbox.com/api/search/search-box/

**Opção B:** Integrar com outra API
- Google Places API (pago)
- Foursquare API
- OpenStreetMap Nominatim (grátis)

### 2. Filtros Avançados

```typescript
// Adicionar filtros no UI
interface SearchFilters {
  type: SearchType;
  rating?: number;        // Mínimo de estrelas
  openNow?: boolean;      // Aberto agora
  distance?: number;      // Raio em km
}
```

### 3. Clustering de Marcadores

Para muitos resultados, usar Mapbox clusters:

```typescript
map.addSource('places', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});
```

### 4. Direções Integradas

Usar Mapbox Directions API em vez de abrir Google Maps:

```typescript
// https://docs.mapbox.com/api/navigation/directions/
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/
  ${userLng},${userLat};${destLng},${destLat}?
  geometries=geojson&
  access_token=${token}`;
```

## Changelog

### v2.0.0 (atual) - Migração para Mapbox

- ✅ Substituído Google Maps por Mapbox GL JS
- ✅ Substituído Places API por Geocoding API
- ✅ Atualizado formato de coordenadas `[lng, lat]`
- ✅ Marcadores customizados com DOM elements
- ✅ Mesma UX e funcionalidades
- ⚠️ Perdidos: telefone, website, rating (limitação da API)

### v1.0.0 - Google Maps (deprecado)

- Google Maps JavaScript API
- Google Places nearbySearch
- Coordenadas `{lat, lng}`
- Marcadores nativos `google.maps.Marker`

## Licença

Mapbox GL JS: BSD-3-Clause
Mapbox APIs: Terms of Service - https://www.mapbox.com/legal/tos/
