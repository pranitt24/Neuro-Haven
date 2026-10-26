import { useState } from "react";
import * as api from "../api.js";
import { GENTLE } from "../context/TaskContext.jsx";

const TONES = [
  ["polite", "Polite"],
  ["professional", "Professional"],
  ["direct", "Direct"],
];

export default function Messages() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const rewrite = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const res = await api.communicate(text.trim(), tone);
      setResult(res.rewritten);
    } catch {
      setError(GENTLE);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setError("Couldn't copy automatically. You can select the text and copy it.");
    }
  };

  return (
    <>
      <section className="container page-head">
        <div className="orb parallax" style={{ "--speed": 0.25 }} aria-hidden="true" />
        <div className="parallax" style={{ "--speed": 0.08 }}>
          <p className="eyebrow">Communication assistant</p>
          <h1 className="display">
            Say it <em>your way.</em>
          </h1>
          <p className="lead">Write it as it comes out. We'll help it land the way you want it to.</p>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 40 }}>
        <div className="glass card">
          <label className="eyebrow" htmlFor="msg">Your rough message</label>
          <textarea
            id="msg"
            className="field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ugh i cant make it tmrw, this is so annoying"
          />

          <p className="eyebrow" style={{ margin: "22px 0 10px" }}>Choose a tone</p>
          <div className="row left" role="group" aria-label="Tone">
            {TONES.map(([v, label]) => (
              <button key={v} className="chip" aria-pressed={tone === v} onClick={() => setTone(v)}>{label}</button>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={rewrite} disabled={busy || !text.trim()}>
              {busy ? "Thinking gently…" : "Rewrite it"}
            </button>
          </div>

          {error && <p className="gentle" role="status">{error}</p>}

          {result && !busy && (
            <div className="result" role="status">
              <p>{result}</p>
              <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
