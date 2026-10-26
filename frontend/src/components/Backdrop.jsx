const Leaf = ({ className }) => (
  <svg className={`leaf-ghost ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M50 94 C50 60 52 36 50 8" />
    <path d="M50 8 C20 16 10 48 50 62 C90 48 80 16 50 8Z" />
    <path d="M50 40 C40 38 32 32 28 26 M50 52 C62 50 70 44 74 36" />
  </svg>
);

// Fixed, drifting layers behind the whole app (depth via --speed).
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="blob b1 parallax" style={{ "--speed": -0.1 }} />
      <div className="blob b2 parallax" style={{ "--speed": -0.18 }} />
      <div className="blob b3 parallax" style={{ "--speed": -0.06 }} />
      <div className="parallax" style={{ "--speed": -0.24 }}>
        <Leaf className="l1" />
      </div>
      <div className="parallax" style={{ "--speed": -0.14 }}>
        <Leaf className="l2" />
      </div>
    </div>
  );
}
