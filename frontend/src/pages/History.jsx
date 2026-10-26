import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext.jsx";
import Reveal from "../components/Reveal.jsx";

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function History() {
  const { tasks, loading, error, refresh, openTask } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <section className="container page-head">
        <div className="orb parallax" style={{ "--speed": 0.25 }} aria-hidden="true" />
        <div className="parallax" style={{ "--speed": 0.08 }}>
          <p className="eyebrow">History</p>
          <h1 className="display">
            Everything you've <em>begun.</em>
          </h1>
          <p className="lead">Pick any task to open it again and carry on from where you left off.</p>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 24 }}>
        {error && <p className="gentle">{error}</p>}
        {loading ? (
          <p className="muted">Gathering your things…</p>
        ) : tasks.length === 0 ? (
          <div className="glass card empty">
            <span className="emoji" aria-hidden="true">🍃</span>
            <p className="h3" style={{ margin: 0 }}>Nothing here yet. Your first task will show up here.</p>
          </div>
        ) : (
          <ul className="list">
            {tasks.map((t, i) => {
              const done = t.subtasks.filter((s) => s.is_completed).length;
              const pct = t.subtasks.length ? Math.round((done / t.subtasks.length) * 100) : 0;
              return (
                <Reveal as="li" key={t.id} delay={Math.min(i, 5) * 80}>
                  <button
                    className="glass history-item"
                    onClick={() => {
                      openTask(t.id);
                      navigate("/");
                    }}
                  >
                    <span className="history-top">
                      <span className="history-title">{t.title}</span>
                      <span className="muted small">{fmtDate(t.created_at)} · {done}/{t.subtasks.length} steps</span>
                    </span>
                    <span className="progress-track" aria-hidden="true">
                      <span className="progress-fill" style={{ width: `${pct}%`, display: "block" }} />
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
