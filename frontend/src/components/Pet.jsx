import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrefs } from "../context/PreferencesContext.jsx";
import { useTasks } from "../context/TaskContext.jsx";
import { useFocus } from "../context/FocusContext.jsx";
import TaskInput from "./TaskInput.jsx";

const MESSAGES = {
  idle: ["What are we working on?", "One small step is enough.", "Want a break?", "No rush. I'm right here."],
  focusing: ["You're doing so well.", "Steady and gentle.", "Just this one thing."],
  celebrating: ["That took real effort. Proud of you.", "Look at that. All done.", "Time to rest a little."],
  sleepy: ["zzz… I'm here when you're ready."],
};

function Face({ state }) {
  const sleepy = state === "sleepy";
  const happy = state === "celebrating";
  return (
    <svg className="pet-svg" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="petBody" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#b9d3be" />
          <stop offset="100%" stopColor="#8ab092" />
        </radialGradient>
      </defs>
      <path d="M50 30 C46 18 52 10 62 8 C62 18 58 26 50 30Z" fill="#6f8f72" />
      <path d="M50 30 C44 22 36 20 30 22 C32 30 40 33 50 30Z" fill="#7fa688" />
      <ellipse cx="50" cy="62" rx="34" ry="30" fill="url(#petBody)" />
      <ellipse cx="33" cy="68" rx="6" ry="4" fill="rgba(255,255,255,.5)" />
      <ellipse cx="67" cy="68" rx="6" ry="4" fill="rgba(255,255,255,.5)" />
      {sleepy || happy ? (
        <>
          <path d="M33 58 Q38 63 43 58" stroke="#2d382e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M57 58 Q62 63 67 58" stroke="#2d382e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="38" cy="58" r="3.6" fill="#2d382e" />
          <circle cx="62" cy="58" r="3.6" fill="#2d382e" />
          <circle cx="39.2" cy="56.8" r="1.1" fill="#fff" />
          <circle cx="63.2" cy="56.8" r="1.1" fill="#fff" />
        </>
      )}
      <path d={happy ? "M43 70 Q50 78 57 70" : "M45 71 Q50 75 55 71"} stroke="#2d382e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Pet() {
  const { prefs, update } = usePrefs();
  const { allDone } = useTasks();
  const { running, finished } = useFocus();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [sleepy, setSleepy] = useState(false);
  const [tick, setTick] = useState(0);
  const lastAct = useRef(Date.now());

  useEffect(() => {
    const wake = () => {
      lastAct.current = Date.now();
      setSleepy(false);
    };
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    const id = setInterval(() => {
      if (Date.now() - lastAct.current > 120000) setSleepy(true);
    }, 15000);
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 14000);
    return () => clearInterval(id);
  }, []);

  if (prefs.petHidden) return null;

  const state = finished || allDone ? "celebrating" : running ? "focusing" : sleepy ? "sleepy" : "idle";
  const list = MESSAGES[state];
  const message = list[tick % list.length];

  return (
    <div className={`pet ${state}`}>
      {open ? (
        <div className="glass pet-pop">
          <TaskInput
            compact
            autoFocus
            placeholder="Tell me a task…"
            onCreated={() => {
              setOpen(false);
              navigate("/");
            }}
          />
        </div>
      ) : (
        <div className="glass pet-bubble" role="status">{message}</div>
      )}
      <div className="pet-wrap">
        <button
          type="button"
          className="pet-hide"
          aria-label="Hide companion"
          onClick={() => update({ petHidden: true })}
        >
          ×
        </button>
        <button
          type="button"
          className="pet-btn"
          aria-label={open ? "Close task box" : "Open task box. Tell your companion a task"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Face state={state} />
        </button>
      </div>
    </div>
  );
}
