import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container page-head" style={{ textAlign: "center", paddingTop: 110 }}>
      <div className="parallax" style={{ "--speed": 0.08 }}>
        <p className="eyebrow">Feeling a little lost?</p>
        <h1 className="display">
          That page <em>wandered off.</em>
        </h1>
        <p className="lead" style={{ margin: "22px auto 32px" }}>No harm done. Let's head back somewhere calm.</p>
        <Link to="/" className="btn btn-primary">Take me home</Link>
      </div>
    </section>
  );
}
