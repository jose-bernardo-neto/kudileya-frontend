import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Globe, Star, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { servicesConfig } from '@/lib/config';

// Coordenadas de Luanda como fallback
const LUANDA_COORDS = { lat: -8.839987, lng: 13.289436 };
const GEO_TIMEOUT = 5000; // 5 segundos

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface Place {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
}

type SearchType = 'tribunais' | 'escritorios';

const LawyersMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeSearch, setActiveSearch] = useState<SearchType>('tribunais');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  const { t } = useLanguage();

  // Obter localização do usuário com timeout
  const getUserLocation = (): Promise<google.maps.LatLngLiteral> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocalização não suportada, usando Luanda');
        resolve(LUANDA_COORDS);
        return;
      }

      let handled = false;

      const onSuccess = (position: GeolocationPosition) => {
        if (!handled) {
          handled = true;
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Localização obtida:', coords);
          setUserLocation(coords);
          resolve(coords);
        }
      };

      const onError = (error: GeolocationPositionError) => {
        if (!handled) {
          handled = true;
          console.log('Erro ao obter localização:', error.message, '- usando Luanda');
          resolve(LUANDA_COORDS);
        }
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: GEO_TIMEOUT,
        maximumAge: 60000,
        enableHighAccuracy: false
      });

      // Fallback adicional caso o browser ignore o timeout
      setTimeout(() => {
        if (!handled) {
          handled = true;
          console.log('Timeout de geolocalização - usando Luanda');
          resolve(LUANDA_COORDS);
        }
      }, GEO_TIMEOUT + 500);
    });
  };

  // Limpar marcadores antigos
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  // Buscar lugares usando Places API
  const searchPlaces = async (searchType: SearchType) => {
    if (!googleMapRef.current || !placesServiceRef.current) {
      console.warn('Mapa ou Places Service não inicializado');
      return;
    }

    setIsSearching(true);
    setActiveSearch(searchType);
    clearMarkers();

    const center = googleMapRef.current.getCenter();
    if (!center) return;

    // Definir termos de busca
    const searchQuery = searchType === 'tribunais' 
      ? 'tribunal' 
      : 'escritório advocacia';

    const request: google.maps.places.PlaceSearchRequest = {
      location: center,
      radius: 20000, // 20km
      keyword: searchQuery,
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      setIsSearching(false);

      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
        console.log('Nenhum resultado encontrado:', status);
        return;
      }

      console.log(\`Encontrados \${results.length} lugares para \${searchType}\`);

      // Criar marcadores para os resultados
      results.forEach((place) => {
        if (!place.geometry || !place.geometry.location) return;

        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map: googleMapRef.current!,
          title: place.name,
          icon: {
            url: searchType === 'tribunais'
              ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40),
          },
          animation: google.maps.Animation.DROP,
        });

        marker.addListener('click', () => {
          const placeData: Place = {
            id: place.place_id || String(Date.now()),
            name: place.name || 'Sem nome',
            address: place.vicinity || 'Endereço não disponível',
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
            position: place.geometry!.location!,
          };

          setSelectedPlace(placeData);
          googleMapRef.current?.panTo(place.geometry!.location!);
          googleMapRef.current?.setZoom(15);
        });

        markersRef.current.push(marker);
      });

      // Ajustar bounds para mostrar todos os marcadores
      if (markersRef.current.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markersRef.current.forEach((marker) => {
          const pos = marker.getPosition();
          if (pos) bounds.extend(pos);
        });
        googleMapRef.current!.fitBounds(bounds);
      }
    });
  };

  // Inicializar mapa
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Aguardar API do Google Maps carregar
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API não carregada');
        }

        // Obter localização do usuário
        const location = await getUserLocation();

        // Inicializar mapa
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        // Adicionar marcador da localização do usuário
        if (userLocation) {
          new google.maps.Marker({
            position: userLocation,
            map: googleMapRef.current,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new google.maps.Size(32, 32),
            },
            title: 'Sua localização',
          });
        }

        // Inicializar Places Service
        placesServiceRef.current = new google.maps.places.PlacesService(
          googleMapRef.current
        );

        setIsLoaded(true);

        // Buscar tribunais por padrão
        setTimeout(() => {
          searchPlaces('tribunais');
        }, 500);

      } catch (error: any) {
        console.error('Erro ao inicializar mapa:', error);
        setHasError(true);
        setErrorMessage(error.message || 'Erro desconhecido ao carregar o mapa');
        setIsLoaded(true);
      }
    };

    // Carregar script do Google Maps
    const loadGoogleMaps = () => {
      // Verificar se já está carregado
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Verificar se script já existe
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        // Aguardar carregamento
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initMap();
          }
        }, 100);
        setTimeout(() => clearInterval(checkLoaded), 10000);
        return;
      }

      // Criar script
      const script = document.createElement('script');
      const apiKey = servicesConfig.googleMapsApiKey || 'YOUR_API_KEY_HERE';
      script.src = \`https://maps.googleapis.com/maps/api/js?key=\${apiKey}&libraries=places&loading=async\`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setTimeout(initMap, 100);
      };

      script.onerror = () => {
        setHasError(true);
        setErrorMessage('Falha ao carregar Google Maps API');
        setIsLoaded(true);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      clearMarkers();
    };
  }, []);

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={\`\${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-muted-foreground'
        }\`}
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
                <li>Verificar se a API Key está configurada no .env</li>
                <li>Habilitar Maps JavaScript API e Places API</li>
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
        <div ref={mapRef} className="w-full h-full" />

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

        {/* Botões de Busca */}
        <Card className="absolute top-4 left-4 z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Buscar no Mapa</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Button
              variant={activeSearch === 'tribunais' ? 'default' : 'outline'}
              size="sm"
              onClick={() => searchPlaces('tribunais')}
              disabled={isSearching || !isLoaded}
              className={\`w-full justify-start \${
                activeSearch === 'tribunais' ? 'bg-red-600 hover:bg-red-700' : ''
              }\`}
            >
              {isSearching && activeSearch === 'tribunais' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              )}
              Tribunais
            </Button>
            <Button
              variant={activeSearch === 'escritorios' ? 'default' : 'outline'}
              size="sm"
              onClick={() => searchPlaces('escritorios')}
              disabled={isSearching || !isLoaded}
              className={\`w-full justify-start \${
                activeSearch === 'escritorios' ? 'bg-blue-600 hover:bg-blue-700' : ''
              }\`}
            >
              {isSearching && activeSearch === 'escritorios' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              )}
              Escritórios
            </Button>
          </CardContent>
        </Card>

        {/* Info do Lugar Selecionado */}
        {selectedPlace && (
          <Card className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{selectedPlace.name}</CardTitle>
                  <Badge
                    variant={activeSearch === 'tribunais' ? 'destructive' : 'default'}
                    className="mt-1"
                  >
                    {activeSearch === 'tribunais' ? 'Tribunal' : 'Escritório'}
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
                <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{selectedPlace.address}</span>
              </div>

              {selectedPlace.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <a
                    href={\`tel:\${selectedPlace.phone}\`}
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
                  <span className="text-sm font-medium">{selectedPlace.rating}</span>
                </div>
              )}

              <Button
                className="w-full mt-2"
                asChild
              >
                <a
                  href={\`https://www.google.com/maps/dir/?api=1&destination=\${
                    (selectedPlace.position as google.maps.LatLng).lat?.() ||
                    (selectedPlace.position as google.maps.LatLngLiteral).lat
                  },\${
                    (selectedPlace.position as google.maps.LatLng).lng?.() ||
                    (selectedPlace.position as google.maps.LatLngLiteral).lng
                  }\`}
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
