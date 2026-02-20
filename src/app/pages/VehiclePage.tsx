import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  Truck, MapPin, User, Gauge, Thermometer, Activity,
  AlertTriangle, CheckCircle2, Clock, Battery, Wifi,
  TrendingUp, Shield, ChevronRight, Navigation,
} from "lucide-react";
import { useState } from "react";

const vehicles = [
  { id: "TRK-001", name: "Mercedes Actros MP4", driver: "J. Martinez", plate: "B-2468-AC", status: "On Route", risk: 78, riskColor: "#DC2626" },
  { id: "TRK-003", name: "Volvo FH16", driver: "M. Johnson", plate: "C-1234-BX", status: "Delayed", risk: 61, riskColor: "#F59E0B" },
  { id: "TRK-007", name: "Scania R580", driver: "S. Chen", plate: "D-8821-PQ", status: "On Route", risk: 42, riskColor: "#16A34A" },
  { id: "TRK-011", name: "DAF XF510", driver: "A. Williams", plate: "E-5567-RT", status: "On Route", risk: 29, riskColor: "#16A34A" },
];

const telemetryHistory = [
  { time: "06:00", speed: 72, temp: 18, fuel: 95, anomaly: 1.2 },
  { time: "07:00", speed: 85, temp: 20, fuel: 91, anomaly: 1.4 },
  { time: "07:30", speed: 88, temp: 21, fuel: 88, anomaly: 1.8 },
  { time: "08:00", speed: 82, temp: 23, fuel: 85, anomaly: 2.1 },
  { time: "08:30", speed: 79, temp: 24, fuel: 82, anomaly: 3.2 },
  { time: "09:00", speed: 90, temp: 25, fuel: 78, anomaly: 4.5 },
  { time: "09:30", speed: 86, temp: 26, fuel: 74, anomaly: 6.1 },
  { time: "10:00", speed: 87, temp: 26, fuel: 71, anomaly: 8.3 },
];

const riskTimeline = [
  { time: "06:00", risk: 22, event: null },
  { time: "07:00", risk: 31, event: null },
  { time: "07:30", risk: 38, event: "Speed increase" },
  { time: "08:00", risk: 45, event: null },
  { time: "08:30", risk: 53, event: "Temp rise" },
  { time: "09:00", risk: 61, event: "Storm detected" },
  { time: "09:30", risk: 69, event: "Deviation +3.2km" },
  { time: "10:00", risk: 78, event: "⚠ High Risk" },
];

