import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "neurohaven.prefs.v1";
const defaults = { calm: false, dyslexia: false, sound: "off", volume: 0.3, petHidden: false };

function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
}

const Ctx = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(load);

  useEffect(() => {
    document.body.classList.toggle("calm-mode", prefs.calm);
    document.body.classList.toggle("dyslexia-font", prefs.dyslexia);
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable */
    }
  }, [prefs]);

  const update = useCallback((patch) => setPrefs((p) => ({ ...p, ...patch })), []);
  const value = useMemo(() => ({ prefs, update }), [prefs, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);
