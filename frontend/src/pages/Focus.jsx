import { Link } from "react-router-dom";
import { useTasks } from "../context/TaskContext.jsx";
import { useFocus } from "../context/FocusContext.jsx";
import Timer from "../components/Timer.jsx";
import SoundControls from "../components/SoundControls.jsx";
import Reveal from "../components/Reveal.jsx";

const TIPS = [
  ["Time is softer here", "The ring slowly shrinks instead of ticking down. There's no alarm, only a quiet chime."],
  ["One thing only", "You only see the step you chose. Everything else can wait its turn."],
  ["Breaks count", "Rest isn't a reward you earn. It's part of the work, and it's always allowed."],
];

export default function Focus() {
  const { current, toggleSubtask } = useTasks();
  const f = useFocus();
  const open = current ? current.subtasks.filter((s) => !s.is_completed) : [];

  return (
    <>
      <section className="container page-head">
        <div className="orb parallax" style={{ "--speed": 0.25 }} aria-hidden="true" />
        <div className="parallax" style={{ "--speed": 0.08 }}>
          <p className="eyebrow">Focus session</p>
          <h1 className="display">
            One thing, <em>gently.</em>
          </h1>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 40 }}>
        {f.finished && (
          <div className="glass card finish" role="status" style={{ marginBottom: 24 }}>
            {f.finished === "focus" ? (
              <>
                <p className="h3" style={{ margin: 0 }}>Beautiful. You stayed with it.</p>
                <p className="muted" style={{ margin: "6px 0 16px" }}>Whatever happened in there, showing up counts.</p>
                <div className="row left">
                  {f.selected && !f.selected.is_completed && (
                    <button className="btn btn-primary" onClick={() => toggleSubtask(f.selected.id)}>Mark this step done?</button>
                  )}
                  <button className="btn btn-ghost" onClick={f.startBreak}>Take a 5 minute break</button>
                  <button className="btn btn-ghost" onClick={f.dismissFinished}>Not now</button>
                </div>
              </>
            ) : (
              <>
                <p className="h3" style={{ margin: 0 }}>Break's over. Ready whenever you are.</p>
                <div className="row left" style={{ marginTop: 14 }}>
                  <button className="btn btn-primary" onClick={f.dismissFinished}>Back to focus</button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid-2">
          <Timer />
          <div className="stack">
            <div className="glass card">
              <p className="eyebrow">Current step</p>
              {f.selected ? (
                <>
                  <h2 className="h3" style={{ fontSize: "1.55rem" }}>{f.selected.description}</h2>
                  <span className="badge">~{f.selected.estimated_minutes}m</span>
                  {f.selected.is_completed && <p className="muted small" style={{ margin: "12px 0 0" }}>This one's already done. Lovely.</p>}
                </>
              ) : current ? (
                <>
                  <p className="muted" style={{ marginTop: 0 }}>Pick a step to focus on:</p>
                  {open.length ? (
                    <select
                      className="select"
                      aria-label="Choose a step"
                      defaultValue=""
                      onChange={(e) => f.selectSubtask(open.find((s) => s.id === Number(e.target.value)))}
                    >
                      <option value="" disabled>Choose a step…</option>
                      {open.map((s) => (
                        <option key={s.id} value={s.id}>Step {s.step_number}: {s.description}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="muted">Every step is done. Wonderful.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="muted" style={{ marginTop: 0 }}>No task yet. Start one and come back.</p>
                  <Link className="btn btn-ghost btn-sm" to="/">Go to Home</Link>
                </>
              )}
            </div>
            <SoundControls />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="grid-3">
          {TIPS.map(([title, text], i) => (
            <Reveal key={title} delay={i * 140} className="glass card tight">
              <h3 className="h3">{title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
