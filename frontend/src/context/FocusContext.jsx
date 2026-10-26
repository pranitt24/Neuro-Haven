import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as api from "../api.js";
import useAmbientSound from "../hooks/useAmbientSound.js";
import { usePrefs } from "./PreferencesContext.jsx";
import { useTasks } from "./TaskContext.jsx";

const BREAK_MIN = 5;
const Ctx = createContext(null);

export function fmt(sec) {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function FocusProvider({ children }) {
  const { prefs, update } = usePrefs();
  const { current } = useTasks();
  const sound = useAmbientSound();

  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("focus"); // focus | break
  const [focusMin, setFocusMinState] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(null); // null | "focus" | "break"
  const [playing, setPlaying] = useState("off"); // never auto-plays on load
  const endAt = useRef(0);

  const selected = useMemo(
    () => (current && selectedId != null ? current.subtasks.find((s) => s.id === selectedId) || null : null),
    [current, selectedId]
  );
  const total = (mode === "focus" ? focusMin : BREAK_MIN) * 60;

  const latest = useRef({});
  latest.current = { mode, focusMin, selected };

  const complete = useCallback(() => {
    const { mode: m, focusMin: fm, selected: sel } = latest.current;
    setRunning(false);
    setRemaining(0);
    setFinished(m);
    sound.chime();
    if (m === "focus") api.logFocusSession(sel ? sel.id : null, fm).catch(() => {});
  }, [sound]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        complete();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, complete]);

  useEffect(() => {
    document.title = running ? `${fmt(remaining)} · Neuro-Haven` : "Neuro-Haven";
  }, [running, remaining]);

  const start = useCallback(() => {
    sound.unlock(); // called from a click, so audio is allowed
    setFinished(null);
    const secs = remaining > 0 ? remaining : total;
    setRemaining(secs);
    endAt.current = Date.now() + secs * 1000;
    setRunning(true);
  }, [remaining, total, sound]);

  const pause = useCallback(() => {
    setRemaining(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)));
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setFinished(null);
    setRemaining(total);
  }, [total]);

  const setFocusMin = useCallback(
    (m) => {
      if (running) return;
      const v = Math.min(120, Math.max(1, Math.round(m)));
      setFocusMinState(v);
      setMode("focus");
      setFinished(null);
      setRemaining(v * 60);
    },
    [running]
  );

  const useEstimate = useCallback(() => {
    if (selected) setFocusMin(selected.estimated_minutes);
  }, [selected, setFocusMin]);

  const switchMode = useCallback(
    (m) => {
      if (running) return;
      setMode(m);
      setFinished(null);
      setRemaining((m === "focus" ? focusMin : BREAK_MIN) * 60);
    },
    [running, focusMin]
  );

  const startBreak = useCallback(() => {
    sound.unlock();
    setMode("break");
    setFinished(null);
    setRemaining(BREAK_MIN * 60);
    endAt.current = Date.now() + BREAK_MIN * 60 * 1000;
    setRunning(true);
  }, [sound]);

  const dismissFinished = useCallback(() => {
    setFinished(null);
    if (mode === "break") {
      setMode("focus");
      setRemaining(focusMin * 60);
    }
  }, [mode, focusMin]);

  const selectSubtask = useCallback((st) => setSelectedId(st ? st.id : null), []);

  const setSound = useCallback(
    (type) => {
      update({ sound: type });
      setPlaying(type);
      sound.start(type, prefs.volume); // inside a click handler
    },
    [update, sound, prefs.volume]
  );

  const setVolume = useCallback(
    (v) => {
      update({ volume: v });
      sound.setVolume(v);
    },
    [update, sound]
  );

  const value = useMemo(
    () => ({
      selected, selectSubtask, mode, focusMin, remaining, total, running, finished,
      start, pause, reset, setFocusMin, useEstimate, switchMode, startBreak, dismissFinished,
      playing, setSound, setVolume, volume: prefs.volume, lastSound: prefs.sound,
    }),
    [
      selected, selectSubtask, mode, focusMin, remaining, total, running, finished,
      start, pause, reset, setFocusMin, useEstimate, switchMode, startBreak, dismissFinished,
      playing, setSound, setVolume, prefs.volume, prefs.sound,
    ]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFocus = () => useContext(Ctx);
