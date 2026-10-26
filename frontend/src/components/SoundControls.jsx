import { useFocus } from "../context/FocusContext.jsx";

const OPTIONS = [
  ["off", "Off"],
  ["rain", "Rain"],
  ["brown", "Brown noise"],
  ["wind", "Soft wind"],
];

export default function SoundControls() {
  const { playing, setSound, volume, setVolume, lastSound } = useFocus();
  const label = OPTIONS.find(([v]) => v === lastSound)?.[1];

  return (
    <div className="glass card">
      <p className="eyebrow">Ambient sound</p>
      <h3 className="h3">Something soft to settle into</h3>
      <div className="row left" role="group" aria-label="Ambient sound">
        {OPTIONS.map(([value, name]) => (
          <button key={value} className="chip" aria-pressed={playing === value} onClick={() => setSound(value)}>
            {name}
          </button>
        ))}
      </div>
      <label className="small muted" htmlFor="vol" style={{ display: "block", marginTop: 20 }}>
        Volume · {Math.round(volume * 100)}%
      </label>
      <input
        id="vol"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
      {playing === "off" && lastSound !== "off" && (
        <p className="small muted" style={{ margin: "8px 0 0" }}>Last time you liked {label}. Tap it to play.</p>
      )}
    </div>
  );
}
