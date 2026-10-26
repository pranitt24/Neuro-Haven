import { fmt, useFocus } from "../context/FocusContext.jsx";

const R = 120;
const C = 2 * Math.PI * R;

export default function Timer() {
  const f = useFocus();
  const frac = f.total ? Math.max(0, Math.min(1, f.remaining / f.total)) : 0;

  return (
    <div className="glass card timer-card">
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="chip" aria-pressed={f.mode === "focus"} disabled={f.running} onClick={() => f.switchMode("focus")}>Focus</button>
        <button className="chip" aria-pressed={f.mode === "break"} disabled={f.running} onClick={() => f.switchMode("break")}>Break · 5 min</button>
      </div>

      <div className="ring-wrap">
        <svg viewBox="0 0 280 280" aria-hidden="true">
          <circle className="ring-bg" cx="140" cy="140" r={R} />
          <circle className="ring-fg" cx="140" cy="140" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
        </svg>
        <div className="ring-center">
          <div className="time" role="timer" aria-live="off">{fmt(f.remaining)}</div>
          <div className="time-label">{f.mode === "focus" ? "Focus time" : "Rest time"}</div>
        </div>
      </div>

      <div className="row timer-actions">
        {f.running ? (
          <button className="btn btn-primary" onClick={f.pause}>Pause</button>
        ) : (
          <button className="btn btn-primary" onClick={f.start}>{f.remaining < f.total && f.remaining > 0 ? "Resume" : "Start"}</button>
        )}
        <button className="btn btn-ghost" onClick={f.reset}>Reset</button>
      </div>

      {f.mode === "focus" && (
        <div className="row" style={{ marginTop: 26 }}>
          {[15, 25, 45].map((m) => (
            <button key={m} className="chip" aria-pressed={f.focusMin === m} disabled={f.running} onClick={() => f.setFocusMin(m)}>
              {m} min
            </button>
          ))}
          <button className="chip" disabled={f.running || !f.selected} onClick={f.useEstimate} title="Match the length to the step's estimate">
            Use step estimate
          </button>
        </div>
      )}
    </div>
  );
}
