export default function ProgressBar({ subtasks }) {
  const done = subtasks.filter((s) => s.is_completed).length;
  const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;
  const minutes = subtasks.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0);

  return (
    <div className="progress">
      <div className="progress-meta">
        <span className="strong">{done} of {subtasks.length} steps done</span>
        <span className="muted">About {minutes} min total</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Task progress">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
