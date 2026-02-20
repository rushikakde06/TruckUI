// Geolocation Service - Uses browser's free built-in Geolocation API
// No API key required!

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export class GeolocationService {
  private watchId: number | null = null;
  private listeners: ((location: LocationData) => void)[] = [];

  /**
   * Get current location (one-time)
   * Uses browser's Geolocation API (100% free)
   */
  getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported in this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Watch location updates continuously
   * Useful for live tracking
   */
  watchLocation(callback: (location: LocationData) => void, intervalMs = 5000) {
    if (!navigator.geolocation) {
      callback({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 0,
        timestamp: Date.now(),
      });
      return;
    }

    this.listeners.push(callback);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
        };

        // Notify all listeners
        this.listeners.forEach((listener) => listener(location));
      },
      (error) => {
        console.error('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return this.watchId;
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.listeners = [];
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * Returns distance in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const geolocationService = new GeolocationService();

// React Hook for geolocation
import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    geolocationService
      .getCurrentLocation()
      .then((loc) => {
        setLocation(loc);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        // Default to New York for demo
        setLocation({
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 0,
          timestamp: Date.now(),
        });
      });
  }, []);

  return { location, error, loading };
};
