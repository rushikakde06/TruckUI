import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area, LineChart, Line, ReferenceLine,
  Legend, Cell,
} from "recharts";
import { Brain, TrendingUp, Cpu, Activity, BarChart3, Target, ChevronRight, Info } from "lucide-react";

const featureImportance = [
  { feature: "Weather Severity", importance: 0.34, color: "#DC2626" },
  { feature: "Speed Pattern", importance: 0.28, color: "#F59E0B" },
  { feature: "Temp Trend", importance: 0.21, color: "#7C3AED" },
  { feature: "Route Deviation", importance: 0.17, color: "#2563EB" },
  { feature: "Cargo Load", importance: 0.12, color: "#16A34A" },
  { feature: "Driver Behavior", importance: 0.09, color: "#F59E0B" },
];

// Seeded normal points for scatter plot
const normalPoints = [
  { x: 15, y: 20 }, { x: 18, y: 25 }, { x: 22, y: 18 }, { x: 25, y: 30 }, { x: 20, y: 22 },
  { x: 28, y: 26 }, { x: 30, y: 20 }, { x: 12, y: 28 }, { x: 35, y: 24 }, { x: 16, y: 32 },
  { x: 24, y: 15 }, { x: 32, y: 28 }, { x: 19, y: 35 }, { x: 27, y: 14 }, { x: 33, y: 31 },
  { x: 21, y: 17 }, { x: 26, y: 33 }, { x: 14, y: 21 }, { x: 29, y: 19 }, { x: 23, y: 28 },
  { x: 17, y: 24 }, { x: 31, y: 22 }, { x: 13, y: 30 }, { x: 36, y: 18 }, { x: 11, y: 26 },
];

const anomalyPoints = [
  { x: 68, y: 72 }, { x: 75, y: 58 }, { x: 52, y: 80 }, { x: 82, y: 65 }, { x: 61, y: 85 }, { x: 78, y: 78 },
];

const forecastData = [
  { time: "06:00", actual: 18, predicted: null, upper: null, lower: null },
  { time: "07:00", actual: 20, predicted: null, upper: null, lower: null },
  { time: "08:00", actual: 22, predicted: null, upper: null, lower: null },
  { time: "09:00", actual: 24, predicted: null, upper: null, lower: null },
  { time: "10:00", actual: 26, predicted: 26, upper: 28, lower: 24 },
  { time: "11:00", actual: null, predicted: 30, upper: 33, lower: 27 },
  { time: "12:00", actual: null, predicted: 35, upper: 39, lower: 31 },
  { time: "13:00", actual: null, predicted: 38, upper: 43, lower: 33 },
  { time: "14:00", actual: null, predicted: 36, upper: 42, lower: 30 },
];

