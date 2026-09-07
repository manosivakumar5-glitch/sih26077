/**
 * STORM-MIND WeatherSceneEngine
 * Meteorological-to-Atmospheric Environment & Scene Generation Engine
 * Synthesizes physical atmospheric variables into real-time visual environment parameters
 */

export type WeatherCondition =
  | 'SUNNY'
  | 'PARTLY_CLOUDY'
  | 'CLOUDY'
  | 'RAIN'
  | 'THUNDERSTORM'
  | 'FOG';

export type TimeOfDay = 'SUNRISE' | 'DAY' | 'SUNSET' | 'NIGHT';

export interface WeatherSceneState {
  condition: WeatherCondition;
  temperature: number; // °C
  cloudCover: number; // 0 - 100%
  rainProbability: number; // 0 - 100%
  rainIntensity: number; // mm/h
  windSpeed: number; // km/h
  windDirection: number; // degrees 0 - 360
  lightningPotential: number; // 0 - 100%
  visibility: number; // km
  timeOfDay: TimeOfDay;
  stormIntensity: number; // 0.0 - 1.0
  description: string;
  hazardStatus: 'ALL_CLEAR' | 'WATCH' | 'ADVISORY' | 'WARNING' | 'EXTREME';
}

export interface SkyColorPalette {
  top: [number, number, number]; // RGB
  mid: [number, number, number];
  bottom: [number, number, number];
  sunGlow: [number, number, number, number]; // RGBA
  sunColor: [number, number, number];
  cloudHighlight: [number, number, number, number];
  cloudShadow: [number, number, number, number];
  hazeColor: [number, number, number, number];
  isDaytime: boolean;
  sunVisible: boolean;
  moonVisible: boolean;
}

/**
 * Determine high-level weather condition from physical variables
 */
export function determineWeatherCondition(
  rainRateMmh: number,
  cloudCoverPct: number,
  visibilityKm: number,
  lightningFlashesPerMin: number,
  scenario?: string
): WeatherCondition {
  // Explicit severe thunderstorm or intense lightning
  if (
    rainRateMmh > 25 ||
    lightningFlashesPerMin > 10 ||
    (scenario === 'SEVERE_THUNDERSTORM' && rainRateMmh > 5) ||
    (scenario === 'MONSOON_CLOUDBURST' && rainRateMmh > 30)
  ) {
    return 'THUNDERSTORM';
  }

  // Active rainfall
  if (rainRateMmh > 0.8) {
    return 'RAIN';
  }

  // Dense fog or heavy mist
  if (visibilityKm < 3.2 && cloudCoverPct > 60) {
    return 'FOG';
  }

  // Cloud cover tiers
  if (cloudCoverPct > 68) {
    return 'CLOUDY';
  }

  if (cloudCoverPct > 25) {
    return 'PARTLY_CLOUDY';
  }

  return 'SUNNY';
}

/**
 * Determine Time of Day based on base hour (14:00 default) + timeline offset minutes
 */
export function determineTimeOfDay(tOffsetMin: number, overrideTime?: TimeOfDay): TimeOfDay {
  if (overrideTime) return overrideTime;

  // Base time: 14:00 (2:00 PM)
  const currentTotalMinutes = (14 * 60 + tOffsetMin) % (24 * 60);
  const normalizedMins = currentTotalMinutes < 0 ? currentTotalMinutes + 24 * 60 : currentTotalMinutes;
  const hour = normalizedMins / 60;

  if (hour >= 5.5 && hour < 7.5) {
    return 'SUNRISE';
  } else if (hour >= 7.5 && hour < 17.5) {
    return 'DAY';
  } else if (hour >= 17.5 && hour < 19.5) {
    return 'SUNSET';
  } else {
    return 'NIGHT';
  }
}

/**
 * Calculate natural language condition summary
 */
