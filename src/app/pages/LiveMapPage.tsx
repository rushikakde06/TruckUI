// =====================================================================
// LiveMapPage.tsx – Ola/Uber-style tracking
//   ✅ Only SELECTED truck shows on map (others hidden)
//   ✅ Full route line start → end destination
//   ✅ Live weather fetched along the route (5 sample points)
//   ✅ Smooth animated truck marker (requestAnimationFrame lerp)
//   ✅ Fullscreen map mode with back button
//   ✅ OpenWeatherMap API key integrated
// =====================================================================
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { telemetryAPI, alertsAPI, createWebSocketConnection } from "../../services/api";
import {
  Maximize2, Minimize2, ArrowLeft, Thermometer, Wind,
  Droplets, Eye, AlertTriangle, Cloud, RefreshCw,
  Navigation, Gauge, Activity, Shield, MapPin,
  ChevronDown, Radio, Loader2, CloudRain, Sun,
  Truck,
} from "lucide-react";

// ── Weather key from .env ─────────────────────────────────────────────────────
const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "721bc7a82bae72b16dcef7d4ba527f15";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FleetVehicle {
  vehicle_id: string;
  vehicle_number: string;
  status: string;
  driver_name?: string | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  temperature: number | null;
  route_deviation: number;
  weather_severity: number;
  last_update: string | null;
  risk_score: number;
  anomaly_score: number;
  delay_probability: number;
  ai_confidence: number;
  predicted_temperature: number | null;
  active_alerts: number;
  has_telemetry: boolean;
  route_name?: string | null;
  route_coordinates?: Array<{ lat: number; lng: number }>;
  ai_reasoning?: { summary: string; recommendation: string } | null;
}

interface WeatherPoint {
  lat: number;
  lng: number;
  label: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  weather_main: string;
  visibility: number;
  city: string;
  icon: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// ── Utility ──────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function getRiskColor(score: number) {
  if (score >= 70) return "#EF4444";
  if (score >= 45) return "#F59E0B";
  return "#22C55E";
}

function getWeatherRisk(main: string, wind: number, vis: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const m = main.toUpperCase();
  if (m === "THUNDERSTORM") return "CRITICAL";
  if (m === "SNOW" || m === "BLIZZARD") return "HIGH";
  if (m === "RAIN" && wind > 15) return "HIGH";
  if (m === "RAIN" || m === "DRIZZLE") return "MEDIUM";
  if ((m === "MIST" || m === "FOG") && vis < 1000) return "HIGH";
  if (wind > 20) return "MEDIUM";
  return "LOW";
}

function weatherRiskColor(r: string) {
  if (r === "CRITICAL") return "#EF4444";
  if (r === "HIGH") return "#F59E0B";
  if (r === "MEDIUM") return "#3B82F6";
  return "#22C55E";
}

function weatherIcon(main: string) {
  const m = main.toUpperCase();
  if (m === "THUNDERSTORM") return "⛈";
  if (m === "SNOW" || m === "BLIZZARD") return "🌨";
  if (m === "RAIN" || m === "DRIZZLE") return "🌧";
  if (m === "MIST" || m === "FOG") return "🌫";
  if (m === "CLOUDS") return "☁";
  return "☀";
}

