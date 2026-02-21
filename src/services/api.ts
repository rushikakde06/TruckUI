// API Client for connecting to the backend
// Backend runs on http://localhost:8001 (configure in .env)
import { apiKeyManager } from './apiKeyManager';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8001';
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================
// Helper: Get Authentication Headers
// ============================================
function getAuthHeaders(token?: string): Record<string, string> {
  return apiKeyManager.getAuthHeaders(token || undefined);
}

// ============================================
// Auth API
// ============================================
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.detail || 'Login failed');
    }
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch profile');
    return response.json();
  },
};

// ============================================
// Vehicles API
// ============================================
export const vehiclesAPI = {
  async listVehicles(token: string, skip = 0, limit = 100) {
    const response = await fetch(
      `${API_BASE_URL}/vehicles/?skip=${skip}&limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicles');
    return response.json();
  },

  async getVehicle(token: string, vehicleId: string) {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicle');
    return response.json();
  },

  async createVehicle(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/vehicles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to create vehicle');
    return response.json();
  },

  async updateVehicle(token: string, vehicleId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to update vehicle');
    return response.json();
  },
};

// ============================================
// Telemetry API
// ============================================
export const telemetryAPI = {
  /** Single call returning latest telemetry + AI predictions for every vehicle */
  async getLiveFleet(token: string) {
    const response = await fetch(
      `${API_BASE_URL}/telemetry/live-fleet`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch live fleet');
    return response.json(); // { count, vehicles: [...] }
  },

  async getTelemetryHistory(token: string, vehicleId: string, limit = 100) {
    const response = await fetch(
      `${API_BASE_URL}/telemetry/${vehicleId}?limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch telemetry');
    return response.json();
  },

  /** Kept for legacy compat, wraps getTelemetryHistory taking one record */
  async getLatestTelemetry(token: string, vehicleId: string) {
    const history = await telemetryAPI.getTelemetryHistory(token, vehicleId, 1);
    return Array.isArray(history) ? history[0] : history;
  },

  /** Push a new telemetry reading through the full AI pipeline */
  async ingestTelemetry(token: string, data: {
    vehicle_id: string;
    latitude: number;
    longitude: number;
    speed: number;
    temperature: number;
    route_deviation: number;
    weather_severity: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/telemetry/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to ingest telemetry');
    return response.json(); // { telemetry, ai_prediction, alerts_generated }
  },

  async logTelemetry(token: string, data: any) {
    return telemetryAPI.ingestTelemetry(token, data);
  },
};

// ============================================
// Alerts API
// ============================================
export const alertsAPI = {
  async listAlerts(token: string, skip = 0, limit = 100) {
    const response = await fetch(
      `${API_BASE_URL}/alerts/?skip=${skip}&limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch alerts');
    return response.json();
  },

  async getAlertsByVehicle(token: string, vehicleId: string, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/alerts/?vehicle_id=${vehicleId}&limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicle alerts');
    return response.json();
  },

  async resolveAlert(token: string, alertId: string) {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ resolved_by: 'operator' }),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to resolve alert');
    return response.json();
  },

  async acknowledgeAlert(token: string, alertId: string) {
    return alertsAPI.resolveAlert(token, alertId);
  },
};

// ============================================
// Analytics API
// ============================================
export const analyticsAPI = {
  async getFleetSummary(token: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/fleet-summary`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch fleet summary');
    return response.json();
  },

  async getRiskMetrics(token: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/risk-metrics`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch risk metrics');
    return response.json();
  },

  async getRiskTrend(token: string, hours = 24) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/risk-trend?hours=${hours}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch risk trend');
    return response.json(); // { trend: [{hour, avg_risk_score, ...}] }
  },

  async getAlertsSummary(token: string, hours = 24) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/alerts-summary?hours=${hours}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch alerts summary');
    return response.json();
  },

  async getTemperatureTrends(token: string, vehicleId?: string, hours = 6) {
    const params = new URLSearchParams({ hours: hours.toString() });
    if (vehicleId) params.set('vehicle_id', vehicleId);
    const response = await fetch(
      `${API_BASE_URL}/analytics/temperature-trends?${params}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch temperature trends');
    return response.json();
  },

  async getModelPerformance(token: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/model-performance`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch model performance');
    return response.json();
  },
};

// ============================================
// Routes API
// ============================================
export const routesAPI = {
  async listRoutes(token: string, skip = 0, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/routes/?skip=${skip}&limit=${limit}`,
      { headers: getAuthHeaders(token) }
    );
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch routes');
    return response.json();
  },

  async createRoute(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/routes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to create route');
    return response.json();
  },

  async getRoute(token: string, routeId: string) {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new APIError(response.status, 'Failed to fetch route');
    return response.json();
  },
};

// ============================================
// WebSocket – Real-Time Updates
// ============================================
/**
 * Connect to the backend WebSocket at /ws/telemetry.
 *
 * Events emitted by server:
 *   { event: "telemetry_update",    data: { vehicle_id, risk_score, ... } }
 *   { event: "ai_prediction_update", data: { ... } }
 *   { event: "new_alert",           data: { id, vehicle_id, severity, ... } }
 *   { event: "connected",           data: { client_id } }
 */
export const createWebSocketConnection = (token: string) => {
  const wsUrl = `${WS_BASE_URL}/ws/telemetry`;
  console.log(`[WS] Connecting to ${wsUrl}`);
  try {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('[WS] Connected to AI Telematics real-time feed');
    ws.onerror  = (e) => console.error('[WS] Error:', e);
    ws.onclose  = () => console.log('[WS] Disconnected');
    return ws;
  } catch (err) {
    console.error('[WS] Failed to connect:', err);
    return null;
  }
};
