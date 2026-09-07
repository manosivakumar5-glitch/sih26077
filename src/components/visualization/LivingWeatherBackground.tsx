import React, { useEffect, useRef } from 'react';
import {
  WeatherCondition,
  TimeOfDay,
  WeatherSceneState,
  getScenePalette,
  SkyColorPalette,
} from '../../services/weatherSceneEngine';

interface LivingWeatherBackgroundProps {
  sceneState: WeatherSceneState;
  windEnabled?: boolean;
  rainEnabled?: boolean;
  cloudsEnabled?: boolean;
  lightningEnabled?: boolean;
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

interface WindStream {
  x: number;
  y: number;
  speed: number;
  life: number;
  maxLife: number;
  length: number;
}

// Helper to lerp arrays of numbers
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function lerpColor(c1: number[], c2: number[], t: number): number[] {
  return c1.map((v, i) => lerp(v, c2[i] || 0, t));
}

export const LivingWeatherBackground: React.FC<LivingWeatherBackgroundProps> = ({
  sceneState,
  windEnabled = true,
  rainEnabled = true,
  cloudsEnabled = true,
  lightningEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated persistent state
  const rainDropsRef = useRef<RainDrop[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const starsRef = useRef<Star[]>([]);
  const windStreamsRef = useRef<WindStream[]>([]);
  const cloudOffsetRef = useRef<number>(0);
  const sunPulseRef = useRef<number>(0);

  // Lightning state
  const lastLightningTimeRef = useRef<number>(Date.now());
  const lightningFlashRef = useRef<number>(0); // 0 to 1
  const activeBoltRef = useRef<{ x: number; y: number; branches: { x: number; y: number }[] } | null>(null);

  // Current interpolated palette for smooth transitions
  const currentPaletteRef = useRef<SkyColorPalette | null>(null);

  // Initialize stars once
  useEffect(() => {
    starsRef.current = Array.from({ length: 90 }).map(() => ({
      x: Math.random(),
      y: Math.random() * 0.75, // Top 75% of screen
      size: 0.8 + Math.random() * 1.6,
      baseAlpha: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      // Scale rain count based on rain intensity (0 - 100 mm/h)
      const targetRainCount =
        sceneState.rainIntensity > 0.5
          ? Math.min(700, Math.floor(40 + sceneState.rainIntensity * 6))
          : 0;

      rainDropsRef.current = Array.from({ length: targetRainCount }).map(() => ({
        x: Math.random() * (width + 300) - 150,
        y: Math.random() * height,
        length: 12 + Math.random() * 16 + sceneState.rainIntensity * 0.15,
        speed: Math.max(12, 14 + sceneState.rainIntensity * 0.12 + sceneState.windSpeed * 0.08),
        opacity: 0.25 + Math.random() * 0.5,
        thickness: sceneState.rainIntensity > 30 ? 1.5 + Math.random() : 1.0,
      }));

      // Wind streams
      windStreamsRef.current = Array.from({ length: 45 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 1.5 + Math.random() * 2.5,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 80,
        length: 20 + Math.random() * 40,
      }));
    };

    initParticles();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let animId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.0);
      lastTime = time;

      // Update sun pulse & cloud offset
      sunPulseRef.current += 0.025 * dt;
      const windSpeedNorm = Math.max(0.1, sceneState.windSpeed / 25);
      cloudOffsetRef.current += windSpeedNorm * 0.4 * dt;

      // 1. PALETTE INTERPOLATION (Smooth transitions between states)
      const targetPalette = getScenePalette(
        sceneState.condition,
        sceneState.timeOfDay,
        sceneState.stormIntensity
      );

      if (!currentPaletteRef.current) {
        currentPaletteRef.current = targetPalette;
      } else {
        const cur = currentPaletteRef.current;
        const lerpRate = 0.04 * dt; // Smooth interpolation speed
        cur.top = lerpColor(cur.top, targetPalette.top, lerpRate) as [number, number, number];
        cur.mid = lerpColor(cur.mid, targetPalette.mid, lerpRate) as [number, number, number];
        cur.bottom = lerpColor(cur.bottom, targetPalette.bottom, lerpRate) as [number, number, number];
        cur.sunGlow = lerpColor(cur.sunGlow, targetPalette.sunGlow, lerpRate) as [number, number, number, number];
        cur.cloudHighlight = lerpColor(cur.cloudHighlight, targetPalette.cloudHighlight, lerpRate) as [number, number, number, number];
        cur.cloudShadow = lerpColor(cur.cloudShadow, targetPalette.cloudShadow, lerpRate) as [number, number, number, number];
        cur.hazeColor = lerpColor(cur.hazeColor, targetPalette.hazeColor, lerpRate) as [number, number, number, number];
        cur.sunVisible = targetPalette.sunVisible;
        cur.moonVisible = targetPalette.moonVisible;
      }

      const p = currentPaletteRef.current;

      // 2. DRAW ATMOSPHERIC SKY GRADIENT
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, `rgb(${Math.round(p.top[0])}, ${Math.round(p.top[1])}, ${Math.round(p.top[2])})`);
      skyGrad.addColorStop(0.5, `rgb(${Math.round(p.mid[0])}, ${Math.round(p.mid[1])}, ${Math.round(p.mid[2])})`);
      skyGrad.addColorStop(1, `rgb(${Math.round(p.bottom[0])}, ${Math.round(p.bottom[1])}, ${Math.round(p.bottom[2])})`);

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. STARS AT NIGHT
      if (sceneState.timeOfDay === 'NIGHT') {
        const starCloudCoverage = sceneState.cloudCover / 100;
        const starGlobalAlpha = Math.max(0, 1 - starCloudCoverage * 0.85);

        if (starGlobalAlpha > 0.05) {
          ctx.save();
          starsRef.current.forEach((st) => {
            st.phase += st.speed * dt;
            const twinkle = 0.5 + 0.5 * Math.sin(st.phase);
            const alpha = st.baseAlpha * twinkle * starGlobalAlpha;
            ctx.fillStyle = `rgba(235, 245, 255, ${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(st.x * width, st.y * height, st.size, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      }

      // 4. SUN (SUNNY, PARTLY CLOUDY, SUNRISE, SUNSET)
      if (p.sunVisible && sceneState.timeOfDay !== 'NIGHT') {
        ctx.save();
        // Sun position depending on time of day
        let sunX = width * 0.72;
        let sunY = height * 0.22;
        let sunRadius = 45;

        if (sceneState.timeOfDay === 'SUNRISE') {
          sunX = width * 0.25;
          sunY = height * 0.65;
          sunRadius = 42;
        } else if (sceneState.timeOfDay === 'SUNSET') {
          sunX = width * 0.78;
          sunY = height * 0.68;
          sunRadius = 46;
        }

        // Animated corona pulse
        const pulse = Math.sin(sunPulseRef.current) * 4;
        const outerGlowRadius = 260 + pulse * 6;

        // Radial sunburst glow
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, outerGlowRadius);
        sunGrad.addColorStop(0, `rgba(${p.sunGlow[0]}, ${p.sunGlow[1]}, ${p.sunGlow[2]}, ${p.sunGlow[3]})`);
        sunGrad.addColorStop(0.3, `rgba(${p.sunGlow[0]}, ${p.sunGlow[1]}, ${p.sunGlow[2]}, ${(p.sunGlow[3] * 0.4).toFixed(3)})`);
        sunGrad.addColorStop(0.7, `rgba(${p.sunGlow[0]}, ${p.sunGlow[1]}, ${p.sunGlow[2]}, ${(p.sunGlow[3] * 0.1).toFixed(3)})`);
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, outerGlowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun disc
        const coreGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunRadius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.6, `rgb(${p.sunColor[0]}, ${p.sunColor[1]}, ${p.sunColor[2]})`);
        coreGrad.addColorStop(1, `rgba(${p.sunGlow[0]}, ${p.sunGlow[1]}, ${p.sunGlow[2]}, 0.8)`);

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft sunbeams in clear / sunny conditions
        if (sceneState.condition === 'SUNNY') {
          ctx.strokeStyle = `rgba(255, 250, 220, ${0.06 + Math.sin(sunPulseRef.current * 0.8) * 0.02})`;
          ctx.lineWidth = 18;
          for (let b = 0; b < 6; b++) {
            const angle = (b * Math.PI) / 3 + sunPulseRef.current * 0.05;
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(sunX + Math.cos(angle) * (outerGlowRadius * 1.5), sunY + Math.sin(angle) * (outerGlowRadius * 1.5));
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. MOON (NIGHT)
      if (p.moonVisible && sceneState.timeOfDay === 'NIGHT') {
        ctx.save();
        const moonX = width * 0.76;
        const moonY = height * 0.2;
        const moonR = 34;

        // Moon halo
        const moonHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 160);
        moonHalo.addColorStop(0, 'rgba(215, 235, 255, 0.35)');
        moonHalo.addColorStop(0.5, 'rgba(180, 210, 255, 0.12)');
        moonHalo.addColorStop(1, 'rgba(180, 210, 255, 0)');

        ctx.fillStyle = moonHalo;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 160, 0, Math.PI * 2);
        ctx.fill();

        // Moon disc (gibbous / illuminated crescent)
        ctx.fillStyle = '#e8f0fe';
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx.fill();

        // Moon surface craters/shadow for realism
        ctx.fillStyle = 'rgba(170, 190, 220, 0.25)';
        ctx.beginPath();
        ctx.arc(moonX - 8, moonY - 4, 10, 0, Math.PI * 2);
        ctx.arc(moonX + 10, moonY + 8, 7, 0, Math.PI * 2);
        ctx.arc(moonX + 4, moonY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 6. MOVING CLOUD LAYERS (Drifting based on wind direction & speed)
      if (cloudsEnabled && sceneState.cloudCover > 5) {
        ctx.save();
        const radAngle = (sceneState.windDirection * Math.PI) / 180;
        const windDriftX = Math.sin(radAngle);
        const driftDistance = cloudOffsetRef.current * 70;

        // Number of cloud clusters derived from cloudCover (2 for sunny, up to 10 for overcast/storm)
        const cloudCount = Math.max(2, Math.min(10, Math.round((sceneState.cloudCover / 100) * 10)));
        const cloudOpacity = Math.min(0.95, Math.max(0.25, (sceneState.cloudCover / 100) * 0.9));

        for (let i = 0; i < cloudCount; i++) {
          const baseY = 80 + (i % 3) * 65 + Math.sin(i * 2 + cloudOffsetRef.current * 0.05) * 20;
          const clusterSpacing = width / (cloudCount / 1.5);
          const baseX = (((i * clusterSpacing + driftDistance * windDriftX) % (width + 500)) - 250);
          const clusterRadius = 140 + (i % 4) * 45;

          // Radial gradient for each fluffy cumulus cloud puff
          const puffGrad = ctx.createRadialGradient(
            baseX,
            baseY,
            clusterRadius * 0.15,
            baseX,
            baseY,
            clusterRadius
          );

          puffGrad.addColorStop(
            0,
            `rgba(${Math.round(p.cloudHighlight[0])}, ${Math.round(p.cloudHighlight[1])}, ${Math.round(p.cloudHighlight[2])}, ${(p.cloudHighlight[3] * cloudOpacity).toFixed(3)})`
          );
          puffGrad.addColorStop(
            0.6,
            `rgba(${Math.round(p.cloudShadow[0])}, ${Math.round(p.cloudShadow[1])}, ${Math.round(p.cloudShadow[2])}, ${(p.cloudShadow[3] * cloudOpacity * 0.7).toFixed(3)})`
          );
          puffGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = puffGrad;
          ctx.beginPath();
          // Draw composite cloud shapes
          ctx.arc(baseX, baseY, clusterRadius * 0.8, 0, Math.PI * 2);
          ctx.arc(baseX - clusterRadius * 0.45, baseY + clusterRadius * 0.15, clusterRadius * 0.6, 0, Math.PI * 2);
          ctx.arc(baseX + clusterRadius * 0.45, baseY + clusterRadius * 0.1, clusterRadius * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. LIGHTNING FLASH & BOLTS (THUNDERSTORM)
      if (lightningEnabled && sceneState.lightningPotential > 5) {
        const now = Date.now();
        // Trigger lightning flash randomly based on potential
        const minInterval = Math.max(1600, 12000 - sceneState.lightningPotential * 100);
        if (now - lastLightningTimeRef.current > minInterval + (Math.random() * 3000 - 1500)) {
          lightningFlashRef.current = 1.0;
          lastLightningTimeRef.current = now;

          // Generate branching bolt coordinates
          const startX = width * 0.25 + Math.random() * (width * 0.5);
          const startY = 30;
          const branches: { x: number; y: number }[] = [];
          let curX = startX;
          let curY = startY;

          while (curY < height * 0.72) {
            curX += (Math.random() - 0.5) * 60;
            curY += 25 + Math.random() * 35;
            branches.push({ x: curX, y: curY });
          }
          activeBoltRef.current = { x: startX, y: startY, branches };
        }
      }

      // Decay lightning flash
      if (lightningFlashRef.current > 0) {
        lightningFlashRef.current -= 0.06 * dt;
        if (lightningFlashRef.current < 0) {
          lightningFlashRef.current = 0;
          activeBoltRef.current = null;
        }

        // Atmospheric illumination flash
        ctx.save();
        ctx.fillStyle = `rgba(235, 245, 255, ${(lightningFlashRef.current * 0.55).toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);

        // Draw branching bolt if available
        if (activeBoltRef.current && lightningFlashRef.current > 0.4) {
          const bolt = activeBoltRef.current;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(lightningFlashRef.current * 0.95).toFixed(3)})`;
          ctx.lineWidth = 3.0;
          ctx.shadowColor = '#93c5fd';
          ctx.shadowBlur = 18;

          ctx.beginPath();
          ctx.moveTo(bolt.x, bolt.y);
          bolt.branches.forEach((b) => {
            ctx.lineTo(b.x, b.y);
          });
          ctx.stroke();

          // Core bright white inner streak
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 8. FOG & ATMOSPHERIC HAZE
      if (sceneState.condition === 'FOG' || sceneState.visibility < 4 || p.hazeColor[3] > 0.3) {
        ctx.save();
        const fogAlpha =
          sceneState.condition === 'FOG'
            ? 0.55
            : Math.min(0.5, (p.hazeColor[3] || 0.2) * 0.7);

        const fogGrad = ctx.createLinearGradient(0, height * 0.3, 0, height);
        fogGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        fogGrad.addColorStop(
          0.6,
          `rgba(${p.hazeColor[0]}, ${p.hazeColor[1]}, ${p.hazeColor[2]}, ${fogAlpha * 0.6})`
        );
        fogGrad.addColorStop(
          1,
          `rgba(${p.hazeColor[0]}, ${p.hazeColor[1]}, ${p.hazeColor[2]}, ${fogAlpha})`
        );

        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 9. RAINFALL PARTICLES & GROUND SPLASH RIPPLES
      if (rainEnabled && sceneState.rainIntensity > 0.5) {
        ctx.save();
        const radAngle = (sceneState.windDirection * Math.PI) / 180;
        const windDriftX = Math.sin(radAngle) * Math.min(18, sceneState.windSpeed * 0.4);

        ctx.strokeStyle =
          sceneState.timeOfDay === 'NIGHT'
            ? 'rgba(186, 230, 253, 0.45)'
            : 'rgba(224, 242, 254, 0.65)';

        rainDropsRef.current.forEach((drop) => {
          ctx.lineWidth = drop.thickness;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + windDriftX * 0.8, drop.y + drop.length);
          ctx.stroke();

          // Move drops
          drop.x += windDriftX * 0.8 * dt;
          drop.y += drop.speed * dt;

          // Splash trigger when drop hits the bottom boundary
          if (drop.y > height - 15) {
            drop.y = -20;
            drop.x = Math.random() * (width + 300) - 150;

            // Generate ground ripple splash occasionally
            if (splashesRef.current.length < 50 && Math.random() > 0.65) {
              splashesRef.current.push({
                x: drop.x,
                y: height - Math.random() * 15,
                radius: 1,
                maxRadius: 6 + Math.random() * 10,
                opacity: 0.6,
              });
            }
          }
        });

        // Render ripples
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.4)';
        ctx.lineWidth = 1.0;
        splashesRef.current.forEach((sp, idx) => {
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 2, sp.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();

          sp.radius += 0.45 * dt;
          sp.opacity -= 0.035 * dt;
        });

        // Clean up finished ripples
        splashesRef.current = splashesRef.current.filter((sp) => sp.opacity > 0);
        ctx.restore();
      }

      // 10. WIND FLOW STREAMLINES
      if (windEnabled && sceneState.windSpeed > 8) {
        ctx.save();
        const radAngle = (sceneState.windDirection * Math.PI) / 180;
        const wx = Math.sin(radAngle) * (sceneState.windSpeed / 12);
        const wy = Math.cos(radAngle) * 0.2;

        ctx.strokeStyle =
          sceneState.timeOfDay === 'NIGHT'
            ? 'rgba(147, 197, 253, 0.2)'
            : 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.2;

        windStreamsRef.current.forEach((ws) => {
          ws.x += wx * dt * ws.speed;
          ws.y += wy * dt + Math.sin(ws.x * 0.01) * 0.3;
          ws.life += dt;

          if (ws.life > ws.maxLife || ws.x > width + 100 || ws.x < -100 || ws.y > height + 100) {
            ws.x = Math.random() * width;
            ws.y = Math.random() * height;
            ws.life = 0;
          }

          ctx.beginPath();
          ctx.moveTo(ws.x, ws.y);
          ctx.lineTo(ws.x + wx * ws.length * 0.2, ws.y + wy * 10);
          ctx.stroke();
        });
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [sceneState, windEnabled, rainEnabled, cloudsEnabled, lightningEnabled]);

  return (
    <canvas
      ref={canvasRef}
      id="living-weather-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-700"
    />
  );
};