export function getWeatherSummaryPhrase(
  condition: WeatherCondition,
  tempC: number,
  windSpeedKmh: number,
  rainIntensityMmh: number
): string {
  switch (condition) {
    case 'SUNNY':
      return windSpeedKmh > 20
        ? `Bright sunshine with brisk ${Math.round(windSpeedKmh)} km/h winds`
        : 'Clear skies with pleasant sunlight and calm winds';
    case 'PARTLY_CLOUDY':
      return 'Sun with drifting cumulus clouds and gentle breeze';
    case 'CLOUDY':
      return 'Overcast skies with muted sunlight and stable pressure';
    case 'RAIN':
      return rainIntensityMmh > 15
        ? `Heavy steady downpour (${rainIntensityMmh} mm/h) with wet road hazards`
        : `Light intermittent rain showers (${rainIntensityMmh} mm/h)`;
    case 'THUNDERSTORM':
      return `Severe convective storm with active lightning & ${Math.round(windSpeedKmh)} km/h wind gusts`;
    case 'FOG':
      return 'Dense atmospheric fog with reduced surface visibility';
    default:
      return 'Current atmospheric conditions normal';
  }
}

/**
 * Get icon/emoji representation
 */
export function getWeatherConditionIcon(condition: WeatherCondition, timeOfDay: TimeOfDay): string {
  switch (condition) {
    case 'SUNNY':
      return timeOfDay === 'NIGHT' ? '🌙' : '☀️';
    case 'PARTLY_CLOUDY':
      return timeOfDay === 'NIGHT' ? '☁️' : '🌤️';
    case 'CLOUDY':
      return '☁️';
    case 'RAIN':
      return '🌧️';
    case 'THUNDERSTORM':
      return '⛈️';
    case 'FOG':
      return '🌫️';
  }
}

/**
 * Get RGB color palettes for smooth canvas rendering
 */
