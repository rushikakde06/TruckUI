import { useState, useEffect } from 'react';
import { Truck, ChevronDown, Activity, Thermometer, Droplets, Gauge, MapPin, Clock, AlertTriangle, CloudRain, Wifi, X } from 'lucide-react';
import { Zap } from 'lucide-react';

const STATIC_TRUCKS = [
  {
    id: "TRK-001",
    name: "Volvo FH16",
    driverId: "DR-101",
    driverName: "Rajesh Kumar",
    status: "active",
    currentTemp: 12,
    minTemp: 10,
    maxTemp: 25,
    tempStatus: "normal",
    cargoType: "Perishable Vegetables",
    currentSpeed: 75,
    speedLimit: 90,
    location: "Mumbai to Aurangabad",
    coordinates: "19.0760° N, 72.8777° E",
    eta: "5h 12m",
    delayRisk: 62,
    routePoints: [
      [100, 420], [160, 390], [220, 360], [290, 320],
      [350, 280], [410, 240], [460, 210], [520, 180],
      [580, 155], [640, 135],
    ],
    startLocation: "Mumbai",
    endLocation: "Aurangabad",
    anomalyScore: 6.2,
    weatherZones: [
      { x: 580, y: 140, r: 70, type: "rain", intensity: "medium" },
    ],
    deviationPoints: [],
  },
  {
    id: "TRK-003",
    name: "Scania R440",
    driverId: "DR-103",
    driverName: "Vikram Patel",
    status: "active",
    currentTemp: 18,
    minTemp: 10,
    maxTemp: 25,
    tempStatus: "normal",
    cargoType: "Pharmaceutical (Temperature Control)",
    currentSpeed: 92,
    speedLimit: 90,
    location: "Belgaum to Gulbarga",
    coordinates: "15.8691° N, 74.5057° E",
    eta: "2h 45m",
    delayRisk: 28,
    routePoints: [
      [120, 400], [180, 370], [250, 340], [320, 310],
      [400, 280], [480, 250], [560, 220], [640, 190],
      [700, 160],
    ],
    startLocation: "Belgaum",
    endLocation: "Gulbarga",
    anomalyScore: 3.1,
    weatherZones: [
      { x: 400, y: 280, r: 50, type: "wind", intensity: "low" },
    ],
    deviationPoints: [],
  },
  {
    id: "TRK-004",
    name: "MAN TGX",
    driverId: "DR-104",
    driverName: "Suresh Desai",
    status: "active",
    currentTemp: 22,
    minTemp: 16,
    maxTemp: 26,
    tempStatus: "normal",
    cargoType: "Fresh Fruits",
    currentSpeed: 82,
    speedLimit: 90,
    location: "Kolhapur to Satara",
    coordinates: "17.6869° N, 73.7563° E",
    eta: "1h 50m",
    delayRisk: 15,
    routePoints: [
      [150, 350], [210, 320], [280, 290], [350, 260],
      [420, 240], [500, 220], [580, 200], [650, 180],
    ],
    startLocation: "Kolhapur",
    endLocation: "Satara",
    anomalyScore: 2.5,
    weatherZones: [
      { x: 300, y: 290, r: 40, type: "rain", intensity: "low" },
    ],
    deviationPoints: [],
  },
  {
    id: "TRK-005",
    name: "DAF XF95",
    driverId: "DR-105",
    driverName: "Mohan Joshi",
    status: "active",
    currentTemp: 28,
    minTemp: 20,
    maxTemp: 32,
    tempStatus: "critical",
    cargoType: "Frozen Foods",
    currentSpeed: 85,
    speedLimit: 90,
    location: "Nagpur to Amravati",
    coordinates: "21.1458° N, 79.0882° E",
    eta: "2h 15m",
    delayRisk: 45,
    routePoints: [
      [130, 360], [190, 330], [270, 300], [340, 270],
      [410, 240], [490, 210], [570, 185], [650, 160],
      [720, 140],
    ],
    startLocation: "Nagpur",
    endLocation: "Amravati",
    anomalyScore: 9.1,
    weatherZones: [
      { x: 450, y: 220, r: 75, type: "storm", intensity: "critical" },
      { x: 600, y: 170, r: 50, type: "rain", intensity: "high" },
    ],
    deviationPoints: [[340, 300], [380, 280]],
  },
];

