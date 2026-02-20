export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  source: string;
  destination: string;
  coordinates: Coordinates[]; // Simplified path
}

export interface Vehicle {
  id: string;
  driver: string;
  status: "Normal" | "Caution" | "Critical" | "Idle";
  riskScore: number;
  currentLocation: Coordinates;
  speed: number; // km/h
  temperature: number; // Celsius
  fuelLevel: number; // percentage
  destination: string;
  eta: string;
  routeId: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: "Weather" | "Traffic" | "Mechanical" | "Schedule" | "RouteDeviation" | "Temperature";
  severity: "Low" | "Medium" | "High" | "Critical";
  message: string;
  timestamp: string;
  location?: Coordinates;
}
