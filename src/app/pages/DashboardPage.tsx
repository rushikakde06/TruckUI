import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  Bell, AlertTriangle, Thermometer, Activity,
  TrendingUp, CloudRain, Navigation, Cpu,
  ArrowUp, ChevronRight, Brain, Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { vehiclesAPI, analyticsAPI } from "../../services/api";

const tempForecastData = [
  { time: "08:00", actual: 21, predicted: null },
  { time: "08:30", actual: 23, predicted: null },
  { time: "09:00", actual: 22, predicted: null },
  { time: "09:30", actual: 25, predicted: null },
  { time: "10:00", actual: 26, predicted: 26 },
  { time: "10:30", actual: null, predicted: 29 },
  { time: "11:00", actual: null, predicted: 33 },
  { time: "11:30", actual: null, predicted: 37 },
  { time: "12:00", actual: null, predicted: 40 },
];

const riskTrendData = [
  { time: "06:00", risk: 34, baseline: 50 },
  { time: "07:00", risk: 42, baseline: 50 },
  { time: "07:30", risk: 38, baseline: 50 },
  { time: "08:00", risk: 55, baseline: 50 },
  { time: "08:30", risk: 61, baseline: 50 },
  { time: "09:00", risk: 58, baseline: 50 },
  { time: "09:30", risk: 69, baseline: 50 },
  { time: "10:00", risk: 78, baseline: 50 },
  { time: "10:30", risk: 82, baseline: 50 },
];

const insights = [
  {
    icon: Thermometer,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.2)",
    title: "Temperature Breach Imminent",
    desc: "High probability (89%) of temperature breach in 18 minutes on TRK-001",
    badge: "89% Confidence",
    badgeColor: "#DC2626",
  },
  {
    icon: CloudRain,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    title: "Storm System Detected",
    desc: "Severe weather front detected 40km ahead on I-5 North corridor",
    badge: "74% Confidence",
    badgeColor: "#F59E0B",
  },
  {
    icon: Navigation,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    title: "Route Anomaly Detected",
    desc: "Anomalous route behavior detected — deviation of 3.2km from optimal path",
    badge: "94% Confidence",
    badgeColor: "#7C3AED",
  },
  {
    icon: Zap,
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.2)",
    title: "Recommended Action",
    desc: "Reduce speed by 10km/h and reroute via Highway 101 to avoid storm",
    badge: "AI Suggestion",
    badgeColor: "#2563EB",
  },
];

