// Real-time telemetry streaming from backend
// Uses WebSocket when available, falls back to polling

import { vehiclesAPI, telemetryAPI, alertsAPI, createWebSocketConnection } from './api';
import { useState, useEffect, useRef } from 'react';

export interface VehicleRealTimeData {
  vehicle_id: string;
  vehicle_number: string;
  latitude: number;
  longitude: number;
  speed: number;
  temperature: number;
  fuel_level: number;
  status: 'online' | 'offline';
  last_update: string;
  route_deviation: number;
  risk_score: number;
  ai_confidence: number;
}

export interface RealTimeAlert {
  id: string;
  vehicle_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  created_at: string;
  status: 'OPEN' | 'RESOLVED';
}

class TelemetryStreamService {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, (data: VehicleRealTimeData) => void> = new Map();
  private alertListeners: ((alerts: RealTimeAlert[]) => void)[] = [];
  private ws: WebSocket | null = null;

  /**
   * Start WebSocket connection for real-time updates.
   * Falls back to polling if WS fails.
   */
  startWebSocket(token: string, onFleetUpdate: () => void) {
    const ws = createWebSocketConnection(token);
    if (!ws) return null;
    this.ws = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (
          msg.event === 'telemetry_update' ||
          msg.event === 'ai_prediction_update' ||
          msg.event === 'new_alert'
        ) {
          onFleetUpdate();
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    return ws;
  }

  /**
   * Start polling vehicle telemetry from backend
   * @param vehicleId - Vehicle UUID
   * @param token - JWT auth token
   * @param intervalMs - Poll interval (default 5 seconds)
   */
  startPolling(vehicleId: string, token: string, intervalMs = 5000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const telemetry = await telemetryAPI.getLatestTelemetry(token, vehicleId);

        if (telemetry) {
          const realTimeData: VehicleRealTimeData = {
            vehicle_id: vehicleId,
            vehicle_number: telemetry.vehicle?.vehicle_number || 'UNKNOWN',
            latitude: telemetry.latitude || 0,
            longitude: telemetry.longitude || 0,
            speed: telemetry.speed || 0,
            temperature: telemetry.temperature || 0,
            fuel_level: telemetry.fuel_level || 0,
            status: telemetry.timestamp ? 'online' : 'offline',
            last_update: new Date(telemetry.timestamp || Date.now()).toISOString(),
            route_deviation: telemetry.route_deviation || 0,
            risk_score: telemetry.risk_score || 0,
            ai_confidence: telemetry.ai_confidence || 0,
          };

          const listener = this.listeners.get(vehicleId);
          if (listener) {
            listener(realTimeData);
          }
        }
      } catch (error) {
        console.error('Telemetry polling error:', error);
      }
    }, intervalMs);
  }

  /**
   * Start polling alerts from backend
   */
  startAlertPolling(token: string, intervalMs = 5000) {
    const alertInterval = setInterval(async () => {
      try {
        const alerts = await alertsAPI.listAlerts(token, 0, 20);

        if (alerts && alerts.length > 0) {
          const realTimeAlerts: RealTimeAlert[] = alerts.map((a: any) => ({
            id: a.id,
            vehicle_id: a.vehicle_id,
            alert_type: a.alert_type,
            severity: a.severity || 'MEDIUM',
            message: a.message,
            created_at: a.created_at,
            status: a.status || 'OPEN',
          }));

          this.alertListeners.forEach((listener) => listener(realTimeAlerts));
        }
      } catch (error) {
        console.error('Alert polling error:', error);
      }
    }, intervalMs);

    return alertInterval;
  }

  onVehicleUpdate(vehicleId: string, callback: (data: VehicleRealTimeData) => void) {
    this.listeners.set(vehicleId, callback);
  }

  onAlertUpdate(callback: (alerts: RealTimeAlert[]) => void) {
    this.alertListeners.push(callback);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.listeners.clear();
  }

  stopWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const telemetryStreamService = new TelemetryStreamService();

// React Hook for real-time telemetry (single vehicle)
export const useTelemetryStream = (vehicleId: string | null, token: string | null) => {
  const [data, setData] = useState<VehicleRealTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId || !token) return;

    setLoading(true);
    telemetryStreamService.startPolling(vehicleId, token, 5000);
    telemetryStreamService.onVehicleUpdate(vehicleId, (telemetry) => {
      setData(telemetry);
      setLoading(false);
    });

    return () => {
      telemetryStreamService.stopPolling();
    };
  }, [vehicleId, token]);

  return { data, loading };
};

// React Hook for alerts stream
export const useAlertsStream = (token: string | null) => {
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const pollingId = telemetryStreamService.startAlertPolling(token, 5000);
    telemetryStreamService.onAlertUpdate((newAlerts) => {
      setAlerts(newAlerts);
      setLoading(false);
    });

    return () => {
      clearInterval(pollingId);
    };
  }, [token]);

  return { alerts, loading };
};