// ── Fetch weather for ONE lat/lng ────────────────────────────────────────────
async function fetchWeather(lat: number, lng: number, label: string): Promise<WeatherPoint | null> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_KEY}&units=metric`
    );
    if (!res.ok) return null;
    const d = await res.json();
    const main = d.weather?.[0]?.main || "Clear";
    const wind = d.wind?.speed ?? 0;
    const vis = d.visibility ?? 10000;
    return {
      lat, lng, label,
      temp: d.main?.temp ?? 0,
      feels_like: d.main?.feels_like ?? 0,
      humidity: d.main?.humidity ?? 0,
      wind_speed: wind,
      description: d.weather?.[0]?.description ?? "clear sky",
      weather_main: main,
      visibility: vis,
      city: d.name ?? label,
      icon: d.weather?.[0]?.icon ?? "01d",
      risk: getWeatherRisk(main, wind, vis),
    };
  } catch {
    return null;
  }
}

// ── Main LeafletMap component ─────────────────────────────────────────────────
interface LeafletMapProps {
  vehicle: FleetVehicle | null;
  weatherPoints: WeatherPoint[];
  fullscreen: boolean;
  onHazardDetected?: (inHazard: boolean) => void;
}

function LeafletMap({ vehicle, weatherPoints, fullscreen, onHazardDetected }: LeafletMapProps) {
  const mapRef = useRef<any>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const deviationLayerRef = useRef<any>(null);
  const weatherLayersRef = useRef<any[]>([]);
  const animRef = useRef<number>(0);
  const targetRef = useRef<{ lat: number; lng: number } | null>(null);
  const currentRef = useRef<{ lat: number; lng: number } | null>(null);
  const [ready, setReady] = useState(false);
  const leafletRef = useRef<any>(null);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !mapElRef.current) return;
    const init = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      leafletRef.current = L;

      const map = L.map(mapElRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      setReady(true);

      // ── New: Use ResizeObserver for perfect expansion handles ───────────
      const observer = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });
      observer.observe(mapElRef.current!);
      
      return () => {
        observer.disconnect();
        if (animRef.current) cancelAnimationFrame(animRef.current);
      }
    };
    init();
  }, []);

  // Ensure map recenters when switching modes
  useEffect(() => {
    if (mapRef.current) {
       mapRef.current.invalidateSize();
       // Double check after transition finishes (0.35s)
       setTimeout(() => {
         if (mapRef.current) mapRef.current.invalidateSize();
       }, 400);

       if (targetRef.current) {
         mapRef.current.panTo([targetRef.current.lat, targetRef.current.lng], { animate: true });
       }
    }
  }, [fullscreen]);

  // Draw route + truck when selected vehicle changes
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    // Clear existing layers
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
    if (deviationLayerRef.current) { map.removeLayer(deviationLayerRef.current); deviationLayerRef.current = null; }
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
    weatherLayersRef.current.forEach(l => { try { map.removeLayer(l); } catch {} });
    weatherLayersRef.current = [];

    if (!vehicle || !vehicle.latitude || !vehicle.longitude) return;

    const isDeviated = vehicle.route_deviation > 0.5;
    const coords = vehicle.route_coordinates || [];
    if (coords.length >= 2) {
      const latLngs = coords.map((c: any) => [c.lat, c.lng]);

      // Assign the Route (Fixed Path) - Changes to Red if Deviated
      const routeLine = L.polyline(latLngs, {
        color: isDeviated ? "#EF4444" : "#3B82F6",
        weight: isDeviated ? 5 : 4,
        opacity: isDeviated ? 0.7 : 0.5,
        dashArray: isDeviated ? "12, 12" : "none",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      routeLayerRef.current = routeLine;

      // Draw Deviation if truck is away from route
      if (isDeviated) {
        // Find nearest point
        let nearest = coords[0];
        let minDist = Infinity;
        coords.forEach((p: any) => {
          const d = Math.sqrt(Math.pow(p.lat - vehicle.latitude!, 2) + Math.pow(p.lng - vehicle.longitude!, 2));
          if (d < minDist) { minDist = d; nearest = p; }
        });

        const devLine = L.polyline([[vehicle.latitude, vehicle.longitude], [nearest.lat, nearest.lng]], {
          color: "#EF4444",
          weight: 6,
          dashArray: "1, 10",
          lineCap: "round",
          opacity: 1.0,
        }).addTo(map);
        deviationLayerRef.current = devLine;

        // Pulse Circle at connection
        const circle = L.circleMarker([nearest.lat, nearest.lng], {
          radius: 6,
          color: "#EF4444",
          fillColor: "#EF4444",
          fillOpacity: 0.8,
          weight: 2
        }).addTo(map);
        
        // Add a class for pulsing if possible, or just keep as is for weight
        weatherLayersRef.current.push(circle); 
      }

      // Start marker
      const startIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#22C55E;border:2px solid white;box-shadow:0 0 8px #22C55E"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: ""
      });
      L.marker([coords[0].lat, coords[0].lng], { icon: startIcon }).addTo(map);

      // End marker
      const endIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#EF4444;border:2px solid white;box-shadow:0 0 10px #EF4444;display:flex;align-items:center;justify-content:center;font-size:10px">🏁</div>`,
        iconSize: [20, 20], iconAnchor: [10, 10], className: ""
      });
      const endPt = coords[coords.length - 1];
      L.marker([endPt.lat, endPt.lng], { icon: endIcon }).addTo(map);

      // Only fit bounds on FIRST load of this vehicle to avoid jumping
      if (!targetRef.current) {
        map.fitBounds(routeLine.getBounds(), { padding: [80, 80], animate: true });
      }
    }

    // ── Animated truck marker ──────────────────────────────────────────
    const lat = vehicle.latitude;
    const lng = vehicle.longitude;
    currentRef.current = { lat, lng };
    targetRef.current = { lat, lng };

    const truckIcon = L.divIcon({
      html: `
        <div style="position:relative">
          <div style="
            width:44px;height:44px;border-radius:50%;
            background: ${vehicle.risk_score >= 80 ? "#EF4444" : "linear-gradient(135deg,#1D4ED8,#7C3AED)"};
            border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 0 6px ${vehicle.risk_score >= 80 ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.25)"},0 4px 14px rgba(0,0,0,0.5);
            font-size:20px;
            animation: ${vehicle.risk_score >= 80 ? "pulse 1s infinite" : "none"}">🚛</div>
          <div style="
            position:absolute;top:-22px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.8);color:white;
            padding:2px 7px;border-radius:5px;font-size:10px;font-weight:800;
            white-space:nowrap;border:1px solid rgba(59,130,246,0.5)">
            ${vehicle.vehicle_number}
          </div>
          ${isDeviated ? `
          <div style="
            position:absolute;top:-38px;left:50%;transform:translateX(-50%);
            background:#EF4444;color:white;
            padding:1px 6px;border-radius:4px;font-size:9px;font-weight:900;
            white-space:nowrap;border:1px solid white;
            animation: pulse 1s infinite">
            ⚠️ OFF ROUTE
          </div>` : ""}
          <div style="
            position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
            color:#22C55E;font-size:9px;font-weight:700;
            white-space:nowrap;text-shadow:0 1px 3px #000">
            ⚡ ${vehicle.speed != null ? Math.round(vehicle.speed) : "—"} km/h
          </div>
        </div>`,
      iconSize: [44, 44], iconAnchor: [22, 22], className: "",
    });

    const marker = L.marker([lat, lng], { icon: truckIcon }).addTo(map);
    markerRef.current = marker;

    // Pan to truck position
    map.setView([lat, lng], Math.max(map.getZoom(), 9), { animate: true });

    // Animate marker using lerp
    const animate = () => {
      if (!currentRef.current || !targetRef.current || !markerRef.current) return;
      const c = currentRef.current;
      const t = targetRef.current;
      const newLat = lerp(c.lat, t.lat, 0.08);
      const newLng = lerp(c.lng, t.lng, 0.08);
      currentRef.current = { lat: newLat, lng: newLng };
      markerRef.current.setLatLng([newLat, newLng]);
      animRef.current = requestAnimationFrame(animate);
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

  }, [vehicle?.vehicle_id, ready]);

  // Update animation target when position changes
  useEffect(() => {
    if (vehicle?.latitude && vehicle?.longitude) {
      targetRef.current = { lat: vehicle.latitude, lng: vehicle.longitude };
    }
  }, [vehicle?.latitude, vehicle?.longitude]);

  // Draw weather pins along route
  useEffect(() => {
    if (!ready || !mapRef.current || weatherPoints.length === 0) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    let truckInHazard = false;
    let hazardCenter: any = null;
    
    if (vehicle && vehicle.latitude && vehicle.longitude) {
      const vPos = L.latLng(vehicle.latitude, vehicle.longitude);
      weatherPoints.forEach(wp => {
        if (wp.risk === "HIGH" || wp.risk === "CRITICAL") {
          const wpPos = L.latLng(wp.lat, wp.lng);
          const dist = vPos.distanceTo(wpPos); 
          if (dist <= 12000) { 
            truckInHazard = true;
            hazardCenter = { lat: wp.lat, lng: wp.lng };
          }
        }
      });
    }
    if (onHazardDetected) onHazardDetected(truckInHazard);

    // Remove old weather layers
    weatherLayersRef.current.forEach(l => { try { map.removeLayer(l); } catch {} });
    weatherLayersRef.current = [];

    // Draw tether if in hazard
    if (truckInHazard && hazardCenter && vehicle && vehicle.latitude && vehicle.longitude) {
       const center = hazardCenter as { lat: number; lng: number };
       const tether = L.polyline([[vehicle.latitude, vehicle.longitude], [center.lat, center.lng]], {
         color: "#EF4444",
         weight: 2,
         dashArray: "4, 4",
         opacity: 0.8
       }).addTo(map);
       weatherLayersRef.current.push(tether);
    }

    weatherPoints.forEach((wp) => {
      const color = weatherRiskColor(wp.risk);

      // Add Danger Zone Circle (Radius) if risk is HIGH or CRITICAL
      if (wp.risk === "HIGH" || wp.risk === "CRITICAL") {
        const circle = L.circle([wp.lat, wp.lng], {
          radius: 12000, 
          color: color,
          fillColor: color,
          fillOpacity: wp.risk === "CRITICAL" ? 0.25 : 0.15,
          weight: 3,
          dashArray: "10, 10"
        }).addTo(map);
        weatherLayersRef.current.push(circle);

        // Core pulse for critical zones
        if (wp.risk === "CRITICAL") {
           const innerCircle = L.circle([wp.lat, wp.lng], {
             radius: 3000,
             color: color,
             fillColor: color,
             fillOpacity: 0.4,
             weight: 0
           }).addTo(map);
           weatherLayersRef.current.push(innerCircle);
        }
      }

      const icon = L.divIcon({
        html: `
          <div style="
            background:rgba(0,0,0,0.85);border:2px solid ${color};
            border-radius:10px;padding:4px 8px;
            color:white;font-size:10px;font-weight:800;
            white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.6);
            display:flex;align-items:center;gap:5px;
            transform: scale(${wp.risk === "CRITICAL" ? "1.15" : "1"});
            animation: ${wp.risk === "CRITICAL" ? "pulse 2s infinite" : "none"}"
          >
            <span>${weatherIcon(wp.weather_main)}</span>
            <span style="color:${color}">${Math.round(wp.temp)}°C</span>
            <span style="color:#94A3B8;font-size:8px">${wp.risk === "LOW" ? "" : wp.risk}</span>
          </div>`,
        iconSize: [85, 28], iconAnchor: [42, 14], className: "",
      });

      const popupContent = `
        <div style="font-family:Inter,sans-serif;min-width:180px">
          <div style="font-weight:900;font-size:13px;margin-bottom:4px;color:${color}">
            ${weatherIcon(wp.weather_main)} ${wp.risk} RISK ZONE
          </div>
          <div style="font-weight:700;font-size:12px;color:white;background:#333;padding:2px 6px;border-radius:4px">
            ${wp.city} — ${wp.label}
          </div>
          <div style="font-size:11px;color:#555;margin-top:6px">${wp.description}</div>
          <hr style="margin:8px 0;opacity:0.2">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
            <div>🌡 Temp: ${wp.temp.toFixed(1)}°C</div>
            <div>💨 Wind: ${wp.wind_speed.toFixed(1)}m/s</div>
            <div>💧 Humid: ${wp.humidity}%</div>
            <div>👁 Vis: ${(wp.visibility / 1000).toFixed(1)}km</div>
          </div>
        </div>`;

      const m = L.marker([wp.lat, wp.lng], { icon }).bindPopup(popupContent);
      m.addTo(map);
      weatherLayersRef.current.push(m);
    });
  }, [weatherPoints, ready]);

  return (
    <div
      ref={mapElRef}
      style={{ width: "100%", height: "100%", background: "#0B1220" }}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LiveMapPage() {
  const { token } = useAuth();

  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isTruckInHazard, setIsTruckInHazard] = useState(false);
  const wsRef = useRef<any>(null);

  // ── Load fleet ──────────────────────────────────────────────────────────────
  const loadFleet = useCallback(async () => {
    if (!token) return;
    try {
      const [data, alertsData] = await Promise.all([
        telemetryAPI.getLiveFleet(token),
        alertsAPI.listAlerts(token, 0, 50)
      ]);
      
      const vehicles: FleetVehicle[] = data?.vehicles || [];
      const alertedIds = new Set((alertsData || []).map((a: any) => a.vehicle_id));

      // Show vehicles that are ACTIVE, have TELEMETRY, or have ALERTs
      const active = vehicles.filter(
        v => v.status?.toLowerCase() === "active" || v.has_telemetry || alertedIds.has(v.vehicle_id)
      );
      
      setFleet(active);
      setAlerts(alertsData || []);
      setLastRefresh(new Date());

      // Auto-select first if nothing selected
      setSelectedVehicle(prev => {
        if (!prev && active.length > 0) return active[0];
        if (prev) {
          const updated = active.find(v => v.vehicle_id === prev.vehicle_id);
          return updated || prev;
        }
        return prev;
      });
    } catch (err) {
      console.error("[LiveMap] fleet load error:", err);
    }
  }, [token]);

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 8000);
    return () => clearInterval(interval);
  }, [loadFleet]);

  // ── WebSocket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const ws = createWebSocketConnection(token);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        const eventType = msg.event || msg.type; // Support both just in case
        
        if (eventType === "telemetry_update") {
          setFleet(prev =>
            prev.map(v =>
              v.vehicle_id === msg.data.vehicle_id
                ? {
                    ...v,
                    latitude: msg.data.latitude,
                    longitude: msg.data.longitude,
                    speed: msg.data.speed,
                    temperature: msg.data.temperature,
                    last_update: msg.data.timestamp,
                    risk_score: msg.data.risk_score !== undefined ? msg.data.risk_score : v.risk_score,
                    anomaly_score: msg.data.anomaly_score !== undefined ? msg.data.anomaly_score : v.anomaly_score,
                    ai_reasoning: msg.data.ai_reasoning !== undefined ? msg.data.ai_reasoning : v.ai_reasoning
                  }
                : v
            )
          );
          setSelectedVehicle(prev => {
            if (!prev || prev.vehicle_id !== msg.data.vehicle_id) return prev;
            return { 
              ...prev, 
              latitude: msg.data.latitude, 
              longitude: msg.data.longitude, 
              speed: msg.data.speed,
              temperature: msg.data.temperature,
              last_update: msg.data.timestamp,
              risk_score: msg.data.risk_score !== undefined ? msg.data.risk_score : prev.risk_score,
              ai_reasoning: msg.data.ai_reasoning !== undefined ? msg.data.ai_reasoning : prev.ai_reasoning
            };
          });
        } else if (eventType === "new_alert") {
          // Add new alert to the list
          setAlerts(prev => [msg.data, ...prev]);
          console.log("🔔 REAL-TIME ALERT:", msg.data);
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    return () => { try { ws.close(); } catch {} };
  }, [token]);

  // ── Load alerts ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    alertsAPI.listAlerts(token, 0, 30).then(setAlerts).catch(() => {});
  }, [token]);

  // ── Fetch weather along route when vehicle changes ───────────────────────────
  useEffect(() => {
    if (!selectedVehicle) { setWeatherPoints([]); return; }
    const coords = selectedVehicle.route_coordinates || [];
    if (coords.length === 0) {
      // No route coords – fetch weather at current position only
      if (selectedVehicle.latitude && selectedVehicle.longitude) {
        setLoadingWeather(true);
        fetchWeather(selectedVehicle.latitude, selectedVehicle.longitude, "Current Position")
          .then(wp => { setWeatherPoints(wp ? [wp] : []); })
          .finally(() => setLoadingWeather(false));
      }
      return;
    }

    // Sample 5 evenly-spaced points along the route
    const total = coords.length;
    const indices = [
      0,
      Math.floor(total * 0.25),
      Math.floor(total * 0.5),
      Math.floor(total * 0.75),
      total - 1,
    ].filter((v, i, a) => a.indexOf(v) === i);

    const labels = ["Start", "25%", "Midpoint", "75%", "Destination"];
    setLoadingWeather(true);
    setWeatherPoints([]);

    Promise.all(
      indices.map((idx, i) =>
        fetchWeather(coords[idx].lat, coords[idx].lng, labels[i] || `Point ${i + 1}`)
      )
    )
      .then(results => {
        setWeatherPoints(results.filter(Boolean) as WeatherPoint[]);
      })
      .finally(() => setLoadingWeather(false));
  }, [selectedVehicle?.vehicle_id]);

  const vehicleAlerts = selectedVehicle
    ? alerts.filter(a => a.vehicle_id === selectedVehicle.vehicle_id).slice(0, 4)
    : [];

  const worstWeather = weatherPoints.reduce<WeatherPoint | null>((worst, wp) => {
    const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    if (!worst || order[wp.risk] > order[worst.risk]) return wp;
    return worst;
  }, null);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100vh", width: "100%", background: "#060D1A",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', sans-serif", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes routePop { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:none} }
        .truck-card { transition: all 0.2s; cursor: pointer; }
        .truck-card:hover { background: rgba(37,99,235,0.07) !important; }
        .weather-card { animation: fadeIn 0.35s ease; }
        .leaflet-popup-content-wrapper { border-radius: 12px !important; }
      `}</style>

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      {!fullscreen && (
        <div style={{
          height: 52, minHeight: 52, padding: "0 20px",
          background: "rgba(6,13,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(12px)", zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
              🗺 Live Fleet Tracker
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: connected ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
              borderRadius: 20, padding: "3px 10px",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: connected ? "#22C55E" : "#EF4444",
                animation: "pulse 1.5s infinite",
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: connected ? "#22C55E" : "#EF4444" }}>
                {connected ? "WS LIVE" : "POLLING"}
              </span>
            </div>
            {lastRefresh && (
              <span style={{ fontSize: 10, color: "#4B5563" }}>
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "Active", value: fleet.filter(v => v.status?.toLowerCase() === "active").length, color: "#22C55E" },
                { label: "Tracking", value: fleet.filter(v => v.has_telemetry).length, color: "#3B82F6" },
                { label: "High Risk", value: fleet.filter(v => v.risk_score >= 60).length, color: "#EF4444" },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 9, color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <button onClick={loadFleet} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "6px 10px", color: "#94A3B8", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
            }}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button 
              onClick={() => {
                if (!selectedVehicle) return;
                // INJECT A SIMULATED HIGH RISK EVENT VIA WEBSOCKET (Local check)
                const mockAlert = {
                   id: "test-alert-" + Date.now(),
                   vehicle_id: selectedVehicle.vehicle_id,
                   alert_type: "WEATHER",
                   severity: "critical",
                   message: "🚨 SIMULATED CRITICAL WEATHER ALERT: Severe thunderstorm detected in your sector. Advise driver to seek shelter.",
                   created_at: new Date().toISOString()
                };
                setAlerts(prev => [mockAlert as any, ...prev]);
                
                // Also simulate an AI reasoning update
                setSelectedVehicle(prev => prev ? ({
                  ...prev,
                  risk_score: 85,
                  ai_reasoning: {
                    summary: "Severe weather conditions combined with high current speed.",
                    recommendation: "Immediate speed reduction to 40km/h required. Heavy precipitation detected."
                  }
                }) : null);
              }}
              style={{
                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: 8, padding: "6px 10px", color: "#F87171", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700,
              }}>
              <AlertTriangle size={12} /> Simulate Alert
            </button>
          </div>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: fullscreen ? "1fr" : "260px 1fr 300px",
        transition: "grid-template-columns 0.35s ease",
        height: "calc(100vh - 84px)", // Fixed height to prevent overflow
        overflow: "hidden",
      }}>

        {/* ═══ LEFT: Vehicle Selector ═══════════════════════════════════════ */}
        {!fullscreen && (
          <div style={{
            background: "rgba(8,15,30,0.98)", borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.3px" }}>
                  ACTIVE VEHICLES
                </div>
                <div style={{ fontSize: 9, color: "#4B5563", marginTop: 1 }}>
                  {fleet.length} tracking · click to view route
                </div>
              </div>
              <div style={{
                background: "rgba(34,197,94,0.15)", borderRadius: 6,
                padding: "2px 8px", fontSize: 11, fontWeight: 800, color: "#22C55E",
                border: "1px solid rgba(34,197,94,0.25)",
              }}>{fleet.length}</div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
              {fleet.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Truck size={32} color="#1E3A5F" style={{ margin: "0 auto 10px" }} />
                  <div style={{ color: "#4B5563", fontSize: 12 }}>No active trucks</div>
                </div>
              ) : (
                fleet.map(v => {
                  const isSelected = selectedVehicle?.vehicle_id === v.vehicle_id;
                  const rColor = getRiskColor(v.risk_score);
                  return (
                    <div
                      key={v.vehicle_id}
                      className="truck-card"
                      onClick={() => setSelectedVehicle(v)}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isSelected
                          ? "rgba(37,99,235,0.12)"
                          : "transparent",
                        borderLeft: isSelected
                          ? "3px solid #3B82F6"
                          : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: isSelected
                            ? "rgba(59,130,246,0.2)"
                            : "rgba(255,255,255,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, flexShrink: 0,
                          border: isSelected ? "1px solid rgba(59,130,246,0.4)" : "none",
                        }}>🚛</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "white" }}>
                            {v.vehicle_number}
                          </div>
                          <div style={{ fontSize: 10, color: "#4B5563", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {v.driver_name || "Unknown Driver"}
                          </div>
                          {v.route_name && (
                            <div style={{ fontSize: 9, color: "#2563EB", marginTop: 1 }}>
                              📍 {v.route_name}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: rColor }}>{Math.round(v.risk_score)}</div>
                          <div style={{ fontSize: 8, color: "#4B5563", textTransform: "uppercase" }}>RISK</div>
                          {v.speed !== null && (
                            <div style={{ fontSize: 9, color: "#22C55E", fontWeight: 700 }}>
                              {Math.round(v.speed)} km/h
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Speed bar */}
                      {v.speed !== null && (
                        <div style={{ marginTop: 7 }}>
                          <div style={{
                            height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2,
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${Math.min(100, (v.speed / 120) * 100)}%`,
                              background: `linear-gradient(90deg, #22C55E, ${rColor})`,
                              borderRadius: 2, transition: "width 1s ease",
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═══ CENTER: Map ══════════════════════════════════════════════════ */}
        <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
                {isTruckInHazard && (
                  <div style={{
                    position: "absolute", top: 16, right: 16, zIndex: 1000,
                    background: "rgba(239,68,68,0.95)", color: "white", padding: "8px 16px",
                    borderRadius: 8, fontSize: 11, fontWeight: 900,
                    animation: "pulse 1.5s infinite",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 4px 15px rgba(239,68,68,0.4)",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}>
                    <AlertTriangle size={14} /> TRUCK IN HAZARD ZONE
                  </div>
                )}
                
                <LeafletMap 
                  vehicle={selectedVehicle} 
                  weatherPoints={weatherPoints} 
                  fullscreen={fullscreen}
                  onHazardDetected={setIsTruckInHazard}
                />
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(f => !f)}
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 1000,
              width: 40, height: 40,
              background: "rgba(6,13,26,0.88)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
            }}
            title={fullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {fullscreen ? <Minimize2 size={16} color="white" /> : <Maximize2 size={16} color="white" />}
          </button>

          {/* Back button (fullscreen only) */}
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              style={{
                position: "absolute", top: 14, left: 14, zIndex: 1000,
                padding: "8px 14px",
                background: "rgba(6,13,26,0.88)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, color: "white",
                fontSize: 13, fontWeight: 700,
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          )}

          {/* No vehicle selected overlay */}
          {!selectedVehicle && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 999,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,13,26,0.6)", backdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🚛</div>
                <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Select a vehicle to track</div>
                <div style={{ color: "#4B5563", fontSize: 12, marginTop: 4 }}>Route + weather will appear on map</div>
              </div>
            </div>
          )}

          {/* Selected vehicle mini HUD (fullscreen mode) */}
          {fullscreen && selectedVehicle && (
            <div style={{
              position: "absolute", bottom: 20, left: "50%",
              transform: "translateX(-50%)", zIndex: 1000,
              background: "rgba(6,13,26,0.92)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 24,
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}>
              <div>
                <div style={{ color: "white", fontSize: 14, fontWeight: 800 }}>{selectedVehicle.vehicle_number}</div>
                <div style={{ color: "#4B5563", fontSize: 10 }}>{selectedVehicle.driver_name || "—"}</div>
              </div>
              <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.08)" }} />
              {[
                { label: "Speed", value: selectedVehicle.speed != null ? `${Math.round(selectedVehicle.speed)} km/h` : "—", color: "#22C55E" },
                { label: "Temp", value: selectedVehicle.temperature != null ? `${selectedVehicle.temperature.toFixed(1)}°C` : "—", color: "#3B82F6" },
                { label: "Risk", value: Math.round(selectedVehicle.risk_score), color: getRiskColor(selectedVehicle.risk_score) },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#4B5563", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
              {worstWeather && (
                <>
                  <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.08)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: weatherRiskColor(worstWeather.risk) }}>
                      {weatherIcon(worstWeather.weather_main)} {Math.round(worstWeather.temp)}°C
                    </div>
                    <div style={{ fontSize: 9, color: "#4B5563", textTransform: "uppercase", fontWeight: 700 }}>Weather</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Telemetry + Weather Panel ════════════════════════════ */}
        {!fullscreen && (
          <div style={{
            background: "rgba(8,15,30,0.98)", borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {selectedVehicle ? (
              <div style={{ flex: 1, overflowY: "auto" }}>

                {/* Vehicle summary */}
                <div style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 13,
                      background: "linear-gradient(135deg,#1D4ED8,#7C3AED)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}>🚛</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>
                        {selectedVehicle.vehicle_number}
                      </div>
                      <div style={{ color: "#4B5563", fontSize: 11, marginTop: 1 }}>
                        {selectedVehicle.driver_name || "Unknown Driver"}
                      </div>
                      {selectedVehicle.route_name && (
                        <div style={{ color: "#2563EB", fontSize: 10, marginTop: 2, fontWeight: 600 }}>
                          📍 {selectedVehicle.route_name}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontSize: 24, fontWeight: 900, lineHeight: 1,
                        color: getRiskColor(selectedVehicle.risk_score),
                      }}>{Math.round(selectedVehicle.risk_score)}</div>
                      <div style={{ fontSize: 8, color: "#4B5563", fontWeight: 700 }}>AI RISK</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{
                    marginTop: 10, padding: "6px 10px", borderRadius: 7,
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 700 }}>ACTIVE — Live Tracking ON</span>
                  </div>
                </div>

                {/* Live metrics */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: "0.5px", marginBottom: 10 }}>
                    LIVE TELEMETRY
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { icon: Gauge, label: "Speed", value: selectedVehicle.speed != null ? `${Math.round(selectedVehicle.speed)} km/h` : "—", color: "#22C55E" },
                      { icon: Thermometer, label: "Cargo°C", value: selectedVehicle.temperature != null ? `${selectedVehicle.temperature.toFixed(1)}°C` : "—", color: "#3B82F6" },
                      { icon: Navigation, label: "Deviation", value: `${(selectedVehicle.route_deviation || 0).toFixed(1)} km`, color: "#F59E0B" },
                      { icon: Activity, label: "Anomaly", value: `${Math.round((selectedVehicle.anomaly_score || 0) * 100)}%`, color: "#EF4444" },
                      { icon: Shield, label: "AI Conf.", value: `${Math.round((selectedVehicle.ai_confidence || 0) * 100)}%`, color: "#7C3AED" },
                      { icon: MapPin, label: "Delay Prob.", value: `${Math.round(selectedVehicle.delay_probability || 0)}%`, color: "#F59E0B" },
                    ].map((item, i) => (
                      <div key={i} style={{
                        background: "rgba(255,255,255,0.03)", borderRadius: 8,
                        padding: "8px 10px",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <item.icon size={10} color={item.color} />
                          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather section */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: "0.5px" }}>
                      WEATHER ALONG ROUTE
                    </div>
                    {loadingWeather && (
                      <Loader2 size={12} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
                    )}
                  </div>

                  {weatherPoints.length === 0 && !loadingWeather && (
                    <div style={{ textAlign: "center", padding: "16px 0", color: "#4B5563", fontSize: 11 }}>
                      {selectedVehicle.route_coordinates?.length
                        ? "Fetching weather data…"
                        : "No route assigned — weather at current position"}
                    </div>
                  )}

                  {weatherPoints.map((wp, i) => (
                    <div key={i} className="weather-card" style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${weatherRiskColor(wp.risk)}30`,
                      borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                      borderLeft: `3px solid ${weatherRiskColor(wp.risk)}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <span style={{ fontSize: 14 }}>{weatherIcon(wp.weather_main)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "white", marginLeft: 5 }}>
                            {wp.city}
                          </span>
                          <span style={{ fontSize: 9, color: "#4B5563", marginLeft: 4 }}>({wp.label})</span>
                        </div>
                        <div style={{
                          fontSize: 9, fontWeight: 800, color: weatherRiskColor(wp.risk),
                          background: `${weatherRiskColor(wp.risk)}15`,
                          padding: "2px 7px", borderRadius: 4,
                        }}>{wp.risk}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
                        {[
                          { icon: Thermometer, val: `${Math.round(wp.temp)}°C` },
                          { icon: Wind, val: `${wp.wind_speed.toFixed(1)} m/s` },
                          { icon: Droplets, val: `${wp.humidity}%` },
                          { icon: Eye, val: `${(wp.visibility / 1000).toFixed(1)} km` },
                        ].map((m, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <m.icon size={9} color="#4B5563" />
                            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{m.val}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 9, color: "#4B5563", textTransform: "capitalize" }}>
                        {wp.description}
                      </div>
                    </div>
                  ))}

                  {/* Route weather summary bar */}
                  {weatherPoints.length > 0 && (
                    <div style={{
                      marginTop: 6, padding: "8px 10px", borderRadius: 8,
                      background: worstWeather?.risk === "CRITICAL" ? "rgba(239,68,68,0.1)" :
                        worstWeather?.risk === "HIGH" ? "rgba(245,158,11,0.1)" :
                          "rgba(34,197,94,0.08)",
                      border: `1px solid ${worstWeather ? weatherRiskColor(worstWeather.risk) : "#22C55E"}22`,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span style={{ fontSize: 14 }}>
                        {worstWeather ? weatherIcon(worstWeather.weather_main) : "☀"}
                      </span>
                      <div>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          color: worstWeather ? weatherRiskColor(worstWeather.risk) : "#22C55E",
                        }}>
                          Route Max Risk: {worstWeather?.risk || "LOW"}
                        </div>
                        <div style={{ fontSize: 9, color: "#4B5563" }}>
                          Worst at {worstWeather?.city || "—"} ({worstWeather?.label})
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerts */}
                {vehicleAlerts.length > 0 && (
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: "0.5px" }}>
                        ACTIVE ALERTS
                      </div>
                      <a href="/dashboard/alerts" style={{ fontSize: 9, fontWeight: 800, color: "#3B82F6", textDecoration: "none" }}>VIEW ALL</a>
                    </div>
                    {vehicleAlerts.map((a, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7,
                        padding: "8px 10px", borderRadius: 8,
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.14)",
                      }}>
                        <AlertTriangle size={11} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444" }}>
                            {a.alert_type?.replace(/_/g, " ")}
                          </div>
                          <div style={{ fontSize: 9, color: "#64748B", marginTop: 1 }}>{a.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Reasoning Section (GPT-4) */}
                {selectedVehicle.ai_reasoning && (
                  <div style={{ padding: "16px", background: "rgba(59,130,246,0.06)", borderTop: "1px solid rgba(59,130,246,0.15)", borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🧠</div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#3B82F6", letterSpacing: "1.2px" }}>AI BRAIN ANALYSIS</div>
                    </div>
                    <div style={{ fontSize: 13, color: "white", fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
                      {selectedVehicle.ai_reasoning.summary}
                    </div>
                    <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#F59E0B", marginBottom: 3 }}>DRIVER RECOMMENDATION :</div>
                      <div style={{ fontSize: 11, color: "#CBD5E1", fontStyle: "italic" }}>
                        "{selectedVehicle.ai_reasoning.recommendation}"
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Legend */}
                <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#3B82F6", letterSpacing: "1px", marginBottom: 8 }}>
                    HOW AI ANALYSIS WORKS
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.6 }}>
                    Our AI uses four specialized models to track your fleet:
                    <ul style={{ paddingLeft: 12, marginTop: 4 }}>
                      <li><b>Decision Logic (GPT-4):</b> Provides human-like reasoning for high-risk situations.</li>
                      <li><b>Anomaly Logic (Isolation Forest):</b> Detects "strange" driving patterns like sudden brakes.</li>
                      <li><b>Delay Engine (Linear Regression):</b> Predicts arrival delays by analyzing weather vs speed.</li>
                      <li><b>Risk Score:</b> Composite formula (30% Anomaly + 50% Delay + 20% Temp).</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: 24, textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚛</div>
                <div style={{ color: "#4B5563", fontSize: 13, fontWeight: 600 }}>
                  Select a truck from the left sidebar to begin tracking
                </div>
                <div style={{ color: "#1E3A5F", fontSize: 11, marginTop: 6 }}>
                  Route line + weather data will load automatically
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveMapPage;
