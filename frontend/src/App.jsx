import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import { TaskProvider } from "./context/TaskContext.jsx";
import { FocusProvider } from "./context/FocusContext.jsx";
import { useParallaxEngine } from "./parallax.js";
import Backdrop from "./components/Backdrop.jsx";
import NavBar from "./components/NavBar.jsx";
import Pet from "./components/Pet.jsx";
import Home from "./pages/Home.jsx";
import Focus from "./pages/Focus.jsx";
import History from "./pages/History.jsx";
import Messages from "./pages/Messages.jsx";
import NotFound from "./pages/NotFound.jsx";

function Layout() {
  const loc = useLocation();
  useParallaxEngine();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Backdrop />
      <NavBar />
      <main id="main" className="page" key={loc.pathname}>
        <Routes location={loc}>
          <Route path="/" element={<Home />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/history" element={<History />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">Made with care for calmer minds · Neuro-Haven</footer>
      <Pet />
    </>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <TaskProvider>
        <FocusProvider>
          <HashRouter>
            <Layout />
          </HashRouter>
        </FocusProvider>
      </TaskProvider>
    </PreferencesProvider>
  );
}
