import { useState } from "react";
import type { ReactNode } from "react";
import {
  Settings, Bell, Shield, Thermometer, Navigation,
  Brain, Sliders, Save, RefreshCw, CheckCircle2,
  AlertTriangle, Activity, Zap, Database, Lock, Cpu,
  Key, Copy, Trash2, Plus,
} from "lucide-react";
import apiKeyManager from "../../services/apiKeyManager";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        background: checked ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#E2E8F0",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18,
        borderRadius: "50%",
        background: "white",
        position: "absolute",
        top: 3,
        left: checked ? 23 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function RangeSlider({ value, min, max, step = 1, onChange, color = "#2563EB", unit = "" }: {
  value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; color?: string; unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 30, textAlign: "right" }}>{min}{unit}</span>
      <div style={{ flex: 1, position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 3, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${((value - min) / (max - min)) * 100}%`,
            background: color,
            borderRadius: 3,
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            width: "100%",
            height: 6,
            opacity: 0,
            cursor: "pointer",
            margin: 0,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 30 }}>{max}{unit}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", minWidth: 50, textAlign: "right" }}>
        {value}{unit}
      </span>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ marginLeft: 24 }}>{children}</div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: ReactNode }) {
  return (
    <div style={{
      background: "white", borderRadius: 12, padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.04)",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))",
          border: "1px solid rgba(124,58,237,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color="#7C3AED" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  // Route settings
  const [deviationThreshold, setDeviationThreshold] = useState(2.5);
  const [speedLimit, setSpeedLimit] = useState(90);
  const [realtimeTracking, setRealtimeTracking] = useState(true);
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);

  // Temperature settings
  const [tempMin, setTempMin] = useState(-5);
  const [tempMax, setTempMax] = useState(35);
  const [tempForecastHorizon, setTempForecastHorizon] = useState(30);
  const [tempBreachAlerts, setTempBreachAlerts] = useState(true);

  // AI Risk settings
  const [riskSensitivity, setRiskSensitivity] = useState("medium");
  const [anomalyThreshold, setAnomalyThreshold] = useState(7.5);
  const [confidenceMin, setConfidenceMin] = useState(75);
  const [autoEscalation, setAutoEscalation] = useState(true);

  // Alert settings
  const [alertPriority, setAlertPriority] = useState("high");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(true);
  const [alertCooldown, setAlertCooldown] = useState(15);

  // Model settings
  const [modelAutoUpdate, setModelAutoUpdate] = useState(true);
  const [predictionCaching, setPredictionCaching] = useState(true);
  const [dataRetention, setDataRetention] = useState(90);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Platform Settings
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            Configure AI thresholds, alert rules, and model behavior
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            height: 40, padding: "0 16px",
            background: "white", border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8, color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={14} />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            style={{
              height: 40, padding: "0 20px",
              background: saved ? "#16A34A" : "linear-gradient(135deg, #2563EB, #7C3AED)",
              border: "none", borderRadius: 8,
              color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.3s",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            }}
          >
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {saved && (
        <div className="fade-in-up" style={{
          background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.2)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <CheckCircle2 size={16} color="#16A34A" />
          <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 600 }}>
            Settings saved successfully — AI models will recalibrate with new thresholds within 60 seconds.
          </span>
        </div>
      )}

      {/* ── Route Configuration ─────────────────────────────── */}
      <SectionCard icon={Navigation} title="Route & Tracking Configuration" desc="Define route deviation tolerance and GPS tracking behavior">
        <SettingRow label="Route Deviation Threshold" desc="Maximum allowed deviation from planned route before triggering an alert">
          <div style={{ width: 280 }}>
            <RangeSlider value={deviationThreshold} min={0.5} max={10} step={0.5} onChange={setDeviationThreshold} color="#2563EB" unit=" km" />
          </div>
        </SettingRow>
        <SettingRow label="Maximum Speed Limit" desc="Speed threshold for vehicle speed violation alerts">
          <div style={{ width: 280 }}>
            <RangeSlider value={speedLimit} min={60} max={130} step={5} onChange={setSpeedLimit} color="#7C3AED" unit=" km/h" />
          </div>
        </SettingRow>
        <SettingRow label="Real-time GPS Tracking" desc="Enable continuous GPS position updates every 5 seconds">
          <Toggle checked={realtimeTracking} onChange={setRealtimeTracking} />
        </SettingRow>
        <SettingRow label="Geofence Violation Alerts" desc="Alert when vehicles enter or exit defined geographic zones">
          <Toggle checked={geofenceAlerts} onChange={setGeofenceAlerts} />
        </SettingRow>
      </SectionCard>

      {/* ── Temperature Configuration ────────────────────────── */}
      <SectionCard icon={Thermometer} title="Temperature Monitoring" desc="Configure cargo temperature limits and LSTM forecast settings">
        <SettingRow label="Minimum Temperature Threshold" desc="Alert when cargo temperature drops below this value">
          <div style={{ width: 280 }}>
            <RangeSlider value={tempMin} min={-20} max={0} step={1} onChange={setTempMin} color="#2563EB" unit="°C" />
          </div>
        </SettingRow>
        <SettingRow label="Maximum Temperature Threshold" desc="Alert when cargo temperature exceeds this value (breach limit)">
          <div style={{ width: 280 }}>
            <RangeSlider value={tempMax} min={20} max={60} step={1} onChange={setTempMax} color="#DC2626" unit="°C" />
          </div>
        </SettingRow>
        <SettingRow label="Forecast Horizon" desc="How far ahead the LSTM model should predict temperature trends">
          <div style={{ width: 280 }}>
            <RangeSlider value={tempForecastHorizon} min={10} max={120} step={5} onChange={setTempForecastHorizon} color="#7C3AED" unit=" min" />
          </div>
        </SettingRow>
        <SettingRow label="Temperature Breach Alerts" desc="Send alerts when LSTM model predicts a temperature breach">
          <Toggle checked={tempBreachAlerts} onChange={setTempBreachAlerts} />
        </SettingRow>
      </SectionCard>

      {/* ── AI Risk Configuration ────────────────────────────── */}
      <SectionCard icon={Brain} title="AI Risk Engine Configuration" desc="Tune the sensitivity of AI models and anomaly detection parameters">
        <SettingRow label="Risk Sensitivity Level" desc="How aggressively the AI engine scores operational risk">
          <div style={{ display: "flex", gap: 6 }}>
            {["low", "medium", "high"].map(level => (
              <button
                key={level}
                onClick={() => setRiskSensitivity(level)}
                style={{
                  height: 34,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: "1px solid",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  background: riskSensitivity === level
                    ? (level === "low" ? "#16A34A" : level === "medium" ? "#F59E0B" : "#DC2626")
                    : "transparent",
                  color: riskSensitivity === level ? "white" : "#94A3B8",
                  borderColor: riskSensitivity === level
                    ? (level === "low" ? "#16A34A" : level === "medium" ? "#F59E0B" : "#DC2626")
                    : "#E2E8F0",
                  transition: "all 0.2s",
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Anomaly Score Threshold" desc="Score above which behavior is classified as anomalous (0-10 scale)">
          <div style={{ width: 280 }}>
            <RangeSlider value={anomalyThreshold} min={1} max={10} step={0.5} onChange={setAnomalyThreshold} color="#DC2626" />
          </div>
        </SettingRow>
        <SettingRow label="Minimum Confidence Score" desc="Only trigger alerts when model confidence exceeds this threshold">
          <div style={{ width: 280 }}>
            <RangeSlider value={confidenceMin} min={50} max={99} step={1} onChange={setConfidenceMin} color="#16A34A" unit="%" />
          </div>
        </SettingRow>
        <SettingRow label="Auto-Escalation" desc="Automatically escalate critical alerts to fleet managers">
          <Toggle checked={autoEscalation} onChange={setAutoEscalation} />
        </SettingRow>

        <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(124,58,237,0.04)", borderRadius: 10, border: "1px solid rgba(124,58,237,0.12)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <AlertTriangle size={13} color="#7C3AED" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>
              <span style={{ color: "#7C3AED", fontWeight: 700 }}>Current settings</span>: {riskSensitivity} sensitivity with {anomalyThreshold}/10 anomaly threshold and {confidenceMin}% confidence minimum.
              Estimated false positive rate: <strong style={{ color: "#0F172A" }}>{riskSensitivity === "low" ? "8.2%" : riskSensitivity === "medium" ? "4.7%" : "2.1%"}</strong>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Alert Priority Configuration ─────────────────────── */}
      <SectionCard icon={Bell} title="Alert Priority & Notifications" desc="Configure how and when alerts are sent to operators">
        <SettingRow label="Alert Priority Level" desc="Default priority level for new AI-generated alerts">
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "Low", color: "#16A34A" },
              { label: "Medium", color: "#F59E0B" },
              { label: "High", color: "#DC2626" },
              { label: "Critical", color: "#7C0000" },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => setAlertPriority(p.label.toLowerCase())}
                style={{
                  height: 32, padding: "0 12px",
                  borderRadius: 7, border: "1px solid",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: alertPriority === p.label.toLowerCase() ? p.color : "transparent",
                  color: alertPriority === p.label.toLowerCase() ? "white" : "#94A3B8",
                  borderColor: alertPriority === p.label.toLowerCase() ? p.color : "#E2E8F0",
                  transition: "all 0.2s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Alert Cooldown Period" desc="Minimum time between repeated alerts for the same vehicle">
          <div style={{ width: 280 }}>
            <RangeSlider value={alertCooldown} min={1} max={60} step={1} onChange={setAlertCooldown} color="#F59E0B" unit=" min" />
          </div>
        </SettingRow>
        <SettingRow label="Email Notifications" desc="Receive alert summaries via email">
          <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
        </SettingRow>
        <SettingRow label="SMS Notifications" desc="Receive critical alerts via SMS (charges may apply)">
          <Toggle checked={smsAlerts} onChange={setSmsAlerts} />
        </SettingRow>
        <SettingRow label="Push Notifications" desc="In-app push notifications for real-time alerts">
          <Toggle checked={pushAlerts} onChange={setPushAlerts} />
        </SettingRow>
        <SettingRow label="Slack Integration" desc="Post critical alerts to configured Slack channels">
          <Toggle checked={slackIntegration} onChange={setSlackIntegration} />
        </SettingRow>
      </SectionCard>

      {/* ── Model & Data Settings ─────────────────────────────── */}
      <SectionCard icon={Database} title="AI Model & Data Management" desc="Control model update schedules, caching, and data retention policies">
        <SettingRow label="Automatic Model Updates" desc="Allow AI models to retrain automatically on new fleet data">
          <Toggle checked={modelAutoUpdate} onChange={setModelAutoUpdate} />
        </SettingRow>
        <SettingRow label="Prediction Caching" desc="Cache model predictions for improved response time">
          <Toggle checked={predictionCaching} onChange={setPredictionCaching} />
        </SettingRow>
        <SettingRow label="Data Retention Period" desc="How long to retain historical telemetry and alert data">
          <div style={{ width: 280 }}>
            <RangeSlider value={dataRetention} min={7} max={365} step={1} onChange={setDataRetention} color="#2563EB" unit=" days" />
          </div>
        </SettingRow>

        {/* Model status */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Model Version", value: "v3.2.1", icon: Cpu, color: "#2563EB" },
            { label: "Last Retrained", value: "4 days ago", icon: RefreshCw, color: "#7C3AED" },
            { label: "Data Points", value: "50M+", icon: Database, color: "#16A34A" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px", background: "#F8FAFC",
              borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `${item.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <item.icon size={14} color={item.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── API Key Management ────────────────────────────────── */}
      <SectionCard icon={Key} title="API Key Management" desc="Use API keys for programmatic access to fleet data">
        <SettingRow label="Your API Key" desc="Keep this secure - anyone with this key can access your data">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "8px 12px",
              background: "#F8FAFC", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)",
              fontFamily: "monospace", fontSize: 11, color: "#64748B",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {apiKeyVisible && apiKeyManager.getKey() ? (
                apiKeyManager.getKey()
              ) : (
                apiKeyManager.hasKey() ? "tui_••••••••••••••••••••" : "Not set"
              )}
            </div>
            <button
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              title={apiKeyVisible ? "Hide" : "Show"}
              style={{
                height: 32, width: 32,
                background: "#F8FAFC", border: "none", borderRadius: 6,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {apiKeyVisible ? "🔒" : "👁️"}
            </button>
            {apiKeyManager.hasKey() && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKeyManager.getKey() || "");
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                title="Copy API key"
                style={{
                  height: 32, width: 32,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none", borderRadius: 6,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                }}
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </SettingRow>

        <SettingRow label="Add/Update API Key" desc="Paste your API key from the backend API Keys endpoint">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type={apiKeyVisible ? "text" : "password"}
              placeholder="tui_paste_your_api_key_here"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{
                flex: 1, height: 32, padding: "0 8px",
                background: "#F8FAFC", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6,
                fontSize: 11, fontFamily: "monospace",
              }}
            />
            <button
              onClick={() => {
                if (apiKeyInput.trim()) {
                  apiKeyManager.saveKey(apiKeyInput.trim());
                  setApiKeyInput("");
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }
              }}
              style={{
                height: 32, padding: "0 12px",
                background: "#16A34A", border: "none", borderRadius: 6,
                color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Plus size={12} /> Save
            </button>
          </div>
        </SettingRow>

        <SettingRow label="Create New API Key" desc="Generate a new API key from the backend dashboard">
          <a
            href={`${(import.meta.env.VITE_API_URL as string) || 'http://localhost:8001'}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: 32, padding: "0 12px",
              background: "linear-gradient(135deg, #2563EB, #7C3AED)", border: "none", borderRadius: 6,
              color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 4,
              textDecoration: "none",
            }}
          >
            <Plus size={12} /> Open Backend
          </a>
        </SettingRow>

        {apiKeyManager.hasKey() && (
          <SettingRow label="Revoke Existing API Key" desc="Clear the stored API key from this device">
            <button
              onClick={() => {
                apiKeyManager.clearKey();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              style={{
                height: 32, padding: "0 12px",
                background: "#EF4444", border: "none", borderRadius: 6,
                color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Trash2 size={12} /> Clear
            </button>
          </SettingRow>
        )}
      </SectionCard>

      {/* Save button bottom */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button style={{
          height: 44, padding: "0 20px",
          background: "white", border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 8, color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          Cancel Changes
        </button>
        <button
          onClick={handleSave}
          style={{
            height: 44, padding: "0 24px",
            background: saved ? "#16A34A" : "linear-gradient(135deg, #2563EB, #7C3AED)",
            border: "none", borderRadius: 8,
            color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          {saved ? <><CheckCircle2 size={15} /> Settings Saved!</> : <><Save size={15} /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}