import { useState, useEffect } from "react";
import { Bell, Filter, Search, AlertTriangle, CheckCircle2, Clock, ChevronDown, Eye, Download, RefreshCw, Cpu } from "lucide-react";
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

  const { alerts: streamedAlerts } = useAlertsStream(token);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock for last refresh time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      setAlerts(prev => {
        const newAlerts = [...streamedAlerts];
        const combined = [...newAlerts, ...prev];
        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(a => [a.id, a])).values());
        // Sort by created_at descending
        return unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      });
    }
  }, [streamedAlerts]);

  const filtered = alerts.filter((a) => {
    const matchSearch =
      search === "" ||
      (a.id && a.id.toLowerCase().includes(search.toLowerCase())) ||
      (a.vehicle_id && a.vehicle_id.toLowerCase().includes(search.toLowerCase())) ||
      (a.vehicle_number && a.vehicle_number.toLowerCase().includes(search.toLowerCase()));
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
    OPEN: { color: "#DC2626", bg: "rgba(220,38,38,0.08)", icon: AlertTriangle },
    Predicted: { color: "#7C3AED", bg: "rgba(124,58,237,0.08)", icon: Clock },
    RESOLVED: { color: "#16A34A", bg: "rgba(22,163,74,0.08)", icon: CheckCircle2 },
    Resolved: { color: "#16A34A", bg: "rgba(22,163,74,0.08)", icon: CheckCircle2 },
  };

  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  const handleAcknowledge = async (alert: any) => {
    setSelectedAlert(alert);
  };

  const handleCloseModal = () => setSelectedAlert(null);

  const handleResolve = async (alertId: string) => {
    if (!token) return;
    try {
      await alertsAPI.resolveAlert(token, alertId);
      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: "RESOLVED", resolved_at: new Date().toISOString() } : a));
      setSelectedAlert(null);
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "28px", color: "white", textAlign: "center", marginTop: 100 }}>
        <RefreshCw size={24} className="animate-spin" style={{ marginBottom: 16, opacity: 0.5 }} />
        <div>Loading intel stream...</div>
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
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", position: "relative", minHeight: "100vh", background: "#0F172A", color: "#F8FAFC" }}>
      {/* Detail Modal */}
      {selectedAlert && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(6,11,25,0.85)", backdropFilter: "blur(8px)",
          padding: 20
        }} onClick={handleCloseModal}>
          <div style={{
            width: "100%", maxWidth: 550,
            background: "linear-gradient(135deg, #0F172A 0%, #020617 100%)",
            borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px", background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ 
                    padding: "4px 8px", borderRadius: 6, 
                    background: severityConfig[selectedAlert.severity?.toLowerCase()]?.bg || "rgba(255,255,255,0.1)",
                    color: severityConfig[selectedAlert.severity?.toLowerCase()]?.color || "white",
                    fontSize: 10, fontWeight: 800, letterSpacing: "1px"
                  }}>
                    {selectedAlert.severity?.toUpperCase()}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>ID: {selectedAlert.id}</span>
                </div>
                <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>
                  {selectedAlert.alert_type?.replace(/_/g, " ")} Details
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", padding: 8 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 24, padding: 16, background: "rgba(239,68,68,0.05)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.15)" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6, fontWeight: 500 }}>
                    {selectedAlert.message}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Vehicle Context</div>
                  <div style={{ fontSize: 14, color: "white", fontWeight: 700 }}>{selectedAlert.vehicle_number || selectedAlert.vehicle_id}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Driver: {selectedAlert.driver_name || "Unassigned"}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>AI Confidence</div>
                  <div style={{ fontSize: 14, color: "#16A34A", fontWeight: 800 }}>{Math.round((selectedAlert.ai_confidence || 0.9) * 100)}%</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>High Model Alignment</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#94A3B8", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Detected On:</span>
                  <span style={{ color: "white", fontWeight: 600 }}>{new Date(selectedAlert.created_at).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Current Status:</span>
                  <span style={{ 
                    color: statusConfig[selectedAlert.status]?.color || "#2563EB", 
                    fontWeight: 800, textTransform: "uppercase" 
                  }}>{selectedAlert.status}</span>
                </div>
                {selectedAlert.resolved_at && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Resolved On:</span>
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{new Date(selectedAlert.resolved_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ 
              padding: "20px 24px", background: "rgba(255,255,255,0.02)", 
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: 12
            }}>
              <button 
                onClick={handleCloseModal}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8, 
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "white", fontWeight: 600, cursor: "pointer"
                }}
              >
                Close
              </button>
              {selectedAlert.status !== "RESOLVED" && (
                <button 
                  onClick={() => handleResolve(selectedAlert.id)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8, 
                    background: "#16A34A", border: "none",
                    color: "white", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Header Area */}
      <div style={{
        background: "rgba(30, 41, 59, 0.4)",
        borderRadius: 20,
        padding: "24px 32px",
        marginBottom: 24,
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
            Alerts Management
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 13, marginTop: 4, fontWeight: 500 }}>
            Real-time AI monitoring & predictive fleet risk analysis
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>Fleet Intelligence Live</div>
          <div style={{ fontSize: 13, color: "#3B82F6", fontWeight: 900, marginTop: 4, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 8px #3B82F6" }} />
            REFRESHED: {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: "Total Alerts",
            value: alerts.length,
            color: "#60A5FA",
            bg: "rgba(37,99,235,0.15)",
            icon: Bell,
          },
          {
            label: "Active Risks",
            value: alerts.filter((a) => a.status === "OPEN" || a.status === "Active").length,
            color: "#F87171",
            bg: "rgba(220,38,38,0.15)",
            icon: AlertTriangle,
          },
          {
            label: "AI Confidence",
            value: "94%",
            color: "#C084FC",
            bg: "rgba(124,58,237,0.15)",
            icon: Cpu,
          },
          {
            label: "Resolved",
            value: alerts.filter((a) => a.status === "RESOLVED" || a.status === "Resolved").length,
            color: "#4ADE80",
            bg: "rgba(22,163,74,0.15)",
            icon: CheckCircle2,
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(30, 41, 59, 0.4)",
              borderRadius: 16,
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "transform 0.2s",
              cursor: "default"
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${item.bg}`
              }}
            >
              <item.icon size={22} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
            placeholder="Search alerts..."
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
          Showing <strong style={{ color: "white" }}>{filtered.length}</strong> alerts
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
              "140px 180px 120px 100px 1fr 140px 100px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 20px",
            gap: 15
          }}
        >
          {[
            "Vehicle",
            "Alert Type",
            "Severity",
            "Confidence",
            "Message",
            "Timestamp",
            "Status",
          ].map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#64748B",
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
          const status = alert.status?.toUpperCase();
          const dispStatus = statusConfig[alert.status] || statusConfig[status] || statusConfig.Active;
          
          return (
            <div
              key={alert.id}
              onClick={() => handleAcknowledge(alert)}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "140px 180px 120px 100px 1fr 140px 100px",
                padding: "14px 20px",
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                gap: 15
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {alert.vehicle_number || "TRK-" + alert.vehicle_id?.substring(0,4)}
                </div>
                <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", marginTop: 2 }}>
                  ID: {alert.id.substring(0, 8)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                {alert.alert_type?.replace(/_/g, " ")}
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
                    fontWeight: 900,
                  }}
                >
                  {sev?.label || alert.severity}
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: (alert.ai_confidence || 0.9) > 0.8 ? "#16A34A" : "#F59E0B" }}>
                {Math.round((alert.ai_confidence || 0.9) * 100)}%
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {alert.message}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>
                {new Date(alert.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{
                  fontSize: 10, fontWeight: 900,
                  color: dispStatus?.color || "#64748B",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: dispStatus?.bg || "rgba(255,255,255,0.05)",
                  textTransform: "uppercase",
                  textAlign: "center",
                  minWidth: 70
                }}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748B" }}>
            <Bell size={40} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>No alerts found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Refine your filters to see more results</div>
          </div>
        )}
      </div>
    </div>
  );
}
