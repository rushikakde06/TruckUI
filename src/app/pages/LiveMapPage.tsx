// ============================================================
// LiveMapPage.tsx – Premium Real-Time AI Fleet Control Center
// ✅ Leaflet.js (Free OSM Tiles) with Custom Dark Aesthetics
// ============================================================
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Truck, AlertTriangle, MapPin, Thermometer, Wifi, WifiOff,
  Activity, RefreshCw, Navigation, Zap, CloudRain,
  CheckCircle2, ChevronRight, BarChart2, Wind,
  TrendingUp, Clock, X, ChevronDown, Bell, Shield,
  Navigation2, Layout, Sliders, Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { telemetryAPI, alertsAPI, vehiclesAPI, createWebSocketConnection } from "../../services/api";

// ── Leaflet Setup ─────────────────────────────────────────────────────────────
function injectLeafletCSS() {
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

let leafletLoaded = false;
let leafletLoading = false;
const leafletCallbacks: Array<() => void> = [];

function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if (leafletLoaded) { resolve(); return; }
    leafletCallbacks.push(resolve);
    if (leafletLoading) return;
    leafletLoading = true;
    injectLeafletCSS();
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      leafletLoaded = true;
      leafletLoading = false;
      leafletCallbacks.forEach(cb => cb());
      leafletCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FleetVehicle {
  vehicle_id: string;
  vehicle_number: string;
  status: string;
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
  driver_name?: string | null;
  route_name?: string | null;
}

interface LiveAlert {
  id: string;
  vehicle_id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRiskColor(score: number) {
  if (score >= 70) return "#EF4444"; // Red
  if (score >= 45) return "#F59E0B"; // Yellow/Orange
  return "#22C55E"; // Green
}

function timeSince(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const secs = Math.round(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

// ── Leaflet Map Component ─────────────────────────────────────────────────────
interface LeafletMapProps {
  fleet: FleetVehicle[];
  selectedVehicle: FleetVehicle | null;
  onSelectVehicle: (v: FleetVehicle | null) => void;
}

function LeafletMap({ fleet, selectedVehicle, onSelectVehicle }: LeafletMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const pathRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadLeaflet().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!ready || !mapDivRef.current || mapRef.current) return;
    const L = (window as any).L;

    mapRef.current = L.map(mapDivRef.current, {
      center: [20.5937, 78.9629], // India
      zoom: 5,
      zoomControl: false, // Custom controls instead
      attributionControl: false,
    });

    // ✅ Dark Grid Tile Layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Grid filter (css)
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-container { background: #0b0f19 !important; cursor: crosshair; }
      .leaflet-tile-pane { opacity: 0.85; filter: contrast(110%); }
      .custom-marker { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      @keyframes pulse-ring { 0% { opacity: 0.6; transform: scale(1); } 100% { opacity: 0; transform: scale(2.5); } }
      .pulse-ring { 
        position: absolute; inset: -10px; border-radius: 50%; 
        border: 2px solid #EF4444; animation: pulse-ring 2s infinite; 
      }
    `;
    document.head.appendChild(style);
  }, [ready]);

  // Update Markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = (window as any).L;
    const vehiclesWithGPS = fleet.filter(v => v.latitude != null && v.longitude != null);

    // Sync markers
    markersRef.current.forEach((marker, id) => {
      if (!vehiclesWithGPS.find(v => v.vehicle_id === id)) {
         marker.remove();
         markersRef.current.delete(id);
      }
    });

    vehiclesWithGPS.forEach(v => {
      const isSelected = selectedVehicle?.vehicle_id === v.vehicle_id;
      const col = getRiskColor(v.risk_score);
      const iconHtml = `
        <div class="custom-marker" style="position:relative; width:44px; height:44px;">
          ${v.risk_score >= 70 ? `<div class="pulse-ring"></div>` : ""}
          <div style="
            width:44px; height:44px; border-radius:50%; background:${isSelected ? '#3B82F6' : '#1e293b'};
            border: 2px solid ${isSelected ? 'white' : col}; display:flex; align-items:center; justify-content:center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 10px ${col}44; position:relative; z-index:2;
          ">
            <div style="font-size:20px;">🚛</div>
          </div>
          <div style="
            position:absolute; bottom:-22px; left:50%; transform:translateX(-50%);
            background:rgba(0,0,0,0.85); color:white; font-size:10px; font-weight:800;
            padding:2px 6px; border-radius:4px; border:1px solid ${col}66; white-space:nowrap;
          ">${v.vehicle_number}</div>
        </div>
      `;

      if (markersRef.current.has(v.vehicle_id)) {
        const marker = markersRef.current.get(v.vehicle_id);
        marker.setLatLng([v.latitude, v.longitude]);
        marker.setIcon(L.divIcon({ html: iconHtml, className: "", iconSize: [44, 44], iconAnchor: [22, 22] }));
      } else {
        const marker = L.marker([v.latitude, v.longitude], {
          icon: L.divIcon({ html: iconHtml, className: "", iconSize: [44, 44], iconAnchor: [22, 22] })
        }).addTo(mapRef.current);
        
        marker.on("click", () => onSelectVehicle(v));
        markersRef.current.set(v.vehicle_id, marker);
      }
    });

    // If single vehicle selected, zoom in
    if (selectedVehicle?.latitude != null) {
      mapRef.current.setView([selectedVehicle.latitude, selectedVehicle.longitude], 13, { animate: true });
    } else if (vehiclesWithGPS.length > 0) {
      const bounds = L.latLngBounds(vehiclesWithGPS.map(v => [v.latitude, v.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 10 });
    }
  }, [fleet, selectedVehicle, ready]);

  return (
    <div ref={mapDivRef} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
  );
}

// ── Components ────────────────────────────────────────────────────────────────



// ── Main Page ─────────────────────────────────────────────────────────────────

export function LiveMapPage() {
  const { token } = useAuth();
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const selectedVehicle = useMemo(() => 
    fleet.find(v => v.vehicle_id === selectedVehicleId) || null
  , [fleet, selectedVehicleId]);

  // Data Fetching
  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [fData, aData] = await Promise.all([
        telemetryAPI.getLiveFleet(token),
        alertsAPI.listAlerts(token, 0, 10),
      ]);
      setFleet(fData.vehicles || []);
      setAlerts(aData || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { 
    fetchAll();
    const timer = setInterval(fetchAll, 6000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  // WebSocket
  useEffect(() => {
    if (!token) return;
    const ws = createWebSocketConnection(token);
    if (!ws) return;
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === "telemetry_update") fetchAll();
        if (msg.event === "new_alert") setAlerts(p => [msg.data, ...p].slice(0, 10));
      } catch {}
    };
    return () => ws.close();
  }, [token, fetchAll]);

  return (
    <div style={{ 
      width: "100%", height: "100%", 
      display: "flex", flexDirection: "column", background: "#0b0f19",
      fontFamily: "'Inter', sans-serif", color: "white", overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .glass-btn { 
          background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 8px; padding: 10px 16px; color: white; cursor: pointer;
          display: flex; alignItems: center; gap: 10px; font-weight: 700; transition: all 0.2s;
        }
        .glass-btn:hover { background: rgba(30, 41, 59, 1); border-color: rgba(59, 130, 246, 0.5); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
      
      {/* ── Top Header (Minimal) ── */}
      <div style={{ 
        height: 54, borderBottom: "1px solid rgba(255,255,255,0.05)", 
        display: "flex", alignItems: "center", gap: 12, padding: "0 24px", 
        zIndex: 10, background: "rgba(11, 15, 25, 0.4)", backdropFilter: "blur(4px)" 
      }}>
        <button className="glass-btn" style={{ pointerEvents: "auto", height: 32, padding: "0 12px", fontSize: 11 }}>
          <Layout size={14} /> LIVE MAP
        </button>
        <div style={{ flex: 1 }}></div>
        {selectedVehicle && (
          <div style={{ 
            background: "rgba(11, 15, 25, 0.6)", border: "1px solid rgba(255,255,255,0.1)", 
            borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700,
            color: "white", backdropFilter: "blur(4px)"
          }}>
            🚛 {selectedVehicle.vehicle_number}
          </div>
        )}
      </div>

      {/* ── Main Layout: Sidebar + Map + Details ── */}
      <div style={{ flex: 1, display: "flex", gap: 0, position: "relative", overflow: "hidden" }}>
        
        {/* ── LEFT SIDEBAR: Truck Selector + Alerts (Constant) ── */}
        <div style={{
          width: 320, background: "rgba(11, 15, 25, 0.9)", 
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", pointerEvents: "auto", zIndex: 5,
          boxShadow: "2px 0 16px rgba(0,0,0,0.3)"
        }}>
          
          {/* Fleet Selector */}
          <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: "1px", marginBottom: 12 }}>SELECT TRUCK</div>
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", 
              borderRadius: 8, overflow: "hidden"
            }}>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {fleet.length === 0 ? (
                  <div style={{ padding: 16, fontSize: 12, color: "#6B7280", textAlign: "center" }}>No active trucks</div>
                ) : (
                  fleet.map((v) => (
                    <div 
                      key={v.vehicle_id}
                      onClick={() => setSelectedVehicleId(v.vehicle_id)}
                      style={{
                        padding: "12px 14px", cursor: "pointer", transition: "all 0.2s", borderBottom: "1px solid rgba(255,255,255,0.02)",
                        background: selectedVehicleId === v.vehicle_id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                        borderLeft: selectedVehicleId === v.vehicle_id ? "3px solid #3B82F6" : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14 }}>🚛</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{v.vehicle_number}</div>
                          <div style={{ fontSize: 9, color: "#9CA3AF" }}>{v.route_name || "Regional Route"}</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: getRiskColor(v.risk_score) }}>
                            {v.risk_score >= 70 ? "🔴 HIGH" : v.risk_score >= 45 ? "🟠 MED" : "🟢 LOW"}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 8, color: "#6B7280", display: "flex", justifyContent: "space-between" }}>
                        <span>Speed: {Math.round(v.speed || 0)} km/h</span>
                        <span>{timeSince(v.last_update)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: "1px", marginBottom: 12 }}>ACTIVE ALERTS ({alerts.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center", padding: 20 }}>No alerts</div>
              ) : (
                alerts.map((a, i) => {
                  const getAlertStyle = (type: string) => {
                    const t = type.toLowerCase();
                    if (t.includes("anomaly")) return { bg: "rgba(220, 38, 38, 0.15)", border: "#EF4444", icon: "🔴", label: "CRITICAL" };
                    if (t.includes("risk") || t.includes("delay")) return { bg: "rgba(217, 119, 6, 0.15)", border: "#F59E0B", icon: "🟠", label: "PREDICTION" };
                    if (t.includes("threshold") || t.includes("breach")) return { bg: "rgba(180, 83, 9, 0.15)", border: "#D97706", icon: "⚠️", label: "ALERT" };
                    return { bg: "rgba(37, 99, 235, 0.15)", border: "#3B82F6", icon: "ℹ️", label: "SYSTEM" };
                  };
                  const style = getAlertStyle(a.alert_type);
                  return (
                    <div key={i} style={{
                      background: style.bg, borderRadius: 8, padding: "10px 12px",
                      border: `1px solid ${style.border}80`, position: "relative",
                      animation: "slideIn 0.3s ease-out",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ fontSize: 14, marginTop: 2 }}>{style.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: style.border, textTransform: "uppercase" }}>{style.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "white", marginTop: 2 }}>{a.message}</div>
                          <div style={{ fontSize: 8, color: "#6B7280", marginTop: 2 }}>
                            {a.vehicle_id} · {timeSince(a.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── CENTER: Map (Main Area) ── */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          <LeafletMap fleet={fleet} selectedVehicle={selectedVehicle} onSelectVehicle={(v) => setSelectedVehicleId(v?.vehicle_id || null)} />

          {/* ── Bottom Left Legend ── */}
          <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 10, pointerEvents: "auto" }}>
            <div style={{ 
              background: "rgba(11, 15, 25, 0.8)", border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: 8, padding: "12px 16px", backdropFilter: "blur(8px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 2, background: "#22C55E" }}></div>
                  <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Planned Route</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 2, background: "#EF4444", borderStyle: "dashed" }}></div>
                  <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Deviated Route</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 2, background: "#F59E0B" }}></div>
                  <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Weather Zone</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Right Info ── */}
          <div style={{ position: "absolute", bottom: 20, right: 20, fontSize: 10, color: "#6B7280", zIndex: 10, pointerEvents: "none", textAlign: "right" }}>
            <div>Updated 2s ago · {fleet.length} vehicles tracked</div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR: Telemetry Panel (When truck selected) ── */}
        {selectedVehicle && (
          <div style={{
            width: 340, background: "rgba(11, 15, 25, 0.95)", 
            borderLeft: "1px solid rgba(255,255,255,0.08)", 
            overflowY: "auto", height: "100%",
            display: "flex", flexDirection: "column", padding: 20, pointerEvents: "auto",
            boxShadow: "-4px 0 16px rgba(0,0,0,0.3)", zIndex: 5
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", letterSpacing: "1px", marginBottom: 20 }}>AI TELEMETRY PANEL</div>
            
            {/* Truck Header */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                🚛
              </div>
              <div>
                <div style={{ color: "white", fontSize: 15, fontWeight: 800 }}>{selectedVehicle.vehicle_number} Scania R440</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }}></div>
                  <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 800 }}>ON ROUTE — Active</span>
                </div>
                <div style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>Driver: {selectedVehicle.driver_name || "Unassigned"}</div>
              </div>
            </div>

            {/* Cargo Temp Widget */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Thermometer size={14} color="#22C55E" />
                  <span style={{ color: "#D1D5DB", fontSize: 11, fontWeight: 700 }}>Cargo Container Temp</span>
                </div>
                <span style={{ color: "#22C55E", fontSize: 10, fontWeight: 800 }}>✓ NORMAL</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "white", fontSize: 24, fontWeight: 900 }}>{selectedVehicle.temperature?.toFixed(1)}°C</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 8, color: "#6B7280" }}>Max Threshold</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#EF4444" }}>25°C</span>
                </div>
              </div>
              {/* Simple Progress Bar as Gauge */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, position: "relative" }}>
                <div style={{ position: "absolute", left: `${(selectedVehicle.temperature! / 40) * 100}%`, top: -3, width: 2, height: 10, background: "white" }}></div>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #3B82F6, #22C55E, #F59E0B, #EF4444)", borderRadius: 2, opacity: 0.5 }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 8, color: "#4B5563" }}>
                <span>-10°</span>
                <span>40°</span>
              </div>
            </div>

            {/* Stats List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: Activity, label: "Current Speed", value: `${Math.round(selectedVehicle.speed || 0)} km/h`, sub: "Limit: 90 km/h", color: "#3B82F6" },
                { icon: MapPin, label: "Current Location", value: selectedVehicle.route_name || "En-route", sub: `${selectedVehicle.latitude?.toFixed(4)}, ${selectedVehicle.longitude?.toFixed(4)}`, color: "#8B5CF6" },
                { icon: Clock, label: "ETA / Delay", value: "2h 45m", sub: "Predicted delay: +15 min", color: "#F59E0B" },
                { icon: Zap, label: "Anomaly Score", value: `${(selectedVehicle.anomaly_score * 10).toFixed(1)} / 10`, sub: "LOW RISK", color: "#22C55E" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <s.icon size={14} color={s.color} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{s.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 8, color: "#4B5563" }}>{s.sub}</span>
                  </div>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 800 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* AI Predictions */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", letterSpacing: "1px", marginBottom: 16 }}>AI PREDICTIONS</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>Temp in 20 min</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#22C55E" }}>NORMAL</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{selectedVehicle.predicted_temperature?.toFixed(1)}°C</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 8 }}>
                  <div style={{ width: "85%", height: "100%", background: "#22C55E", borderRadius: 2 }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>Delay Probability</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B" }}>LOW</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{Math.round(selectedVehicle.delay_probability)}%</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 8 }}>
                  <div style={{ width: "28%", height: "100%", background: "#F59E0B", borderRadius: 2 }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default LiveMapPage;
