import { useEffect, useRef, useState } from "react";
import "./akky-orb.css";

export type AkkyOrbState = "idle" | "entering" | "thinking" | "working" | "success" | "error" | "alert" | "sleeping";

type OrbEventDetail = { state: AkkyOrbState; duration?: number };

const MINDPAL_SALES_AI_URL = "https://chatbot.getmindpal.com/akkyos-sales-aai-miw";

export const setAkkyOrbState = (state: AkkyOrbState, duration?: number) =>
  window.dispatchEvent(new CustomEvent<OrbEventDetail>("akky-orb-state", { detail: { state, duration } }));

export default function AkkyOrb() {
  const [state, setState] = useState<AkkyOrbState>(() => sessionStorage.getItem("akky-orb-entered") ? "idle" : "entering");
  const [open, setOpen] = useState(false);
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

  const toggle = () => {
    setOpen(value => !value);
    if (state === "sleeping") setState("idle");
  };

  return <div className={`akky-orb-system state-${state} ${open ? "panel-open" : ""}`}>
    {open && <section className="akky-assistant" role="dialog" aria-modal="false" aria-label="Akkyos Sales AI">
      <header><div><span className="mini-orb"/><strong>Akkyos Sales AI</strong><small>Business assistant</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close Akkyos Sales AI">×</button></header>
      <iframe
        className="akky-mindpal-frame"
        src={MINDPAL_SALES_AI_URL}
        title="Akkyos Sales AI"
        allow="clipboard-read; clipboard-write; microphone"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setState("idle")}
      />
    </section>}
    <button type="button" className="akky-orb" onClick={toggle} aria-expanded={open} aria-label={`${open ? "Close" : "Open"} Akkyos Sales AI`} title="Ask Akkyos Sales AI">
      <span className="orb-shadow"/><span className="orb-tail"/>
      <span className="orb-ear left"/><span className="orb-ear right"/>
      <span className="orb-body"><i className="orb-foot left"/><i className="orb-foot right"/></span>
      <span className="orb-aura"/>
      <span className="orb-core"><i className="orb-brow left"/><i className="orb-brow right"/><i className="orb-eye left"/><i className="orb-eye right"/><b/></span>
      <span className="orb-status">{state === "sleeping" ? "zZ" : state === "thinking" ? "···" : state === "working" ? "↻" : state === "success" ? "✓" : state === "error" ? "!" : state === "alert" ? "•" : ""}</span>
    </button>
  </div>;
}