const alertHistory = [
  { time: "10:18", type: "Temperature Breach", severity: "critical", predicted: "10:12", lag: "+6 min", status: "Active" },
  { time: "09:47", type: "Route Deviation", severity: "high", predicted: "09:45", lag: "+2 min", status: "Active" },
  { time: "08:32", type: "Speed Violation", severity: "low", predicted: "08:31", lag: "+1 min", status: "Resolved" },
  { time: "06:55", type: "Anomaly Score", severity: "medium", predicted: "06:52", lag: "+3 min", status: "Resolved" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "white" }}>
        <div style={{ color: "#94A3B8", marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export function VehiclePage() {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);

  const sevColors: Record<string, { color: string; bg: string }> = {
    critical: { color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
    high: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    medium: { color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
    low: { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  };

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Vehicle Details
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            Individual vehicle telemetry, AI risk timeline & alert history
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
        {/* Vehicle selector list */}
        <div style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.04)",
          overflow: "hidden",
          height: "fit-content",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Fleet Vehicles</div>
            <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>Select vehicle to inspect</div>
          </div>
          {vehicles.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                cursor: "pointer",
                background: selectedVehicle.id === v.id ? "rgba(37,99,235,0.04)" : "transparent",
                borderLeft: selectedVehicle.id === v.id ? "3px solid #2563EB" : "3px solid transparent",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `${v.riskColor}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>🚛</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{v.id}</div>
                <div style={{ fontSize: 10, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: v.riskColor }}>{v.risk}</div>
                <div style={{ fontSize: 9, color: "#94A3B8" }}>Risk</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Vehicle details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Vehicle Info Card */}
          <div style={{
            background: "linear-gradient(135deg, #0B1426 0%, #0F172A 100%)",
            borderRadius: 12,
            padding: "20px 24px",
            border: "1px solid rgba(37,99,235,0.2)",
            boxShadow: "0 4px 20px rgba(37,99,235,0.1)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 14,
                background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                border: "1px solid rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>🚛</div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ color: "white", fontSize: 20, fontWeight: 800 }}>{selectedVehicle.id}</span>
                  <span style={{
                    background: "rgba(22,163,74,0.15)",
                    color: "#16A34A",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 5,
                    border: "1px solid rgba(22,163,74,0.25)",
                  }}>● {selectedVehicle.status.toUpperCase()}</span>
                </div>
                <div style={{ color: "#94A3B8", fontSize: 13, marginBottom: 8 }}>{selectedVehicle.name}</div>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { icon: User, label: "Driver", value: selectedVehicle.driver },
                    { icon: Shield, label: "Plate", value: selectedVehicle.plate },
                    { icon: MapPin, label: "Route", value: "LA → San Francisco" },
                    { icon: Navigation, label: "Progress", value: "42% complete" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <item.icon size={12} color="#4C5B7A" />
                      <div>
                        <div style={{ color: "#4C5B7A", fontSize: 9 }}>{item.label}</div>
                        <div style={{ color: "white", fontSize: 11, fontWeight: 600 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#4C5B7A", fontSize: 10, marginBottom: 4 }}>AI RISK SCORE</div>
                <div style={{
                  fontSize: 48, fontWeight: 900,
                  color: selectedVehicle.riskColor,
                  lineHeight: 1,
                  textShadow: `0 0 20px ${selectedVehicle.riskColor}60`,
                }}>{selectedVehicle.risk}</div>
                <div style={{ color: "#4C5B7A", fontSize: 10 }}>/100 HIGH RISK</div>
                <div style={{
                  marginTop: 8,
                  display: "flex", alignItems: "center", gap: 6,
                  background: `${selectedVehicle.riskColor}20`,
                  border: `1px solid ${selectedVehicle.riskColor}30`,
                  borderRadius: 6, padding: "4px 10px",
                }}>
                  <Activity size={11} color={selectedVehicle.riskColor} />
                  <span style={{ color: selectedVehicle.riskColor, fontSize: 10, fontWeight: 700 }}>91% Confidence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { icon: Gauge, label: "Speed", value: "87 km/h", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
              { icon: Thermometer, label: "Temp", value: "26°C", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
              { icon: Activity, label: "Anomaly", value: "8.3/10", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
              { icon: Battery, label: "Fuel", value: "71%", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
              { icon: Wifi, label: "Signal", value: "Strong", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "white",
                borderRadius: 10,
                padding: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <item.icon size={15} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Route Map Snapshot */}
          <div style={{
            background: "white",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Route Map Snapshot</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>Los Angeles → San Francisco · 619 km</div>
            </div>
            <div style={{ height: 140, background: "#0B1426", position: "relative" }}>
              <svg viewBox="0 0 700 140" style={{ width: "100%", height: "100%" }}>
                <rect width="700" height="140" fill="#0B1426" />
                <defs>
                  <pattern id="miniGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(37,99,235,0.06)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="700" height="140" fill="url(#miniGrid)" />
                {/* Roads */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
                <line x1="0" y1="80" x2="700" y2="80" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
                <line x1="0" y1="120" x2="700" y2="120" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
                <line x1="120" y1="0" x2="120" y2="140" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
                <line x1="280" y1="0" x2="280" y2="140" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
                <line x1="450" y1="0" x2="450" y2="140" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
                <line x1="580" y1="0" x2="580" y2="140" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
                {/* Planned route */}
                <polyline points="40,120 120,105 200,90 290,72 380,58 450,45 540,32 610,22 660,18" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10 3" />
                {/* Deviation */}
                <polyline points="290,72 320,85 360,90 395,80 380,58" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 2" />
                {/* Weather zone */}
                <circle cx="580" cy="32" r="35" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1" strokeDasharray="4 2" />
                {/* Truck position */}
                <circle cx="380" cy="58" r="7" fill="#2563EB" stroke="white" strokeWidth="2" />
                <circle cx="380" cy="58" r="12" fill="none" stroke="#2563EB" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="7;16;7" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Start / End */}
                <circle cx="40" cy="120" r="5" fill="#16A34A" stroke="white" strokeWidth="1.5" />
                <text x="40" y="136" textAnchor="middle" fill="#16A34A" fontSize="7" fontFamily="Inter" fontWeight="700">LA</text>
                <circle cx="660" cy="18" r="5" fill="#2563EB" stroke="white" strokeWidth="1.5" />
                <text x="660" y="11" textAnchor="middle" fill="#2563EB" fontSize="7" fontFamily="Inter" fontWeight="700">SF</text>
              </svg>
              {/* Overlay labels */}
              <div style={{ position: "absolute", top: 8, left: 12, display: "flex", gap: 8 }}>
                <div style={{ background: "rgba(11,20,38,0.8)", borderRadius: 5, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 2, background: "#16A34A", borderRadius: 1 }} />
                  <span style={{ color: "#94A3B8", fontSize: 9 }}>Planned</span>
                </div>
                <div style={{ background: "rgba(11,20,38,0.8)", borderRadius: 5, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 14, height: 2, background: "#DC2626", borderRadius: 1 }} />
                  <span style={{ color: "#94A3B8", fontSize: 9 }}>Deviation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Telemetry History */}
            <div style={{
              background: "white", borderRadius: 12, padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Telemetry History</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 14 }}>Speed & temperature over time</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={telemetryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line dataKey="speed" name="Speed (km/h)" stroke="#2563EB" strokeWidth={2} dot={false} />
                  <Line dataKey="temp" name="Temp (°C)" stroke="#DC2626" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Risk Timeline */}
            <div style={{
              background: "white", borderRadius: 12, padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>AI Risk Timeline</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 14 }}>Composite risk score progression</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={riskTimeline}>
                  <defs>
                    <linearGradient id="riskAreaVehicle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 3" strokeWidth={1} />
                  <ReferenceLine y={75} stroke="#DC2626" strokeDasharray="4 3" strokeWidth={1} />
                  <Area dataKey="risk" name="Risk Score" stroke="#DC2626" strokeWidth={2.5} fill="url(#riskAreaVehicle)" dot={{ fill: "#DC2626", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alert History */}
          <div style={{
            background: "white", borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Alert History</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>AI prediction accuracy: predicted vs actual event times</div>
              </div>
              <div style={{
                background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: 6, padding: "3px 10px",
                fontSize: 10, color: "#2563EB", fontWeight: 700,
              }}>
                Avg. Lead Time: +3.0 min
              </div>
            </div>
            <div>
              <div style={{
                display: "grid", gridTemplateColumns: "80px 1fr 90px 80px 100px 90px",
                padding: "8px 20px",
                background: "#F8FAFC",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              }}>
                {["Time", "Alert Type", "Severity", "Predicted", "Accuracy", "Status"].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {alertHistory.map((alert, i) => {
                const sev = sevColors[alert.severity];
                return (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 90px 80px 100px 90px",
                    padding: "12px 20px",
                    borderBottom: i < alertHistory.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                    alignItems: "center",
                  }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>{alert.time}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{alert.type}</div>
                    <div>
                      <span style={{
                        padding: "2px 7px", borderRadius: 4,
                        background: sev.bg, color: sev.color,
                        fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      }}>
                        {alert.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>{alert.predicted}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>
                        {alert.lag} lag
                      </span>
                    </div>
                    <div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 7px", borderRadius: 4,
                        background: alert.status === "Active" ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)",
                        color: alert.status === "Active" ? "#DC2626" : "#16A34A",
                        fontSize: 9, fontWeight: 700,
                      }}>
                        {alert.status === "Active" ? <AlertTriangle size={9} /> : <CheckCircle2 size={9} />}
                        {alert.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