function MapVisualization({ trucks, selectedTruckId }: { trucks: typeof STATIC_TRUCKS; selectedTruckId: string }) {
  const [truckPositions, setTruckPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPositions(prev => {
        const newPositions: Record<string, number> = {};
        trucks.forEach(truck => {
          newPositions[truck.id] = (prev[truck.id] || 0 + Math.random() * 10) % 100;
        });
        return newPositions;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [trucks]);

  // Get truck color based on status
  const getTruckColor = (truck: typeof STATIC_TRUCKS[0]) => {
    if (truck.tempStatus === "critical") return "#DC2626";
    if (truck.tempStatus === "warning") return "#F59E0B";
    return "#16A34A";
  };

  // Render all trucks on map
  const renderTruck = (truck: typeof STATIC_TRUCKS[0]) => {
    const truckPos = truckPositions[truck.id] || 0;
    const routePoints = truck.routePoints;
    const idx = Math.floor((truckPos / 100) * (routePoints.length - 1));
    const progress = (truckPos / 100) * (routePoints.length - 1) - idx;
    const p0 = routePoints[Math.min(idx, routePoints.length - 1)];
    const p1 = routePoints[Math.min(idx + 1, routePoints.length - 1)];
    const tx = p0[0] + (p1[0] - p0[0]) * progress;
    const ty = p0[1] + (p1[1] - p0[1]) * progress;

    const truckColor = getTruckColor(truck);
    const isSelected = truck.id === selectedTruckId;

    return (
      <g key={truck.id}>
        {/* Truck marker */}
        <g transform={`translate(${tx - 14}, ${ty - 14})`}>
          {/* Outer ring for selected truck */}
          {isSelected && (
            <circle cx="14" cy="14" r="24" fill="none" stroke={truckColor} strokeWidth="2.5" opacity="0.6" />
          )}

          <circle cx="14" cy="14" r="18" fill="rgba(255,255,255,0.1)" />
          <circle cx="14" cy="14" r="14" fill={truckColor} stroke="white" strokeWidth="2.5" />
          <text x="14" y="19" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">🚛</text>
        </g>

        {/* Pulsing ring (more visible for selected) */}
        {isSelected && (
          <circle cx={tx} cy={ty} r="22" fill="none" stroke={truckColor} strokeWidth="2" opacity="0.8">
            <animate attributeName="r" values="18;32;18" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Truck ID label */}
        <text
          x={tx}
          y={ty - 35}
          textAnchor="middle"
          fill={truckColor}
          fontSize="10"
          fontFamily="Inter"
          fontWeight="700"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
        >
          {truck.id}
        </text>

        {/* Route path for this truck (faint) */}
        {!isSelected && (
          <polyline
            points={truck.routePoints.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={truckColor}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
            opacity="0.2"
          />
        )}
      </g>
    );
  };

  // Get selected truck for showing its detailed route
  const selectedTruck = trucks.find(t => t.id === selectedTruckId);

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

      {/* Road network */}
      <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />
      <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
      <line x1="0" y1="400" x2="800" y2="400" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="150" y1="0" x2="150" y2="500" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="300" y1="0" x2="300" y2="500" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
      <line x1="450" y1="0" x2="450" y2="500" stroke="rgba(148,163,184,0.1)" strokeWidth="2" />
      <line x1="600" y1="0" x2="600" y2="500" stroke="rgba(148,163,184,0.15)" strokeWidth="3" />

      {/* City blocks */}
      {[
        [30, 120, 90, 60], [170, 120, 100, 60], [340, 120, 80, 60],
        [30, 220, 100, 60], [170, 220, 90, 60], [340, 220, 90, 60], [490, 220, 80, 60],
        [30, 320, 90, 60], [340, 320, 90, 60], [490, 320, 80, 60],
        [170, 420, 100, 50], [640, 220, 80, 60], [640, 320, 80, 60],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(30,41,59,0.8)" rx="2" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      ))}

      {/* Weather Risk Zones for selected truck */}
      {selectedTruck && selectedTruck.weatherZones.map((zone, zi) => {
        const colors = {
          storm: { fill: "rgba(245,158,11,0.12)", stroke: "rgba(245,158,11,0.3)", label: "⚡" },
          rain: { fill: "rgba(66,165,245,0.12)", stroke: "rgba(66,165,245,0.3)", label: "🌧️" },
          wind: { fill: "rgba(177,245,66,0.12)", stroke: "rgba(177,245,66,0.3)", label: "💨" },
        };
        const color = colors[zone.type as keyof typeof colors];
        return (
          <g key={`zone-${zi}`}>
            <circle cx={zone.x} cy={zone.y} r={zone.r} fill={color.fill} stroke={color.stroke} strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx={zone.x} cy={zone.y} r={zone.r * 0.6} fill={color.fill} stroke={color.stroke} strokeWidth="1" opacity="0.7" />
          </g>
        );
      })}

      {/* Planned route for selected truck */}
      {selectedTruck && (
        <>
          <polyline
            points={selectedTruck.routePoints.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={getTruckColor(selectedTruck)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          <polyline
            points={selectedTruck.routePoints.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke={getTruckColor(selectedTruck)}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 4"
          />

          {/* Deviated route if exists */}
          {selectedTruck.deviationPoints.length > 0 && (
            <>
              <polyline
                points={selectedTruck.deviationPoints.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="rgba(220,38,38,0.5)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <polyline
                points={selectedTruck.deviationPoints.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 3"
              />
              <text x={selectedTruck.deviationPoints[1][0]} y={selectedTruck.deviationPoints[1][1] + 20} fill="#DC2626" fontSize="9" fontFamily="Inter" fontWeight="700" textAnchor="middle">⚠ DEVIATION</text>
            </>
          )}

          {/* Start marker */}
          <circle cx={selectedTruck.routePoints[0][0]} cy={selectedTruck.routePoints[0][1]} r="8" fill={getTruckColor(selectedTruck)} stroke="white" strokeWidth="2" />
          <text x={selectedTruck.routePoints[0][0]} y={selectedTruck.routePoints[0][1] + 25} textAnchor="middle" fill={getTruckColor(selectedTruck)} fontSize="9" fontFamily="Inter" fontWeight="700">{selectedTruck.startLocation}</text>

          {/* End marker */}
          <circle cx={selectedTruck.routePoints[selectedTruck.routePoints.length - 1][0]} cy={selectedTruck.routePoints[selectedTruck.routePoints.length - 1][1]} r="8" fill="#2563EB" stroke="white" strokeWidth="2" />
          <text x={selectedTruck.routePoints[selectedTruck.routePoints.length - 1][0]} y={selectedTruck.routePoints[selectedTruck.routePoints.length - 1][1] - 15} textAnchor="middle" fill="#2563EB" fontSize="9" fontFamily="Inter" fontWeight="700">{selectedTruck.endLocation}</text>
        </>
      )}

      {/* Render selected truck only */}
      {selectedTruck && renderTruck(selectedTruck)}

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
      </g>
    </svg>
  );
}

export function LiveMapPage() {
  const [selectedTruckId, setSelectedTruckId] = useState("TRK-001");
  const selectedTruck = STATIC_TRUCKS.find(t => t.id === selectedTruckId) || STATIC_TRUCKS[0];

  const [alerts, setAlerts] = useState([
    { id: 1, text: "AI Prediction: High risk of delay due to storm conditions.", type: "warning", visible: true },
    { id: 2, text: `Temperature anomaly detected in ${selectedTruck.id} cargo hold.`, type: "critical", visible: true },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const messages = [
        `Route deviation detected on ${selectedTruck.id} — AI suggests alternate route.`,
        `Temperature threshold breached for ${selectedTruck.id}: ${selectedTruck.currentTemp}°C`,
        `Weather alert for ${selectedTruck.id}: Storm approaching on planned route.`,
      ];
      setAlerts(prev => [...prev, {
        id: prev.length + 1,
        text: messages[Math.floor(Math.random() * messages.length)],
        type: ["info", "warning", "critical"][Math.floor(Math.random() * 3)] as any,
        visible: true
      }]);
    }, 5000);
    return () => clearTimeout(t);
  }, [selectedTruck.id]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, visible: false } : a));
  };

  const alertColors: Record<string, { bg: string; border: string; color: string; icon: any }> = {
    warning: { bg: "rgba(245,158,11,0.95)", border: "#F59E0B", color: "white", icon: AlertTriangle },
    critical: { bg: "rgba(220,38,38,0.95)", border: "#DC2626", color: "white", icon: AlertTriangle },
    info: { bg: "rgba(37,99,235,0.95)", border: "#2563EB", color: "white", icon: AlertTriangle },
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      {/* Map Area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Map header with truck selector */}
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

          {/* Truck Selector Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                background: "rgba(11,20,38,0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "8px 14px",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer",
                transition: "border-color 0.3s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            >
              <Truck size={13} color="#7C3AED" />
              {selectedTruck.id}
              <ChevronDown size={13} />
            </button>

            {isDropdownOpen && (
              <div style={{
                position: "absolute", top: "100%", left: 0, marginTop: 8,
                background: "rgba(11,20,38,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(37,99,235,0.3)",
                borderRadius: 10,
                padding: "8px",
                minWidth: 160,
                zIndex: 20,
              }}>
                {STATIC_TRUCKS.map((truck) => (
                  <button
                    key={truck.id}
                    onClick={() => {
                      setSelectedTruckId(truck.id);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: truck.id === selectedTruckId ? "rgba(37,99,235,0.2)" : "transparent",
                      border: "none",
                      borderRadius: 6,
                      color: truck.id === selectedTruckId ? "#2563EB" : "#94A3B8",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(37,99,235,0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = truck.id === selectedTruckId ? "rgba(37,99,235,0.2)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: truck.tempStatus === "critical" ? "#DC2626" : truck.tempStatus === "warning" ? "#F59E0B" : "#16A34A"
                      }} />
                      {truck.id}
                    </div>
                    <div style={{ fontSize: 9, color: "#4C5B7A", marginTop: 4 }}>
                      {truck.driverName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: "rgba(11,20,38,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "8px 14px",
          }}>
            <span style={{ color: "#94A3B8", fontSize: 11 }}>
              {selectedTruck.id} · <span style={{ color: "white", fontWeight: 600 }}>{selectedTruck.startLocation} → {selectedTruck.endLocation}</span>
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
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
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

        <MapVisualization trucks={STATIC_TRUCKS} selectedTruckId={selectedTruckId} />
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
          <div style={{ color: "#4C5B7A", fontSize: 11 }}>{selectedTruck.id} · Live Data Stream</div>
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
              <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{selectedTruck.id} {selectedTruck.name}</div>
              <div style={{ color: "#16A34A", fontSize: 10, fontWeight: 600 }}>● ON ROUTE — Active</div>
              <div style={{ color: "#4C5B7A", fontSize: 10 }}>Driver: {selectedTruck.driverName}</div>
            </div>
          </div>

          {/* Container Temperature Monitoring */}
          <div style={{
            background: selectedTruck.tempStatus === "critical" ? "rgba(220,38,38,0.1)" : selectedTruck.tempStatus === "warning" ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)",
            border: selectedTruck.tempStatus === "critical" ? "1px solid rgba(220,38,38,0.3)" : selectedTruck.tempStatus === "warning" ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(22,163,74,0.3)",
            borderRadius: 10,
            padding: "14px",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Thermometer size={16} color={selectedTruck.tempStatus === "critical" ? "#DC2626" : selectedTruck.tempStatus === "warning" ? "#F59E0B" : "#16A34A"} />
              <span style={{
                color: selectedTruck.tempStatus === "critical" ? "#DC2626" : selectedTruck.tempStatus === "warning" ? "#F59E0B" : "#16A34A",
                fontSize: 12, fontWeight: 700
              }}>
                Cargo Container Temp {selectedTruck.tempStatus === "critical" ? "⚠ CRITICAL" : selectedTruck.tempStatus === "warning" ? "⚠ WARNING" : "✓ NORMAL"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 4 }}>Current</div>
                <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>{selectedTruck.currentTemp}°C</div>
              </div>
              <div>
                <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 4 }}>Min Threshold</div>
                <div style={{ color: "#16A34A", fontSize: 14, fontWeight: 700 }}>{selectedTruck.minTemp}°C</div>
              </div>
              <div>
                <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 4 }}>Max Threshold</div>
                <div style={{ color: "#DC2626", fontSize: 14, fontWeight: 700 }}>{selectedTruck.maxTemp}°C</div>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 20,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 10,
              padding: "0 8px",
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 10, color: "#4C5B7A", minWidth: 20 }}>{selectedTruck.minTemp}°</div>
              <div style={{
                flex: 1,
                height: 8,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute",
                  left: `${((selectedTruck.currentTemp - selectedTruck.minTemp) / (selectedTruck.maxTemp - selectedTruck.minTemp)) * 100}%`,
                  width: 12,
                  height: 12,
                  background: selectedTruck.currentTemp > selectedTruck.maxTemp ? "#DC2626" : selectedTruck.currentTemp < selectedTruck.minTemp ? "#2563EB" : "#16A34A",
                  borderRadius: 6,
                  border: "2px solid white",
                  transform: "translateX(-50%) translateY(-2px)",
                }} />
              </div>
              <div style={{ fontSize: 10, color: "#4C5B7A", minWidth: 20 }}>{selectedTruck.maxTemp}°</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#4C5B7A" }}>
              <Droplets size={12} />
              <span>Cargo: {selectedTruck.cargoType}</span>
            </div>
          </div>

          {/* Telemetry metrics */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>Live Telemetry</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: Gauge, label: "Current Speed", value: `${selectedTruck.currentSpeed} km/h`, sub: `Limit: ${selectedTruck.speedLimit} km/h`, color: selectedTruck.currentSpeed > selectedTruck.speedLimit ? "#F59E0B" : "#16A34A", bg: "rgba(22,163,74,0.08)" },
                { icon: MapPin, label: "Current Location", value: selectedTruck.location, sub: selectedTruck.coordinates, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                { icon: Clock, label: "ETA", value: selectedTruck.eta, sub: `Predicted delay: +${selectedTruck.delayRisk} min`, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
                { icon: Activity, label: "Anomaly Score", value: `${selectedTruck.anomalyScore} / 10`, sub: selectedTruck.anomalyScore > 7 ? "HIGH RISK" : selectedTruck.anomalyScore > 4 ? "MEDIUM RISK" : "LOW RISK", color: selectedTruck.anomalyScore > 7 ? "#DC2626" : selectedTruck.anomalyScore > 4 ? "#F59E0B" : "#16A34A", bg: "rgba(22,163,74,0.08)" },
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
                  value: `${selectedTruck.currentTemp + 2}°C`,
                  confidence: 89,
                  status: selectedTruck.currentTemp + 2 > selectedTruck.maxTemp ? "BREACH RISK" : "NORMAL",
                  statusColor: selectedTruck.currentTemp + 2 > selectedTruck.maxTemp ? "#DC2626" : "#16A34A",
                  icon: Thermometer,
                },
                {
                  label: "Delay Probability",
                  value: `${selectedTruck.delayRisk}%`,
                  confidence: 81,
                  status: selectedTruck.delayRisk > 50 ? "HIGH" : selectedTruck.delayRisk > 30 ? "MEDIUM" : "LOW",
                  statusColor: selectedTruck.delayRisk > 50 ? "#DC2626" : selectedTruck.delayRisk > 30 ? "#F59E0B" : "#16A34A",
                  icon: CloudRain,
                },
                {
                  label: "Anomaly Score",
                  value: `${selectedTruck.anomalyScore} / 10`,
                  confidence: 94,
                  status: selectedTruck.anomalyScore > 7 ? "ELEVATED" : "NORMAL",
                  statusColor: selectedTruck.anomalyScore > 7 ? "#DC2626" : "#16A34A",
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
            background: selectedTruck.anomalyScore > 7 ? "rgba(220,38,38,0.08)" : "rgba(245,158,11,0.08)",
            border: selectedTruck.anomalyScore > 7 ? "1px solid rgba(220,38,38,0.2)" : "1px solid rgba(245,158,11,0.2)",
            borderRadius: 10,
            padding: "14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <AlertTriangle size={14} color={selectedTruck.anomalyScore > 7 ? "#DC2626" : "#F59E0B"} />
              <span style={{ color: selectedTruck.anomalyScore > 7 ? "#DC2626" : "#F59E0B", fontSize: 12, fontWeight: 700 }}>AI Risk Assessment</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ color: "#4C5B7A", fontSize: 9, marginBottom: 3 }}>Overall Risk</div>
                <div style={{ color: selectedTruck.anomalyScore > 7 ? "#DC2626" : "#F59E0B", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
                  {Math.round(selectedTruck.anomalyScore * 10)}
                </div>
                <div style={{ color: "#4C5B7A", fontSize: 9 }}>/100 {selectedTruck.anomalyScore > 7 ? "HIGH" : "MEDIUM"}</div>
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
