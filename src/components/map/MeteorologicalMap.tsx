import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  FloodRiskAssessment,
  LightningIntelligence,
  LocationInfo,
  MapLayerState,
  StormCell,
  WarningNotice,
} from '../../types/weather';
import { Compass, Layers, Maximize2, ShieldAlert, Zap } from 'lucide-react';

interface MeteorologicalMapProps {
  location: LocationInfo;
  layers: MapLayerState;
  stormCells: StormCell[];
  selectedStorm: StormCell | null;
  onSelectStorm: (storm: StormCell | null) => void;
  floodRisk: FloodRiskAssessment;
  lightning: LightningIntelligence;
  warning: WarningNotice;
  tOffsetMin: number;
  onMapClick?: (lat: number, lng: number) => void;
  is3d: boolean;
  onToggle3d: () => void;
  hideWarningBanner?: boolean;
  baseMapStyle?: 'DARK' | 'SATELLITE' | 'HYBRID';
  onMapReady?: (map: maplibregl.Map) => void;
}

export const MeteorologicalMap: React.FC<MeteorologicalMapProps> = ({
  location,
  layers,
  stormCells,
  selectedStorm,
  onSelectStorm,
  floodRisk,
  lightning,
  warning,
  tOffsetMin,
  is3d,
  onToggle3d,
  hideWarningBanner = false,
  baseMapStyle = 'DARK',
  onMapReady,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeHoverCell, setActiveHoverCell] = useState<StormCell | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isSat = baseMapStyle === 'SATELLITE' || baseMapStyle === 'HYBRID';

    // Multi-source cartographic & high-resolution satellite tiles
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics',
          },
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO',
          },
        },
        layers: [
          {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-opacity': isSat ? 1.0 : 0.0,
            },
          },
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-opacity': isSat ? 0.0 : 1.0,
            },
          },
        ],
      },
      center: [location.lng, location.lat],
      zoom: 11.2,
      pitch: is3d ? 50 : 0,
      bearing: is3d ? -15 : 0,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      mapInstanceRef.current = map;
      onMapReady?.(map);

      // Add Sources
      // 1. Radar circles GeoJSON
      map.addSource('radar-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Radar fill
      map.addLayer({
        id: 'radar-layer-fill',
        type: 'fill',
        source: 'radar-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'opacity'],
        },
      });

      // Radar stroke
      map.addLayer({
        id: 'radar-layer-stroke',
        type: 'line',
        source: 'radar-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1.5,
          'line-opacity': 0.7,
        },
      });

      // 2. Storm Tracks GeoJSON
      map.addSource('tracks-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'tracks-layer-line',
        type: 'line',
        source: 'tracks-source',
        paint: {
          'line-color': '#f97316',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
        },
      });

      // 3. Flood Inundation Catchments GeoJSON
      map.addSource('flood-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'flood-layer-fill',
        type: 'fill',
        source: 'flood-source',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.45,
        },
      });
      map.addLayer({
        id: 'flood-layer-stroke',
        type: 'line',
        source: 'flood-source',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // 4. Storm Cell Centroids
      map.addSource('storm-centroids-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'storm-centroids-layer',
        type: 'circle',
        source: 'storm-centroids-source',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      });

      // 5. Lightning Strikes
      map.addSource('lightning-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'lightning-layer',
        type: 'circle',
        source: 'lightning-source',
        paint: {
          'circle-radius': 5,
          'circle-color': '#facc15',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Storm click interaction
      map.on('click', 'storm-centroids-layer', (e) => {
        if (!e.features || !e.features[0]) return;
        const cellId = e.features[0].properties?.id;
        const found = stormCells.find((s) => s.id === cellId);
        if (found) {
          onSelectStorm(found);
        }
      });

      map.on('mouseenter', 'storm-centroids-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          const cellId = e.features[0].properties?.id;
          const found = stormCells.find((s) => s.id === cellId);
          if (found) setActiveHoverCell(found);
        }
      });

      map.on('mouseleave', 'storm-centroids-layer', () => {
        map.getCanvas().style.cursor = '';
        setActiveHoverCell(null);
      });
    });

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    }, 120);

    return () => {
      clearTimeout(resizeTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dynamic Basemap Style Switch (Satellite vs Dark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    const isSat = baseMapStyle === 'SATELLITE' || baseMapStyle === 'HYBRID';
    try {
      if (map.getLayer('esri-satellite-layer')) {
        map.setPaintProperty('esri-satellite-layer', 'raster-opacity', isSat ? 1.0 : 0.0);
      }
      if (map.getLayer('carto-dark-layer')) {
        map.setPaintProperty('carto-dark-layer', 'raster-opacity', isSat ? 0.0 : 1.0);
      }
    } catch (err) {
      console.warn('Failed to switch base map style:', err);
    }
  }, [baseMapStyle, mapLoaded]);

  // Fly to location when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [location.lng, location.lat],
      zoom: 11.4,
      essential: true,
      duration: 1800,
    });
  }, [location.id]);

  // Handle 2D / 3D Pitch toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (is3d) {
      map.easeTo({ pitch: 55, bearing: -20, duration: 1200 });
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    }
  }, [is3d]);

  // Zoom to selected storm
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStorm) return;
    map.flyTo({
      center: [selectedStorm.lng, selectedStorm.lat],
      zoom: 12.2,
      duration: 1400,
    });
  }, [selectedStorm?.id]);

  // Update GeoJSON Layers based on current simulation state and layer toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Helper to generate polygon circle coordinates
    const createGeoCircle = (centerLng: number, centerLat: number, radiusKm: number, points = 32) => {
      const coords = [];
      const kmPerLat = 111;
      const kmPerLng = 111 * Math.cos((centerLat * Math.PI) / 180);
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const lat = centerLat + (radiusKm * Math.cos(theta)) / kmPerLat;
        const lng = centerLng + (radiusKm * Math.sin(theta)) / kmPerLng;
        coords.push([lng, lat]);
      }
      return [coords];
    };

    // 1. Radar Rings
    const radarSource = map.getSource('radar-source') as maplibregl.GeoJSONSource;
    if (radarSource) {
      const features: any[] = [];
      if (layers.radar) {
        stormCells.forEach((cell) => {
          // Outer convective core (35-45 dBZ)
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: createGeoCircle(cell.lng, cell.lat, cell.radiusKm),
            },
            properties: {
              color: '#eab308', // yellow
              opacity: 0.28 * layers.opacity.radar,
            },
          });
          // Severe Reflectivity Core (>50 dBZ)
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: createGeoCircle(cell.lng, cell.lat, cell.radiusKm * 0.55),
            },
            properties: {
              color: '#ef4444', // red
              opacity: 0.5 * layers.opacity.radar,
            },
          });
          // Extreme Hail/Downburst Core (>60 dBZ)
          if (cell.maxReflectivityDbz > 55) {
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: createGeoCircle(cell.lng, cell.lat, cell.radiusKm * 0.25),
              },
              properties: {
                color: '#a855f7', // purple
                opacity: 0.75 * layers.opacity.radar,
              },
            });
          }
        });
      }
      radarSource.setData({ type: 'FeatureCollection', features });
    }

    // 2. Storm Tracks
    const tracksSource = map.getSource('tracks-source') as maplibregl.GeoJSONSource;
    if (tracksSource) {
      const features: any[] = [];
      if (layers?.stormCells && stormCells) {
        stormCells.forEach((cell) => {
          const historyCoords = cell.history?.map((h) => [h.lng, h.lat]) ?? [];
          const forecastCoords = cell.forecastTrack?.map((f) => [f.lng, f.lat]) ?? [];
          const trackCoords = [
            ...historyCoords,
            [cell.lng, cell.lat],
            ...forecastCoords,
          ];
          features.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: trackCoords,
            },
            properties: { id: cell.id },
          });
        });
      }
      tracksSource.setData({ type: 'FeatureCollection', features });
    }

    // 3. Flood Risk Polygons
    const floodSource = map.getSource('flood-source') as maplibregl.GeoJSONSource;
    if (floodSource) {
      const features: any[] = [];
      if (layers?.floodRisk && floodRisk?.affectedCatchments) {
        floodRisk.affectedCatchments.forEach((catchment, idx) => {
          const latOffset = ((idx % 2 === 0 ? 1 : -1) * (idx + 1) * 0.02);
          const lngOffset = ((idx % 3 === 0 ? 1 : -1) * (idx + 1) * 0.02);
          const cLat = location.lat + latOffset;
          const cLng = location.lng + lngOffset;

          const color =
            catchment.riskLevel === 'VERY HIGH'
              ? '#dc2626'
              : catchment.riskLevel === 'HIGH'
              ? '#ea580c'
              : catchment.riskLevel === 'MODERATE'
              ? '#0284c7'
              : '#0d9488';

          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: createGeoCircle(cLng, cLat, 2.8),
            },
            properties: {
              name: catchment.name,
              fillColor: color,
            },
          });
        });
      }
      floodSource.setData({ type: 'FeatureCollection', features });
    }

    // 4. Storm Centroids
    const centroidsSource = map.getSource('storm-centroids-source') as maplibregl.GeoJSONSource;
    if (centroidsSource) {
      const features: any[] = [];
      if (layers?.stormCells && stormCells) {
        stormCells.forEach((cell) => {
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [cell.lng, cell.lat],
            },
            properties: {
              id: cell.id,
              name: cell.name,
              color: cell.severity === 'EXTREME' ? '#dc2626' : cell.severity === 'SEVERE' ? '#ea580c' : '#38bdf8',
              radius: 9,
            },
          });
        });
      }
      centroidsSource.setData({ type: 'FeatureCollection', features });
    }

    // 5. Lightning Strikes
    const lightningSource = map.getSource('lightning-source') as maplibregl.GeoJSONSource;
    if (lightningSource) {
      const features: any[] = [];
      if (layers?.lightning && lightning?.highDensityZones) {
        lightning.highDensityZones.forEach((zone) => {
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [zone.lng, zone.lat],
            },
            properties: { density: zone.density },
          });
        });
      }
      lightningSource.setData({ type: 'FeatureCollection', features });
    }
  }, [mapLoaded, layers, stormCells, floodRisk, lightning, location]);

  return (
    <div className="relative w-full h-full min-h-[360px] overflow-hidden select-none">
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" style={{ minHeight: '360px', width: '100%', height: '100%' }} />

      {/* Floating Tactical Map Bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0a1224]/85 backdrop-blur-md border border-cyan-500/25 px-3 py-1.5 rounded-lg text-xs font-mono-code text-cyan-300 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-semibold text-slate-100">{location.locality}</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-300">
          {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-cyan-400">ELEV: {location.elevationM}m</span>
      </div>

      {/* 2D / 3D Perspective Button & Camera Controls */}
      <div className="absolute top-4 right-14 z-10 flex items-center gap-1.5">
        <button
          id="toggle-3d-perspective-btn"
          onClick={onToggle3d}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-mono-code font-medium transition-all backdrop-blur-md border ${
            is3d
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-[#0a1224]/80 text-slate-300 border-slate-700 hover:border-cyan-500/30'
          }`}
          title="Toggle 2D / 3D Terrain & Pitch"
        >
          <Compass className={`w-3.5 h-3.5 ${is3d ? 'text-cyan-400 rotate-45' : ''} transition-transform`} />
          <span>{is3d ? '3D PITCH' : '2D FLAT'}</span>
        </button>
      </div>

      {/* Hover Info Tooltip */}
      {activeHoverCell && (
        <div
          className="absolute z-20 pointer-events-none bg-[#070d1b]/95 border border-cyan-500/40 p-3 rounded-lg shadow-2xl backdrop-blur-md text-xs font-mono-code"
          style={{ top: '65px', left: '20px' }}
        >
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            {activeHoverCell.name}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1.5 text-slate-300">
            <div>
              Intensity: <span className="text-amber-400 font-bold">{activeHoverCell.maxReflectivityDbz} dBZ</span>
            </div>
            <div>
              Rainfall: <span className="text-cyan-300 font-bold">{activeHoverCell.rainfallRateMmh} mm/h</span>
            </div>
            <div>
              Speed: <span className="text-slate-200">{activeHoverCell.speedKmh} km/h</span>
            </div>
            <div>
              Lightning: <span className="text-yellow-300">{activeHoverCell.lightningFlashesPerMin}/min</span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400/80 mt-1.5 pt-1 border-t border-slate-800">
            Click storm cell to open Storm DNA
          </div>
        </div>
      )}

      {/* Warning Watermark Banner on Map (Hidden if rendered in dedicated warning section) */}
      {!hideWarningBanner && warning && warning.severity && warning.severity !== 'NORMAL' && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm bg-red-950/80 border border-red-500/50 backdrop-blur-md px-3 py-2 rounded-lg text-xs font-mono-code text-red-200 shadow-2xl flex items-start gap-2.5 animate-hazard-pulse">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider text-red-300">
              {warning.headline || 'Atmospheric Hazard Warning'}
            </div>
            <div className="text-[11px] text-red-200/80 line-clamp-1 mt-0.5">
              Window: T+{warning.timeWindowStartMin ?? 0}m to T+{warning.timeWindowEndMin ?? 60}m | Confidence: {warning.confidence ?? 'HIGH'}
            </div>
          </div>
        </div>
      )}

      {/* Radar dBZ Color Scale Legend on Map Bottom Right */}
      {layers.radar && (
        <div className="absolute bottom-4 right-4 z-10 bg-[#070f20]/90 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-lg text-[10px] font-mono-code shadow-xl">
          <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
            <span>DOPPLER REFLECTIVITY (dBZ)</span>
            <span className="text-cyan-400 text-[9px]">LIVE DOPPLER FEED</span>
          </div>
          <div className="flex items-center h-2.5 rounded overflow-hidden w-44">
            <div className="h-full flex-1 bg-emerald-500" title="20-30 dBZ Light" />
            <div className="h-full flex-1 bg-yellow-400" title="35-45 dBZ Moderate" />
            <div className="h-full flex-1 bg-orange-500" title="45-55 dBZ Heavy" />
            <div className="h-full flex-1 bg-red-600" title="55-65 dBZ Severe" />
            <div className="h-full flex-1 bg-purple-600" title=">65 dBZ Hail/Extreme" />
          </div>
          <div className="flex justify-between text-slate-400 text-[9px] mt-0.5">
            <span>20</span>
            <span>35</span>
            <span>45</span>
            <span>55</span>
            <span>65+</span>
          </div>
        </div>
      )}
    </div>
  );
};
