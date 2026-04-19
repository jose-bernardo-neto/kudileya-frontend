import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Phone, Globe, Star, AlertCircle, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { servicesConfig } from '@/lib/config';

// Coordenadas de Luanda como fallback
const LUANDA_COORDS = { lng: 13.289436, lat: -8.839987 };
const GEO_TIMEOUT = 5000; // 5 segundos

interface Place {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  position: [number, number]; // [lng, lat]
}

const LawyersMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const { t } = useLanguage();

  // Obter localização do usuário com timeout
  const getUserLocation = (): Promise<[number, number]> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocalização não suportada, usando Luanda');
        resolve([LUANDA_COORDS.lng, LUANDA_COORDS.lat]);
        return;
      }

      let handled = false;

      const onSuccess = (position: GeolocationPosition) => {
        if (!handled) {
          handled = true;
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          console.log('Localização obtida:', coords);
          setUserLocation(coords);
          resolve(coords);
        }
      };

      const onError = (error: GeolocationPositionError) => {
        if (!handled) {
          handled = true;
          console.log('Erro ao obter localização:', error.message, '- usando Luanda');
          resolve([LUANDA_COORDS.lng, LUANDA_COORDS.lat]);
        }
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: GEO_TIMEOUT,
        maximumAge: 60000,
        enableHighAccuracy: false,
      });

      // Fallback adicional caso o browser ignore o timeout
      setTimeout(() => {
        if (!handled) {
          handled = true;
          console.log('Timeout de geolocalização - usando Luanda');
          resolve([LUANDA_COORDS.lng, LUANDA_COORDS.lat]);
        }
      }, GEO_TIMEOUT + 500);
    });
  };

  // Limpar marcadores antigos
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  // Buscar lugares usando Mapbox Geocoding API
  const searchPlaces = async (query: string) => {
    if (!mapRef.current || !query.trim()) {
      console.warn('Mapa não inicializado ou query vazia');
      return;
    }

    setIsSearching(true);
    clearMarkers();

    const center = mapRef.current.getCenter();

    try {
      // Usar Mapbox Geocoding API para buscar lugares
      const accessToken = servicesConfig.mapboxAccessToken;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${center.lng},${center.lat}&limit=20&country=AO&access_token=${accessToken}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Falha ao buscar lugares');
      }

      const data = await response.json();
      const results = data.features || [];

      console.log(`Encontrados ${results.length} lugares para "${query}"`);

      // Criar marcadores para os resultados
      results.forEach((place: any) => {
        const [lng, lat] = place.center;

        // Criar elemento customizado para marcador
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#3b82f6'; // Azul para todos os marcadores
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        // Click listener
        el.addEventListener('click', () => {
          const placeData: Place = {
            id: place.id || String(Date.now()),
            name: place.text || place.place_name || 'Sem nome',
            address: place.place_name || 'Endereço não disponível',
            position: [lng, lat],
          };

          setSelectedPlace(placeData);
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1000,
          });
        });

        markersRef.current.push(marker);
      });

      // Ajustar bounds para mostrar todos os marcadores
      if (markersRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markersRef.current.forEach((marker) => {
          bounds.extend(marker.getLngLat());
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error: any) {
      console.error('Erro ao buscar lugares:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const accessToken = servicesConfig.mapboxAccessToken;

        if (!accessToken || accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
          throw new Error(
            'Mapbox Access Token não configurado. Configure VITE_MAPBOX_ACCESS_TOKEN no arquivo .env',
          );
        }

        // Configurar token do Mapbox
        mapboxgl.accessToken = accessToken;

        // Obter localização do usuário
        const location = await getUserLocation();

        // Inicializar mapa
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: location,
          zoom: 12,
        });

        mapRef.current = map;

        // Aguardar mapa carregar
        map.on('load', () => {
          setIsLoaded(true);

          // Adicionar marcador da localização do usuário
          if (userLocation) {
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#22c55e';
            el.style.border = '3px solid white';
            el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

            const userMarker = new mapboxgl.Marker(el)
              .setLngLat(userLocation)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  '<p style="margin: 0; padding: 4px 8px; font-size: 12px;">Sua localização</p>',
                ),
              )
              .addTo(map);

            userMarkerRef.current = userMarker;
          }
        });

        map.on('error', (e) => {
          console.error('Erro no mapa:', e);
          setHasError(true);
          setErrorMessage('Erro ao carregar o mapa Mapbox');
        });

        // Adicionar controles de navegação
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      } catch (error: any) {
        console.error('Erro ao inicializar mapa:', error);
        setHasError(true);
        setErrorMessage(
          error.message || 'Erro desconhecido ao carregar o mapa',
        );
        setIsLoaded(true);
      }
    };

    initMap();

    // Cleanup
    return () => {
      clearMarkers();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
      />
    ));
  };

  // Mostrar erro
  if (hasError) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive" size={20} />
              Erro no Mapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Possíveis soluções:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verificar se o Mapbox Access Token está configurado no .env</li>
                <li>
                  Criar um token em{' '}
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    account.mapbox.com
                  </a>
                </li>
                <li>Verificar conexão com internet</li>
              </ul>
            </div>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando mapa...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Obtendo sua localização...
              </p>
            </div>
          </div>
        )}

        {/* Campo de Busca */}
        <Card className="absolute top-4 left-4 z-10 w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Buscar no Mapa</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  searchPlaces(searchQuery);
                }
              }}
              className="flex gap-2"
            >
              <Input
                type="text"
                placeholder="Ex: tribunal, escritório advocacia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching || !isLoaded}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSearching || !isLoaded || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info do Lugar Selecionado */}
        {selectedPlace && (
          <Card className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{selectedPlace.name}</CardTitle>
                  <Badge variant="default" className="mt-1">
                    Lugar
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <span className="text-sm">{selectedPlace.address}</span>
              </div>

              {selectedPlace.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <a
                    href={`tel:${selectedPlace.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedPlace.phone}
                  </a>
                </div>
              )}

              {selectedPlace.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-muted-foreground" />
                  <a
                    href={selectedPlace.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedPlace.website}
                  </a>
                </div>
              )}

              {selectedPlace.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(selectedPlace.rating)}
                  </div>
                  <span className="text-sm font-medium">
                    {selectedPlace.rating}
                  </span>
                </div>
              )}

              <Button className="w-full mt-2" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.position[1]},${selectedPlace.position[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Obter Direções
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LawyersMap;
