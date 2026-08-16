import { useEffect, useState } from "react";
import "./App.css";
import "./marketplace.css";
import AdminLogin from "./components/AdminLogin";
import CustomerPortal from "./components/CustomerPortal";
import LeadManager from "./components/LeadManager";
import EnquiryModal, { type EnquiryKind } from "./components/EnquiryModal";
import AkkyOrb, { setAkkyOrbState } from "./components/AkkyOrb";
import "./lead-manager.css";
import "./enquiry-modal.css";

type Screen = "home" | "products" | "detail" | "services" | "support" | "leads";
type ProductStatus = "Live" | "In Development" | "Coming Soon" | "Custom Solution";

type Product = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  status: ProductStatus;
  description: string;
  audience: string;
  platform: string;
  icon: string;
  image?: string;
  tone: string;
  features: string[];
  priceLabel: string;
};

const products: Product[] = [
  {
    id: "akkyos",
    name: "AkkyOS",
    shortName: "AkkyOS",
    category: "Business Product Platform",
    status: "In Development",
    description: "One secure place to discover, access and manage every AkkyOS business product.",
    audience: "Growing businesses using multiple digital products",
    platform: "Web",
    icon: "A",
    tone: "violet",
    features: ["Unified customer identity", "Product catalogue", "License workspace", "Support access"],
    priceLabel: "Early access",
  },
  {
    id: "recovery-crm",
    name: "Shiv Shakti Recovery CRM V2",
    shortName: "Recovery CRM",
    category: "Recovery Operations",
    status: "Live",
    description: "Field recovery operations for cases, executives, verified visits, GPS, payments and reports.",
    audience: "Recovery agencies and field collection teams",
    platform: "Web + Android",
    icon: "RC",
    image: "/shiv-shakti-app-icon.png",
    tone: "crimson",
    features: [
      "Case command centre",
      "GPS verified field visits",
      "Photo proof with location",
      "Executive mobile workflow",
      "Payment and recovery reports",
      "Secure role-based access",
    ],
    priceLabel: "Get pricing",
  },
  {
    id: "shopuday",
    name: "Shopuday Namkin",
    shortName: "Shopuday",
    category: "Food Commerce",
    status: "In Development",
    description: "A retail and wholesale namkeen storefront with catalogue, cart, checkout and direct customer support.",
    audience: "Namkeen retailers, wholesale buyers and food brands",
    platform: "Web + Android",
    icon: "SN",
    tone: "amber",
    features: ["Retail and wholesale shopping", "Product catalogue and search", "Cart and checkout", "Order tracking", "WhatsApp and Instagram commerce", "Responsive mobile experience"],
    priceLabel: "Early access",
  },
  {
    id: "ai-chatbot",
    name: "AI Chatbot",
    shortName: "AI Chatbot",
    category: "Customer Conversations",
    status: "Coming Soon",
    description: "A planned AI conversation product for business enquiries and customer assistance.",
    audience: "Businesses planning automated customer assistance",
    platform: "Roadmap",
    icon: "AI",
    tone: "cyan",
    features: ["Business knowledge setup", "Lead capture workflow", "Human hand-off", "Conversation insights"],
    priceLabel: "Join waitlist",
  },
  {
    id: "whatsapp-ai",
    name: "WhatsApp AI Automation",
    shortName: "WhatsApp AI",
    category: "Messaging Automation",
    status: "Coming Soon",
    description: "A roadmap product for structured WhatsApp enquiries, follow-ups and business workflows.",
    audience: "Sales and support teams working on WhatsApp",
    platform: "Roadmap",
    icon: "WA",
    tone: "emerald",
    features: ["Enquiry workflows", "Follow-up journeys", "Team hand-off", "Template management"],
    priceLabel: "Join waitlist",
  },
  {
    id: "inventory-billing",
    name: "Inventory & Billing",
    shortName: "Inventory & Billing",
    category: "Business Operations",
    status: "Coming Soon",
    description: "Planned inventory, billing and stock visibility for small and growing businesses.",
    audience: "Retailers, distributors and service businesses",
    platform: "Roadmap",
    icon: "IB",
    tone: "amber",
    features: ["Stock catalogue", "Billing workflow", "Purchase tracking", "Business reports"],
    priceLabel: "Coming soon",
  },
  {
    id: "hr-payroll",
    name: "HR & Payroll",
    shortName: "HR & Payroll",
    category: "People Operations",
    status: "Coming Soon",
    description: "A future workspace for employee records, attendance and payroll operations.",
    audience: "Small and mid-sized teams",
    platform: "Roadmap",
    icon: "HR",
    tone: "indigo",
    features: ["Employee records", "Attendance workflow", "Payroll preparation", "Leave tracking"],
    priceLabel: "Coming soon",
  },
  {
    id: "school-management",
    name: "School Management",
    shortName: "School Management",
    category: "Education Solution",
    status: "Custom Solution",
    description: "A configurable solution concept shaped around an institution's real workflow.",
    audience: "Schools needing a tailored operational system",
    platform: "Custom scope",
    icon: "SM",
    tone: "blue",
    features: ["Requirement discovery", "Student workflow", "Fee operations", "Institution reports"],
    priceLabel: "Custom quote",
  },
  {
    id: "hospital-management",
    name: "Hospital Management",
    shortName: "Hospital Management",
    category: "Healthcare Solution",
    status: "Custom Solution",
    description: "A custom software engagement based on the hospital's approved requirements and scope.",
    audience: "Clinics and hospitals seeking tailored software",
    platform: "Custom scope",
    icon: "HM",
    tone: "teal",
    features: ["Requirement discovery", "Patient workflow", "Operations planning", "Custom reporting"],
    priceLabel: "Custom quote",
  },
];

