import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Eye, EyeOff, Zap, Shield, Activity, TrendingUp } from "lucide-react";

const features = [
  { icon: Brain, label: "ML Anomaly Detection", desc: "Real-time behavioral analysis" },
  { icon: TrendingUp, label: "Predictive Forecasting", desc: "Temperature & delay prediction" },
  { icon: Shield, label: "Dynamic Risk Scoring", desc: "AI-powered risk intelligence" },
  { icon: Activity, label: "Live Telemetry", desc: "24/7 fleet monitoring" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@telematicsai.io");
  const [password, setPassword] = useState("••••••••••");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060C1A 0%, #0B1426 40%, #12082E 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background neural network pattern */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#2563EB" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Background glow blobs */}
      <div style={{
        position: "absolute", top: "10%", left: "10%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800, height: 800,
        background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 60%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* Floating nodes */}
      {[
        { top: "15%", left: "20%", size: 6, color: "#2563EB" },
        { top: "25%", right: "25%", size: 4, color: "#7C3AED" },
        { bottom: "30%", left: "15%", size: 5, color: "#7C3AED" },
        { bottom: "20%", right: "20%", size: 6, color: "#2563EB" },
        { top: "60%", left: "30%", size: 3, color: "#16A34A" },
      ].map((node, i) => (
        <div key={i} style={{
          position: "absolute",
          ...node,
          width: node.size,
          height: node.size,
          borderRadius: "50%",
          background: node.color,
          boxShadow: `0 0 ${node.size * 4}px ${node.color}`,
          opacity: 0.7,
        }} />
      ))}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 64,
        maxWidth: 1100,
        width: "100%",
        padding: "40px 48px",
        alignItems: "center",
      }}>
        {/* Left: Branding panel */}
        <div className="fade-in-up" style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(37,99,235,0.45)",
            }}>
              <Brain size={28} color="white" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.5px" }}>TelematicsAI</div>
              <div style={{ color: "#4C5B7A", fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Enterprise Platform</div>
            </div>
          </div>

          <h1 style={{
            color: "white",
            fontSize: 36,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-1px",
            marginBottom: 16,
          }}>
            AI-Driven<br />
            <span style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Telematics Intelligence
            </span>
          </h1>

          <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Predictive Risk Intelligence for Transportation Assets. Machine learning powered anomaly detection, forecasting, and real-time risk scoring.
          </p>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}>
                <div style={{
                  width: 30, height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <f.icon size={15} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ color: "white", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ color: "#4C5B7A", fontSize: 10 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="fade-in-up" style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "40px 36px",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          {/* Card glow */}
          <div style={{
            position: "absolute",
            top: -1, left: -1, right: -1, bottom: -1,
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.1), transparent)",
            pointerEvents: "none",
          }} />

          <div style={{ marginBottom: 32, position: "relative", zIndex: 1 }}>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.4px" }}>
              Sign In
            </h2>
            <p style={{ color: "#64748B", fontSize: 13 }}>Access your AI intelligence dashboard</p>
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 16, position: "relative", zIndex: 1 }}>
            <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@company.com"
              style={{
                width: "100%",
                height: 46,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "0 16px",
                color: "white",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24, position: "relative", zIndex: 1 }}>
            <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.3px" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  height: 46,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "0 44px 0 16px",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 0,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <span style={{ color: "#2563EB", fontSize: 12, cursor: "pointer" }}>Forgot password?</span>
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              height: 48,
              background: loading ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 12,
              boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              letterSpacing: "0.3px",
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Authenticating...
              </>
            ) : (
              <>
                <Shield size={16} />
                Sign In to Platform
              </>
            )}
          </button>

          {/* Demo Mode button */}
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "100%",
              height: 48,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              color: "#94A3B8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
            }}
          >
            <Zap size={16} />
            Enter Demo Mode
          </button>

          {/* Subtext */}
          <div style={{ marginTop: 24, padding: "16px", background: "rgba(37,99,235,0.08)", borderRadius: 10, border: "1px solid rgba(37,99,235,0.15)" }}>
            <div style={{ color: "#94A3B8", fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
              <span style={{ color: "#2563EB", fontWeight: 600 }}>Predictive Risk Intelligence</span> for Transportation Assets
              <br />Powered by ML models trained on 50M+ fleet data points
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
