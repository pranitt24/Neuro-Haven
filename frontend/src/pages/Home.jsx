import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext.jsx";
import { useFocus } from "../context/FocusContext.jsx";
import TaskInput from "../components/TaskInput.jsx";
import SubtaskList from "../components/SubtaskList.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import Reveal from "../components/Reveal.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up? Be gentle with yourself";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const HOW = [
  ["01", "Say it messy", "Type the big, fuzzy thing exactly as it sits in your head. No need to organise it first."],
  ["02", "Get tiny steps", "Neuro-Haven folds it into a few small steps, each with a gentle time estimate."],
  ["03", "Settle in", "Pick one step, start a soft timer with some calming sound, and let the rest wait."],
];

export default function Home() {
  const { current, allDone, loading } = useTasks();
  const { selectSubtask } = useFocus();
  const navigate = useNavigate();

  const next = current?.subtasks.filter((s) => !s.is_completed).sort((a, b) => a.step_number - b.step_number)[0];

  return (
    <>
      <section className="container hero">
        <div className="orb o1 parallax" style={{ "--speed": 0.22 }} aria-hidden="true" />
        <div className="orb o2 parallax" style={{ "--speed": 0.38 }} aria-hidden="true" />

        <div className="parallax" style={{ "--speed": 0.1 }}>
          <p className="eyebrow">{greeting()} · begin gently</p>
          <h1 className="display">
            What feels <em>too big</em> right&nbsp;now?
          </h1>
          <p className="lead">Tell me the thing. I'll fold it into small, kind steps, and we'll take them one at a time.</p>
        </div>

        <div className="glass hero-card">
          <TaskInput />
        </div>
      </section>

      <section className="container section" aria-live="polite">
        {current ? (
          <div className="glass card">
            <div className="task-head">
              <div>
                <p className="eyebrow">Your current task</p>
                <h2 className="h2" style={{ margin: 0 }}>{current.title}</h2>
              </div>
              {next && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    selectSubtask(next);
                    navigate("/focus");
                  }}
                >
                  Focus on step {next.step_number}
                </button>
              )}
            </div>
            <ProgressBar subtasks={current.subtasks} />
            <SubtaskList key={current.id} task={current} />
            {allDone && (
              <div className="finish" role="status">
                <p className="h3" style={{ margin: 0 }}>All done. That took real effort.</p>
                <p className="muted" style={{ margin: "6px 0 0" }}>Rest for a moment. You've earned it.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass card empty">
            <span className="emoji" aria-hidden="true">🌱</span>
            <h2 className="h3">{loading ? "Gathering your things…" : "Nothing here yet, and that's okay."}</h2>
            <p className="muted" style={{ margin: 0 }}>Type something above, or tell your companion in the corner.</p>
          </div>
        )}
      </section>

      <section className="container section">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="h2">Starting is the <em>hardest</em> part.<br />So we make it smaller.</h2>
        </Reveal>
        <div className="grid-3" style={{ marginTop: 32 }}>
          {HOW.map(([n, title, text], i) => (
            <Reveal key={n} delay={i * 140} className="glass card">
              <span className="numeral">{n}</span>
              <h3 className="h3">{title}</h3>
              <p className="muted" style={{ margin: 0 }}>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="quote-band" aria-label="A gentle reminder">
        <div className="container parallax" style={{ "--speed": 0.07 }}>
          <Reveal>
            <blockquote>
              One small step is <strong>enough.</strong>
            </blockquote>
            <cite>A reminder from your companion</cite>
          </Reveal>
        </div>
      </section>
    </>
  );
}
