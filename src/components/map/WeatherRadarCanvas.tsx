import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { LocationInfo, StormCell } from '../../types/weather';

interface WeatherRadarCanvasProps {
  map: maplibregl.Map | null;
  location: LocationInfo;
  stormCells: StormCell[];
  tOffsetMin: number;
  isPlaying?: boolean;
  radarMode?: 'REFLECTIVITY' | 'VELOCITY' | 'ECHO_TOPS' | 'VIL';
  showSweep?: boolean;
  showRangeRings?: boolean;
  onSelectStorm?: (storm: StormCell) => void;
}

export const WeatherRadarCanvas: React.FC<WeatherRadarCanvasProps> = ({
  map,
  location,
  stormCells,
  tOffsetMin,
  isPlaying = false,
  radarMode = 'REFLECTIVITY',
  showSweep = true,
  showRangeRings = true,
  onSelectStorm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sweepAngleRef = useRef<number>(0);

  useEffect(() => {
    if (!map) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const resizeCanvas = () => {
      const rect = map.getContainer().getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    map.on('resize', resizeCanvas);
    map.on('move', () => {}); // Redraw triggered in loop

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Radar station screen position
      const stationPoint = map.project([location.lng, location.lat]);
      const stationX = stationPoint.x;
      const stationY = stationPoint.y;

      // Calculate pixels per kilometer based on current zoom
      const p1 = map.project([location.lng, location.lat]);
      const p2 = map.project([location.lng + 0.1, location.lat]);
      const degDistKm = 111.32 * Math.cos((location.lat * Math.PI) / 180) * 0.1;
      const pxPerKm = Math.hypot(p2.x - p1.x, p2.y - p1.y) / (degDistKm || 1);

      // 1. Draw Range Rings
      if (showRangeRings) {
        ctx.save();
        const ringsKm = [25, 50, 100, 150];
        ringsKm.forEach((rKm) => {
          const radiusPx = rKm * pxPerKm;
          if (radiusPx > 10 && radiusPx < Math.max(width, height) * 1.5) {
            ctx.beginPath();
            ctx.arc(stationX, stationY, radiusPx, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();

            // Ring distance label
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
            ctx.fillText(`${rKm} km`, stationX + 4, stationY - radiusPx + 11);
          }
        });

        // Azimuth Crosshair lines
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.moveTo(stationX, stationY - 160 * pxPerKm);
        ctx.lineTo(stationX, stationY + 160 * pxPerKm);
        ctx.moveTo(stationX - 160 * pxPerKm, stationY);
        ctx.lineTo(stationX + 160 * pxPerKm, stationY);
        ctx.stroke();

        // Cardinal marks
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.fillText('N', stationX - 4, stationY - 150 * pxPerKm - 6);
        ctx.fillText('S', stationX - 3, stationY + 150 * pxPerKm + 14);
        ctx.fillText('E', stationX + 150 * pxPerKm + 6, stationY + 3);
        ctx.fillText('W', stationX - 150 * pxPerKm - 18, stationY + 3);

        ctx.restore();
      }

      // Update sweep angle (rotates at ~14 rpm)
      sweepAngleRef.current = (sweepAngleRef.current + 0.038) % (Math.PI * 2);
      const sweepAngle = sweepAngleRef.current;

      // 2. Draw Simulated Multi-Cell Weather Systems
      // We define 4 realistic, independent convective & stratiform systems moving and evolving
      const systems = [
        {
          id: 'ALPHA',
          name: 'Primary Supercell Core #A01',
          baseRelLat: -0.06,
          baseRelLng: -0.04,
          headingDeg: 42,
          speedKmh: 34,
          peakTimeMin: 60,
          baseRadiusKm: 14,
          maxDbz: 68,
          noiseSeed: 1.2,
          isConvective: true,
        },
        {
          id: 'BRAVO',
          name: 'Trailing Stratiform Rain Shield',
          baseRelLat: -0.16,
          baseRelLng: -0.18,
          headingDeg: 38,
          speedKmh: 28,
          peakTimeMin: 30,
          baseRadiusKm: 22,
          maxDbz: 36,
          noiseSeed: 2.8,
          isConvective: false,
        },
        {
          id: 'CHARLIE',
          name: 'Developing Squall Feeder Band #C03',
          baseRelLat: 0.12,
          baseRelLng: -0.14,
          headingDeg: 65,
          speedKmh: 38,
          peakTimeMin: 45,
          baseRadiusKm: 12,
          maxDbz: 54,
          noiseSeed: 4.1,
          isConvective: true,
        },
        {
          id: 'DELTA',
          name: 'Coastal Sea-Breeze Convergence Cluster',
          baseRelLat: -0.02,
          baseRelLng: 0.16,
          headingDeg: 310,
          speedKmh: 18,
          peakTimeMin: 75,
          baseRadiusKm: 10,
          maxDbz: 46,
          noiseSeed: 5.7,
          isConvective: true,
        },
      ];

      systems.forEach((sys, idx) => {
        // Timeline interpolation
        const timeDiff = tOffsetMin;
        const distTravelKm = (sys.speedKmh * timeDiff) / 60;
        const headingRad = (sys.headingDeg * Math.PI) / 180;

        const deltaLat = (distTravelKm * Math.cos(headingRad)) / 111.32;
        const deltaLng = (distTravelKm * Math.sin(headingRad)) / (111.32 * Math.cos((location.lat * Math.PI) / 180));

        const cellLat = location.lat + sys.baseRelLat + deltaLat;
        const cellLng = location.lng + sys.baseRelLng + deltaLng;

        const cellScreenPt = map.project([cellLng, cellLat]);
        const cx = cellScreenPt.x;
        const cy = cellScreenPt.y;

        // Convective lifecycle intensity multiplier: peak around peakTimeMin
        const timeFromPeak = Math.abs(tOffsetMin - sys.peakTimeMin);
        const lifecycleFactor = Math.exp(-Math.pow(timeFromPeak / 65, 2));
        const currentDbz = Math.max(12, Math.round(sys.maxDbz * (0.4 + 0.6 * lifecycleFactor)));
        const radiusPx = Math.max(8, sys.baseRadiusKm * pxPerKm * (0.65 + 0.45 * lifecycleFactor));

        // Calculate sweep illumination factor: when radar beam sweeps past this cell, boost brightness briefly
        const angleToCell = Math.atan2(cy - stationY, cx - stationX);
        let angleDiff = Math.abs(((sweepAngle - angleToCell + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        const sweepExcitation = Math.max(0, 1 - angleDiff / 0.5) * 0.35;

        ctx.save();

        if (radarMode === 'REFLECTIVITY') {
          // Render organic, non-circular precipitation cell contours with smooth meteorological gradient
          // We draw multiple concentric amoebic lobes to build continuous dBZ density
          const bands = [
            { pct: 1.0, color: 'rgba(56, 189, 248, 0.45)' }, // Light rain (~20 dBZ cyan)
            { pct: 0.75, color: 'rgba(34, 197, 94, 0.65)' }, // Moderate rain (~32 dBZ green)
            { pct: 0.52, color: 'rgba(234, 179, 8, 0.8)' }, // Heavy rain (~42 dBZ yellow)
            { pct: 0.34, color: 'rgba(249, 115, 22, 0.9)' }, // Very heavy (~50 dBZ orange)
            { pct: 0.18, color: 'rgba(239, 68, 68, 0.95)' }, // Severe (~58 dBZ crimson)
            { pct: 0.08, color: 'rgba(217, 70, 239, 1.0)' }, // Extreme hail core (>65 dBZ purple)
          ];

          // Filter bands based on currentDbz
          const activeBands = bands.filter((b, bIdx) => {
            const minDbzForBand = 20 + bIdx * 8;
            return currentDbz >= minDbzForBand;
          });

          // Draw organic contours from outermost to innermost
          activeBands.forEach((band) => {
            const bandRadius = radiusPx * band.pct;
            ctx.beginPath();

            const numPoints = 36;
            for (let i = 0; i <= numPoints; i++) {
              const theta = (i / numPoints) * Math.PI * 2;
              // Organic multi-harmonic boundary perturbation
              const pPerturbation =
                0.22 * Math.sin(3 * theta + sys.noiseSeed + tOffsetMin * 0.02) +
                0.12 * Math.cos(5 * theta - sys.noiseSeed * 1.5) +
                0.08 * Math.sin(7 * theta + 0.8);
              const r = bandRadius * (1 + pPerturbation);

              const px = cx + Math.cos(theta) * r;
              const py = cy + Math.sin(theta) * r;

              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Gradient with phosphor excitation
            ctx.fillStyle = band.color;
            ctx.shadowColor = band.pct <= 0.18 ? 'rgba(217, 70, 239, 0.6)' : 'rgba(249, 115, 22, 0.3)';
            ctx.shadowBlur = band.pct <= 0.18 ? 16 + sweepExcitation * 15 : 6;
            ctx.globalAlpha = Math.min(1.0, 0.85 + sweepExcitation);
            ctx.fill();
          });

          // Convective Core Label
          if (radiusPx > 22 && currentDbz >= 45) {
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(`${currentDbz} dBZ`, cx - 18, cy + 4);
          }
        } else if (radarMode === 'VELOCITY') {
          // Radial Velocity Dipole (Green inbound, Red outbound)
          const angleToRadar = Math.atan2(stationY - cy, stationX - cx);

          // Inbound lobe (green)
          ctx.beginPath();
          ctx.arc(cx - Math.cos(angleToRadar) * 6, cy - Math.sin(angleToRadar) * 6, radiusPx * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.75)';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Outbound lobe (red)
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angleToRadar) * 6, cy + Math.sin(angleToRadar) * 6, radiusPx * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Zero isodop separator line
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`ROT COUPLET ${Math.round(sys.speedKmh * 1.4)}kt`, cx - 35, cy - radiusPx - 4);
        } else if (radarMode === 'ECHO_TOPS') {
          // Echo Tops height colors
          const echoTopKm = Number((10 + lifecycleFactor * 6.5).toFixed(1));
          const topColor =
            echoTopKm > 15
              ? 'rgba(236, 72, 153, 0.85)'
              : echoTopKm > 13
              ? 'rgba(234, 179, 8, 0.85)'
              : 'rgba(56, 189, 248, 0.75)';

          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = topColor;
          ctx.shadowColor = topColor;
          ctx.shadowBlur = 12;
          ctx.fill();

          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`TOP ${echoTopKm} km`, cx - 22, cy + 3);
        } else if (radarMode === 'VIL') {
          // Vertically Integrated Liquid
          const vilKgM2 = Math.round(15 + lifecycleFactor * 48);
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = vilKgM2 > 50 ? 'rgba(168, 85, 247, 0.85)' : 'rgba(249, 115, 22, 0.8)';
          ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`VIL ${vilKgM2} kg/m²`, cx - 30, cy + 3);
        }

        ctx.restore();
      });

      // 3. Draw Rotating Radar Sweep Line & Phosphor Trail
      if (showSweep) {
        ctx.save();
        const sweepLength = Math.max(width, height) * 1.2;

        // Fading phosphor sector trail
        const trailSlices = 24;
        const trailAngle = (Math.PI * 2) / 6; // 60-degree phosphor fade wedge
        for (let s = 0; s < trailSlices; s++) {
          const startA = sweepAngle - (s / trailSlices) * trailAngle;
          const endA = sweepAngle - ((s + 1) / trailSlices) * trailAngle;
          const alpha = (1 - s / trailSlices) * 0.08;

          ctx.beginPath();
          ctx.moveTo(stationX, stationY);
          ctx.arc(stationX, stationY, sweepLength, startA, endA, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.fill();
        }

        // Crisp leading radar sweep beam line
        const beamX = stationX + Math.cos(sweepAngle) * sweepLength;
        const beamY = stationY + Math.sin(sweepAngle) * sweepLength;

        ctx.beginPath();
        ctx.moveTo(stationX, stationY);
        ctx.lineTo(beamX, beamY);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(56, 189, 248, 1.0)';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Doppler Radar Station Center Icon
        ctx.beginPath();
        ctx.arc(stationX, stationY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(stationX, stationY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(location.radarStationCode, stationX + 10, stationY + 4);

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      map.off('resize', resizeCanvas);
    };
  }, [map, location, stormCells, tOffsetMin, isPlaying, radarMode, showSweep, showRangeRings]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
