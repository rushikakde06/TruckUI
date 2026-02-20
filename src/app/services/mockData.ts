import { Vehicle, Alert, Route } from "../types";

// Helper for random coords near a point
const randomCoords = (lat: number, lng: number, variance: number = 0.01) => ({
  lat: lat + (Math.random() - 0.5) * variance,
  lng: lng + (Math.random() - 0.5) * variance,
});

// Initial Mock Data - Maharashtra Focus
const BASE_VEHICLES: Vehicle[] = [
  {
    id: "MH-12-AB-1234",
    driver: "R. Patil",
    status: "Critical",
    riskScore: 82,
    currentLocation: { lat: 18.5204, lng: 73.8567 }, // Pune
    speed: 65,
    temperature: -18.5,
    fuelLevel: 45,
    destination: "Mumbai",
    eta: "3h 10m",
    routeId: "R-MH-001",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MH-02-XY-9876",
    driver: "S. Deshmukh",
    status: "Normal",
    riskScore: 12,
    currentLocation: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    speed: 55,
    temperature: -20.0,
    fuelLevel: 80,
    destination: "Nashik",
    eta: "4h 15m",
    routeId: "R-MH-002",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MH-04-CD-5678",
    driver: "M. Shinde",
    status: "Caution",
    riskScore: 55,
    currentLocation: { lat: 19.8762, lng: 75.3433 }, // Aurangabad
    speed: 60,
    temperature: -15.0, // Warming up!
    fuelLevel: 25,
    destination: "Pune",
    eta: "5h 30m",
    routeId: "R-MH-003",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MH-31-EF-4321",
    driver: "A. Wankhede",
    status: "Normal",
    riskScore: 29,
    currentLocation: { lat: 21.1458, lng: 79.0882 }, // Nagpur
    speed: 72,
    temperature: -21.0,
    fuelLevel: 60,
    destination: "Amravati",
    eta: "2h 45m",
    routeId: "R-MH-004",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "MH-09-GH-8765",
    driver: "K. Mane",
    status: "Idle",
    riskScore: 5,
    currentLocation: { lat: 16.7050, lng: 74.2433 }, // Kolhapur
    speed: 0,
    temperature: -20.0,
    fuelLevel: 95,
    destination: "Satara",
    eta: "N/A",
    routeId: "R-MH-005",
    lastUpdated: new Date().toISOString(),
  },
];

let currentVehicles = [...BASE_VEHICLES];

// Simulate movement and telemetry changes
export const getVehicles = (): Promise<Vehicle[]> => {
  return new Promise((resolve) => {
    // Only update sometimes or slightly to simulate real-time
    currentVehicles = currentVehicles.map(v => {
      if (v.status === "Idle") return v;
      
      const moved = randomCoords(v.currentLocation.lat, v.currentLocation.lng, 0.002);
      // Ensure speed varies
      const newSpeed = Math.max(0, Math.min(100, v.speed + (Math.random() - 0.5) * 5));
      // Ensure temp varies slightly
      const newTemp = v.temperature + (Math.random() - 0.5) * 0.2;

      return {
        ...v,
        currentLocation: moved,
        speed: Math.floor(newSpeed),
        temperature: parseFloat(newTemp.toFixed(1)),
        lastUpdated: new Date().toISOString(),
      };
    });
    resolve(currentVehicles);
  });
};

export const getVehicleById = (id: string): Promise<Vehicle | undefined> => {
  return new Promise((resolve) => {
    resolve(currentVehicles.find(v => v.id === id));
  });
};
