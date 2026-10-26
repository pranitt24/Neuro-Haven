import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api.js";

const CUR = "neurohaven.currentTask.v1";
export const GENTLE = "Something went wrong. Let's try that again.";

const Ctx = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [currentId, setCurrentId] = useState(() => {
    try {
      const v = localStorage.getItem(CUR);
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const list = await api.listTasks();
      setTasks(list);
      setError("");
    } catch {
      setError(GENTLE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      if (currentId == null) localStorage.removeItem(CUR);
      else localStorage.setItem(CUR, String(currentId));
    } catch {
      /* ignore */
    }
  }, [currentId]);

  const current = useMemo(() => tasks.find((t) => t.id === currentId) || null, [tasks, currentId]);
  const allDone = !!current && current.subtasks.length > 0 && current.subtasks.every((s) => s.is_completed);

  const createTask = useCallback(
    async (prompt) => {
      const text = (prompt || "").trim();
      if (!text || creating) return null;
      setCreating(true);
      setError("");
      try {
        const t = await api.createTask(text);
        setTasks((p) => [t, ...p.filter((x) => x.id !== t.id)]);
        setCurrentId(t.id);
        return t;
      } catch {
        setError(GENTLE);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [creating]
  );

  const setSubtaskState = (subtaskId, value) =>
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.subtasks.some((s) => s.id === subtaskId)) return t;
        const subtasks = t.subtasks.map((s) => (s.id === subtaskId ? { ...s, is_completed: value } : s));
        return { ...t, subtasks, is_completed: subtasks.every((s) => s.is_completed) };
      })
    );

  const toggleSubtask = useCallback(
    async (subtaskId) => {
      const sub = tasks.flatMap((t) => t.subtasks).find((s) => s.id === subtaskId);
      if (!sub) return;
      const next = !sub.is_completed;
      setSubtaskState(subtaskId, next); // optimistic
      try {
        await api.toggleSubtask(subtaskId, next);
      } catch {
        setSubtaskState(subtaskId, !next); // revert
        setError(GENTLE);
      }
    },
    [tasks]
  );

  const openTask = useCallback((id) => setCurrentId(id), []);
  const clearError = useCallback(() => setError(""), []);

  const value = useMemo(
    () => ({ tasks, current, allDone, loading, creating, error, clearError, refresh, createTask, toggleSubtask, openTask }),
    [tasks, current, allDone, loading, creating, error, clearError, refresh, createTask, toggleSubtask, openTask]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTasks = () => useContext(Ctx);
