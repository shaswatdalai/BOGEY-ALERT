import { useState } from "react";
import { Save, RotateCcw, CheckCircle } from "lucide-react";

const DEFAULTS = {
  apiUrl:             "http://localhost:8000",
  criticalThreshold:  80,
  highThreshold:      60,
  mediumThreshold:    35,
  emailAlerts:        true,
  slackAlerts:        false,
  autoSuspend:        false,
  logRetention:       90,
  pollingInterval:    6,
  detailedLogs:       true,
  anomalyDetection:   true,
};

// Reusable section wrapper
function Section({ title, sub, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <div className="text-sm font-bold text-slate-800">{title}</div>
        <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// Reusable field row
function Field({ label, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// Toggle switch
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30
        ${value ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
          ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// Number / text input
const inputCls =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15";

export default function SettingsPage() {
  const [cfg, setCfg]   = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setCfg(DEFAULTS);
  }

  return (
    <div className="space-y-5 p-6">

      {/* API Connection */}
      <Section title="API Connection" sub="Configure the connection to your Python api.py backend">
        <Field label="API Base URL" sub="The address where api.py is running (default: localhost:8000)">
          <input
            className={`${inputCls} w-60 text-left`}
            value={cfg.apiUrl}
            onChange={(e) => set("apiUrl", e.target.value)}
          />
        </Field>
        <Field label="Health check interval (seconds)" sub="How often to ping the /health endpoint">
          <input
            type="number" className={`${inputCls} w-24`} min={1}
            value={cfg.pollingInterval}
            onChange={(e) => set("pollingInterval", Number(e.target.value))}
          />
        </Field>
      </Section>

      {/* Risk Thresholds */}
      <Section title="Risk Thresholds" sub="Adjust score cutoffs for each severity level (0–100)">
        {[
          ["Critical threshold", "criticalThreshold", "Scores at or above this are flagged CRITICAL"],
          ["High threshold",     "highThreshold",     "Scores at or above this are flagged HIGH"],
          ["Medium threshold",   "mediumThreshold",   "Scores at or above this are flagged MEDIUM"],
        ].map(([label, key, sub]) => (
          <Field key={key} label={label} sub={sub}>
            <div className="flex items-center gap-3">
              {/* Mini progress bar */}
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${cfg[key]}%` }}
                />
              </div>
              <input
                type="number" className={`${inputCls} w-20`} min={0} max={100}
                value={cfg[key]}
                onChange={(e) => set(key, Number(e.target.value))}
              />
            </div>
          </Field>
        ))}
      </Section>

      {/* Notifications */}
      <Section title="Notifications" sub="Control where alerts are sent when threats are detected">
        <Field label="Email alerts" sub="Send an email for every CRITICAL and HIGH event">
          <Toggle value={cfg.emailAlerts} onChange={(v) => set("emailAlerts", v)} />
        </Field>
        <Field label="Slack alerts" sub="Post to a Slack channel via webhook URL">
          <Toggle value={cfg.slackAlerts} onChange={(v) => set("slackAlerts", v)} />
        </Field>
        <Field
          label="Auto-suspend accounts"
          sub="Automatically disable any account that reaches CRITICAL score"
        >
          <Toggle value={cfg.autoSuspend} onChange={(v) => set("autoSuspend", v)} />
        </Field>
      </Section>

      {/* Detection Engine */}
      <Section title="Detection Engine" sub="Configure the AI behavioral analysis model">
        <Field label="Anomaly detection model" sub="Use the trained ML model from anomaly_detector.py + anomaly_model.pkl">
          <Toggle value={cfg.anomalyDetection} onChange={(v) => set("anomalyDetection", v)} />
        </Field>
        <Field label="Detailed logging" sub="Write full event data to employee_logs.csv after each analysis">
          <Toggle value={cfg.detailedLogs} onChange={(v) => set("detailedLogs", v)} />
        </Field>
        <Field label="Log retention (days)" sub="How many days to keep historical event logs before purging">
          <input
            type="number" className={`${inputCls} w-24`} min={1}
            value={cfg.logRetention}
            onChange={(e) => set("logRetention", Number(e.target.value))}
          />
        </Field>
      </Section>

      {/* Save bar */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
        <p className="text-xs text-slate-400">
          Settings are applied to the current session. Restart the dev server to persist changes.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            Reset defaults
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition
              ${saved
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? "Saved!" : "Save settings"}
          </button>
        </div>
      </div>

    </div>
  );
}
