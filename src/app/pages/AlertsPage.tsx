import { useState } from "react";
import { Bell, Filter, Search, AlertTriangle, CheckCircle2, Clock, ChevronDown, Eye, Download, RefreshCw } from "lucide-react";

const allAlerts = [
  { id: "ALT-0847", vehicle: "TRK-001", driver: "J. Martinez", type: "Temperature Breach", confidence: 89, severity: "critical", predicted: "10:12", actual: "10:18", timestamp: "2024-02-19 10:18:32", status: "Active" },
  { id: "ALT-0846", vehicle: "TRK-003", driver: "M. Johnson", type: "Route Deviation", confidence: 94, severity: "high", predicted: "09:45", actual: "09:47", timestamp: "2024-02-19 09:47:15", status: "Active" },
  { id: "ALT-0845", vehicle: "TRK-007", driver: "S. Chen", type: "Weather Delay", confidence: 78, severity: "medium", predicted: "11:00", actual: null, timestamp: "2024-02-19 09:20:00", status: "Predicted" },
  { id: "ALT-0844", vehicle: "TRK-002", driver: "R. Patel", type: "Anomaly Score", confidence: 91, severity: "high", predicted: "08:55", actual: "08:58", timestamp: "2024-02-19 08:58:44", status: "Resolved" },
  { id: "ALT-0843", vehicle: "TRK-011", driver: "A. Williams", type: "Speed Violation", confidence: 97, severity: "low", predicted: "08:30", actual: "08:31", timestamp: "2024-02-19 08:31:20", status: "Resolved" },
  { id: "ALT-0842", vehicle: "TRK-004", driver: "L. Garcia", type: "Temperature Breach", confidence: 85, severity: "critical", predicted: "12:00", actual: null, timestamp: "2024-02-19 11:00:00", status: "Predicted" },
  { id: "ALT-0841", vehicle: "TRK-009", driver: "K. Brown", type: "Geofence Violation", confidence: 99, severity: "medium", predicted: "07:48", actual: "07:49", timestamp: "2024-02-19 07:49:03", status: "Resolved" },
  { id: "ALT-0840", vehicle: "TRK-005", driver: "T. Wilson", type: "Route Deviation", confidence: 88, severity: "high", predicted: "07:20", actual: "07:23", timestamp: "2024-02-19 07:23:11", status: "Resolved" },
  { id: "ALT-0839", vehicle: "TRK-013", driver: "D. Lee", type: "Weather Delay", confidence: 72, severity: "medium", predicted: "13:00", actual: null, timestamp: "2024-02-19 10:55:00", status: "Predicted" },
  { id: "ALT-0838", vehicle: "TRK-006", driver: "C. Torres", type: "Anomaly Score", confidence: 83, severity: "high", predicted: "06:55", actual: "07:02", timestamp: "2024-02-19 07:02:45", status: "Resolved" },
];

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
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severities");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filtered = allAlerts.filter(a => {
    const matchSearch = search === "" || a.id.toLowerCase().includes(search.toLowerCase()) || a.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "All Severities" || a.severity === severityFilter.toLowerCase();
    const matchType = typeFilter === "All Types" || a.type === typeFilter;
    const matchStatus = statusFilter === "All Status" || a.status === statusFilter;
    return matchSearch && matchSeverity && matchType && matchStatus;
  });

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Alerts Management
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            AI-generated alerts with confidence scoring and prediction accuracy
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            height: 36, padding: "0 14px",
            background: "white", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8, color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button style={{
            height: 36, padding: "0 14px",
            background: "white", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8, color: "#64748B", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Download size={13} /> Export
          </button>
          <button style={{
            height: 36, padding: "0 16px",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Bell size={13} /> Configure Alerts
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Alerts", value: allAlerts.length, color: "#2563EB", bg: "rgba(37,99,235,0.08)", icon: Bell },
          { label: "Active", value: allAlerts.filter(a => a.status === "Active").length, color: "#DC2626", bg: "rgba(220,38,38,0.08)", icon: AlertTriangle },
          { label: "Predicted", value: allAlerts.filter(a => a.status === "Predicted").length, color: "#7C3AED", bg: "rgba(124,58,237,0.08)", icon: Clock },
          { label: "Resolved Today", value: allAlerts.filter(a => a.status === "Resolved").length, color: "#16A34A", bg: "rgba(22,163,74,0.08)", icon: CheckCircle2 },
        ].map((item, i) => (
          <div key={i} style={{
            background: "white",
            borderRadius: 12,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13 }}>
          <Filter size={14} />
          <span style={{ fontWeight: 600 }}>Filters:</span>
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} color="#94A3B8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or vehicle..."
            style={{
              width: "100%",
              height: 36,
              background: "#F8FAFC",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              padding: "0 12px 0 30px",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
              color: "#0F172A",
            }}
          />
        </div>

        {/* Severity filter */}
        <div style={{ position: "relative" }}>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{
              height: 36, padding: "0 30px 0 12px",
              background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8, fontSize: 12, outline: "none", cursor: "pointer",
              color: "#0F172A", appearance: "none",
            }}
          >
            {severities.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} color="#94A3B8" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>

        {/* Type filter */}
        <div style={{ position: "relative" }}>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              height: 36, padding: "0 30px 0 12px",
              background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8, fontSize: 12, outline: "none", cursor: "pointer",
              color: "#0F172A", appearance: "none",
            }}
          >
            {alertTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={12} color="#94A3B8" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              height: 36, padding: "0 30px 0 12px",
              background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8, fontSize: 12, outline: "none", cursor: "pointer",
              color: "#0F172A", appearance: "none",
            }}
          >
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} color="#94A3B8" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>

        <div style={{ marginLeft: "auto", color: "#94A3B8", fontSize: 12 }}>
          Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> of {allAlerts.length} alerts
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "100px 90px 1fr 160px 100px 110px 140px 160px 90px 60px",
          gap: 0,
          background: "#F8FAFC",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 20px",
        }}>
          {["Alert ID", "Vehicle", "Alert Type", "AI Type", "Confidence", "Severity", "Predicted", "Timestamp", "Status", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {/* Table rows */}
        {filtered.map((alert, i) => {
          const sev = severityConfig[alert.severity];
          const stat = statusConfig[alert.status];
          const StatIcon = stat.icon;
          return (
            <div
              key={alert.id}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 90px 1fr 160px 100px 110px 140px 160px 90px 60px",
                gap: 0,
                padding: "12px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                alignItems: "center",
                transition: "background 0.1s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", fontFamily: "monospace" }}>{alert.id}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{alert.vehicle}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{alert.driver}</div>
              </div>
              <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 500 }}>{alert.type}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED" }} />
                <span style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>
                  {alert.type === "Temperature Breach" ? "LSTM Forecast" :
                    alert.type === "Route Deviation" ? "Anomaly Detect." :
                      alert.type === "Weather Delay" ? "Weather Model" :
                        alert.type === "Anomaly Score" ? "Isolation Forest" : "Classification"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 4, background: "#F1F5F9", borderRadius: 2, maxWidth: 50 }}>
                  <div style={{
                    height: "100%",
                    width: `${alert.confidence}%`,
                    background: alert.confidence >= 90 ? "#16A34A" : alert.confidence >= 75 ? "#F59E0B" : "#DC2626",
                    borderRadius: 2,
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>{alert.confidence}%</span>
              </div>
              <div>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: sev.bg,
                  color: sev.color,
                  border: `1px solid ${sev.border}`,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}>
                  {sev.label}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#0F172A", fontWeight: 600 }}>
                  {alert.predicted} → {alert.actual || <span style={{ color: "#7C3AED" }}>PENDING</span>}
                </div>
                <div style={{ fontSize: 9, color: "#94A3B8" }}>
                  {alert.actual ? `Δ ${Math.abs(parseInt(alert.actual.split(":")[1]) - parseInt(alert.predicted.split(":")[1]))} min lag` : "AI prediction active"}
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontFamily: "monospace" }}>{alert.timestamp}</div>
              <div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: stat.bg,
                  color: stat.color,
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  <StatIcon size={10} />
                  {alert.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94A3B8", padding: "4px",
                  borderRadius: 4,
                }}>
                  <Eye size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
            <Bell size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No alerts match your filters</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}
