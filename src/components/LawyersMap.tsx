import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
	AlertCircle,
	Loader2,
	Navigation,
	MapPin,
	Scale,
	Briefcase,
	ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { servicesConfig } from '@/lib/config';

// ---------------------------------------------------------------------------
// Dados estáticos
// ---------------------------------------------------------------------------

interface Location {
	id: string;
	nome: string;
	lat: number;
	lng: number;
	provincia: string;
	tipo: 'tribunal' | 'escritorio';
}

const TRIBUNAIS: Location[] = [
	{
		id: 't1',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial de Luanda',
		lat: -8.8368,
		lng: 13.2342,
		provincia: 'Luanda',
	},
	{
		id: 't2',
		tipo: 'tribunal',
		nome: 'Tribunal Municipal do Cazenga',
		lat: -8.7981,
		lng: 13.2947,
		provincia: 'Luanda',
	},
	{
		id: 't3',
		tipo: 'tribunal',
		nome: 'Tribunal Supremo de Angola',
		lat: -8.82,
		lng: 13.23,
		provincia: 'Luanda',
	},
	{
		id: 't4',
		tipo: 'tribunal',
		nome: 'Tribunal Municipal de Viana',
		lat: -8.9048,
		lng: 13.374,
		provincia: 'Luanda',
	},
	{
		id: 't5',
		tipo: 'tribunal',
		nome: 'Tribunal Municipal do Kilamba Kiaxi',
		lat: -8.86,
		lng: 13.32,
		provincia: 'Luanda',
	},
	{
		id: 't6',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial de Benguela',
		lat: -12.576,
		lng: 13.4052,
		provincia: 'Benguela',
	},
	{
		id: 't7',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial do Huambo',
		lat: -12.7763,
		lng: 15.7395,
		provincia: 'Huambo',
	},
	{
		id: 't8',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial do Lubango',
		lat: -14.9177,
		lng: 13.4921,
		provincia: 'Huíla',
	},
	{
		id: 't9',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial de Cabinda',
		lat: -5.55,
		lng: 12.191,
		provincia: 'Cabinda',
	},
	{
		id: 't10',
		tipo: 'tribunal',
		nome: 'Tribunal Provincial do Bié',
		lat: -12.356,
		lng: 17.0608,
		provincia: 'Bié',
	},
];

const ESCRITORIOS: Location[] = [
	{
		id: 'e1',
		tipo: 'escritorio',
		nome: 'EDGE – Escrit. de Direito e Gestão',
		lat: -8.82,
		lng: 13.235,
		provincia: 'Luanda',
	},
	{
		id: 'e2',
		tipo: 'escritorio',
		nome: 'BLP Angola',
		lat: -8.8283,
		lng: 13.244,
		provincia: 'Luanda',
	},
	{
		id: 'e3',
		tipo: 'escritorio',
		nome: 'Sérvulo & Associados Angola',
		lat: -8.815,
		lng: 13.239,
		provincia: 'Luanda',
	},
	{
		id: 'e4',
		tipo: 'escritorio',
		nome: 'Miranda & Associados Angola',
		lat: -8.84,
		lng: 13.251,
		provincia: 'Luanda',
	},
	{
		id: 'e5',
		tipo: 'escritorio',
		nome: 'Linklaters Angola',
		lat: -8.831,
		lng: 13.247,
		provincia: 'Luanda',
	},
	{
		id: 'e6',
		tipo: 'escritorio',
		nome: 'AA&A – Alves, Almada & Associados',
		lat: -8.91,
		lng: 13.18,
		provincia: 'Luanda',
	},
	{
		id: 'e7',
		tipo: 'escritorio',
		nome: 'Gabinete Jurídico Benguela',
		lat: -12.58,
		lng: 13.41,
		provincia: 'Benguela',
	},
	{
		id: 'e8',
		tipo: 'escritorio',
		nome: 'Escritório Jurídico do Huambo',
		lat: -12.77,
		lng: 15.735,
		provincia: 'Huambo',
	},
	{
		id: 'e9',
		tipo: 'escritorio',
		nome: 'Advocacia Cabinda',
		lat: -5.56,
		lng: 12.195,
		provincia: 'Cabinda',
	},
	{
		id: 'e10',
		tipo: 'escritorio',
		nome: 'Centro Jurídico Lubango',
		lat: -14.92,
		lng: 13.49,
		provincia: 'Huíla',
	},
];

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

