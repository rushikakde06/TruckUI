// Weather Service using free Open-Meteo API
// No API key required! https://open-meteo.com

export interface WeatherForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
  description: string;
  isExtremeWeather: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog with rime',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow grains',
  80: 'Slight Rain showers',
  81: 'Moderate Rain showers',
  82: 'Violent Rain showers',
  85: 'Slight Snow showers',
  86: 'Heavy Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

// Weather codes that indicate extreme/dangerous conditions
const EXTREME_WEATHER_CODES = new Set([45, 48, 65, 73, 75, 77, 82, 86, 95, 96, 99]);

export const weatherService = {
  /**
   * Get weather forecast for a location
   * Uses free Open-Meteo API (no key required)
   * @param latitude - Location latitude
   * @param longitude - Location longitude
   * @param forecastDays - Number of days to forecast (1-16)
   */
  async getForecast(
    latitude: number,
    longitude: number,
    forecastDays = 7
  ): Promise<WeatherForecast[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        hourly: 'temperature_2m,weather_code,wind_speed_10m,precipitation',
        forecast_days: Math.min(forecastDays, 16).toString(),
        timezone: 'auto',
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      const hourly = data.hourly;

      return hourly.time.map((time: string, index: number) => ({
        time,
        temperature: hourly.temperature_2m[index],
        weatherCode: hourly.weather_code[index],
        windSpeed: hourly.wind_speed_10m[index],
        precipitation: hourly.precipitation[index],
        description: WEATHER_DESCRIPTIONS[hourly.weather_code[index]] || 'Unknown',
      }));
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      throw error;
    }
  },

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<CurrentWeather> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'temperature_2m,weather_code,wind_speed_10m,precipitation',
        timezone: 'auto',
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      const current = data.current;

      const isExtremeWeather = EXTREME_WEATHER_CODES.has(current.weather_code);
      const temperature = current.temperature_2m;
      const windSpeed = current.wind_speed_10m;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (isExtremeWeather) {
        riskLevel = 'high';
      } else if (temperature > 35 || temperature < -10 || windSpeed > 40) {
        riskLevel = 'high';
      } else if (temperature > 30 || temperature < 0 || windSpeed > 30) {
        riskLevel = 'medium';
      }

      return {
        temperature,
        weatherCode: current.weather_code,
        windSpeed,
        precipitation: current.precipitation,
        description: WEATHER_DESCRIPTIONS[current.weather_code] || 'Unknown',
        isExtremeWeather,
        riskLevel,
      };
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw error;
    }
  },

  /**
   * Check if extreme weather is detected on route
   * Returns alerts for dangerous conditions ahead
   */
  async checkExtremeWeatherOnRoute(
    waypoints: Array<{ lat: number; lon: number; label: string }>
  ): Promise<Array<{ location: string; risk: string; description: string }>> {
    try {
      const alerts: Array<{ location: string; risk: string; description: string }> = [];

      for (const waypoint of waypoints) {
        const forecast = await this.getForecast(waypoint.lat, waypoint.lon, 1);

        // Check next 24 hours for extreme weather
        for (const hour of forecast.slice(0, 24)) {
          if (EXTREME_WEATHER_CODES.has(hour.weatherCode)) {
            alerts.push({
              location: waypoint.label,
              risk: 'HIGH',
              description: `${hour.description} expected with ${hour.windSpeed} km/h winds`,
            });
            break;
          }

          // Temperature extremes
          if (hour.temperature > 40 || hour.temperature < -15) {
            alerts.push({
              location: waypoint.label,
              risk: 'MEDIUM',
              description: `Extreme temperature: ${hour.temperature}°C`,
            });
            break;
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Failed to check route weather:', error);
      return [];
    }
  },
};

// ============================================
// useWeather Hook
// ============================================
import { useState, useEffect } from 'react';

export const useWeather = (latitude?: number, longitude?: number) => {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const weather = await weatherService.getCurrentWeather(latitude, longitude);
        setWeather(weather);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  return { weather, loading, error };
};
