import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Vehicle } from "../../types";
import { getVehicles } from "../../services/mockData";

// Fix for broken marker icons in React-Leaflet/Vite
// We use a simple SVG or online URL to avoid asset path issues
const truckIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const cautionIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});




export function LiveMap({ onVehicleSelect }: { onVehicleSelect?: (vehicle: Vehicle) => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    // Initial fetch
    getVehicles().then(setVehicles);

    // Polling for real-time updates
    const interval = setInterval(() => {
      getVehicles().then((data) => {
        setVehicles(data);
        // Update selected vehicle if open
        if (selectedVehicle) {
          const updated = data.find((v) => v.id === selectedVehicle.id);
          if (updated) {
             setSelectedVehicle(updated);
             if (onVehicleSelect) onVehicleSelect(updated);
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedVehicle, onVehicleSelect]);

  const getIcon = (status: string) => {
    if (status === "Critical") return criticalIcon;
    if (status === "Caution") return cautionIcon;
    return truckIcon;
  };

  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <MapContainer center={[19.7515, 75.7139]} zoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.currentLocation.lat, vehicle.currentLocation.lng]}
            icon={getIcon(vehicle.status)}
            eventHandlers={{
              click: () => {
                setSelectedVehicle(vehicle);
                if (onVehicleSelect) onVehicleSelect(vehicle);
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>{vehicle.id}</h3>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                  <strong>Driver:</strong> {vehicle.driver}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                  <strong>Status:</strong> <span style={{ 
                    fontWeight: "bold", 
                    color: vehicle.status === "Critical" ? "#dc2626" : vehicle.status === "Caution" ? "#f59e0b" : "#16a34a" 
                  }}>{vehicle.status}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                  <strong>Speed:</strong> {vehicle.speed} km/h
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                  <strong>Temp:</strong> {vehicle.temperature}°C
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                    <strong>ETA:</strong> {vehicle.eta} To {vehicle.destination}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
