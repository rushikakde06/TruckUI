// ============================================================
// VehiclePage.tsx – Fleet Management with Add + Edit Vehicle
// ============================================================
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Truck, User, Gauge, Thermometer, Activity,
  AlertTriangle, CheckCircle2, Battery, Wifi,
  Shield, Navigation, Plus, X, RefreshCw, Loader2,
  Route, Clock, Calendar, Phone, Edit3, Save, MapPin,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { vehiclesAPI, alertsAPI, telemetryAPI, routesAPI } from "../../services/api";

// ── Types ──────────────────────────────────────────────────────────────────────
interface VehicleData {
  id: string;
  vehicle_number: string;
  status: string;
  route_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  actual_start_time: string | null;
  created_at: string;
}

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
  scheduled_start_time?: string | null;
  scheduled_end_time?: string | null;
  actual_start_time?: string | null;
}

interface RouteData {
  id: string;
  route_name: string;
  start_location: string;
  end_location: string;
}

interface AlertData {
  id: string;
  vehicle_id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getRiskColor(score: number) {
  if (score >= 70) return "#EF4444";
  if (score >= 45) return "#F59E0B";
  return "#22C55E";
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

function formatDateTime(iso: string | null): string {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// Converts ISO/datetime string to datetime-local format for <input>
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

// ── Shared Input Styles ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10, padding: "11px 14px 11px 38px",
  color: "white", fontSize: 13, outline: "none", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#94A3B8",
  letterSpacing: "0.6px", textTransform: "uppercase" as const,
  display: "block", marginBottom: 8,
};

// ── Vehicle Form Modal (Add + Edit) ───────────────────────────────────────────
interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  routes: RouteData[];
  editVehicle?: VehicleData | null; // if set → Edit mode
}

function VehicleFormModal({ open, onClose, onSuccess, token, routes, editVehicle }: VehicleFormModalProps) {
  const isEdit = !!editVehicle;

  const [form, setForm] = useState({
    vehicle_number: "",
    status: "inactive",
    route_id: "",
    driver_name: "",
    driver_phone: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill form when editing
  useEffect(() => {
    if (isEdit && editVehicle) {
      setForm({
        vehicle_number: editVehicle.vehicle_number || "",
        status: editVehicle.status || "inactive",
        route_id: editVehicle.route_id || "",
        driver_name: editVehicle.driver_name || "",
        driver_phone: editVehicle.driver_phone || "",
        scheduled_start_time: toDatetimeLocal(editVehicle.scheduled_start_time),
        scheduled_end_time: toDatetimeLocal(editVehicle.scheduled_end_time),
      });
    } else {
      setForm({
        vehicle_number: "", status: "inactive", route_id: "",
        driver_name: "", driver_phone: "",
        scheduled_start_time: "", scheduled_end_time: "",
      });
    }
    setError("");
  }, [editVehicle, isEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle_number.trim()) { setError("Vehicle number is required."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        vehicle_number: form.vehicle_number.trim().toUpperCase(),
        status: form.status.toUpperCase(),
        route_id: form.route_id || null,
        driver_name: form.driver_name.trim() || null,
        driver_phone: form.driver_phone.trim() || null,
        scheduled_start_time: form.scheduled_start_time ? new Date(form.scheduled_start_time).toISOString() : null,
        scheduled_end_time: form.scheduled_end_time ? new Date(form.scheduled_end_time).toISOString() : null,
      };
      if (isEdit && editVehicle) {
        await vehiclesAPI.updateVehicle(token, editVehicle.id, payload);
      } else {
        await vehiclesAPI.createVehicle(token, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to ${isEdit ? "update" : "create"} vehicle.`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const StatusToggleBtn = ({ value, current }: { value: string; current: string }) => {
    const colors: Record<string, { color: string; bg: string; border: string }> = {
      active:   { color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)" },
      inactive: { color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.3)" },
      scheduled:{ color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)" },
      completed:{ color: "#A855F7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)" },
    };
    const c = colors[value] || colors.inactive;
    const isActive = current === value;
    return (
      <button
        type="button"
        onClick={() => setForm(f => ({ ...f, status: value }))}
        style={{
          padding: "7px 14px", borderRadius: 8, cursor: "pointer",
          border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.08)"}`,
          background: isActive ? c.bg : "transparent",
          color: isActive ? c.color : "#4B5563",
          fontSize: 11, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.4px", transition: "all 0.18s",
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.65)", display: "flex",
      alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(8px)", overflowY: "auto", padding: "40px 0",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0B1220 0%, #0F172A 60%, #111827 100%)",
        border: "1px solid rgba(99,102,241,0.2)", borderRadius: 22,
        width: 620, boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
        overflow: "hidden", margin: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: `linear-gradient(135deg, rgba(${isEdit ? "124,58,237" : "37,99,235"},0.15) 0%, rgba(${isEdit ? "37,99,235" : "124,58,237"},0.08) 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: isEdit ? "linear-gradient(135deg, #7C3AED, #2563EB)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
            }}>
              {isEdit ? <Edit3 size={20} color="white" /> : <Truck size={20} color="white" />}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>
                {isEdit ? `Edit ${editVehicle?.vehicle_number}` : "Register New Vehicle"}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                {isEdit ? "Update vehicle details and trip info" : "Setup trip details and automatic scheduling"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: 9, width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Vehicle Number */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Vehicle Number / Plate *</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Truck size={14} color="#4C5B7A" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. MH-12-AB-1234"
                  value={form.vehicle_number}
                  onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                  disabled={isEdit} // Can't change vehicle number in edit mode
                  style={{
                    ...inputStyle,
                    opacity: isEdit ? 0.6 : 1,
                    cursor: isEdit ? "not-allowed" : "text",
                  }}
                  required
                />
              </div>
              {isEdit && <p style={{ fontSize: 10, color: "#4B5563", margin: "4px 0 0" }}>Vehicle number cannot be changed after registration.</p>}
            </div>

            {/* Driver Name */}
            <div>
              <label style={labelStyle}>Driver Name</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <User size={14} color="#4C5B7A" />
                </div>
                <input type="text" placeholder="Full name" value={form.driver_name}
                  onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Driver Phone */}
            <div>
              <label style={labelStyle}>Phone Number</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Phone size={14} color="#4C5B7A" />
                </div>
                <input type="text" placeholder="+91 XXXXX XXXXX" value={form.driver_phone}
                  onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Scheduled Start */}
            <div>
              <label style={labelStyle}>Scheduled Start (UTC)</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Calendar size={14} color="#4C5B7A" />
                </div>
                <input type="datetime-local" value={form.scheduled_start_time}
                  onChange={(e) => setForm({ ...form, scheduled_start_time: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Scheduled End */}
            <div>
              <label style={labelStyle}>Scheduled End (UTC)</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Clock size={14} color="#4C5B7A" />
                </div>
                <input type="datetime-local" value={form.scheduled_end_time}
                  onChange={(e) => setForm({ ...form, scheduled_end_time: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Route */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Assign Route</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Route size={14} color="#4C5B7A" />
                </div>
                <select value={form.route_id}
                  onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none",
                    color: form.route_id ? "white" : "#64748B" }}
                >
                  <option value="">No route assigned</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: "#0F172A" }}>
                      {r.route_name} ({r.start_location} → {r.end_location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status (Edit mode only) */}
            {isEdit && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Vehicle Status</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["ACTIVE", "INACTIVE", "SCHEDULED", "COMPLETED"].map(s => (
                    <StatusToggleBtn key={s} value={s} current={form.status} />
                  ))}
                </div>
                <p style={{ fontSize: 10, color: "#4B5563", marginTop: 6 }}>
                  ⚡ Only <strong style={{ color: "#22C55E" }}>Active</strong> vehicles appear on Live Map for tracking.
                </p>
              </div>
            )}
          </div>

          {!isEdit && (
            <p style={{ fontSize: 11, color: "#64748B", marginTop: 16, lineHeight: 1.5 }}>
              💡 <strong>Auto-trigger:</strong> If Scheduled Start is in the future, status = <em>SCHEDULED</em> and auto-flips to <em>ACTIVE</em> at that time.
            </p>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px", marginTop: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertTriangle size={14} color="#EF4444" />
              <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "12px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: "12px",
              background: loading ? "rgba(37,99,235,0.4)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: "none", borderRadius: 10,
              color: "white", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : isEdit ? <Save size={16} /> : <Plus size={16} />}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Register Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function VehiclePage() {
  const { token } = useAuth();

  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [fleetData, setFleetData] = useState<FleetVehicle[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleData | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [vehiclesRaw, fleetRaw, routesRaw, alertsRaw] = await Promise.all([
        vehiclesAPI.listVehicles(token, 0, 100),
        telemetryAPI.getLiveFleet(token),
        routesAPI.listRoutes(token, 0, 50),
        alertsAPI.listAlerts(token, 0, 50),
      ]);
      setVehicles(vehiclesRaw || []);
      setFleetData(fleetRaw?.vehicles || []);
      setRoutes(routesRaw || []);
      setAlerts(alertsRaw || []);
    } catch (err) {
      console.error("[VehiclePage] loadAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Load telemetry history when vehicle selection changes (depends on ID, not object reference)
  useEffect(() => {
    const vehicleId = selectedVehicle?.id || selectedVehicle?.vehicle_id;
    if (!vehicleId || !token) return;
    
    setLoadingTelemetry(true);
    telemetryAPI.getTelemetryHistory(token, vehicleId, 10)
      .then((data) => {
        const formatted = [...(data || [])].reverse().map((t: any) => ({
          time: new Date(t.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          speed: t.speed ?? 0,
          temp: t.temperature ?? 0,
          deviation: t.route_deviation ?? 0,
        }));
        setTelemetryHistory(formatted);
      })
      .catch(() => setTelemetryHistory([]))
      .finally(() => setLoadingTelemetry(false));
  }, [selectedVehicle?.id, selectedVehicle?.vehicle_id, token]);

  // Merge vehicle data with fleet live data - useMemo to prevent infinite loops
  const enrichedVehicles = useMemo(() => {
    return vehicles.map((v) => {
      const live = fleetData.find((f) => f.vehicle_number === v.vehicle_number || f.vehicle_id === v.id);
      const route = routes.find((r) => r.id === v.route_id);
      return { 
        ...v, 
        live: live || null,
        start_location: route?.start_location || "N/A",
        end_location: route?.end_location || "N/A"
      };
    });
  }, [vehicles, fleetData, routes]);

  // Filter by status
  const filteredVehicles = useMemo(() => {
    return statusFilter === "all"
      ? enrichedVehicles
      : enrichedVehicles.filter(v => v.status.toLowerCase() === statusFilter.toLowerCase());
  }, [enrichedVehicles, statusFilter]);

  // Auto-select first vehicle and KEEP IT UPDATED with live data
  useEffect(() => {
    if (enrichedVehicles.length > 0) {
      if (!selectedVehicle) {
        const first = enrichedVehicles[0];
        setSelectedVehicle(first.live ? { ...first, ...first.live } : (first as any));
      } else {
        // Find current selected in the new enriched list
        const current = enrichedVehicles.find(v => v.id === selectedVehicle.id || v.id === (selectedVehicle as any).vehicle_id);
        if (current && current.live) {
          // Only update if the timestamp has actually changed to prevent loops
          if (current.live.last_update !== (selectedVehicle as any).last_update) {
            setSelectedVehicle({ ...current, ...current.live });
          }
        }
      }
    }
  }, [enrichedVehicles]); // Only depend on enrichedVehicles

  const vehicleAlerts = selectedVehicle
    ? alerts.filter((a) => a.vehicle_id === selectedVehicle.vehicle_id).slice(0, 6)
    : [];

  const sevColors: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
    HIGH: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    MEDIUM: { color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
    LOW: { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  };

  const statusMap: Record<string, { color: string; bg: string }> = {
    active: { color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
    scheduled: { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
    inactive: { color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
    completed: { color: "#A855F7", bg: "rgba(168,85,247,0.15)" },
  };

  const statusCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status?.toLowerCase() === "active").length,
    scheduled: vehicles.filter(v => v.status?.toLowerCase() === "scheduled").length,
    inactive: vehicles.filter(v => v.status?.toLowerCase() === "inactive").length,
    completed: vehicles.filter(v => v.status?.toLowerCase() === "completed").length,
  };

  const openAddModal = () => { setEditVehicle(null); setShowModal(true); };
  const openEditModal = (v: VehicleData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditVehicle(v);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ padding: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <Loader2 size={18} className="animate-spin" color="#2563EB" />
        <span style={{ color: "#64748B", fontSize: 13 }}>Loading fleet data…</span>
      </div>
    );
  }

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .vehicle-row { transition: all 0.15s ease; }
        .vehicle-row:hover { background: rgba(37,99,235,0.04) !important; }
        .edit-btn { opacity: 0; transition: opacity 0.15s; }
        .vehicle-row:hover .edit-btn { opacity: 1; }
        .status-filter-btn { cursor: pointer; border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; border: 1px solid transparent; transition: all 0.15s; }
        .status-filter-btn:hover { opacity: 0.85; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Fleet Vehicles
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            {vehicles.length} vehicles registered · {fleetData.filter(v => v.has_telemetry).length} live tracking · {statusCounts.active} active
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={loadAll} style={{
            height: 38, padding: "0 14px",
            background: "white", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 9, color: "#64748B", fontSize: 13, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button id="btn-add-vehicle" onClick={openAddModal} style={{
            height: 38, padding: "0 18px",
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            border: "none", borderRadius: 9, color: "white",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}>
            <Plus size={15} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "active", "scheduled", "inactive", "completed"] as const).map(s => {
          const isActive = statusFilter === s;
          const colors = s === "all" ? { color: "#0F172A", bg: "#F1F5F9", border: "#CBD5E1" }
            : { color: (statusMap[s] || statusMap.inactive).color, bg: s === "active" ? "rgba(34,197,94,0.1)" : s === "scheduled" ? "rgba(59,130,246,0.1)" : s === "completed" ? "rgba(168,85,247,0.1)" : "rgba(148,163,184,0.1)", border: (statusMap[s] || statusMap.inactive).color + "40" };
          return (
            <button
              key={s}
              className="status-filter-btn"
              onClick={() => setStatusFilter(s)}
              style={{
                background: isActive ? colors.bg : "transparent",
                border: `1px solid ${isActive ? colors.border : "rgba(0,0,0,0.08)"}`,
                color: isActive ? colors.color : "#64748B",
              }}
            >
              {s.toUpperCase()} ({statusCounts[s]})
            </button>
          );
        })}
        {statusFilter?.toLowerCase() === "active" && (
          <span style={{ fontSize: 11, color: "#22C55E", alignSelf: "center", fontWeight: 600 }}>
            ✅ Only active vehicles are tracked on Live Map
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20 }}>

        {/* ── Vehicle List Panel ── */}
        <div style={{
          background: "white", borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden", height: "fit-content",
        }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
              Fleet Management
              <span style={{ marginLeft: 8, fontSize: 10, color: "#94A3B8" }}>({filteredVehicles.length})</span>
            </div>
            <button onClick={openAddModal} style={{
              width: 26, height: 26, borderRadius: 7, cursor: "pointer",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={13} color="white" />
            </button>
          </div>

          <div style={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
            {filteredVehicles.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Truck size={32} color="#CBD5E1" style={{ margin: "0 auto 10px", display: "block" }} />
                <div style={{ fontSize: 12, color: "#94A3B8" }}>No vehicles found</div>
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isSelected = selectedVehicle?.vehicle_id === v.id || selectedVehicle?.vehicle_number === v.vehicle_number;
                const st = statusMap[v.status] || statusMap.inactive;
                return (
                  <div
                    key={v.id}
                    className="vehicle-row"
                    onClick={() => setSelectedVehicle(v.live || (v as any))}
                    style={{
                      padding: "11px 14px",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      background: isSelected ? "rgba(37,99,235,0.05)" : "transparent",
                      borderLeft: isSelected ? "3px solid #2563EB" : "3px solid transparent",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `${st.color}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>🚛</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 1 }}>{v.vehicle_number}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 700, color: st.color,
                          textTransform: "uppercase", letterSpacing: "0.3px",
                          padding: "1px 5px", borderRadius: 4,
                          background: st.bg, border: `1px solid ${st.color}30`,
                        }}>{v.status}</div>
                        {v.driver_name && (
                          <div style={{ fontSize: 9, color: "#94A3B8" }}>· {v.driver_name}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {v.live?.risk_score !== undefined && (
                        <div style={{ fontSize: 13, fontWeight: 900, color: getRiskColor(v.live.risk_score) }}>
                          {Math.round(v.live.risk_score)}
                        </div>
                      )}
                      {/* Edit button */}
                      <button
                        className="edit-btn"
                        onClick={(e) => openEditModal(v, e)}
                        title="Edit vehicle"
                        style={{
                          width: 26, height: 26, borderRadius: 6,
                          background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Edit3 size={11} color="#2563EB" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Vehicle Detail Panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {selectedVehicle ? (
            <>
              {/* Vehicle info card */}
              <div style={{
                background: "linear-gradient(135deg, #0B1426 0%, #0F172A 100%)",
                borderRadius: 14, padding: "20px 24px",
                border: "1px solid rgba(37,99,235,0.2)",
                boxShadow: "0 4px 20px rgba(37,99,235,0.08)",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 16, fontSize: 32,
                    background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                    border: "1px solid rgba(37,99,235,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>🚛</div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ color: "white", fontSize: 22, fontWeight: 800 }}>{selectedVehicle.vehicle_number}</span>
                      <span style={{
                        background: (statusMap[selectedVehicle.status] || statusMap.inactive).bg,
                        color: (statusMap[selectedVehicle.status] || statusMap.inactive).color,
                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 6,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        border: `1px solid ${(statusMap[selectedVehicle.status] || statusMap.inactive).color}40`,
                      }}>
                        {selectedVehicle.status}
                      </span>
                      {/* Quick Edit button */}
                      {vehicles.find(v => v.vehicle_number === selectedVehicle.vehicle_number) && (
                        <button
                          onClick={(e) => {
                            const v = vehicles.find(vv => vv.vehicle_number === selectedVehicle.vehicle_number);
                            if (v) openEditModal(v, e);
                          }}
                          style={{
                            background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.3)",
                            borderRadius: 7, padding: "4px 10px", color: "#60A5FA",
                            fontSize: 11, fontWeight: 600, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5,
                          }}
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                      {[
                        { icon: User, label: "Driver", value: selectedVehicle.driver_name || "Unassigned" },
                        { icon: Calendar, label: "Start Trip", value: formatDateTime(selectedVehicle.scheduled_start_time || null) },
                        { icon: Navigation, label: "Deviation", value: selectedVehicle.route_deviation !== undefined ? `${selectedVehicle.route_deviation.toFixed(2)} km` : "—" },
                        { icon: Clock, label: "Last Tracked", value: timeSince(selectedVehicle.last_update || null) },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <item.icon size={12} color="#4C5B7A" />
                          <div>
                            <div style={{ color: "#4C5B7A", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                            <div style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedVehicle.risk_score !== undefined && (
                    <div style={{ textAlign: "center", minWidth: 100 }}>
                      <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>AI RISK</div>
                      <div style={{ fontSize: 44, fontWeight: 900, color: getRiskColor(selectedVehicle.risk_score), lineHeight: 1 }}>
                        {Math.round(selectedVehicle.risk_score)}
                      </div>
                      <div style={{
                        marginTop: 10, display: "flex", alignItems: "center", gap: 6,
                        background: `${getRiskColor(selectedVehicle.risk_score)}20`,
                        borderRadius: 6, padding: "4px 8px",
                      }}>
                        <Shield size={10} color={getRiskColor(selectedVehicle.risk_score)} />
                        <span style={{ color: getRiskColor(selectedVehicle.risk_score), fontSize: 10, fontWeight: 700 }}>
                          {Math.round(selectedVehicle.ai_confidence * 100)}% Conf.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active vehicle tracking badge */}
                {selectedVehicle.status?.toLowerCase() === "active" && (
                  <div style={{
                    marginTop: 14, padding: "8px 14px", borderRadius: 8,
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
                    <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>
                      This vehicle is visible on Live Map — track it in real time
                    </span>
                  </div>
                )}
                {selectedVehicle.status?.toLowerCase() !== "active" && (
                  <div style={{
                    marginTop: 14, padding: "8px 14px", borderRadius: 8,
                    background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.15)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8" }} />
                    <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                      Set status to <strong style={{ color: "#22C55E" }}>Active</strong> to track this vehicle on Live Map
                    </span>
                  </div>
                )}
              </div>

              {/* Metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
                {[
                  { icon: Gauge, label: "Speed", value: selectedVehicle.speed != null ? `${Math.round(selectedVehicle.speed)} km/h` : "N/A", color: "#16A34A" },
                  { icon: Thermometer, label: "Temp", value: selectedVehicle.temperature != null ? `${selectedVehicle.temperature.toFixed(1)}°C` : "N/A", color: "#2563EB" },
                  { icon: Activity, label: "Anomaly", value: selectedVehicle.anomaly_score != null ? `${Math.round(selectedVehicle.anomaly_score * 100)}%` : "N/A", color: "#DC2626" },
                  { icon: Battery, label: "Delay Prob.", value: selectedVehicle.delay_probability != null ? `${Math.round(selectedVehicle.delay_probability)}%` : "N/A", color: "#F59E0B" },
                  { icon: Wifi, label: "AI Forecast", value: selectedVehicle.predicted_temperature != null ? `${selectedVehicle.predicted_temperature.toFixed(1)}°C` : "N/A", color: "#7C3AED" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "white", borderRadius: 12, padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", 
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <item.icon size={14} color={item.color} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.2px" }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.5px" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Trip Logistics & Intelligence Section */}
              <div style={{
                background: "white", borderRadius: 14, padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", 
                border: "1px solid rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Navigation size={16} color="#2563EB" /> Trip Logistics & Journey Progress
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 24, alignItems: "center" }}>
                  {/* Start Point */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 36, height: 36, background: "rgba(34,197,94,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <MapPin size={16} color="#22C55E" />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>Origin</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{selectedVehicle.start_location || "Not Available"}</div>
                  </div>

                  {/* Progress visualization (the "normal graph") */}
                  <div style={{ position: "relative", padding: "0 20px" }}>
                    <div style={{ height: 6, background: "#F1F5F9", borderRadius: 10, position: "relative", overflow: "hidden" }}>
                      <div style={{ 
                        position: "absolute", left: 0, top: 0, height: "100%", 
                        width: selectedVehicle.status?.toLowerCase() === "active" ? "64%" : "0%", 
                        background: "linear-gradient(90deg, #2563EB, #7C3AED)",
                        borderRadius: 10,
                        transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>0% Started</div>
                      <div style={{ 
                        fontSize: 11, fontWeight: 800, color: "#2563EB", 
                        background: "rgba(37,99,235,0.08)", padding: "2px 8px", borderRadius: 10 
                      }}>
                        {selectedVehicle.status?.toLowerCase() === "active" ? "ETA: ~3.5h remaining" : "Standing by"}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>100% End</div>
                    </div>
                  </div>

                  {/* End Point */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 36, height: 36, background: "rgba(220,38,38,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <Navigation size={16} color="#EF4444" />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase" }}>Destination</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{selectedVehicle.end_location || "Not Available"}</div>
                  </div>
                </div>
              </div>

              {/* Chart & Alerts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{
                  background: "white", borderRadius: 14, padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", 
                  border: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={16} color="#2563EB" /> Telemetry Timeline
                  </div>
                  {loadingTelemetry ? (
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" /></div>
                  ) : telemetryHistory.length === 0 ? (
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12, textAlign: "center" }}>
                      No active stream detected.<br />Data will appear when transit begins.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={telemetryHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} hide />
                        <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line dataKey="speed" name="Speed" stroke="#2563EB" strokeWidth={3} dot={false} type="monotone" />
                        <Line dataKey="temp" name="Temp" stroke="#DC2626" strokeWidth={3} dot={false} type="monotone" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={{
                  background: "white", borderRadius: 14, overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", 
                  border: "1px solid rgba(0,0,0,0.04)", padding: "20px"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={16} color="#7C3AED" /> Operational Efficiency (AI Predict)
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={telemetryHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                      <Tooltip />
                      <Line 
                        type="stepAfter" 
                        dataKey="deviation" 
                        name="Delay Prob" 
                        stroke="#7C3AED" 
                        strokeWidth={2} 
                        fill="rgba(124,58,237,0.1)" 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Behavioral Risk Analysis (Full width or adjusted) */}
              <div style={{
                background: "white", borderRadius: 14, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", 
                border: "1px solid rgba(0,0,0,0.04)",
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontSize: 13, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} color="#F59E0B" /> Behavioral Risk Analysis
                </div>
                <div style={{ maxHeight: 240, overflowY: "auto" }}>
                    {vehicleAlerts.length === 0 ? (
                      <div style={{ padding: 40, textAlign: "center" }}>
                        <CheckCircle2 size={32} color="#22C55E" style={{ margin: "0 auto 10px" }} />
                        <div style={{ fontSize: 12, color: "#64748B" }}>No predictive risks detected</div>
                      </div>
                    ) : (
                      vehicleAlerts.map((a, i) => {
                        const s = sevColors[a.severity] || sevColors.LOW;
                        return (
                          <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid #f8fafc", display: "flex", gap: 12 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, marginTop: 6 }} />
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{a.alert_type.replace(/_/g, " ")}</div>
                              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{a.message}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
          ) : (
            <div style={{ background: "white", borderRadius: 14, padding: "80px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
              <Truck size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#64748B" }}>Select a vehicle to view intelligence</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Vehicle Form Modal (Add/Edit) ── */}
      <VehicleFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditVehicle(null); }}
        onSuccess={loadAll}
        token={token!}
        routes={routes}
        editVehicle={editVehicle}
      />
    </div>
  );
}

export default VehiclePage;
