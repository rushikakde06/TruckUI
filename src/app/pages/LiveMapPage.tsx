import { useState, useEffect } from "react";
import {
  Thermometer, Gauge, Activity, CloudRain,
  AlertTriangle, Navigation, Wifi, Zap, X,
  TrendingUp, MapPin, Clock,
} from "lucide-react";

function MapVisualization() {
  const [truckPos, setTruckPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPos(p => (p + 0.3) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Interpolate truck along route
  const routePoints = [
    [100, 420], [160, 390], [220, 360], [290, 320],
    [350, 280], [410, 240], [460, 210], [520, 180],
    [580, 155], [640, 135], [700, 110],
  ];
  const idx = Math.floor((truckPos / 100) * (routePoints.length - 1));
  const progress = (truckPos / 100) * (routePoints.length - 1) - idx;
  const p0 = routePoints[Math.min(idx, routePoints.length - 1)];
  const p1 = routePoints[Math.min(idx + 1, routePoints.length - 1)];
  const tx = p0[0] + (p1[0] - p0[0]) * progress;
  const ty = p0[1] + (p1[1] - p0[1]) * progress;

  return (
    <svg
      viewBox="0 0 800 500"
      style={{ width: "100%", height: "100%", background: "transparent" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Map background tiles simulation */}
      <rect width="800" height="500" fill="#0B1426" />

      {/* Grid pattern */}
      <defs>
        <pattern id="mapgrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(37,99,235,0.07)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="800" height="500" fill="url(#mapgrid)" />

      {/* Road network (background roads) */}
      {/* Horizontal roads */}
      <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
      <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
      <line x1="0" y1="400" x2="800" y2="400" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      {/* Vertical roads */}
      <line x1="150" y1="0" x2="150" y2="500" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="300" y1="0" x2="300" y2="500" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
      <line x1="450" y1="0" x2="450" y2="500" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="600" y1="0" x2="600" y2="500" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
      {/* Diagonal connector roads */}
      <line x1="0" y1="300" x2="150" y2="200" stroke="rgba(148,163,184,0.08)" strokeWidth="2" />
      <line x1="300" y1="400" x2="450" y2="300" stroke="rgba(148,163,184,0.08)" strokeWidth="2" />
      <line x1="450" y1="200" x2="600" y2="100" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />

      {/* City blocks (buildings simulation) */}
      {[
        [30, 120, 90, 60], [170, 120, 100, 60], [340, 120, 80, 60],
        [30, 220, 100, 60], [170, 220, 90, 60], [340, 220, 90, 60], [490, 220, 80, 60],
        [30, 320, 90, 60], [340, 320, 90, 60], [490, 320, 80, 60],
        [170, 420, 100, 50], [640, 220, 80, 60], [640, 320, 80, 60],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(30,41,59,0.8)" rx="2" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      ))}

      {/* Weather Risk Zones */}
      {/* Storm zone - large orange */}
      <circle cx="590" cy="155" r="90" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
      <circle cx="590" cy="155" r="55" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
      <text x="590" y="250" textAnchor="middle" fill="rgba(245,158,11,0.8)" fontSize="9" fontFamily="Inter" fontWeight="700">⚡ STORM ZONE</text>

      {/* High risk zone - red, smaller */}
      <circle cx="655" cy="130" r="50" fill="rgba(220,38,38,0.15)" stroke="rgba(220,38,38,0.35)" strokeWidth="1.5" strokeDasharray="4 2" />
      <circle cx="655" cy="130" r="25" fill="rgba(220,38,38,0.2)" />
      <text x="655" y="190" textAnchor="middle" fill="rgba(220,38,38,0.8)" fontSize="9" fontFamily="Inter" fontWeight="700">⚠ CRITICAL</text>

      {/* Medium risk zone */}
      <ellipse cx="350" cy="280" rx="70" ry="40" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="1" strokeDasharray="5 3" />

      {/* Planned route (green line) */}
      <polyline
        points="100,420 160,390 220,360 290,320 350,280 410,240 460,210 520,180 580,155 640,135 700,110"
        fill="none"
        stroke="rgba(22,163,74,0.4)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="100,420 160,390 220,360 290,320 350,280 410,240 460,210 520,180 580,155 640,135 700,110"
        fill="none"
        stroke="#16A34A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="12 4"
      />

      {/* Deviated route (red - anomaly) */}
      <polyline
        points="350,280 380,310 420,330 455,320 460,210"
        fill="none"
        stroke="rgba(220,38,38,0.5)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <polyline
        points="350,280 380,310 420,330 455,320 460,210"
        fill="none"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 3"
      />
      <text x="415" y="345" fill="#DC2626" fontSize="9" fontFamily="Inter" fontWeight="700" textAnchor="middle">⚠ DEVIATION +3.2km</text>

      {/* Start and End markers */}
      <circle cx="100" cy="420" r="8" fill="#16A34A" stroke="white" strokeWidth="2" />
      <text x="100" y="445" textAnchor="middle" fill="#16A34A" fontSize="9" fontFamily="Inter" fontWeight="700">LOS ANGELES</text>

      <circle cx="700" cy="110" r="8" fill="#2563EB" stroke="white" strokeWidth="2" />
      <text x="700" y="95" textAnchor="middle" fill="#2563EB" fontSize="9" fontFamily="Inter" fontWeight="700">SAN FRANCISCO</text>

      {/* Moving Truck marker */}
      <g transform={`translate(${tx - 14}, ${ty - 14})`}>
        <circle cx="14" cy="14" r="18" fill="rgba(37,99,235,0.2)" />
        <circle cx="14" cy="14" r="14" fill="#2563EB" stroke="white" strokeWidth="2.5" />
        {/* Truck icon path */}
        <text x="14" y="19" textAnchor="middle" fontSize="12" fill="white">🚛</text>
      </g>

      {/* Pulsing ring around truck */}
      <circle cx={tx} cy={ty} r="22" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Waypoint markers */}
      {[[290, 320, "WP-1"], [460, 210, "WP-2"]].map(([x, y, label], i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r="5" fill="rgba(245,158,11,0.8)" stroke="white" strokeWidth="1.5" />
          <text x={(x as number) + 10} y={(y as number) + 4} fill="rgba(245,158,11,0.9)" fontSize="9" fontFamily="Inter" fontWeight="600">{label}</text>
        </g>
      ))}

      {/* Map scale & compass */}
      <g transform="translate(20, 460)">
        <line x1="0" y1="0" x2="50" y2="0" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <line x1="50" y1="-3" x2="50" y2="3" stroke="white" strokeWidth="1.5" opacity="0.4" />
        <text x="25" y="-6" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter">50 km</text>
      </g>

      {/* Compass */}
      <g transform="translate(760, 460)">
        <circle cx="0" cy="0" r="12" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <text x="0" y="-3" textAnchor="middle" fill="white" fontSize="8" fontFamily="Inter" fontWeight="700">N</text>
        <line x1="0" y1="-2" x2="0" y2="-8" stroke="#2563EB" strokeWidth="2" />
        <line x1="0" y1="2" x2="0" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function LiveMapPage() {
  const [alerts, setAlerts] = useState([
    { id: 1, text: "AI Prediction: High risk of delay due to storm conditions.", type: "warning", visible: true },
    { id: 2, text: "Temperature anomaly detected in TRK-001 cargo hold.", type: "critical", visible: true },
  ]);
  const [newAlert, setNewAlert] = useState(false);

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
          position: "absolute", top: 16, left: 16, zIndex: 10,
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
              TRK-001 · <span style={{ color: "white", fontWeight: 600 }}>LA → San Francisco</span>
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 10,
          background: "rgba(11,20,38,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          gap: 16,
        }}>
          {[
            { color: "#16A34A", dash: false, label: "Planned Route" },
            { color: "#DC2626", dash: true, label: "Deviated Route" },
            { color: "#F59E0B", dash: false, label: "Weather Zone" },
            { color: "#DC2626", dash: false, label: "Critical Risk Zone" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {item.dash ? (
                <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke={item.color} strokeWidth="2" strokeDasharray="4 2" /></svg>
              ) : (
                <div style={{ width: 18, height: 3, background: item.color, borderRadius: 2 }} />
              )}
              <span style={{ color: "#94A3B8", fontSize: 10 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Alert popups */}
        <div style={{ position: "absolute", top: 16, right: 340, zIndex: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
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

        <MapVisualization />
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
          <div style={{ color: "#4C5B7A", fontSize: 11 }}>TRK-001 · Live Data Stream</div>
        </div>

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
              <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>TRK-001 Mercedes Actros</div>
              <div style={{ color: "#16A34A", fontSize: 10, fontWeight: 600 }}>● ON ROUTE — Active</div>
              <div style={{ color: "#4C5B7A", fontSize: 10 }}>Driver: J. Martinez</div>
            </div>
          </div>

          {/* Telemetry metrics */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Live Telemetry</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: Gauge, label: "Current Speed", value: "87 km/h", sub: "Limit: 90 km/h", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
                { icon: Thermometer, label: "Current Temp", value: "26°C", sub: "Cargo hold temperature", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
                { icon: MapPin, label: "Current Location", value: "I-5 North", sub: "38.4° N, 121.8° W", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                { icon: Clock, label: "ETA", value: "3h 24m", sub: "Predicted delay: +38 min", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
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
                  label: "Anomaly Score",
                  value: "8.3 / 10",
                  confidence: 94,
                  status: "ELEVATED",
                  statusColor: "#7C3AED",
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
                <div style={{ color: "#DC2626", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>78</div>
                <div style={{ color: "#4C5B7A", fontSize: 9 }}>/100 HIGH</div>
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
      </div>
    </div>
  );
}
