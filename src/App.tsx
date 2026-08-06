import { useState, type CSSProperties, type PointerEvent } from "react";
import "./App.css";

type Screen = "universe" | "product";

const product = {
  name: "Shiv Shakti Recovery CRM V2",
  shortName: "Shiv Shakti V2",
  category: "Recovery Operations",
  description:
    "A complete field recovery command system for cases, executives, verified visits, live GPS, payments and reports.",
  features: [
    "Case command center",
    "GPS verified field visits",
    "Photo proof with location",
    "Executive mobile workflow",
    "Payment and recovery reports",
    "Secure role-based access",
  ],
};

function App() {
  const [screen, setScreen] = useState<Screen>("universe");
  const [notice, setNotice] = useState("");

  const tiltProduct = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--rx", `${-y * 13}deg`);
    event.currentTarget.style.setProperty("--ry", `${x * 17}deg`);
    event.currentTarget.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const resetTilt = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  };

  const requestAccess = () => {
    setNotice("Request access form payment setup ke saath next module me connect hoga.");
    window.setTimeout(() => setNotice(""), 4000);
  };

  return (
    <main className={`cosmos ${screen === "product" ? "product-is-open" : ""}`}>
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="noise" />

      <header className="site-header">
        <button className="brand" onClick={() => setScreen("universe")} aria-label="AkkyOS home">
          <span className="brand-cube"><i>A</i></span>
          <span><strong>AkkyOS</strong><small>PRODUCT UNIVERSE</small></span>
        </button>
        <nav aria-label="Primary navigation">
          <button className="active" onClick={() => setScreen("universe")}>Universe</button>
          <button onClick={() => setScreen("product")}>Products</button>
          <button onClick={() => setNotice("Customer portal next module me activate hoga.")}>My AkkyOS</button>
        </nav>
        <button className="login-pill" onClick={() => setNotice("Secure login next module me connect hoga.")}>
          <span /> Sign in
        </button>
      </header>

      {screen === "universe" ? (
        <section className="universe-screen">
          <div className="hero-copy">
            <p className="eyebrow"><span /> INDIA'S PRODUCT OPERATING SYSTEM</p>
            <h1>
              <span className="hero-name">AKKYOS</span>
              <small>Software that feels <em>alive.</em></small>
            </h1>
            <p className="hero-description">
              Discover powerful business products built inside one intelligent universe. Enter a product, explore its world and choose what moves your business forward.
            </p>
            <div className="hero-actions">
              <button className="primary-cta" onClick={() => setScreen("product")}>Explore first product <span>↗</span></button>
              <span className="release-note"><i /> 01 product live</span>
            </div>
          </div>

          <div className="product-stage">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="orbit orbit-c" />
            <span className="satellite satellite-a" />
            <span className="satellite satellite-b" />
            <button
              className="product-object"
              onPointerMove={tiltProduct}
              onPointerLeave={resetTilt}
              onClick={() => setScreen("product")}
              style={{ "--rx": "0deg", "--ry": "0deg", "--mx": "50%", "--my": "50%" } as CSSProperties}
            >
              <span className="object-glow" />
              <span className="product-glass">
                <span className="product-index">PRODUCT / 001</span>
                <img src="/shiv-shakti-app-icon.png" alt="Shiv Shakti Recovery CRM" />
                <span className="product-type">{product.category}</span>
                <strong>{product.shortName}</strong>
                <span className="enter-label">ENTER PRODUCT <i>↗</i></span>
              </span>
            </button>
            <p className="drag-hint"><span>↔</span> Move over the product</p>
          </div>

          <div className="universe-footer">
            <span>AKKYOS.IN</span>
            <p>One account. Every product. Infinite possibility.</p>
            <span>EST. 2026</span>
          </div>
        </section>
      ) : (
        <section className="product-screen">
          <button className="back-button" onClick={() => setScreen("universe")}><span>←</span> Back to universe</button>
          <div className="product-visual">
            <div className="visual-halo" />
            <div className="visual-ring ring-one" />
            <div className="visual-ring ring-two" />
            <div className="app-icon-shell"><img src="/shiv-shakti-app-icon.png" alt="Shiv Shakti Recovery CRM V2" /></div>
            <span className="visual-chip chip-one">GPS LIVE</span>
            <span className="visual-chip chip-two">FIELD PROOF</span>
            <span className="visual-chip chip-three">SECURE CRM</span>
          </div>
          <div className="product-story">
            <p className="eyebrow"><span /> AKKYOS ORIGINAL · PRODUCT 001</p>
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <div className="feature-grid">
              {product.features.map((feature, index) => (
                <article key={feature}><span>{String(index + 1).padStart(2, "0")}</span><strong>{feature}</strong></article>
              ))}
            </div>
            <div className="product-actions">
              <button className="primary-cta" onClick={requestAccess}>Request access <span>↗</span></button>
              <div><small>Platform</small><strong>Web + Android</strong></div>
              <div><small>Status</small><strong><i /> Production ready</strong></div>
            </div>
          </div>
        </section>
      )}

      {notice && <div className="toast" role="status"><span>AK</span>{notice}</div>}
    </main>
  );
}

export default App;
