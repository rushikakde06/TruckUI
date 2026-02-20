// API Client for connecting to the backend
// Backend runs on http://localhost:8001 (configure in .env)

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8001';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
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
      headers: { 'Authorization': `Bearer ${token}` },
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
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicles');
    return response.json();
  },

  async getVehicle(token: string, vehicleId: string) {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicle');
    return response.json();
  },

  async createVehicle(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/vehicles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
        'Authorization': `Bearer ${token}`,
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
  async getTelemetryHistory(token: string, vehicleId: string, limit = 100) {
    const response = await fetch(
      `${API_BASE_URL}/telemetry/${vehicleId}/history?limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch telemetry');
    return response.json();
  },

  async getLatestTelemetry(token: string, vehicleId: string) {
    const response = await fetch(`${API_BASE_URL}/telemetry/${vehicleId}/latest`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch latest telemetry');
    return response.json();
  },

  async logTelemetry(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/telemetry/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to log telemetry');
    return response.json();
  },
};

// ============================================
// Alerts API
// ============================================
export const alertsAPI = {
  async listAlerts(token: string, skip = 0, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/alerts/?skip=${skip}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch alerts');
    return response.json();
  },

  async getAlertsByVehicle(token: string, vehicleId: string, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/alerts/vehicle/${vehicleId}?limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch vehicle alerts');
    return response.json();
  },

  async acknowledgeAlert(token: string, alertId: string) {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to acknowledge alert');
    return response.json();
  },
};

// ============================================
// Analytics API
// ============================================
export const analyticsAPI = {
  async getFleetSummary(token: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/fleet-summary`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch fleet summary');
    return response.json();
  },

  async getRiskMetrics(token: string) {
    const response = await fetch(`${API_BASE_URL}/analytics/risk-metrics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch risk metrics');
    return response.json();
  },

  async getTemperatureTrends(token: string, vehicleId: string) {
    const response = await fetch(
      `${API_BASE_URL}/analytics/temperature-trends?vehicle_id=${vehicleId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch trends');
    return response.json();
  },
};

// ============================================
// Routes API (Trip Planning)
// ============================================
export const routesAPI = {
  async listRoutes(token: string, skip = 0, limit = 50) {
    const response = await fetch(
      `${API_BASE_URL}/routes/?skip=${skip}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch routes');
    return response.json();
  },

  async createRoute(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/routes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to create route');
    return response.json();
  },

  async getRoute(token: string, routeId: string) {
    const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new APIError(response.status, 'Failed to fetch route');
    return response.json();
  },
};

// ============================================
// WebSocket for Real-Time Updates
// ============================================
export const createWebSocketConnection = (vehicleId: string, token: string) => {
  const ws = new WebSocket(
    `${API_BASE_URL.replace('http', 'ws')}/ws/${vehicleId}?token=${token}`
  );

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};