const modelHistory = [
  { epoch: 1, trainLoss: 0.82, valLoss: 0.85 },
  { epoch: 5, trainLoss: 0.61, valLoss: 0.64 },
  { epoch: 10, trainLoss: 0.43, valLoss: 0.47 },
  { epoch: 20, trainLoss: 0.28, valLoss: 0.31 },
  { epoch: 30, trainLoss: 0.18, valLoss: 0.22 },
  { epoch: 40, trainLoss: 0.12, valLoss: 0.16 },
  { epoch: 50, trainLoss: 0.09, valLoss: 0.13 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "white",
      }}>
        <div style={{ color: "#94A3B8", marginBottom: 6 }}>{label}</div>
        {payload.map((p: any, i: number) => p.value != null && (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function SectionHeader({ icon: Icon, title, desc, badge }: { icon: any; title: string; desc: string; badge?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
          border: "1px solid rgba(124,58,237,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color="#7C3AED" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      {badge && (
        <div style={{
          background: "rgba(37,99,235,0.08)",
          border: "1px solid rgba(37,99,235,0.2)",
          borderRadius: 6, padding: "4px 10px",
          fontSize: 10, color: "#2563EB", fontWeight: 700,
        }}>{badge}</div>
      )}
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            AI Analytics
          </h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
            Model performance, feature analysis, anomaly detection & predictive forecasting
          </p>
        </div>
        <div style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 10, padding: "10px 16px",
          maxWidth: 380,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Brain size={14} color="#7C3AED" style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "#7C3AED", fontWeight: 700 }}>Our system combines</span> anomaly detection, LSTM forecasting models, and gradient boosting classification algorithms to generate proactive risk intelligence for transportation assets.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 1: Model Performance ─────────────────────── */}
      <div style={{
        background: "white", borderRadius: 12, padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)", marginBottom: 20,
      }}>
        <SectionHeader
          icon={Target}
          title="Model Performance Metrics"
          desc="Evaluated on 15,000 test samples from Q4 2024 production data"
          badge="v3.2.1 PRODUCTION"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Accuracy", value: "94.2%", desc: "Overall prediction accuracy", color: "#16A34A", bg: "rgba(22,163,74,0.08)", bar: 94.2, detail: "Correct predictions / Total predictions" },
            { label: "Precision", value: "91.8%", desc: "Positive predictive value", color: "#2563EB", bg: "rgba(37,99,235,0.08)", bar: 91.8, detail: "TP / (TP + FP)" },
            { label: "Recall", value: "96.1%", desc: "Sensitivity / True positive rate", color: "#7C3AED", bg: "rgba(124,58,237,0.08)", bar: 96.1, detail: "TP / (TP + FN)" },
            { label: "F1 Score", value: "93.9%", desc: "Harmonic mean of P & R", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", bar: 93.9, detail: "2 × (P × R) / (P + R)" },
          ].map((m, i) => (
            <div key={i} style={{
              background: m.bg,
              border: `1px solid ${m.color}20`,
              borderRadius: 12, padding: "18px 20px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: m.color, opacity: 0.6 }} />
              <div style={{ fontSize: 11, color: m.color, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", lineHeight: 1, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: "#64748B", marginBottom: 12 }}>{m.desc}</div>
              <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 3, marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${m.bar}%`, background: m.color, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 9, color: "#94A3B8", fontFamily: "monospace" }}>{m.detail}</div>
            </div>
          ))}
        </div>

        {/* Model training history */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Training & Validation Loss</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={modelHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "Epoch", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="trainLoss" name="Train Loss" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line dataKey="valLoss" name="Val Loss" stroke="#7C3AED" strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>Model Architecture</div>
            {[
              { label: "Architecture", value: "LSTM + XGBoost Ensemble" },
              { label: "Training Data", value: "50M+ telemetry records" },
              { label: "Features", value: "47 engineered features" },
              { label: "Training Time", value: "8h 23m (GPU A100)" },
              { label: "Inference Latency", value: "12ms avg / vehicle" },
              { label: "Last Retrained", value: "2024-02-15 03:00 UTC" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 2 & 3: Feature Importance + Anomaly ──────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Feature Importance */}
        <div style={{
          background: "white", borderRadius: 12, padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}>
          <SectionHeader
            icon={BarChart3}
            title="Feature Importance"
            desc="SHAP values from gradient boosting model"
            badge="XGBoost"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureImportance} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 0.4]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v: any) => `${(v * 100).toFixed(1)}%`} content={<CustomTooltip />} />
              <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]}>
                {featureImportance.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "rgba(37,99,235,0.04)",
            borderRadius: 8, border: "1px solid rgba(37,99,235,0.1)",
          }}>
            <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6 }}>
              <span style={{ color: "#DC2626", fontWeight: 600 }}>Weather severity</span> is the strongest predictor of delay risk, followed by <span style={{ color: "#F59E0B", fontWeight: 600 }}>speed patterns</span>. Combined, these two features account for <strong>62%</strong> of predictive power.
            </div>
          </div>
        </div>

        {/* Anomaly Detection Scatter */}
        <div style={{
          background: "white", borderRadius: 12, padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}>
          <SectionHeader
            icon={Activity}
            title="Anomaly Detection"
            desc="Isolation Forest — behavioral clustering visualization"
            badge="Isolation Forest"
          />
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" dataKey="x" name="Speed Variance" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "Speed Variance", position: "insideBottom", offset: -2, fontSize: 9, fill: "#94A3B8" }} />
              <YAxis type="number" dataKey="y" name="Temp Variance" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} label={{ value: "Temp Δ", angle: -90, position: "insideLeft", offset: 5, fontSize: 9, fill: "#94A3B8" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "white" }}>
                      <div>X: {payload[0]?.value}, Y: {payload[1]?.value}</div>
                    </div>
                  );
                }
                return null;
              }} />
              <Scatter name="Normal" data={normalPoints} fill="#2563EB" opacity={0.7} />
              <Scatter name="Anomaly" data={anomalyPoints} fill="#DC2626" opacity={0.9} />
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563EB" }} />
              <span style={{ fontSize: 11, color: "#64748B" }}>Normal behavior ({normalPoints.length} points)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#DC2626" }} />
              <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 600 }}>Anomalies ({anomalyPoints.length} detected)</span>
            </div>
          </div>
          <div style={{
            marginTop: 10, padding: "8px 12px",
            background: "rgba(220,38,38,0.04)", borderRadius: 8,
            border: "1px solid rgba(220,38,38,0.1)",
          }}>
            <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
              Anomaly rate: <span style={{ color: "#DC2626", fontWeight: 700 }}>19.4%</span> of fleet trips in last 24h · Contamination factor: 0.05 · Isolation depth: 8 trees
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Forecast Visualization ────────────────── */}
      <div style={{
        background: "white", borderRadius: 12, padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)", marginBottom: 20,
      }}>
        <SectionHeader
          icon={TrendingUp}
          title="Temperature Forecast Visualization"
          desc="LSTM time-series model with 95% prediction confidence interval"
          badge="LSTM Model"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="°C" domain={[10, 50]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={35} stroke="#DC2626" strokeDasharray="4 4" strokeWidth={2} label={{ value: "⚠ Breach Threshold 35°C", fill: "#DC2626", fontSize: 10 }} />
                <Area dataKey="upper" name="Upper CI" stroke="none" fill="url(#predGrad)" connectNulls={false} />
                <Area dataKey="lower" name="Lower CI" stroke="none" fill="#F8FAFC" connectNulls={false} />
                <Line dataKey="actual" name="Actual Temp" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} connectNulls={false} />
                <Line dataKey="predicted" name="Predicted Temp" stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: "#7C3AED", r: 4 }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {[
                { color: "#2563EB", dash: false, label: "Actual Temperature" },
                { color: "#7C3AED", dash: true, label: "LSTM Prediction" },
                { color: "rgba(124,58,237,0.3)", area: true, label: "95% Confidence Interval" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {item.area ? (
                    <div style={{ width: 16, height: 10, background: "rgba(124,58,237,0.25)", borderRadius: 2 }} />
                  ) : item.dash ? (
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={item.color} strokeWidth="2" strokeDasharray="5 3" /></svg>
                  ) : (
                    <div style={{ width: 20, height: 2, background: item.color, borderRadius: 1 }} />
                  )}
                  <span style={{ fontSize: 11, color: "#64748B" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>Forecast Metrics</div>
            {[
              { label: "Forecast Horizon", value: "4 hours", color: "#2563EB" },
              { label: "RMSE", value: "1.34°C", color: "#16A34A" },
              { label: "MAE", value: "0.89°C", color: "#16A34A" },
              { label: "MAPE", value: "3.2%", color: "#16A34A" },
              { label: "Confidence (95%)", value: "±2.1°C", color: "#7C3AED" },
              { label: "Breach Alert Lead", value: "18-22 min", color: "#F59E0B" },
              { label: "False Positive Rate", value: "4.7%", color: "#F59E0B" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px",
                background: "#F8FAFC", borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.04)",
              }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}

            <div style={{
              padding: "12px",
              background: "rgba(22,163,74,0.06)",
              borderRadius: 8,
              border: "1px solid rgba(22,163,74,0.15)",
              marginTop: 4,
            }}>
              <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 700, marginBottom: 4 }}>✓ MODEL STATUS</div>
              <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.5 }}>
                Temperature LSTM achieves sub-2°C error with 18-minute breach prediction lead time — enabling proactive interventions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Confusion Matrix & ROC ────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Confusion Matrix */}
        <div style={{
          background: "white", borderRadius: 12, padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}>
          <SectionHeader icon={Cpu} title="Confusion Matrix" desc="Temperature breach classification performance" />
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 4, maxWidth: 300, margin: "0 auto" }}>
            <div></div>
            <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8", padding: "4px 0" }}>Pred: Normal</div>
            <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8", padding: "4px 0" }}>Pred: Breach</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", display: "flex", alignItems: "center", writingMode: "vertical-rl" as any, transform: "rotate(180deg)", padding: "0 4px" }}>Actual: Normal</div>
            <div style={{ background: "rgba(22,163,74,0.12)", border: "2px solid rgba(22,163,74,0.3)", borderRadius: 8, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#16A34A" }}>8,241</div>
              <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 600 }}>TN · 91.2%</div>
            </div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>793</div>
              <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>FP · 8.8%</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", display: "flex", alignItems: "center", writingMode: "vertical-rl" as any, transform: "rotate(180deg)", padding: "0 4px" }}>Actual: Breach</div>
            <div style={{ background: "rgba(220,38,38,0.08)", border: "2px solid rgba(220,38,38,0.2)", borderRadius: 8, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#DC2626" }}>236</div>
              <div style={{ fontSize: 10, color: "#DC2626", fontWeight: 600 }}>FN · 3.9%</div>
            </div>
            <div style={{ background: "rgba(22,163,74,0.12)", border: "2px solid rgba(22,163,74,0.3)", borderRadius: 8, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#16A34A" }}>5,730</div>
              <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 600 }}>TP · 96.1%</div>
            </div>
          </div>
        </div>

        {/* AI Models summary */}
        <div style={{
          background: "linear-gradient(135deg, #080E1E 0%, #0F172A 100%)",
          borderRadius: 12, padding: "24px",
          boxShadow: "0 4px 24px rgba(37,99,235,0.15)",
          border: "1px solid rgba(37,99,235,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Brain size={16} color="#7C3AED" />
            <span style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Deployed AI Models</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "LSTM Temperature Forecaster", version: "v2.1.4", accuracy: 94, status: "Active", type: "Time Series", color: "#2563EB" },
              { name: "Isolation Forest Anomaly Detector", version: "v1.3.2", accuracy: 91, status: "Active", type: "Unsupervised", color: "#7C3AED" },
              { name: "XGBoost Delay Classifier", version: "v3.0.1", accuracy: 88, status: "Active", type: "Classification", color: "#16A34A" },
              { name: "Weather Impact Regressor", version: "v1.5.0", accuracy: 86, status: "Active", type: "Regression", color: "#F59E0B" },
              { name: "Risk Score Ensemble", version: "v3.2.1", accuracy: 96, status: "Active", type: "Ensemble", color: "#DC2626" },
            ].map((model, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${model.color}20`, border: `1px solid ${model.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Cpu size={16} color={model.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 2 }}>{model.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: "#4C5B7A", fontSize: 10 }}>{model.version}</span>
                    <span style={{ color: model.color, fontSize: 9, background: `${model.color}20`, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>{model.type}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: model.color, fontSize: 14, fontWeight: 800 }}>{model.accuracy}%</div>
                  <div style={{ color: "#16A34A", fontSize: 9, fontWeight: 600 }}>● LIVE</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
