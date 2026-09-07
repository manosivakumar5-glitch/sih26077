import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { AtmosphericState, LocationInfo } from '../../types/weather';

interface SatelliteCloudCanvasProps {
  map: maplibregl.Map | null;
  location: LocationInfo;
  channel: 'IR' | 'WV' | 'VIS' | 'GEOCOLOR';
  tOffsetMin: number;
  atmosphere?: AtmosphericState;
}

export const SatelliteCloudCanvas: React.FC<SatelliteCloudCanvasProps> = ({
  map,
  location,
  channel,
  tOffsetMin,
  atmosphere,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const driftOffsetRef = useRef<number>(0);

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
    map.on('move', () => {});

    // Multi-scale cloud structures anchored geographically around the location
    const cloudSystems = [
      {
        id: 'SYS-DEEP-CONVECTIVE',
        relLat: 0.04,
        relLng: 0.08,
        radiusKm: 42,
        rotationSpeed: 0.0008,
        driftSpeedKmh: 36,
        driftHeadingDeg: 55,
        tempC: atmosphere?.cloudTopTempC ?? -72.4,
        type: 'CUMULONIMBUS_CLUSTER',
      },
      {
        id: 'SYS-CIRRUS-OUTFLOW',
        relLat: -0.15,
        relLng: -0.1,
        radiusKm: 75,
        rotationSpeed: -0.0004,
        driftSpeedKmh: 58,
        driftHeadingDeg: 62,
        tempC: -58.2,
        type: 'CIRRUS_PLUME',
      },
      {
        id: 'SYS-MID-STRATUS',
        relLat: 0.18,
        relLng: -0.16,
        radiusKm: 55,
        rotationSpeed: 0.0005,
        driftSpeedKmh: 24,
        driftHeadingDeg: 45,
        tempC: -32.5,
        type: 'STRATOCUMULUS_BANK',
      },
      {
        id: 'SYS-COASTAL-FLURRY',
        relLat: -0.08,
        relLng: 0.22,
        radiusKm: 35,
        rotationSpeed: 0.0009,
        driftSpeedKmh: 20,
        driftHeadingDeg: 340,
        tempC: -46.0,
        type: 'COASTAL_CONVECTIVE',
      },
    ];

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Increment subtle atmospheric drift
      driftOffsetRef.current += 0.25;
      const liveDrift = driftOffsetRef.current;

      // Pixels per km
      const p1 = map.project([location.lng, location.lat]);
      const p2 = map.project([location.lng + 0.1, location.lat]);
      const degDistKm = 111.32 * Math.cos((location.lat * Math.PI) / 180) * 0.1;
      const pxPerKm = Math.hypot(p2.x - p1.x, p2.y - p1.y) / (degDistKm || 1);

      // Render each cloud system
      cloudSystems.forEach((sys, sysIdx) => {
        // Compute drift based on timeline offset (minutes) + continuous loop drift
        const totalMinutes = tOffsetMin + liveDrift / 30;
        const driftDistKm = (sys.driftSpeedKmh * totalMinutes) / 60;
        const headingRad = (sys.driftHeadingDeg * Math.PI) / 180;

        const deltaLat = (driftDistKm * Math.cos(headingRad)) / 111.32;
        const deltaLng = (driftDistKm * Math.sin(headingRad)) / (111.32 * Math.cos((location.lat * Math.PI) / 180));

        const cloudLat = location.lat + sys.relLat + deltaLat;
        const cloudLng = location.lng + sys.relLng + deltaLng;

        const screenPt = map.project([cloudLng, cloudLat]);
        const cx = screenPt.x;
        const cy = screenPt.y;
        const radiusPx = sys.radiusKm * pxPerKm;

        // Skip if way off-screen
        if (cx < -radiusPx * 2 || cx > width + radiusPx * 2 || cy < -radiusPx * 2 || cy > height + radiusPx * 2) {
          return;
        }

        ctx.save();

        if (channel === 'VIS') {
          // VISIBLE CHANNEL: Rich, realistic optical cloud tops with textured shadows cast southeastward

          // 1. Shadow cast by cloud on ground
          ctx.beginPath();
          const shadowOffsetX = radiusPx * 0.18;
          const shadowOffsetY = radiusPx * 0.22;
          ctx.ellipse(cx + shadowOffsetX, cy + shadowOffsetY, radiusPx * 0.95, radiusPx * 0.75, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10, 15, 25, 0.32)';
          ctx.filter = 'blur(16px)';
          ctx.fill();
          ctx.filter = 'none';

          // 2. Multi-layered organic cloud decks
          const lobes = 7;
          for (let l = 0; l < lobes; l++) {
            const lobeAngle = (l / lobes) * Math.PI * 2 + liveDrift * sys.rotationSpeed;
            const lobeDist = radiusPx * 0.42;
            const lx = cx + Math.cos(lobeAngle) * lobeDist;
            const ly = cy + Math.sin(lobeAngle) * lobeDist;
            const lobeR = radiusPx * (0.45 + (l % 3) * 0.12);

            const grad = ctx.createRadialGradient(lx, ly, lobeR * 0.1, lx, ly, lobeR);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
            grad.addColorStop(0.55, 'rgba(240, 245, 255, 0.72)');
            grad.addColorStop(0.85, 'rgba(220, 230, 245, 0.35)');
            grad.addColorStop(1, 'rgba(210, 225, 240, 0)');

            ctx.beginPath();
            ctx.arc(lx, ly, lobeR, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }

          // Dense convective anvil core
          if (sys.type === 'CUMULONIMBUS_CLUSTER') {
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx * 0.55);
            coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            coreGrad.addColorStop(0.5, 'rgba(245, 250, 255, 0.85)');
            coreGrad.addColorStop(1, 'rgba(230, 240, 255, 0)');

            ctx.beginPath();
            ctx.arc(cx, cy, radiusPx * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
            ctx.shadowBlur = 15;
            ctx.fill();
          }
        } else if (channel === 'IR') {
          // INFRARED CHANNEL: Cloud-top temperature false-color thermal gradient
          // Extreme cold tops (-75°C to -60°C) are rendered in electric violet, cyan, and stark white cores
          const isExtremeCold = sys.tempC <= -65;

          const irGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx);
          if (isExtremeCold) {
            // Severe convective thunderstorm thermal signature
            irGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // Overshooting top (<-75°C)
            irGrad.addColorStop(0.2, 'rgba(217, 70, 239, 0.9)'); // Electric violet (-70°C)
            irGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.85)'); // Intense cyan (-65°C)
            irGrad.addColorStop(0.65, 'rgba(59, 130, 246, 0.7)'); // Blue (-50°C)
            irGrad.addColorStop(0.85, 'rgba(30, 41, 59, 0.45)'); // Low cloud (-25°C)
            irGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            // Mid-level / Cirrus plume
            irGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
            irGrad.addColorStop(0.35, 'rgba(37, 99, 235, 0.65)');
            irGrad.addColorStop(0.7, 'rgba(30, 58, 138, 0.4)');
            irGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          }

          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
          ctx.fillStyle = irGrad;
          ctx.shadowColor = isExtremeCold ? 'rgba(217, 70, 239, 0.65)' : 'rgba(56, 189, 248, 0.4)';
          ctx.shadowBlur = isExtremeCold ? 22 : 10;
          ctx.fill();

          // Temperature Callout Label on core
          if (radiusPx > 35) {
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(`${sys.tempC.toFixed(1)}°C`, cx - 22, cy + 4);
          }
        } else if (channel === 'WV') {
          // WATER VAPOR CHANNEL: Upper-tropospheric moisture eddies & swirling plumes
          const wvGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx * 1.3);
          wvGrad.addColorStop(0, 'rgba(45, 212, 191, 0.88)'); // High moisture convergence (turquoise)
          wvGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.72)'); // Upper vapor plume (cyan)
          wvGrad.addColorStop(0.65, 'rgba(30, 64, 175, 0.45)'); // Moderate vapor (deep blue)
          wvGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx * 1.25, 0, Math.PI * 2);
          ctx.fillStyle = wvGrad;
          ctx.shadowColor = 'rgba(45, 212, 191, 0.5)';
          ctx.shadowBlur = 18;
          ctx.fill();

          // Swirling streamline wisp
          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx * 0.7, 0, Math.PI * 1.2);
          ctx.strokeStyle = 'rgba(167, 243, 208, 0.45)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        } else if (channel === 'GEOCOLOR') {
          // GEOCOLOR: True Color Day/Night Earth Blend with atmospheric limb glow
          const geoGrad = ctx.createRadialGradient(cx, cy, radiusPx * 0.1, cx, cy, radiusPx);
          geoGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
          geoGrad.addColorStop(0.4, 'rgba(240, 249, 255, 0.78)');
          geoGrad.addColorStop(0.75, 'rgba(186, 230, 253, 0.4)');
          geoGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');

          ctx.beginPath();
          ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
          ctx.fillStyle = geoGrad;
          ctx.shadowColor = 'rgba(186, 230, 253, 0.6)';
          ctx.shadowBlur = 14;
          ctx.fill();
        }

        ctx.restore();
      });

      // Atmospheric limb / horizon scattering gradient at top
      ctx.save();
      const horizonGrad = ctx.createLinearGradient(0, 0, 0, 40);
      horizonGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      horizonGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, 0, width, 40);
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
  }, [map, location, channel, tOffsetMin, atmosphere]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
