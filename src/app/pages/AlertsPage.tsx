import { useState, useEffect } from "react";
import { Bell, Filter, Search, AlertTriangle, CheckCircle2, Clock, ChevronDown, Eye, Download, RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { alertsAPI } from "../../services/api";
import { useAlertsStream } from "../../services/telemetryStream";

const allAlerts: any[] = [];

const severityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "CRITICAL", color: "#DC2626", bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.3)" },
  high: { label: "HIGH", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  medium: { label: "MEDIUM", color: "#2563EB", bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.3)" },
  low: { label: "LOW", color: "#16A34A", bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.3)" },
};

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  Active: { color: "#DC2626", bg: "rgba(220,38,38,0.08)", icon: AlertTriangle },
  Predicted: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", icon: Clock },
  Resolved: { color: "#16A34A", bg: "rgba(22,163,74,0.08)", icon: CheckCircle2 },
};

const alertTypes = ["All Types", "Temperature Breach", "Route Deviation", "Weather Delay", "Anomaly Score", "Speed Violation", "Geofence Violation"];
const severities = ["All Severities", "Critical", "High", "Medium", "Low"];
const statuses = ["All Status", "Active", "Predicted", "Resolved"];

export function AlertsPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const { data: streamedAlerts } = useAlertsStream(token);

  // Fetch alerts from backend
  useEffect(() => {
    if (!token) {
      setError("Please login to view alerts");
      setLoading(false);
      return;
    }

    setError(null);
    const fetchAlerts = async () => {
      try {
        const data = await alertsAPI.listAlerts(token, 0, 100);
        setAlerts(data);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to fetch alerts:", error);
        setError(error?.message || "Failed to load alerts. Please try again.");
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [token]);

  // Update with streamed alerts
  useEffect(() => {
    if (streamedAlerts && streamedAlerts.length > 0) {
      setAlerts(streamedAlerts);
    }
  }, [streamedAlerts]);

  const alertTypes = ["All Types", ...new Set(alerts.map((a) => a.alert_type))];
  const severities = ["All Severities", "Critical", "High", "Medium", "Low"];
  const statuses = ["All Status", "Active", "Predicted", "Resolved"];

  const filtered = alerts.filter((a) => {
    const matchSearch =
      search === "" ||
      (a.id && a.id.toLowerCase().includes(search.toLowerCase())) ||
      (a.vehicle_id && a.vehicle_id.toLowerCase().includes(search.toLowerCase()));
    const matchSeverity =
      severityFilter === "All Severities" ||
      a.severity?.toLowerCase() === severityFilter.toLowerCase();
    const matchType = typeFilter === "All Types" || a.alert_type === typeFilter;
    const matchStatus = statusFilter === "All Status" || a.status === statusFilter;
    return matchSearch && matchSeverity && matchType && matchStatus;
  });

  const severityConfig: Record<
    string,
    { label: string; color: string; bg: string; border: string }
  > = {
    critical: {
      label: "CRITICAL",
      color: "#DC2626",
      bg: "rgba(220,38,38,0.1)",
      border: "rgba(220,38,38,0.3)",
    },
    high: {
      label: "HIGH",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
    },
    medium: {
      label: "MEDIUM",
      color: "#2563EB",
      bg: "rgba(37,99,235,0.1)",
      border: "rgba(37,99,235,0.3)",
    },
    low: {
      label: "LOW",
      color: "#16A34A",
      bg: "rgba(22,163,74,0.1)",
      border: "rgba(22,163,74,0.3)",
    },
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    Active: { color: "#DC2626", bg: "rgba(220,38,38,0.08)", icon: AlertTriangle },
    Predicted: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", icon: Clock },
    Resolved: { color: "#16A34A", bg: "rgba(22,163,74,0.08)", icon: CheckCircle2 },
  };

  const handleAcknowledge = async (alertId: string) => {
    if (!token) return;
    try {
      // Optional: Add acknowledge endpoint if available
      console.log("Acknowledging alert:", alertId);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "28px", color: "white", textAlign: "center" }}>
        Loading alerts...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "28px", color: "white", textAlign: "center" }}>
        <p style={{ color: "#ef4444", fontSize: 16, marginBottom: 16 }}>⚠️ {error}</p>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          {error.includes("login") ? "Redirecting to login..." : "Please try refreshing the page."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            Alerts Management
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            AI-generated alerts with confidence scoring and prediction accuracy
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              height: 36,
              padding: "0 14px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            style={{
              height: 36,
              padding: "0 14px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Download size={13} /> Export
          </button>
          <button
            style={{
              height: 36,
              padding: "0 16px",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Bell size={13} /> Configure Alerts
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: "Total Alerts",
            value: alerts.length,
            color: "#2563EB",
            bg: "rgba(37,99,235,0.1)",
            icon: Bell,
          },
          {
            label: "Active",
            value: alerts.filter((a) => a.status === "Active").length,
            color: "#DC2626",
            bg: "rgba(220,38,38,0.1)",
            icon: AlertTriangle,
          },
          {
            label: "Predicted",
            value: alerts.filter((a) => a.status === "Predicted").length,
            color: "#7C3AED",
            bg: "rgba(124,58,237,0.1)",
            icon: Clock,
          },
          {
            label: "Resolved Today",
            value: alerts.filter((a) => a.status === "Resolved").length,
            color: "#16A34A",
            bg: "rgba(22,163,74,0.1)",
            icon: CheckCircle2,
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 12,
              padding: "16px 20px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon size={20} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13 }}>
          <Filter size={14} />
          <span style={{ fontWeight: 600 }}>Filters:</span>
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search
            size={13}
            color="#94A3B8"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or vehicle..."
            style={{
              width: "100%",
              height: 36,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "0 12px 0 30px",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
              color: "white",
            }}
          />
        </div>

        {/* Severity filter */}
        <div style={{ position: "relative" }}>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              height: 36,
              padding: "0 30px 0 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
              color: "white",
              appearance: "none",
            }}
          >
            {severities.map((s) => (
              <option key={s} style={{ background: "#1e293b", color: "white" }}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            color="#94A3B8"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Type filter */}
        <div style={{ position: "relative" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              height: 36,
              padding: "0 30px 0 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
              color: "white",
              appearance: "none",
            }}
          >
            {alertTypes.map((t) => (
              <option key={t} style={{ background: "#1e293b", color: "white" }}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            color="#94A3B8"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: 36,
              padding: "0 30px 0 12px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
              color: "white",
              appearance: "none",
            }}
          >
            {statuses.map((s) => (
              <option key={s} style={{ background: "#1e293b", color: "white" }}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            color="#94A3B8"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ marginLeft: "auto", color: "#94A3B8", fontSize: 12 }}>
          Showing <strong style={{ color: "white" }}>{filtered.length}</strong> of{" "}
          {alerts.length} alerts
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "100px 90px 1fr 160px 100px 110px 140px 160px 90px 60px",
            gap: 0,
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "10px 20px",
          }}
        >
          {[
            "Alert ID",
            "Vehicle",
            "Alert Type",
            "AI Type",
            "Confidence",
            "Severity",
            "Predicted",
            "Timestamp",
            "Status",
            "",
          ].map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {filtered.map((alert, i) => {
          const sev = severityConfig[alert.severity?.toLowerCase() || "low"];
          const stat = statusConfig[alert.status];
          const StatIcon = stat?.icon || AlertTriangle;
          return (
            <div
              key={alert.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "100px 90px 1fr 160px 100px 110px 140px 160px 90px 60px",
                gap: 0,
                padding: "12px 20px",
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                alignItems: "center",
                transition: "background 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "rgba(255,255,255,0.03)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "transparent")
              }
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#2563EB",
                  fontFamily: "monospace",
                }}
              >
                {alert.id}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                  {alert.vehicle_id}
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>
                  {alert.driver_name || "N/A"}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "white", fontWeight: 500 }}>
                {alert.alert_type}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#7C3AED",
                  }}
                />
                <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>
                  {alert.model_type || "AI Model"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    maxWidth: 50,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        (alert.confidence || 0) * 100,
                        100
                      )}%`,
                      background:
                        (alert.confidence || 0) >= 0.9
                          ? "#16A34A"
                          : (alert.confidence || 0) >= 0.75
                            ? "#F59E0B"
                            : "#DC2626",
                      borderRadius: 2,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {Math.round((alert.confidence || 0) * 100)}%
                </span>
              </div>
              <div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: sev?.bg,
                    color: sev?.color,
                    border: `1px solid ${sev?.border}`,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  {sev?.label || alert.severity?.toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "white", fontWeight: 600 }}>
                  {alert.predicted_time || "N/A"}
                </div>
                <div style={{ fontSize: 9, color: "#94A3B8" }}>
                  {alert.status === "Resolved"
                    ? "Alert resolved"
                    : "AI prediction active"}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#64748B",
                  fontFamily: "monospace",
                }}
              >
                {new Date(alert.created_at).toLocaleString()}
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: stat?.bg,
                    color: stat?.color,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <StatIcon size={10} />
                  {alert.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                    padding: "4px",
                    borderRadius: 4,
                  }}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#94A3B8",
            }}
          >
            <Bell size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              No alerts match your filters
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
