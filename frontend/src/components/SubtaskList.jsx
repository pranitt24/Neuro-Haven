import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext.jsx";
import { useFocus } from "../context/FocusContext.jsx";

const Tick = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

export default function SubtaskList({ task }) {
  const { toggleSubtask } = useTasks();
  const { selectSubtask } = useFocus();
  const navigate = useNavigate();
  const steps = [...task.subtasks].sort((a, b) => a.step_number - b.step_number);

  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s.id} className={`step ${s.is_completed ? "done" : ""}`} style={{ animationDelay: `${i * 90}ms` }}>
          <button
            type="button"
            className="check"
            role="checkbox"
            aria-checked={s.is_completed}
            aria-label={`Mark step ${s.step_number} ${s.is_completed ? "not done" : "done"}`}
            onClick={() => toggleSubtask(s.id)}
          >
            <Tick />
          </button>
          <div className="step-body">
            <span className="step-num">Step {s.step_number}</span>
            <span className="step-text">{s.description}</span>
          </div>
          <span className="badge">~{s.estimated_minutes}m</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              selectSubtask(s);
              navigate("/focus");
            }}
          >
            Focus
          </button>
        </li>
      ))}
    </ol>
  );
}