export function getScenePalette(condition: WeatherCondition, timeOfDay: TimeOfDay, stormIntensity: number): SkyColorPalette {
  // 1. NIGHT PALETTES
  if (timeOfDay === 'NIGHT') {
    if (condition === 'THUNDERSTORM') {
      return {
        top: [12, 18, 36],
        mid: [18, 28, 52],
        bottom: [24, 38, 68],
        sunGlow: [120, 160, 220, 0.1],
        sunColor: [180, 210, 255],
        cloudHighlight: [45, 60, 95, 0.85],
        cloudShadow: [16, 22, 42, 0.95],
        hazeColor: [20, 32, 58, 0.5],
        isDaytime: false,
        sunVisible: false,
        moonVisible: true,
      };
    }
    if (condition === 'RAIN') {
      return {
        top: [14, 24, 46],
        mid: [20, 34, 62],
        bottom: [28, 46, 78],
        sunGlow: [150, 190, 240, 0.15],
        sunColor: [210, 230, 255],
        cloudHighlight: [60, 78, 110, 0.75],
        cloudShadow: [22, 32, 54, 0.9],
        hazeColor: [25, 40, 70, 0.45],
        isDaytime: false,
        sunVisible: false,
        moonVisible: true,
      };
    }
    // Clear / partly cloudy Night (Deep Sapphire & Indigo, NEVER pure black!)
    return {
      top: [8, 16, 38], // Deep midnight navy
      mid: [15, 28, 62], // Rich indigo
      bottom: [24, 44, 88], // Subtle twilight sapphire horizon
      sunGlow: [180, 210, 255, 0.25], // Moon halo
      sunColor: [240, 246, 255], // Moon disc
      cloudHighlight: [80, 105, 150, 0.4],
      cloudShadow: [24, 36, 64, 0.6],
      hazeColor: [18, 30, 60, 0.2],
      isDaytime: false,
      sunVisible: false,
      moonVisible: true,
    };
  }

  // 2. SUNRISE PALETTES
  if (timeOfDay === 'SUNRISE') {
    return {
      top: [45, 55, 110], // Lavender-indigo top
      mid: [195, 80, 65], // Coral rose
      bottom: [255, 185, 95], // Golden dawn horizon
      sunGlow: [255, 210, 130, 0.65],
      sunColor: [255, 245, 200],
      cloudHighlight: [255, 220, 180, 0.85],
      cloudShadow: [120, 75, 95, 0.65],
      hazeColor: [245, 160, 120, 0.25],
      isDaytime: true,
      sunVisible: true,
      moonVisible: false,
    };
  }

  // 3. SUNSET PALETTES
  if (timeOfDay === 'SUNSET') {
    return {
      top: [35, 40, 95], // Violet-blue zenith
      mid: [180, 60, 80], // Crimson mauve
      bottom: [250, 140, 60], // Amber-orange horizon
      sunGlow: [255, 180, 80, 0.7],
      sunColor: [255, 235, 170],
      cloudHighlight: [255, 195, 130, 0.9],
      cloudShadow: [110, 50, 80, 0.7],
      hazeColor: [230, 110, 70, 0.3],
      isDaytime: true,
      sunVisible: true,
      moonVisible: false,
    };
  }

  // 4. DAYTIME PALETTES ACCORDING TO WEATHER
  switch (condition) {
    case 'SUNNY':
      return {
        top: [30, 136, 229], // Vibrant celestial blue
        mid: [66, 165, 245], // Clear azure
        bottom: [186, 230, 253], // Luminous bright cyan horizon
        sunGlow: [255, 245, 200, 0.85], // Warm glowing sun halo
        sunColor: [255, 255, 255], // Pure bright sun core
        cloudHighlight: [255, 255, 255, 0.92], // Pure fluffy white
        cloudShadow: [210, 230, 248, 0.45], // Soft azure shadow
        hazeColor: [224, 242, 254, 0.15],
        isDaytime: true,
        sunVisible: true,
        moonVisible: false,
      };

    case 'PARTLY_CLOUDY':
      return {
        top: [37, 99, 235], // Rich cobalt blue
        mid: [96, 165, 250], // Sky blue
        bottom: [191, 219, 254], // Soft horizon
        sunGlow: [255, 240, 190, 0.75],
        sunColor: [255, 255, 255],
        cloudHighlight: [255, 255, 255, 0.88],
        cloudShadow: [180, 205, 230, 0.55],
        hazeColor: [220, 235, 250, 0.2],
        isDaytime: true,
        sunVisible: true,
        moonVisible: false,
      };

    case 'CLOUDY':
      return {
        top: [85, 105, 130], // Soft slate grey
        mid: [130, 150, 175], // Diffuse blue-grey
        bottom: [185, 200, 218], // Bright overcast horizon
        sunGlow: [255, 255, 255, 0.25], // Diffuse veiled glow
        sunColor: [245, 248, 255],
        cloudHighlight: [235, 240, 248, 0.8],
        cloudShadow: [120, 135, 155, 0.7],
        hazeColor: [180, 195, 210, 0.35],
        isDaytime: true,
        sunVisible: false,
        moonVisible: false,
      };

    case 'RAIN':
      return {
        top: [50, 65, 88], // Dark slate blue
        mid: [80, 100, 125], // Cool rain cloud tone
        bottom: [140, 160, 185], // Wet atmospheric horizon
        sunGlow: [220, 230, 245, 0.15],
        sunColor: [225, 235, 245],
        cloudHighlight: [180, 195, 215, 0.75],
        cloudShadow: [70, 85, 110, 0.85],
        hazeColor: [120, 140, 168, 0.55],
        isDaytime: true,
        sunVisible: false,
        moonVisible: false,
      };

    case 'THUNDERSTORM':
      return {
        top: [22, 32, 48], // Convective thunderhead dark charcoal-blue
        mid: [38, 52, 75], // Deep turbulent slate
        bottom: [65, 82, 108], // Heavy shelf cloud base
        sunGlow: [180, 205, 235, 0.1],
        sunColor: [200, 220, 245],
        cloudHighlight: [110, 130, 160, 0.8],
        cloudShadow: [28, 38, 56, 0.95],
        hazeColor: [45, 60, 85, 0.65],
        isDaytime: true,
        sunVisible: false,
        moonVisible: false,
      };

    case 'FOG':
      return {
        top: [148, 163, 184], // Soft mist grey
        mid: [180, 195, 212], // Milky haze
        bottom: [215, 225, 235], // Ground mist reflection
        sunGlow: [255, 255, 240, 0.3],
        sunColor: [255, 255, 245],
        cloudHighlight: [230, 235, 242, 0.7],
        cloudShadow: [160, 175, 190, 0.6],
        hazeColor: [210, 220, 230, 0.8],
        isDaytime: true,
        sunVisible: false,
        moonVisible: false,
      };
  }
}
