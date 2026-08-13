import { useEffect, useRef, useState } from "react";
import "./akky-orb.css";

export type AkkyOrbState = "idle" | "entering" | "thinking" | "working" | "success" | "error" | "alert" | "sleeping";

type OrbEventDetail = { state: AkkyOrbState; duration?: number };
type Message = { role: "assistant" | "user"; text: string };

export const setAkkyOrbState = (state: AkkyOrbState, duration?: number) =>
  window.dispatchEvent(new CustomEvent<OrbEventDetail>("akky-orb-state", { detail: { state, duration } }));

export default function AkkyOrb() {
  const [state, setState] = useState<AkkyOrbState>(() => sessionStorage.getItem("akky-orb-entered") ? "idle" : "entering");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Hi, I’m Akky. How can I help with AkkyOS today?" }]);
  const idleTimer = useRef<number | undefined>(undefined);
  const reactionTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state === "entering") {
      sessionStorage.setItem("akky-orb-entered", "1");
      reactionTimer.current = window.setTimeout(() => setState("idle"), 1650);
    }
    return () => window.clearTimeout(reactionTimer.current);
  }, []);

  useEffect(() => {
    const react = (event: Event) => {
      const { state: next, duration } = (event as CustomEvent<OrbEventDetail>).detail;
      window.clearTimeout(reactionTimer.current);
      setState(next);
      if (duration) reactionTimer.current = window.setTimeout(() => setState("idle"), duration);
    };
    window.addEventListener("akky-orb-state", react);
    return () => window.removeEventListener("akky-orb-state", react);
  }, []);

  useEffect(() => {
    const resetIdle = () => {
      window.clearTimeout(idleTimer.current);
      setState(current => current === "sleeping" ? "idle" : current);
      idleTimer.current = window.setTimeout(() => setState(current => current === "idle" ? "sleeping" : current), 90000);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach(name => window.addEventListener(name, resetIdle, { passive: true }));
    resetIdle();
    return () => { events.forEach(name => window.removeEventListener(name, resetIdle)); window.clearTimeout(idleTimer.current); };
  }, []);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(current => [...current, { role: "user", text }]);
    setInput("");
    setState("thinking");
    window.setTimeout(() => setState("working"), 650);
    window.setTimeout(() => {
      setMessages(current => [...current, { role: "assistant", text: "I’ve noted that. Akky AI is ready to connect whenever you add a live assistant service." }]);
      setState("success");
      reactionTimer.current = window.setTimeout(() => setState("idle"), 1100);
    }, 1500);
  };

  const toggle = () => {
    setOpen(value => !value);
    if (state === "sleeping") setState("idle");
  };

  return <div className={`akky-orb-system state-${state} ${open ? "panel-open" : ""}`}>
    {open && <section className="akky-assistant" role="dialog" aria-label="Akky AI Assistant">
      <header><div><span className="mini-orb"/><strong>Akky AI</strong><small>AkkyOS Assistant</small></div><button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></header>
      <div className="akky-messages">{messages.map((message, index) => <p className={message.role} key={index}>{message.text}</p>)}</div>
      <div className="akky-suggestions"><button onClick={() => setInput("Show me AkkyOS products")}>Explore products</button><button onClick={() => setInput("I need support")}>Get support</button></div>
      <form onSubmit={send}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask Akky anything…" aria-label="Message Akky"/><button aria-label="Send message">↗</button></form>
      <small className="demo-note">Visual reactions work without an API · Live AI connection optional</small>
    </section>}
    <button className="akky-orb" onClick={toggle} aria-label={`${open ? "Close" : "Open"} Akky AI Assistant`} title="Ask Akky">
      <span className="orb-shadow"/><span className="orb-tail"/>
      <span className="orb-ear left"/><span className="orb-ear right"/>
      <span className="orb-body"><i className="orb-foot left"/><i className="orb-foot right"/></span>
      <span className="orb-aura"/>
      <span className="orb-core"><i className="orb-brow left"/><i className="orb-brow right"/><i className="orb-eye left"/><i className="orb-eye right"/><b/></span>
      <span className="orb-status">{state === "sleeping" ? "zZ" : state === "thinking" ? "···" : state === "working" ? "↻" : state === "success" ? "✓" : state === "error" ? "!" : state === "alert" ? "•" : ""}</span>
    </button>
  </div>;
}
