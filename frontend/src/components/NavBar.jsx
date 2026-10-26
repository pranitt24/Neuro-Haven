import { Link, NavLink, useLocation } from "react-router-dom";
import { usePrefs } from "../context/PreferencesContext.jsx";
import { fmt, useFocus } from "../context/FocusContext.jsx";

function Toggle({ label, pressed, onClick }) {
  return (
    <button type="button" className="toggle" aria-pressed={pressed} onClick={onClick}>
      <span className="track" aria-hidden="true" />
      <span className="label">{label}</span>
      <span className="sr-only">{pressed ? "on" : "off"}</span>
    </button>
  );
}

const LeafLogo = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M50 92 C50 62 52 36 50 10" />
    <path d="M50 10 C16 20 8 56 50 70 C92 56 84 20 50 10Z" />
  </svg>
);

export default function NavBar() {
  const { prefs, update } = usePrefs();
  const { running, remaining, mode } = useFocus();
  const { pathname } = useLocation();

  return (
    <div className="nav-wrap">
      <header className="nav glass">
        <Link to="/" className="logo" aria-label="Neuro-Haven home">
          <LeafLogo />
          <span>Neuro-Haven</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/focus">Focus</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/messages">Messages</NavLink>
        </nav>

        <div className="nav-tools">
          {running && pathname !== "/focus" && (
            <Link to="/focus" className="pill" aria-label={`${mode} timer running, ${fmt(remaining)} left. Go to focus page`}>
              🌿 {fmt(remaining)}
            </Link>
          )}
          <Toggle label="Calm" pressed={prefs.calm} onClick={() => update({ calm: !prefs.calm })} />
          <Toggle label="Dyslexia font" pressed={prefs.dyslexia} onClick={() => update({ dyslexia: !prefs.dyslexia })} />
          <Toggle label="Companion" pressed={!prefs.petHidden} onClick={() => update({ petHidden: !prefs.petHidden })} />
        </div>
      </header>
    </div>
  );
}