// Fórmula de Haversine — retorna distância em metros
function haversineMeters(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
): number {
	const R = 6371000;
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
	if (meters < 1000) return `a ${Math.round(meters)}m`;
	return `a ${(meters / 1000).toFixed(1).replace('.', ',')}km`;
}

interface LocationWithDistance extends Location {
	distanceM: number;
}

const LUANDA: [number, number] = [13.289436, -8.839987];
const GEO_TIMEOUT = 6000;
const COLOR: Record<'tribunal' | 'escritorio', string> = {
	tribunal: '#ef4444',
	escritorio: '#3b82f6',
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

type Tab = 'tribunais' | 'escritorios';

const LawyersMap = () => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
	const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
	const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
	const [activeTab, setActiveTab] = useState<Tab>('tribunais');
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [activeId, setActiveId] = useState<string | null>(null);

	// Lista com distâncias, ordenada do mais próximo
	const listWithDistance: LocationWithDistance[] = React.useMemo(() => {
		const raw = activeTab === 'tribunais' ? TRIBUNAIS : ESCRITORIOS;
		return raw
			.map((loc) => ({
				...loc,
				distanceM: userCoords
					? haversineMeters(userCoords[1], userCoords[0], loc.lat, loc.lng)
					: Infinity,
			}))
			.sort((a, b) => a.distanceM - b.distanceM);
	}, [activeTab, userCoords]);

	// Criar marcador DOM
	const makeMarkerEl = useCallback(
		(tipo: 'tribunal' | 'escritorio', isActive: boolean) => {
			const el = document.createElement('div');
			el.style.width = isActive ? '36px' : '28px';
			el.style.height = isActive ? '36px' : '28px';
			el.style.borderRadius = '50%';
			el.style.backgroundColor = COLOR[tipo];
			el.style.border = `3px solid ${isActive ? 'white' : 'rgba(255,255,255,0.8)'}`;
			el.style.boxShadow = isActive
				? '0 0 0 3px ' + COLOR[tipo] + '55, 0 4px 12px rgba(0,0,0,0.35)'
				: '0 2px 6px rgba(0,0,0,0.25)';
			el.style.cursor = 'pointer';
			el.style.transition = 'all 0.2s ease';
			return el;
		},
		[],
	);

	// Inicializar mapa (roda apenas 1x)
	useEffect(() => {
		const init = async () => {
			if (!mapContainerRef.current) return;

			const token = servicesConfig.mapboxAccessToken;
			if (!token || token === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
				setHasError(true);
				setErrorMessage('Configure VITE_MAPBOX_ACCESS_TOKEN no arquivo .env');
				setIsLoaded(true);
				return;
			}

			mapboxgl.accessToken = token;

			// Pedir geolocalização
			const getLocation = (): Promise<[number, number]> =>
				new Promise((resolve) => {
					let done = false;
					const finish = (coords: [number, number]) => {
						if (!done) {
							done = true;
							resolve(coords);
						}
					};
					setTimeout(() => finish(LUANDA), GEO_TIMEOUT + 500);
					if (!navigator.geolocation) {
						finish(LUANDA);
						return;
					}
					navigator.geolocation.getCurrentPosition(
						(pos) => {
							const c: [number, number] = [
								pos.coords.longitude,
								pos.coords.latitude,
							];
							setUserCoords(c);
							finish(c);
						},
						() => finish(LUANDA),
						{
							timeout: GEO_TIMEOUT,
							maximumAge: 60000,
							enableHighAccuracy: false,
						},
					);
				});

			const center = await getLocation();

			const map = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: 'mapbox://styles/mapbox/streets-v12',
				center,
				zoom: 12,
			});

			mapRef.current = map;
			map.addControl(new mapboxgl.NavigationControl(), 'top-right');

			map.on('load', () => {
				setIsLoaded(true);

				// Marcador do usuário
				if (userCoords) {
					const el = document.createElement('div');
					el.style.width = '18px';
					el.style.height = '18px';
					el.style.borderRadius = '50%';
					el.style.backgroundColor = '#22c55e';
					el.style.border = '3px solid white';
					el.style.boxShadow = '0 0 0 4px rgba(34,197,94,0.3)';
					userMarkerRef.current = new mapboxgl.Marker(el)
						.setLngLat(userCoords)
						.setPopup(
							new mapboxgl.Popup({ offset: 20 }).setHTML(
								'<p style="margin:0;font-size:12px;font-weight:600">Você está aqui</p>',
							),
						)
						.addTo(map);
				}
			});

			map.on('error', () => {
				setHasError(true);
				setErrorMessage('Erro ao carregar o mapa.');
			});

			return () => {
				markersRef.current.forEach((m) => m.remove());
				popupsRef.current.forEach((p) => p.remove());
				userMarkerRef.current?.remove();
				map.remove();
			};
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sincronizar marcadores sempre que a aba ou os dados mudam
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !isLoaded) return;

		// Remover marcadores antigos
		markersRef.current.forEach((m) => m.remove());
		popupsRef.current.forEach((p) => p.remove());
		markersRef.current.clear();
		popupsRef.current.clear();

		const allLocations = activeTab === 'tribunais' ? TRIBUNAIS : ESCRITORIOS;

		allLocations.forEach((loc) => {
			const isActive = loc.id === activeId;
			const el = makeMarkerEl(loc.tipo, isActive);

			const popup = new mapboxgl.Popup({ offset: 28, closeButton: false })
				.setHTML(`
          <div style="font-family:sans-serif;padding:4px 2px;min-width:180px">
            <p style="margin:0 0 4px;font-weight:700;font-size:13px;line-height:1.3">${loc.nome}</p>
            <p style="margin:0 0 8px;font-size:11px;color:#6b7280">${loc.provincia}</p>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:4px;background:#3b82f6;color:white;font-size:11px;font-weight:600;text-decoration:none;padding:5px 10px;border-radius:6px"
            >
              Como Chegar
            </a>
          </div>
        `);

			const marker = new mapboxgl.Marker(el)
				.setLngLat([loc.lng, loc.lat])
				.setPopup(popup)
				.addTo(map);

			el.addEventListener('click', () => {
				setActiveId(loc.id);
			});

			markersRef.current.set(loc.id, marker);
			popupsRef.current.set(loc.id, popup);
		});
	}, [activeTab, isLoaded, activeId, makeMarkerEl]);

	// Quando activeId muda: flyTo + abrir popup
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !activeId) return;

		const allLocations = [...TRIBUNAIS, ...ESCRITORIOS];
		const loc = allLocations.find((l) => l.id === activeId);
		if (!loc) return;

		map.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 1200 });

		// Abrir popup após o voo terminar
		const openPopup = () => {
			const marker = markersRef.current.get(activeId);
			marker?.togglePopup();
		};
		map.once('moveend', openPopup);

		return () => {
			map.off('moveend', openPopup);
		};
	}, [activeId]);

	// ── Error state ──────────────────────────────────────────────────────────
	if (hasError) {
		return (
			<div className='h-full flex items-center justify-center p-4 bg-background'>
				<div className='max-w-sm w-full space-y-4'>
					<Alert variant='destructive'>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
					<Button className='w-full' onClick={() => window.location.reload()}>
						Tentar Novamente
					</Button>
				</div>
			</div>
		);
	}

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div
			className='relative w-full overflow-hidden'
			style={{ height: 'calc(100svh - 4rem)' }}
		>
			{/* Mapa */}
			<div ref={mapContainerRef} className='absolute inset-0' />

			{/* Loading overlay */}
			{!isLoaded && (
				<div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
					<p className='text-sm text-muted-foreground font-medium'>
						Carregando mapa...
					</p>
					<p className='text-xs text-muted-foreground'>
						Obtendo sua localização...
					</p>
				</div>
			)}

			{/* Sidebar */}
			<div
				className={`
          absolute top-0 left-0 h-full z-10 flex flex-col
          bg-background/95 backdrop-blur-md border-r border-border
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80 sm:w-72' : 'w-0 overflow-hidden'}
        `}
			>
				{/* Header da sidebar */}
				<div className='p-4 border-b border-border shrink-0'>
					<h2 className='font-bold text-base text-foreground flex items-center gap-2'>
						<MapPin className='w-4 h-4 text-primary' />
						Locais Jurídicos
					</h2>
					{userCoords ? (
						<p className='text-xs text-muted-foreground mt-1 flex items-center gap-1'>
							<Navigation className='w-3 h-3 text-green-500' />
							Ordenado por distância
						</p>
					) : (
						<p className='text-xs text-muted-foreground mt-1'>Angola</p>
					)}
				</div>

				{/* Tabs */}
				<div className='flex shrink-0 border-b border-border'>
					<button
						onClick={() => {
							setActiveTab('tribunais');
							setActiveId(null);
						}}
						className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors
              ${
								activeTab === 'tribunais'
									? 'border-b-2 border-red-500 text-red-600'
									: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						<Scale className='w-3.5 h-3.5' />
						Tribunais
						<Badge variant='secondary' className='text-[10px] h-4 px-1'>
							{TRIBUNAIS.length}
						</Badge>
					</button>
					<button
						onClick={() => {
							setActiveTab('escritorios');
							setActiveId(null);
						}}
						className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors
              ${
								activeTab === 'escritorios'
									? 'border-b-2 border-blue-500 text-blue-600'
									: 'text-muted-foreground hover:text-foreground'
							}`}
					>
						<Briefcase className='w-3.5 h-3.5' />
						Escritórios
						<Badge variant='secondary' className='text-[10px] h-4 px-1'>
							{ESCRITORIOS.length}
						</Badge>
					</button>
				</div>

				{/* Lista */}
				<ScrollArea className='flex-1'>
					<div className='p-2 space-y-1'>
						{listWithDistance.map((loc, i) => (
							<button
								key={loc.id}
								onClick={() => setActiveId(loc.id)}
								className={`w-full text-left rounded-lg px-3 py-2.5 transition-all group
                  ${
										activeId === loc.id
											? 'bg-primary/10 border border-primary/30'
											: 'hover:bg-muted border border-transparent'
									}
                `}
							>
								<div className='flex items-start gap-2.5'>
									{/* Rank + cor */}
									<div
										className='w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5'
										style={{
											backgroundColor:
												activeTab === 'tribunais' ? '#ef4444' : '#3b82f6',
										}}
									>
										{i + 1}
									</div>
									<div className='flex-1 min-w-0'>
										<p className='text-xs font-semibold text-foreground leading-snug truncate'>
											{loc.nome}
										</p>
										<p className='text-[10px] text-muted-foreground mt-0.5'>
											{loc.provincia}
										</p>
									</div>
									<div className='text-right shrink-0'>
										{loc.distanceM !== Infinity && (
											<p className='text-[10px] font-medium text-primary whitespace-nowrap'>
												{formatDistance(loc.distanceM)}
											</p>
										)}
										<ChevronRight className='w-3 h-3 text-muted-foreground mt-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity' />
									</div>
								</div>
							</button>
						))}
					</div>
					<Separator className='my-2' />
					<p className='text-center text-[10px] text-muted-foreground pb-4'>
						{listWithDistance.length} locais encontrados
					</p>
				</ScrollArea>
			</div>

			{/* Toggle sidebar button */}
			<button
				onClick={() => setSidebarOpen((o) => !o)}
				className={`
          absolute top-1/2 -translate-y-1/2 z-20
          w-6 h-12 bg-background/90 border border-border rounded-r-lg
          flex items-center justify-center shadow-md hover:bg-muted transition-all
          ${sidebarOpen ? 'left-80 sm:left-72' : 'left-0'}
        `}
				title={sidebarOpen ? 'Fechar lista' : 'Abrir lista'}
			>
				<ChevronRight
					className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`}
				/>
			</button>
		</div>
	);
};

export default LawyersMap;
