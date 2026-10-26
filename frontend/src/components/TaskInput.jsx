import { useId, useState } from "react";
import { useTasks } from "../context/TaskContext.jsx";

export default function TaskInput({ compact = false, placeholder = "What feels too big right now?", onCreated, autoFocus = false }) {
  const { createTask, creating, error } = useTasks();
  const [text, setText] = useState("");
  const id = useId();

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || creating) return;
    const task = await createTask(text);
    if (task) {
      setText("");
      onCreated && onCreated(task);
    }
  };

  return (
    <form className={`task-input ${compact ? "compact" : ""}`} onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>Describe a task</label>
      <input
        id={id}
        className="field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        disabled={creating}
      />
      <button className="btn btn-primary" type="submit" disabled={creating || !text.trim()}>
        {creating ? "Thinking gently…" : "Break it down"}
      </button>
      {creating && (
        <p className="gentle" role="status">Folding that into small, kind steps…</p>
      )}
      {error && !creating && (
        <p className="gentle" role="status">{error}</p>
      )}
    </form>
  );
}
