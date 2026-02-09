import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Globe, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  const { t } = useLanguage();

  // Sample data for Portugal courts and law firms
  const lawyerOffices: LawyerOffice[] = [
    {
      id: '1',
      name: 'Tribunal de Justiça de Lisboa',
      type: 'court',
      address: 'Rua Marquês de Fronteira, 1099-014 Lisboa',
      phone: '+351 21 358 9500',
      hours: '9:00 - 17:00',
      lat: 38.7223,
      lng: -9.1393
    },
    {
      id: '2',
      name: 'PLMJ Advogados',
      type: 'law_firm',
      address: 'Av. da Liberdade, 224, 1250-148 Lisboa',
      phone: '+351 21 319 7300',
      website: 'www.plmj.com',
      rating: 4.8,
      specialties: ['Corporate Law', 'Tax Law', 'Banking'],
      lat: 38.7207,
      lng: -9.1482
    },
    {
      id: '3',
      name: 'Tribunal do Porto',
      type: 'court',
      address: 'Rua dos Bragas, 4050-123 Porto',
      phone: '+351 22 207 1300',
      hours: '9:00 - 17:00',
      lat: 41.1496,
      lng: -8.6109
    },
    {
      id: '4',
      name: 'CCA Law Firm',
      type: 'law_firm',
      address: 'Rua Castilho, 75, 1250-068 Lisboa',
      phone: '+351 21 355 3800',
      website: 'www.ccalaw.eu',
      rating: 4.6,
      specialties: ['M&A', 'Real Estate', 'Litigation'],
      lat: 38.7244,
      lng: -9.1511
    }
  ];

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.3999, lng: -8.2245 }, // Center of Portugal
        zoom: 7,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add markers for each office
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

      setIsLoaded(true);
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDPlnutqHNmkLtpvZEB-KXgIQ3P0skk670&libraries=places`;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
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
                {t('map.apiKeyRequired')}
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
                    className="mt-1"
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
                      <Badge key={index} variant="outline" className="text-xs">
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-xs">{t('map.courts')}</span>
            </div>
            <div className="flex items-center gap-2">
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