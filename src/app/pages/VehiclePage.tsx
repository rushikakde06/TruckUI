// ============================================================
// VehiclePage.tsx – Full Live Add Vehicle + Dynamic Fleet List
// ============================================================
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Truck, MapPin, User, Gauge, Thermometer, Activity,
  AlertTriangle, CheckCircle2, Battery, Wifi,
  Shield, Navigation, Plus, X, RefreshCw, Loader2,
  ChevronRight, Route, ToggleLeft, ToggleRight,
  Clock, Calendar, Phone,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ── Add Vehicle Modal ──────────────────────────────────────────────────────────
interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  routes: RouteData[];
}

function AddVehicleModal({ open, onClose, onSuccess, token, routes }: AddVehicleModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle_number.trim()) {
      setError("Vehicle number is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await vehiclesAPI.createVehicle(token, {
        vehicle_number: form.vehicle_number.trim().toUpperCase(),
        status: form.status,
        route_id: form.route_id || null,
        driver_name: form.driver_name.trim() || null,
        driver_phone: form.driver_phone.trim() || null,
        scheduled_start_time: form.scheduled_start_time ? new Date(form.scheduled_start_time).toISOString() : null,
        scheduled_end_time: form.scheduled_end_time ? new Date(form.scheduled_end_time).toISOString() : null,
      });
      setForm({
        vehicle_number: "",
        status: "inactive",
        route_id: "",
        driver_name: "",
        driver_phone: "",
        scheduled_start_time: "",
        scheduled_end_time: "",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create vehicle. Check if vehicle number already exists.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)",
      overflowY: "auto", padding: "40px 0",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: 20,
        width: 600,
        boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
        overflow: "hidden", margin: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.1) 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
            }}>
              <Truck size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>Register New Vehicle</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Setup trip details and automatic scheduling</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: 8, width: 36, height: 36, cursor: "pointer",
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
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Vehicle Number / Plate *
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Truck size={14} color="#4C5B7A" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. MH-12-AB-1234"
                  value={form.vehicle_number}
                  onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "12px 14px 12px 38px",
                    color: "white", fontSize: 14, outline: "none",
                  }}
                  required
                />
              </div>
            </div>

            {/* Driver Name */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Driver Name
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <User size={14} color="#4C5B7A" />
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.driver_name}
                  onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "12px 14px 12px 38px",
                    color: "white", fontSize: 14, outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Driver Phone */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Phone Number
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Phone size={14} color="#4C5B7A" />
                </div>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.driver_phone}
                  onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "12px 14px 12px 38px",
                    color: "white", fontSize: 14, outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Scheduled Start Time */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Scheduled Start (UTC)
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Calendar size={14} color="#4C5B7A" />
                </div>
                <input
                  type="datetime-local"
                  value={form.scheduled_start_time}
                  onChange={(e) => setForm({ ...form, scheduled_start_time: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "11px 14px 11px 38px",
                    color: "white", fontSize: 13, outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Scheduled End Time */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Scheduled End (UTC)
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Clock size={14} color="#4C5B7A" />
                </div>
                <input
                  type="datetime-local"
                  value={form.scheduled_end_time}
                  onChange={(e) => setForm({ ...form, scheduled_end_time: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "11px 14px 11px 38px",
                    color: "white", fontSize: 13, outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Route Assignment */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Assign Route
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                  <Route size={14} color="#4C5B7A" />
                </div>
                <select
                  value={form.route_id}
                  onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "12px 14px 12px 38px",
                    color: form.route_id ? "white" : "#64748B",
                    fontSize: 14, outline: "none", cursor: "pointer", appearance: "none",
                  }}
                >
                  <option value="">No route assigned</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: "#1E293B" }}>
                      {r.route_name} ({r.start_location} → {r.end_location})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#64748B", marginTop: 16, lineHeight: 1.5 }}>
            💡 <strong>Automatic Trigger:</strong> If Scheduled Start is in the future, status will be set to <em>SCHEDULED</em> and automatically flip to <em>ACTIVE</em> at that time.
          </p>

          {/* Error message */}
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

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: "12px",
                background: loading ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
                border: "none", borderRadius: 10,
                color: "white", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? "Registering..." : "Add Vehicle"}
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  // ── Data loading ──────────────────────────────────────────────────────────
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

  // ── Load telemetry history when vehicle selected ──────────────────────────
  useEffect(() => {
    if (!selectedVehicle || !token) return;
    setLoadingTelemetry(true);
    telemetryAPI.getTelemetryHistory(token, selectedVehicle.vehicle_id, 10)
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
  }, [selectedVehicle, token]);

  // ── Merge vehicle data with fleet live data ──────────────────────────────
  const enrichedVehicles = vehicles.map((v) => {
    const live = fleetData.find((f) => f.vehicle_number === v.vehicle_number);
    return { ...v, live: live ? { ...v, ...live } : null };
  });

  // ── Auto-select first vehicle ────────────────────────────────────────────
  useEffect(() => {
    if (enrichedVehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(enrichedVehicles[0].live || (enrichedVehicles[0] as any));
    }
  }, [fleetData, enrichedVehicles]);

  // ── Alerts for selected vehicle ─────────────────────────────────────────
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
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Fleet Vehicles
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            {vehicles.length} vehicles registered · {fleetData.filter(v => v.has_telemetry).length} live tracking
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={loadAll}
            style={{
              height: 38, padding: "0 14px",
              background: "white", border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 9, color: "#64748B", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          <button
            id="btn-add-vehicle"
            onClick={() => setShowAddModal(true)}
            style={{
              height: 38, padding: "0 18px",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: "none", borderRadius: 9, color: "white",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            <Plus size={15} />
            Add Vehicle
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* ── Vehicle List Panel ── */}
        <div style={{
          background: "white", borderRadius: 14,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.04)",
          overflow: "hidden", height: "fit-content",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Fleet Management</div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Plus size={12} color="white" />
            </button>
          </div>

          <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {enrichedVehicles.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Truck size={32} color="#CBD5E1" style={{ margin: "0 auto 10px", display: "block" }} />
                <div style={{ fontSize: 12, color: "#94A3B8" }}>No vehicles registered</div>
              </div>
            ) : (
              enrichedVehicles.map((v) => {
                const isSelected = selectedVehicle?.vehicle_id === v.id;
                const st = statusMap[v.status] || statusMap.inactive;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.live || (v as any))}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      background: isSelected ? "rgba(37,99,235,0.04)" : "transparent",
                      borderLeft: isSelected ? "3px solid #2563EB" : "3px solid transparent",
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${st.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15,
                    }}>🚛</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{v.vehicle_number}</div>
                      <div style={{ fontSize: 10, color: st.color, fontWeight: 600, textTransform: "uppercase" }}>{v.status}</div>
                    </div>
                    {v.live?.risk_score !== undefined && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: getRiskColor(v.live.risk_score) }}>
                          {Math.round(v.live.risk_score)}
                        </div>
                      </div>
                    )}
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
                boxShadow: "0 4px 20px rgba(37,99,235,0.1)",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                    border: "1px solid rgba(37,99,235,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32,
                  }}>🚛</div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ color: "white", fontSize: 22, fontWeight: 800 }}>{selectedVehicle.vehicle_number}</span>
                      <span style={{
                        background: (statusMap[selectedVehicle.status] || statusMap.inactive).bg,
                        color: (statusMap[selectedVehicle.status] || statusMap.inactive).color,
                        fontSize: 10, fontWeight: 800,
                        padding: "3px 10px", borderRadius: 6,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        border: `1px solid ${(statusMap[selectedVehicle.status] || statusMap.inactive).color}40`,
                      }}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
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
                      <div style={{
                        fontSize: 44, fontWeight: 900,
                        color: getRiskColor(selectedVehicle.risk_score),
                        lineHeight: 1,
                      }}>{Math.round(selectedVehicle.risk_score)}</div>
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
              </div>

              {/* Metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
                {[
                  { icon: Gauge, label: "Speed", value: selectedVehicle.speed != null ? `${Math.round(selectedVehicle.speed)} km/h` : "—", color: "#16A34A" },
                  { icon: Thermometer, label: "Temp", value: selectedVehicle.temperature != null ? `${selectedVehicle.temperature.toFixed(1)}°C` : "—", color: "#2563EB" },
                  { icon: Activity, label: "Anomaly", value: selectedVehicle.anomaly_score !== undefined ? `${Math.round(selectedVehicle.anomaly_score * 100)}%` : "—", color: "#DC2626" },
                  { icon: Battery, label: "Delay Prob.", value: selectedVehicle.delay_probability !== undefined ? `${Math.round(selectedVehicle.delay_probability)}%` : "—", color: "#F59E0B" },
                  { icon: Wifi, label: "AI Forecast", value: selectedVehicle.predicted_temperature != null ? `${selectedVehicle.predicted_temperature.toFixed(1)}°C` : "—", color: "#7C3AED" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "white", borderRadius: 12, padding: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <item.icon size={14} color={item.color} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart & Alerts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{
                  background: "white", borderRadius: 14, padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={16} color="#2563EB" /> Telemetry History
                  </div>
                  {loadingTelemetry ? (
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" /></div>
                  ) : telemetryHistory.length === 0 ? (
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12 }}>No live data streams available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={telemetryHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} hide />
                        <YAxis tick={{ fontSize: 9 }} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line dataKey="speed" name="Speed" stroke="#2563EB" strokeWidth={2} dot={false} />
                        <Line dataKey="temp" name="Temp" stroke="#DC2626" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={{
                  background: "white", borderRadius: 14, overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontSize: 13, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={16} color="#F59E0B" /> Predictive Alerts
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

      <AddVehicleModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadAll}
        token={token!}
        routes={routes}
      />
    </div>
  );
}

export default VehiclePage;
