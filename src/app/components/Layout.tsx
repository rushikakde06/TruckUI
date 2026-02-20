import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Map,
  Bell,
  BarChart3,
  Truck,
  Settings,
  Brain,
  LogOut,
  User,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Map, label: "Live Map", path: "/dashboard/map" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts", badge: 3 },
  { icon: BarChart3, label: "AI Analytics", path: "/dashboard/analytics" },
  { icon: Truck, label: "Vehicles", path: "/dashboard/vehicles" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export function Layout() {
  const navigate = useNavigate();
  const [time] = useState(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 240,
        background: "linear-gradient(180deg, #0B1426 0%, #0F172A 60%, #120D2E 100%)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow blobs */}
        <div style={{
          position: "absolute", top: -60, left: -60,
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 100, right: -40,
          width: 180, height: 180,
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
            }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2, letterSpacing: "-0.3px" }}>TelematicsAI</div>
              <div style={{ color: "#4C5B7A", fontSize: 10, fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>Intelligence Platform</div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ padding: "20px 20px 8px", position: "relative", zIndex: 1 }}>
          <span style={{ color: "#3D4F72", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Navigation</span>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: "0 12px", flex: 1, position: "relative", zIndex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                color: isActive ? "white" : "#64748B",
                background: isActive
                  ? "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.2) 100%)"
                  : "transparent",
                borderLeft: isActive ? "2px solid #2563EB" : "2px solid transparent",
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s ease",
                position: "relative",
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: "#DC2626",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "1px 6px",
                      lineHeight: 1.6,
                    }}>{item.badge}</span>
                  )}
                  {isActive && (
                    <div style={{
                      position: "absolute",
                      right: 8,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#2563EB",
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status indicator */}
        <div style={{ padding: "12px 16px", margin: "0 12px 12px", background: "rgba(22,163,74,0.08)", borderRadius: 8, border: "1px solid rgba(22,163,74,0.15)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
            <div>
              <div style={{ color: "#16A34A", fontSize: 11, fontWeight: 600 }}>System Online</div>
              <div style={{ color: "#4C5B7A", fontSize: 10 }}>24 vehicles tracked</div>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            cursor: "pointer",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <User size={15} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>Admin User</div>
              <div style={{ color: "#4C5B7A", fontSize: 10 }}>Fleet Manager</div>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4C5B7A", padding: 4, borderRadius: 4 }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Navigation */}
        <header style={{
          height: 60,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>AI Control Center</div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Smart Telematics & Predictive Alerting</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.2)",
              padding: "4px 10px",
              borderRadius: 20,
            }}>
              <div className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A" }} />
              <span style={{ color: "#16A34A", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px" }}>LIVE</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ color: "#64748B", fontSize: 12, fontWeight: 500 }}>{time}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F59E0B" }}>
              <Zap size={14} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>AI Active</span>
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={18} color="#64748B" />
              <div style={{
                position: "absolute", top: -5, right: -5,
                width: 16, height: 16, borderRadius: "50%",
                background: "#DC2626",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "white", fontWeight: 700,
                border: "2px solid white",
              }}>3</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "4px 8px", borderRadius: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={15} color="white" />
              </div>
              <ChevronDown size={14} color="#94A3B8" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="scrollbar-thin" style={{ flex: 1, overflow: "auto", background: "#F8FAFC" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
