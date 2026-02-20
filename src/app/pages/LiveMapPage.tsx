import { useState, useEffect } from "react";
import {
  Thermometer, Gauge, Activity, CloudRain,
  AlertTriangle, Navigation, Wifi, Zap, X,
  TrendingUp, MapPin, Clock,
} from "lucide-react";

import { LiveMap } from "../components/Map/LiveMap";
import { Vehicle } from "../types";

export function LiveMapPage() {
  const [alerts, setAlerts] = useState([
    { id: 1, text: "AI Prediction: High risk of delay due to storm conditions.", type: "warning", visible: true },
    { id: 2, text: "Temperature anomaly detected in TRK-001 cargo hold.", type: "critical", visible: true },
  ]);
  const [newAlert, setNewAlert] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setNewAlert(true);
      setAlerts(prev => [...prev, { id: 3, text: "Route deviation detected — AI suggests alternate via Hwy 101.", type: "info", visible: true }]);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, visible: false } : a));
  };

  const alertColors: Record<string, { bg: string; border: string; color: string; icon: any }> = {
    warning: { bg: "rgba(245,158,11,0.95)", border: "#F59E0B", color: "white", icon: AlertTriangle },
    critical: { bg: "rgba(220,38,38,0.95)", border: "#DC2626", color: "white", icon: AlertTriangle },
    info: { bg: "rgba(37,99,235,0.95)", border: "#2563EB", color: "white", icon: Navigation },
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      {/* Map Area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Map header */}
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 1000,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            background: "rgba(11,20,38,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(37,99,235,0.3)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Wifi size={13} color="#16A34A" />
            <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>LIVE MAP</span>
            <div className="live-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
          </div>

          <div style={{
            background: "rgba(11,20,38,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "8px 14px",
          }}>
            <span style={{ color: "#94A3B8", fontSize: 11 }}>
              {selectedVehicle ? selectedVehicle.id : "Active Fleet"} · <span style={{ color: "white", fontWeight: 600 }}>{selectedVehicle ? "Live Tracking w/ AI" : "Real-Time Tracking"}</span>
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 1000,
          background: "rgba(11,20,38,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          gap: 16,
        }}>
          {[
            { color: "#16A34A", dash: false, label: "Normal" },
            { color: "#F59E0B", dash: false, label: "Caution" },
            { color: "#DC2626", dash: false, label: "Critical" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 12, height: 12, background: item.color, borderRadius: "50%" }} />
              <span style={{ color: "#94A3B8", fontSize: 10 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Alert popups */}
        <div style={{ position: "absolute", top: 16, right: 340, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
          {alerts.filter(a => a.visible).map((alert) => {
            const style = alertColors[alert.type];
            const Icon = style.icon;
            return (
              <div
                key={alert.id}
                className="slide-in-right"
                style={{
                  background: style.bg,
                  backdropFilter: "blur(12px)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
                  border: `1px solid rgba(255,255,255,0.2)`,
                }}
              >
                <Icon size={14} color="white" style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontSize: 11, fontWeight: 600, lineHeight: 1.4 }}>{alert.text}</div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 0, flexShrink: 0 }}
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>

        <LiveMap onVehicleSelect={setSelectedVehicle} />
      </div>

      {/* Right Telemetry Panel */}
      <div style={{
        width: 320,
        background: "linear-gradient(180deg, #080E1E 0%, #0F172A 100%)",
        borderLeft: "1px solid rgba(37,99,235,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}>
        {/* Panel header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.08))",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Activity size={15} color="#7C3AED" />
            <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>AI Telemetry Panel</span>
          </div>
          <div style={{ color: "#4C5B7A", fontSize: 11 }}>{selectedVehicle ? `${selectedVehicle.id} · Live Data Stream` : "Select a vehicle to view data"}</div>
        </div>

        {selectedVehicle ? (
          <div className="scrollbar-thin" style={{ flex: 1, overflow: "auto", padding: "16px 16px" }}>
            {/* Vehicle status */}
            <div style={{
              background: "rgba(22,163,74,0.1)",
              border: "1px solid rgba(22,163,74,0.2)",
              borderRadius: 10,
              padding: "12px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{ fontSize: 22 }}>🚛</div>
              <div>
                <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{selectedVehicle.id}</div>
                <div style={{ color: selectedVehicle.status === "Critical" ? "#DC2626" : "#16A34A", fontSize: 10, fontWeight: 600 }}>● {selectedVehicle.status.toUpperCase()}</div>
                <div style={{ color: "#4C5B7A", fontSize: 10 }}>Driver: {selectedVehicle.driver}</div>
              </div>
            </div>

            {/* Telemetry metrics */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Live Telemetry</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: Gauge, label: "Current Speed", value: `${selectedVehicle.speed} km/h`, sub: "Limit: 90 km/h", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
                  { icon: Thermometer, label: "Current Temp", value: `${selectedVehicle.temperature}°C`, sub: "Cargo hold temperature", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
                  { icon: MapPin, label: "Location", value: `${selectedVehicle.currentLocation.lat.toFixed(4)}, ${selectedVehicle.currentLocation.lng.toFixed(4)}`, sub: "GPS Fix: 3D", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                  { icon: Clock, label: "ETA", value: selectedVehicle.eta, sub: `To ${selectedVehicle.destination}`, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: item.bg,
                    border: `1px solid ${item.color}25`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <item.icon size={16} color={item.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#64748B", fontSize: 10 }}>{item.label}</div>
                      <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{item.value}</div>
                    </div>
                    <div style={{ color: "#4C5B7A", fontSize: 9, textAlign: "right" }}>{item.sub}</div>
                  </div>
                ))}
            </div>
            </div>

            {/* AI Predictions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>AI Predictions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    label: "Temp in 20 min",
                    value: "33°C",
                    confidence: 89,
                    status: "BREACH RISK",
                    statusColor: "#DC2626",
                    icon: Thermometer,
                  },
                  {
                    label: "Delay Probability",
                    value: "73%",
                    confidence: 81,
                    status: "HIGH",
                    statusColor: "#F59E0B",
                    icon: CloudRain,
                  },
                  {
                    label: "Risk Score",
                    value: `${selectedVehicle.riskScore}/100`,
                    confidence: 94,
                    status: selectedVehicle.riskScore > 75 ? "ELEVATED" : "NORMAL",
                    statusColor: selectedVehicle.riskScore > 75 ? "#7C3AED" : "#16A34A",
                    icon: Activity,
                  },
                ].map((pred, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <pred.icon size={13} color="#64748B" />
                        <span style={{ color: "#64748B", fontSize: 10 }}>{pred.label}</span>
                      </div>
                      <span style={{
                        background: `${pred.statusColor}20`,
                        color: pred.statusColor,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}>{pred.status}</span>
                    </div>
                    <div style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{pred.value}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${pred.confidence}%`, background: pred.statusColor, borderRadius: 2 }} />
                      </div>
                      <span style={{ color: "#4C5B7A", fontSize: 9 }}>{pred.confidence}% conf.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             {/* Risk assessment */}
            <div style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: 10,
              padding: "14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <AlertTriangle size={14} color="#DC2626" />
                <span style={{ color: "#DC2626", fontSize: 12, fontWeight: 700 }}>AI Risk Assessment</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 3 }}>Overall Risk</div>
                  <div style={{ color: "#DC2626", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{selectedVehicle.riskScore}</div>
                  <div style={{ color: "#4C5B7A", fontSize: 9 }}>/100</div>
                </div>
                <div>
                  <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 3 }}>Confidence</div>
                  <div style={{ color: "white", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>91%</div>
                  <div style={{ color: "#4C5B7A", fontSize: 9 }}>Model v3.2.1</div>
                </div>
              </div>

              <button style={{
                width: "100%",
                marginTop: 12,
                height: 36,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}>
                <Zap size={13} />
                Trigger AI Alert
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "12px", flexDirection: "column", gap: "8px" }}>
            <MapPin size={24} style={{ opacity: 0.5 }} />
            Select a vehicle on the map to view live telemetry
          </div>
        )}
      </div>
    </div>
  );
}