function CircularRiskScore({ score, max = 100 }: { score: number; max?: number }) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = score / max;
  const dashOffset = circumference * (1 - progress);

  const color = score >= 75 ? "#DC2626" : score >= 50 ? "#F59E0B" : "#16A34A";
  const label = score >= 75 ? "HIGH RISK" : score >= 50 ? "MEDIUM RISK" : "LOW RISK";

  return (
    <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        {/* Glow ring */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke="url(#riskGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 100 100)"
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
        {/* Score value */}
        <text x="100" y="88" textAnchor="middle" fill="white" fontSize="40" fontWeight="800" fontFamily="Inter">{score}</text>
        <text x="100" y="108" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13" fontFamily="Inter">/100</text>
        <text x="100" y="130" textAnchor="middle" fill={color} fontSize="11" fontWeight="700" fontFamily="Inter" letterSpacing="1.5">{label}</text>
      </svg>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  trend,
  trendValue,
}: {
  icon: any; label: string; value: string; sub: string;
  color: string; bg: string; trend?: "up" | "down"; trendValue?: string;
}) {
  return (
    <div style={{
      background: "white",
      borderRadius: 12,
      padding: "20px 20px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.04)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={color} />
        </div>
        {trend && trendValue && (
          <div style={{
            display: "flex", alignItems: "center", gap: 3,
            color: trend === "up" ? "#DC2626" : "#16A34A",
            fontSize: 11, fontWeight: 600,
          }}>
            <ArrowUp size={12} style={{ transform: trend === "down" ? "rotate(180deg)" : "none" }} />
            {trendValue}
          </div>
        )}
      </div>

      <div style={{ color: "#0F172A", fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4, letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ color: "#64748B", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ color: color, fontSize: 11, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        color: "white",
      }}>
        <div style={{ color: "#94A3B8", marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value !== null ? `${p.value}${p.name === "Risk Score" ? "" : "°C"}` : "—"}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const vehiclesData = await vehiclesAPI.listVehicles(token, 0, 50);
        setVehicles(vehiclesData);

        // Try to fetch analytics if available
        try {
          const analyticsData = await analyticsAPI.getFleetSummary(token);
          setAnalytics(analyticsData);
        } catch (e) {
          console.warn("Analytics data not available");
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const tempForecastData = [
    { time: "08:00", actual: 21, predicted: null },
    { time: "08:30", actual: 23, predicted: null },
    { time: "09:00", actual: 22, predicted: null },
    { time: "09:30", actual: 25, predicted: null },
    { time: "10:00", actual: 26, predicted: 26 },
    { time: "10:30", actual: null, predicted: 29 },
    { time: "11:00", actual: null, predicted: 33 },
    { time: "11:30", actual: null, predicted: 37 },
    { time: "12:00", actual: null, predicted: 40 },
  ];

  const riskTrendData = [
    { time: "06:00", risk: 34, baseline: 50 },
    { time: "07:00", risk: 42, baseline: 50 },
    { time: "07:30", risk: 38, baseline: 50 },
    { time: "08:00", risk: 55, baseline: 50 },
    { time: "08:30", risk: 61, baseline: 50 },
    { time: "09:00", risk: 58, baseline: 50 },
    { time: "09:30", risk: 69, baseline: 50 },
    { time: "10:00", risk: 78, baseline: 50 },
    { time: "10:30", risk: 82, baseline: 50 },
  ];

  const avgRisk = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.risk_score || 0), 0) / vehicles.length)
    : 0;

  const activeAlerts = analytics?.active_alerts || 0;
  const onTimeRate = analytics?.on_time_delivery_rate || 0;

  const insights = [
    {
      icon: Thermometer,
      color: "#DC2626",
      bg: "rgba(220,38,38,0.08)",
      border: "rgba(220,38,38,0.2)",
      title: "Temperature Monitoring",
      desc: `Fleet average temp: ${analytics?.avg_temperature || "N/A"}°C - performing normally`,
      badge: `${vehicles.length} Vehicles`,
      badgeColor: "#DC2626",
    },
    {
      icon: CloudRain,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      title: "Weather Impact",
      desc: "Monitoring weather patterns across all active routes",
      badge: "Live Data",
      badgeColor: "#F59E0B",
    },
    {
      icon: Navigation,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.08)",
      border: "rgba(124,58,237,0.2)",
      title: "Route Optimization",
      desc: "AI analyzing real-time traffic and weather for optimal routes",
      badge: "AI Active",
      badgeColor: "#7C3AED",
    },
    {
      icon: Zap,
      color: "#2563EB",
      bg: "rgba(37,99,235,0.08)",
      border: "rgba(37,99,235,0.2)",
      title: "System Status",
      desc: "All systems operational - real-time monitoring active",
      badge: "Normal",
      badgeColor: "#2563EB",
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "28px", color: "white", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            AI Control Center
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            Predictive Operational Intelligence — {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            height: 36,
            padding: "0 16px",
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: 8,
            color: "#60A5FA",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Brain size={14} />
            Run AI Analysis
          </button>
          <button style={{
            height: 36,
            padding: "0 16px",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            border: "none",
            borderRadius: 8,
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Bell size={14} />
            {activeAlerts} Active Alerts
          </button>
        </div>
      </div>

      {/* ── ROW 1: AI Risk Score + 4 Metrics ─────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, marginBottom: 20 }}>
        {/* AI Risk Score Card */}
        <div className="ai-glow" style={{
          background: "linear-gradient(135deg, #080E1E 0%, #111827 40%, #150B2E 100%)",
          borderRadius: 16,
          padding: "28px 24px 24px",
          border: "1px solid rgba(37,99,235,0.25)",
          gridRow: "1 / 3",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Cpu size={14} color="#7C3AED" />
            <span style={{ color: "#7C3AED", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>AI Risk Engine</span>
          </div>
          <div style={{ color: "#94A3B8", fontSize: 12, marginBottom: 20 }}>Predicted Operational Risk</div>

          <CircularRiskScore score={avgRisk} />

          <div style={{
            marginTop: 20, padding: "12px 20px",
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.25)",
            borderRadius: 10,
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
          }}>
            <div style={{ color: "#DC2626", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
              ⚠ REAL-TIME MONITORING
            </div>
            <div style={{ color: "#94A3B8", fontSize: 11 }}>Fleet-wide risk assessment</div>
          </div>

          <div style={{ marginTop: 16, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Model", value: "v3.2.1", color: "#64748B" },
              { label: "Accuracy", value: "94.2%", color: "#16A34A" },
              { label: "Updated", value: "Live", color: "#64748B" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ color: item.color, fontSize: 12, fontWeight: 700 }}>{item.value}</div>
                <div style={{ color: "#3D4F72", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <MetricCard
            icon={Bell}
            label="Active AI Alerts"
            value={activeAlerts.toString()}
            sub="Real-time monitoring"
            color="#DC2626"
            bg="rgba(220,38,38,0.08)"
            trend="up"
            trendValue={"+25%"}
          />
          <MetricCard
            icon={TrendingUp}
            label="On-Time Delivery"
            value={`${(onTimeRate * 100).toFixed(0)}%`}
            sub="Fleet performance"
            color="#F59E0B"
            bg="rgba(245,158,11,0.08)"
            trend="up"
            trendValue={"+5%"}
          />
          <MetricCard
            icon={Thermometer}
            label="Avg Fleet Temp"
            value={`${analytics?.avg_temperature || "N/A"}°C`}
            sub="Within normal range"
            color="#7C3AED"
            bg="rgba(124,58,237,0.08)"
            trend="down"
            trendValue={"-2.1°C"}
          />
          <MetricCard
            icon={Activity}
            label="Avg Risk Score"
            value={`${avgRisk}/100`}
            sub="Fleet-wide assessment"
            color="#2563EB"
            bg="rgba(37,99,235,0.08)"
            trend="up"
            trendValue={"+3.2"}
          />
        </div>

        {/* Secondary stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Vehicles On Route", value: vehicles.length.toString(), change: "Active", icon: "🚛", color: "#16A34A" },
            { label: "Avg Fleet Temp", value: `${analytics?.avg_temperature || "N/A"}°C`, change: "Normal", icon: "🌡️", color: "#16A34A" },
            { label: "Active Alerts", value: activeAlerts.toString(), change: "Critical", icon: "📍", color: "#F59E0B" },
            { label: "Fleet Status", value: "Online", change: "All systems", icon: "🧠", color: "#2563EB" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 10,
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{ fontSize: 22 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 600, marginTop: 1 }}>{item.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 2: Charts + AI Insights ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 20, marginBottom: 20 }}>
        {/* Temperature Forecast Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Temperature Forecast</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Actual + AI predicted projection</div>
            </div>
            <div style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 10,
              color: "#A78BFA",
              fontWeight: 700,
            }}>
              LSTM Model
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempForecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="°C" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={35} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Breach Limit", fill: "#DC2626", fontSize: 10 }} />
              <Line dataKey="actual" name="Actual" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 3 }} connectNulls={false} />
              <Line dataKey="predicted" name="Predicted" stroke="#7C3AED" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: "#7C3AED", r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 2, background: "#2563EB", borderRadius: 1 }} />
              <span style={{ fontSize: 11, color: "#64748B" }}>Actual</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#7C3AED" strokeWidth="2" strokeDasharray="5 3" /></svg>
              <span style={{ fontSize: 11, color: "#64748B" }}>AI Predicted</span>
            </div>
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>AI Risk Trend</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Composite risk score over time</div>
            </div>
            <div style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 10,
              color: "#FCA5A5",
              fontWeight: 700,
            }}>
              ↑ RISING
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="riskGradArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5} />
              <ReferenceLine y={75} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={1.5} />
              <Area dataKey="risk" name="Risk Score" stroke="#DC2626" strokeWidth={2.5} fill="url(#riskGradArea)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[
              { color: "#16A34A", label: "Low (<50)" },
              { color: "#F59E0B", label: "Medium (50-75)" },
              { color: "#DC2626", label: "High (>75)" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: 10, color: "#94A3B8" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div style={{
          background: "linear-gradient(180deg, #080E1E 0%, #0F172A 100%)",
          borderRadius: 12,
          padding: "20px",
          border: "1px solid rgba(37,99,235,0.2)",
          boxShadow: "0 4px 24px rgba(37,99,235,0.1)",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 28, height: 28,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain size={14} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>AI Insights</div>
              <div style={{ color: "#4C5B7A", fontSize: 10 }}>Live predictions</div>
            </div>
            <div className="live-pulse" style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.map((insight, i) => (
              <div
                key={i}
                className="fade-in-up"
                style={{
                  background: insight.bg,
                  border: `1px solid ${insight.border}`,
                  borderRadius: 10,
                  padding: "12px",
                  animationDelay: `${i * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <insight.icon size={13} color={insight.color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{insight.title}</div>
                    <div style={{ color: "#64748B", fontSize: 10, lineHeight: 1.5 }}>{insight.desc}</div>
                    <div style={{
                      marginTop: 6,
                      display: "inline-flex",
                      background: `${insight.badgeColor}22`,
                      color: insight.badgeColor,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 4,
                      letterSpacing: "0.5px",
                    }}>
                      {insight.badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button style={{
            width: "100%",
            marginTop: 12,
            height: 36,
            background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(37,99,235,0.25)",
            borderRadius: 8,
            color: "#60A5FA",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}>
            View All AI Insights
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── ROW 3: Recent Activity ──────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Fleet Status */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16 }}>Fleet Status Overview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vehicles.slice(0, 4).map((v, i) => {
              const riskColor = 
                (v.risk_score || 0) > 70 ? "#DC2626" :
                (v.risk_score || 0) > 40 ? "#F59E0B" : "#16A34A";
              const riskStatus =
                (v.risk_score || 0) > 70 ? "High Risk" :
                (v.risk_score || 0) > 40 ? "Elevated" : "Normal";
              const statusBg =
                (v.risk_score || 0) > 70 ? "rgba(220,38,38,0.1)" :
                (v.risk_score || 0) > 40 ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)";
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div style={{
                    width: 32, height: 32,
                    background: `${riskColor}20`,
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>🚛</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{v.vehicle_number}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>{v.driver_name || "N/A"} · Free</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: riskColor }}>{v.risk_score || 0}</div>
                    <div style={{ fontSize: 9, color: "#94A3B8" }}>Risk Score</div>
                  </div>
                  <div style={{
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: statusBg,
                    color: riskColor,
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {riskStatus}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Performance summary */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>AI Model Performance</div>
            <div style={{
              background: "rgba(22,163,74,0.1)",
              color: "#16A34A",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 5,
              border: "1px solid rgba(22,163,74,0.2)",
            }}>
              PRODUCTION
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Accuracy", value: "94.2%", color: "#16A34A", bar: 94 },
              { label: "Precision", value: "91.8%", color: "#2563EB", bar: 92 },
              { label: "Recall", value: "96.1%", color: "#7C3AED", bar: 96 },
              { label: "F1 Score", value: "93.9%", color: "#F59E0B", bar: 94 },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                  <div style={{
                    height: "100%",
                    width: `${m.bar}%`,
                    background: m.color,
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: "12px",
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>
              <span style={{ color: "#60A5FA", fontWeight: 600 }}>System combines</span> anomaly detection, LSTM forecasting, and gradient boosting classification to generate proactive risk intelligence across the entire fleet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}