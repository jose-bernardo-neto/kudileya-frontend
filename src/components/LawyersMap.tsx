import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Globe, Clock, Star, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface LawyerOffice {
  id: string;
  name: string;
  type: 'court' | 'law_firm';
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  rating?: number;
  specialties?: string[];
  lat: number;
  lng: number;
}

const LawyersMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedOffice, setSelectedOffice] = useState<LawyerOffice | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchService, setSearchService] = useState<any>(null);
  const { t } = useLanguage();

  // Create marker content for new API
  const createMarkerContent = (type: 'court' | 'law_firm') => {
    const markerDiv = document.createElement('div');
    markerDiv.style.width = '24px';
    markerDiv.style.height = '24px';
    markerDiv.style.borderRadius = '50%';
    markerDiv.style.backgroundColor = type === 'court' ? '#ef4444' : '#3b82f6';
    markerDiv.style.border = '2px solid white';
    markerDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    return markerDiv;
  };

  // Sample data for Angola courts and law firms
  const lawyerOffices: LawyerOffice[] = [
    {
      id: '1',
      name: 'Tribunal Supremo de Angola',
      type: 'court',
      address: 'Largo da Mutamba, Luanda, Angola',
      phone: '+244 222 310 318',
      hours: '8:00 - 16:30',
      lat: -8.8080,
      lng: 13.2336
    },
    {
      id: '2',
      name: 'Miranda & Associados',
      type: 'law_firm',
      address: 'Rua Rainha Ginga 12, Luanda, Angola',
      phone: '+244 222 441 355',
      website: 'www.mirandalawfirm.com',
      rating: 4.7,
      specialties: ['Direito Comercial', 'Petróleo e Gás', 'Arbitragem'],
      lat: -8.8137,
      lng: 13.2362
    },
    {
      id: '3',
      name: 'Tribunal Provincial de Luanda',
      type: 'court',
      address: 'Rua Amílcar Cabral, Luanda, Angola',
      phone: '+244 222 393 847',
      hours: '8:00 - 16:30',
      lat: -8.8159,
      lng: 13.2306
    },
    {
      id: '4',
      name: 'VdA Angola',
      type: 'law_firm',
      address: 'Rua Frederico Engels 92, Luanda, Angola',
      phone: '+244 226 430 284',
      website: 'www.vda.pt',
      rating: 4.5,
      specialties: ['Bancário', 'Imobiliário', 'Contencioso'],
      lat: -8.8176,
      lng: 13.2441
    },
    {
      id: '5',
      name: 'Tribunal de Comarca de Benguela',
      type: 'court',
      address: 'Avenida Norton de Matos, Benguela, Angola',
      phone: '+244 272 232 445',
      hours: '8:00 - 16:30',
      lat: -12.5763,
      lng: 13.4055
    }
  ];

  // Wait for Google Maps API to be fully loaded
  const waitForGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const checkGoogleMaps = () => {
        if (window.google && 
            window.google.maps && 
            typeof window.google.maps.Map === 'function' &&
            window.google.maps.places) {
          resolve();
        } else if (Date.now() - startTime > 10000) { // 10 second timeout
          reject(new Error('Google Maps API failed to load within timeout'));
        } else {
          setTimeout(checkGoogleMaps, 100); // Check every 100ms
        }
      };
      
      const startTime = Date.now();
      checkGoogleMaps();
    });
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Wait for Google Maps to be fully loaded
        await waitForGoogleMaps();

        // Double check that Map constructor is available
        if (!window.google || !window.google.maps || typeof window.google.maps.Map !== 'function') {
          throw new Error('Google Maps API not properly loaded');
        }

        // Initialize map with error handling
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: -8.8137, lng: 13.2362 }, // Center of Luanda, Angola
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Try to use new Place API, fallback to old one
        try {
          if (window.google.maps.places && window.google.maps.places.Place) {
            // New Place API
            setSearchService({ type: 'new', service: window.google.maps.places });
          } else if (window.google.maps.places && window.google.maps.places.PlacesService) {
            // Legacy PlacesService as fallback
            const placesService = new window.google.maps.places.PlacesService(map);
            setSearchService({ type: 'legacy', service: placesService });
          }
        } catch (placesError) {
          console.warn('Places API not available:', placesError);
        }

        // Add markers with fallback to legacy API
        try {
          // Try new AdvancedMarkerElement first
          const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
          
          lawyerOffices.forEach((office) => {
            const marker = new AdvancedMarkerElement({
              map,
              position: { lat: office.lat, lng: office.lng },
              title: office.name,
              content: createMarkerContent(office.type)
            });

            marker.addListener('click', () => {
              setSelectedOffice(office);
              map.setCenter({ lat: office.lat, lng: office.lng });
              map.setZoom(15);
            });
          });
        } catch (markerError) {
          // Fallback to legacy markers
          console.warn('Using legacy markers:', markerError);
          
          lawyerOffices.forEach((office) => {
            const marker = new window.google.maps.Marker({
              position: { lat: office.lat, lng: office.lng },
              map,
              title: office.name,
              icon: {
                url: office.type === 'court' 
                  ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }
            });

            marker.addListener('click', () => {
              setSelectedOffice(office);
              map.setCenter({ lat: office.lat, lng: office.lng });
              map.setZoom(15);
            });
          });
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setHasError(true);
        
        // Set specific error messages
        if (error.message.includes('BillingNotEnabledMapError')) {
          setErrorMessage('Erro de cobrança: A API do Google Maps requer configuração de billing.');
        } else if (error.message.includes('ApiNotActivatedMapError')) {
          setErrorMessage('API não ativada: O Google Maps API precisa ser ativado no console.');
        } else {
          setErrorMessage('Erro ao carregar o mapa. Verifique sua conexão e configuração da API.');
        }
        
        setIsLoaded(true);
      }
    };

    // Load Google Maps API with proper async loading and error handling
    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
        initMap();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for the existing script to complete
        const waitAndInit = () => {
          setTimeout(() => {
            if (window.google && window.google.maps && typeof window.google.maps.Map === 'function') {
              initMap();
            } else if (Date.now() - waitStart < 15000) { // 15 second timeout
              waitAndInit();
            } else {
              setHasError(true);
              setErrorMessage('Timeout aguardando carregar Google Maps API.');
              setIsLoaded(true);
            }
          }, 100);
        };
        const waitStart = Date.now();
        waitAndInit();
        return;
      }

      // Create new script with proper async loading
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDPlnutqHNmkLtpvZEB-KXgIQ3P0skk670&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Don't init immediately, let the API fully initialize first
        setTimeout(() => {
          initMap();
        }, 100);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setHasError(true);
        setErrorMessage('Falha ao carregar Google Maps API. Verifique sua chave de API.');
        setIsLoaded(true);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const getOfficeTypeLabel = (type: string) => {
    return type === 'court' ? t('map.court') : t('map.lawFirm');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const searchOnMap = (searchTerm: string) => {
    if (!searchService || !mapInstanceRef.current) {
      console.warn('Search service not available');
      return;
    }

    if (searchService.type === 'legacy' && searchService.service) {
      // Use legacy PlacesService
      const request = {
        query: `${searchTerm} Angola`,
        fields: ['name', 'geometry', 'formatted_address', 'rating'],
      };

      searchService.service.textSearch(request, (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          const location = place.geometry.location;
          
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(14);

          // Add temporary marker
          const searchMarker = new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          setTimeout(() => {
            searchMarker.setMap(null);
          }, 5000);
        }
      });
    } else {
      // Fallback to text-based search without Places API
      console.info('Searching for:', searchTerm, 'in Angola');
      // You could implement a basic search here or show a message
    }
  };

  // Show error state
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
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Possíveis soluções:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verificar se a API Key está correta</li>
                <li>Habilitar billing no Google Cloud Console</li>
                <li>Ativar Maps JavaScript API</li>
                <li>Verificar conexão com internet</li>
              </ul>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
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
        
        {!isLoaded && (
          <div className="absolute inset-0 bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('map.loading')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Carregando Google Maps...
              </p>
            </div>
          </div>
        )}

        {selectedOffice && (
          <Card className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{selectedOffice.name}</CardTitle>
                  <Badge 
                    variant={selectedOffice.type === 'court' ? 'destructive' : 'default'}
                    className="mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => searchOnMap(selectedOffice.type === 'court' ? 'tribunal' : 'escritório advocacia')}
                    title={`Pesquisar ${selectedOffice.type === 'court' ? 'tribunais' : 'escritórios de advocacia'} no mapa`}
                  >
                    {getOfficeTypeLabel(selectedOffice.type)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOffice(null)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{selectedOffice.address}</span>
              </div>

              {selectedOffice.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <a 
                    href={`tel:${selectedOffice.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedOffice.phone}
                  </a>
                </div>
              )}

              {selectedOffice.website && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-muted-foreground" />
                  <a 
                    href={`https://${selectedOffice.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedOffice.website}
                  </a>
                </div>
              )}

              {selectedOffice.hours && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm">{selectedOffice.hours}</span>
                </div>
              )}

              {selectedOffice.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(selectedOffice.rating)}
                  </div>
                  <span className="text-sm font-medium">{selectedOffice.rating}</span>
                </div>
              )}

              {selectedOffice.specialties && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('map.specialties')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedOffice.specialties.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-primary/10 transition-colors" 
                        onClick={() => searchOnMap(specialty)}
                        title={`Pesquisar "${specialty}" no mapa`}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="absolute top-4 right-4 z-10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('map.legend')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
              onClick={() => searchOnMap('tribunal')}
              title="Pesquisar tribunais no mapa"
            >
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-xs">{t('map.courts')}</span>
            </div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors"
              onClick={() => searchOnMap('escritório advocacia')}
              title="Pesquisar escritórios de advocacia no mapa"
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-xs">{t('map.lawFirms')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LawyersMap;