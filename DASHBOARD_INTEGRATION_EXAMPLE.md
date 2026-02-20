// Example: Integrating API calls in a component
// This shows how to fetch real data from the backend

import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import {
  AlertTriangle, Thermometer, Activity, TrendingUp, CloudRain, 
  Navigation, Cpu, ArrowUp, ChevronRight, Brain, Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useAuth";
import { alertsAPI, analyticsAPI } from "../../services/api";
import { weatherService } from "../../services/weather";

export function DashboardPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [fleetMetrics, setFleetMetrics] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  // Fetch alerts from backend
  const { data: alertsData, loading: alertsLoading } = useFetch(
    (token) => alertsAPI.listAlerts(token, 0, 10),
    token,
    {
      onSuccess: (data) => setAlerts(data.slice(0, 4)),
    }
  );

  // Fetch fleet summary
  const { data: metricsData } = useFetch(
    (token) => analyticsAPI.getFleetSummary(token),
    token,
    {
      onSuccess: setFleetMetrics,
    }
  );

  // Check for weather alerts
  useEffect(() => {
    const checkWeather = async () => {
      try {
        // Example route waypoints (replace with real route data)
        const route = [
          { lat: 40.7128, lon: -74.0060, label: "New York" },
          { lat: 40.7282, lon: -74.0076, label: "Route Middle" },
          { lat: 39.7392, lon: -104.9903, label: "Denver" },
        ];
        
        const weatherAlerts = await weatherService.checkExtremeWeatherOnRoute(route);
        setWeatherAlerts(weatherAlerts);
      } catch (error) {
        console.error("Failed to check weather:", error);
      }
    };

    if (token) {
      checkWeather();
    }
  }, [token]);

  // Sample data for temperature forecast (replace with real data from backend)
  const tempForecastData = [
    { time: "08:00", actual: 21, predicted: null },
    { time: "09:00", actual: 22, predicted: null },
    { time: "10:00", actual: 26, predicted: 26 },
    { time: "11:00", actual: null, predicted: 33 },
    { time: "12:00", actual: null, predicted: 40 },
  ];

  // Insights from API data
  const insights = [
    {
      icon: Thermometer,
      color: "#DC2626",
      bg: "rgba(220,38,38,0.08)",
      border: "rgba(220,38,38,0.2)",
      title: "Temperature Alerts",
      desc: `${alerts.length} active temperature alerts`,
      badge: `${alerts.length} Active`,
      badgeColor: "#DC2626",
    },
    {
      icon: CloudRain,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      title: "Weather Warnings",
      desc: `${weatherAlerts.length} routes with extreme weather ahead`,
      badge: weatherAlerts.length > 0 ? "HIGH RISK" : "Clear",
      badgeColor: weatherAlerts.length > 0 ? "#F59E0B" : "#10B981",
    },
  ];

  if (!token) {
    return <div style={{ padding: "20px", color: "white" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "0 24px 32px", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: "white", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>
          Real-time AI insights from {fleetMetrics?.total_vehicles || 0} vehicles
        </p>
      </div>

      {/* Dynamic Insights Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        {insights.map((item, i) => (
          <div
            key={i}
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              borderRadius: 12,
              padding: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div
                style={{
                  background: item.color,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <item.icon size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {item.title}
                </h3>
                <p style={{ color: "#94A3B8", fontSize: 12, marginBottom: 8 }}>
                  {item.desc}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    background: item.badgeColor,
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        {/* Temperature Forecast Chart */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Temperature Forecast
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={tempForecastData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#2563EB"
                fill="url(#colorTemp)"
                name="Actual"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#7C3AED"
                fill="none"
                strokeDasharray="5 5"
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Score Trend */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Fleet Risk Score
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tempForecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10B981"
                dot={false}
                strokeWidth={2}
                name="Current Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Alerts */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "white", fontSize: 14, fontWeight: 600 }}>
            Recent Alerts
          </h3>
          <a href="/dashboard/alerts" style={{ color: "#2563EB", fontSize: 12, textDecoration: "none" }}>
            View all →
          </a>
        </div>

        {alertsLoading ? (
          <div style={{ color: "#94A3B8", textAlign: "center", padding: "20px" }}>
            Loading alerts...
          </div>
        ) : alerts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {alerts.map((alert: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                  borderLeft: `3px solid ${alert.severity === 'HIGH' ? '#DC2626' : '#F59E0B'}`,
                }}
              >
                <div style={{ fontSize: 12, color: "#94A3B8", minWidth: 120 }}>
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "white", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                    {alert.alert_type}
                  </p>
                  <p style={{ color: "#94A3B8", fontSize: 12 }}>
                    {alert.message}
                  </p>
                </div>
                <ChevronRight size={16} color="#64748B" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94A3B8", textAlign: "center", padding: "20px" }}>
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
}