const services = [
  { icon: "WD", name: "Website Development", copy: "Fast, responsive business websites designed around real customer journeys.", tone: "rose" },
  { icon: "MA", name: "Mobile App Development", copy: "Purpose-built mobile experiences for field teams and customers.", tone: "violet" },
  { icon: "AA", name: "AI Automation", copy: "Practical workflow automation scoped to your business process.", tone: "cyan" },
  { icon: "CS", name: "Cloud & Server Management", copy: "Deployment, monitoring and cloud operations for supported projects.", tone: "blue" },
  { icon: "TS", name: "AMC & Technical Support", copy: "Ongoing maintenance plans that keep business software dependable.", tone: "emerald" },
];

const supportItems = ["Bug fixes", "Security updates", "Software updates", "Server monitoring", "Backup checks", "Technical support", "Performance maintenance"];

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[1]);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCustomerPortal, setShowCustomerPortal] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [enquiry, setEnquiry] = useState<{ kind: EnquiryKind; subject: string; productSlug?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => setFeaturedIndex((current) => (current + 1) % products.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const featured = products[featuredIndex];

  const openProduct = (product: Product) => {
    setAkkyOrbState("working", 750);
    setSelectedProduct(product);
    setScreen("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollHomeSection = (id: string) => {
    setScreen("home");
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  const adminAuthenticated = (name: string) => {
    setAdminName(name);
    setShowAdminLogin(false);
    setScreen("leads");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAkkyOrbState("success", 1100);
  };

  const productCard = (product: Product) => (
    <article className={`catalog-card tone-${product.tone}`} key={product.id}>
      <div className="catalog-card-top">
        <span className="product-mark">
          {product.image ? <img src={product.image} alt="" /> : product.icon}
        </span>
        <span className={`status-badge status-${product.status.toLowerCase().replaceAll(" ", "-")}`}>{product.status}</span>
      </div>
      <p>{product.category}</p>
      <h3>{product.shortName}</h3>
      <small>{product.description}</small>
      <div className="price-tag"><span>PRICING</span><strong>{product.priceLabel}</strong></div>
      <button onClick={() => openProduct(product)}>View product <span>↗</span></button>
    </article>
  );

  return (
    <main className="cosmos marketplace-shell theme-dark">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="noise" />

      {screen !== "leads" && <>
        <button className={`menu-trigger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation"><i /><i /><i /></button>
        <aside className={`premium-nav ${menuOpen ? "open" : ""}`}>
          <div className="premium-nav-brand"><span>A</span><div><strong>AkkyOS</strong><small>BUSINESS OS</small></div></div>
          <nav>
            {([['home','Home','01'],['products','Products','02'],['services','Services','03'],['support','Support','04']] as const).map(([target,label,no]) => <button key={target} className={screen === target || (target === 'products' && screen === 'detail') ? 'active' : ''} onClick={() => { setScreen(target); setMenuOpen(false); }}><i>{no}</i><span>{label}</span><b>→</b></button>)}
          </nav>
          <div className="nav-highlight"><small>FEATURED PRODUCT</small><strong>Recovery CRM V2</strong><span>Live · Web + Android</span><button onClick={() => { openProduct(products[1]); setMenuOpen(false); }}>Explore ↗</button></div>
          <button className="nav-account" onClick={() => { setShowCustomerPortal(true); setMenuOpen(false); }}><span>AK</span><div><strong>My AkkyOS</strong><small>Customer workspace</small></div><b>↗</b></button>
        </aside>
        {menuOpen && <button className="nav-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      </>}

      {screen !== "leads" && <header className="site-header marketplace-header">
        <button className="brand" onClick={() => setScreen("home")} aria-label="AkkyOS home">
          <span className="brand-cube"><i>A</i></span>
          <span><strong>AkkyOS</strong><small>BUSINESS PRODUCT STUDIO</small></span>
        </button>
        <nav aria-label="Primary navigation">
          <button className={screen === "home" ? "active" : ""} onClick={() => setScreen("home")}>Home</button>
          <button className={screen === "products" || screen === "detail" ? "active" : ""} onClick={() => setScreen("products")}>Products</button>
          <button className={screen === "services" ? "active" : ""} onClick={() => setScreen("services")}>Services</button>
          <button className={screen === "support" ? "active" : ""} onClick={() => setScreen("support")}>Support</button>
        </nav>
        <button className="login-pill" onClick={() => adminName ? setScreen("leads") : setShowCustomerPortal(true)}>
          <span /> {adminName ? "Lead Console" : "My AkkyOS"}
        </button>
      </header>}

      {screen === "leads" && adminName && <LeadManager onClose={() => setScreen("home")} />}

      {screen === "home" && (
        <>
          <section className="market-hero">
            <div className="market-hero-copy">
              <p className="eyebrow"><span /> BUILT IN INDIA · BUILT FOR BUSINESS</p>
              <h1>One studio.<br /><em>Many business products.</em></h1>
              <p>AkkyOS creates focused software products and custom digital solutions—clearly labelled, honestly presented and built around real operations.</p>
              <div className="hero-actions">
                <button className="primary-cta" onClick={() => scrollHomeSection("our-products")}>Explore products <span>↗</span></button>
                <button className="secondary-cta" onClick={() => setScreen("services")}>Our services</button>
              </div>
              <div className="hero-proof"><span><b>01</b> Live product</span><span><b>08</b> Product concepts</span><span><b>05</b> Services</span></div>
            </div>
            <div className={`featured-product rotating-feature tone-${featured.tone}`} key={featured.id}>
              <div className="featured-label"><span>PRODUCT SHOWCASE · {featured.status.toUpperCase()}</span><i>{String(featuredIndex + 1).padStart(2, "0")}</i></div>
              <div className="featured-icon">{featured.image ? <img src={featured.image} alt={featured.name} /> : <strong>{featured.icon}</strong>}</div>
              <p>{featured.category}</p>
              <h2>{featured.shortName}</h2>
              <small>{featured.description}</small>
              <div className="feature-dots">{products.map((product, index) => <button className={index === featuredIndex ? "active" : ""} onClick={() => setFeaturedIndex(index)} aria-label={`Show ${product.name}`} key={product.id} />)}</div>
              <button onClick={() => openProduct(featured)}>Explore product <span>↗</span></button>
            </div>
          </section>

          <section className="home-products" id="our-products">
            <div className={`home-product-detail tone-${featured.tone}`} key={`detail-${featured.id}`}>
              <div className="home-detail-copy">
                <div className="detail-meta"><span>{featured.category}</span><b className={`status-badge status-${featured.status.toLowerCase().replaceAll(" ", "-")}`}>{featured.status}</b></div>
                <h2>{featured.name}</h2>
                <p>{featured.description}</p>
                <div className="home-feature-list">{featured.features.map((feature, index) => <span key={feature}><i>{String(index + 1).padStart(2, "0")}</i>{feature}</span>)}</div>
              </div>
              <aside className="home-price-card">
                <small>PRICE & ACCESS</small>
                <strong>{featured.priceLabel}</strong>
                <p>{featured.status === "Live" ? "Final plan depends on users, access and support coverage." : featured.status === "Custom Solution" ? "Final price is shared after requirement and scope approval." : "Register your interest to receive availability updates."}</p>
                <button className="primary-cta" onClick={() => setEnquiry({ kind: featured.status === "Live" ? "demo" : "quote", subject: featured.name, productSlug: featured.id })}>{featured.status === "Live" ? "Request demo" : featured.status === "Coming Soon" ? "Join waitlist" : "Get quote"}<span>↗</span></button>
                <button className="detail-link" onClick={() => openProduct(featured)}>View complete details <span>→</span></button>
              </aside>
            </div>
          </section>
        </>
      )}

      {screen === "products" && (
        <section className="catalog-page page-frame">
          <div className="page-intro"><p>PRODUCT CATALOGUE</p><h1>Tools for real business operations.</h1><span>Live products, active development and future concepts are clearly separated.</span></div>
          <div className="product-section"><div className="product-section-title"><span>01</span><div><p>AVAILABLE NOW</p><h2>Live & active products</h2></div></div><div className="catalog-grid catalog-grid-page">{products.filter((product) => product.status === "Live" || product.status === "In Development").map(productCard)}</div></div>
          <div className="product-section"><div className="product-section-title"><span>02</span><div><p>NEXT FROM AKKYOS</p><h2>Upcoming products</h2></div></div><div className="catalog-grid catalog-grid-page">{products.filter((product) => product.status === "Coming Soon").map(productCard)}</div></div>
          <div className="product-section"><div className="product-section-title"><span>03</span><div><p>BUILT AROUND YOUR BUSINESS</p><h2>Custom solutions</h2></div></div><div className="catalog-grid catalog-grid-page">{products.filter((product) => product.status === "Custom Solution").map(productCard)}</div></div>
        </section>
      )}

      {screen === "detail" && (
        <section className={`detail-page page-frame tone-${selectedProduct.tone}`}>
          <button className="back-button catalog-back" onClick={() => setScreen("products")}><span>←</span> Product catalogue</button>
          <div className="detail-hero">
            <div className="detail-mark">{selectedProduct.image ? <img src={selectedProduct.image} alt="" /> : selectedProduct.icon}</div>
            <div className="detail-copy">
              <div className="detail-meta"><span>{selectedProduct.category}</span><b className={`status-badge status-${selectedProduct.status.toLowerCase().replaceAll(" ", "-")}`}>{selectedProduct.status}</b></div>
              <h1>{selectedProduct.name}</h1>
              <p>{selectedProduct.description}</p>
              <div className="detail-actions">
                <button className="primary-cta" onClick={() => setEnquiry({ kind: selectedProduct.status === "Live" ? "demo" : "quote", subject: selectedProduct.name, productSlug: selectedProduct.id })}>{selectedProduct.status === "Live" ? "Request demo" : "Discuss requirement"}<span>↗</span></button>
                <button className="secondary-cta" onClick={() => setShowCustomerPortal(true)}>My AkkyOS</button>
              </div>
            </div>
          </div>
          <div className="detail-content">
            <article><p>OVERVIEW</p><h2>Built with a clear purpose.</h2><span>{selectedProduct.description}</span></article>
            <article><p>WHO IT'S FOR</p><h2>{selectedProduct.audience}</h2><span>Final scope and availability are confirmed before any purchase or implementation.</span></article>
            <article className="feature-panel"><p>{selectedProduct.status === "Live" ? "AVAILABLE FEATURES" : "PLANNED / PROPOSED SCOPE"}</p><div>{selectedProduct.features.map((feature, index) => <span key={feature}><i>{String(index + 1).padStart(2, "0")}</i>{feature}</span>)}</div></article>
            <article><p>PLATFORM</p><h2>{selectedProduct.platform}</h2><span>{selectedProduct.status === "Live" ? "Demo access is available on request." : "Availability depends on roadmap or an approved custom scope."}</span></article>
          </div>
          <div className="detail-cta"><div><p>PRICING & ACCESS</p><h2>{selectedProduct.status === "Live" ? "Get the right plan for your team." : "Tell us what you need."}</h2></div><button className="primary-cta" onClick={() => setEnquiry({ kind: "quote", subject: selectedProduct.name, productSlug: selectedProduct.id })}>Get quote <span>↗</span></button></div>
        </section>
      )}

      {screen === "services" && (
        <section className="services-page page-frame">
          <div className="page-intro"><p>AKKYOS SERVICES</p><h1>Custom engineering, without vague promises.</h1><span>We understand the workflow first, define the scope and then build the right solution.</span></div>
          <div className="services-grid">{services.map((service, index) => <article className={`tone-${service.tone}`} key={service.name}><span>{service.icon}</span><i>{String(index + 1).padStart(2, "0")}</i><h2>{service.name}</h2><p>{service.copy}</p><button onClick={() => setEnquiry({ kind: "project", subject: service.name })}>Discuss project <b>↗</b></button></article>)}</div>
        </section>
      )}

      {screen === "support" && (
        <section className="support-page page-frame">
          <div className="page-intro"><p>AKKYOS CARE</p><h1>Support that protects the work.</h1><span>Support coverage is based on the selected plan and supported product or project.</span></div>
          <div className="support-layout"><div className="support-list">{supportItems.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><h2>{item}</h2><i>Included as per plan</i></article>)}</div><aside><p>AMC & TECHNICAL SUPPORT</p><h2>Choose coverage that matches your operations.</h2><span>We will publish plan pricing only after response times and exact coverage are finalised.</span><button className="primary-cta" onClick={() => setEnquiry({ kind: "support", subject: "AMC & Technical Support" })}>Request support quote <b>↗</b></button></aside></div>
        </section>
      )}

      <footer className="market-footer"><button className="brand" onClick={() => setScreen("home")}><span className="brand-cube"><i>A</i></span><span><strong>AkkyOS</strong><small>SOFTWARE THAT WORKS FOR BUSINESS</small></span></button><p>Products · Services · Support</p><span>© 2026 AKKYOS.IN</span></footer>

      {showAdminLogin && <AdminLogin onClose={() => setShowAdminLogin(false)} onAdminAuthenticated={adminAuthenticated} />}
      {showCustomerPortal && <CustomerPortal onClose={() => setShowCustomerPortal(false)} onAdminAccess={() => { setShowCustomerPortal(false); setShowAdminLogin(true); }} />}
      {enquiry && <EnquiryModal {...enquiry} onClose={() => setEnquiry(null)} />}
      <AkkyOrb />
    </main>
  );
}

export default App;
