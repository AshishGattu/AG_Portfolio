import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaCommentDots, FaTimes } from "react-icons/fa";
import { respond, defaultSuggestions } from "../lib/intents.js";

// Inline markdown-ish: **bold**, [text](url), emails, github/linkedin links. Built as React elements (no raw HTML).
const INLINE = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|([\w.+-]+@[\w-]+\.[\w.]+)|((?:github\.com|linkedin\.com)\/[\w\-./]+)/g;
const safeHref = (h) => (/^(\/[\w\-./]*|https:\/\/[^\s]+|mailto:[^\s]+)$/.test(h) ? h : null);
const linkCls = "text-[#ccff00] underline underline-offset-2 break-all";

function renderInline(text, keyBase) {
  const out = [];
  let last = 0, n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${n++}`;
    if (m[1]) out.push(<strong key={k} className="text-white font-semibold">{m[1].slice(2, -2)}</strong>);
    else if (m[2]) {
      const [, label, href] = m[2].match(/\[([^\]]+)\]\(([^)]+)\)/);
      const h = safeHref(href);
      out.push(h ? <a key={k} href={h} target={h.startsWith("/") ? "_blank" : undefined} rel="noreferrer" className={linkCls}>{label}</a> : label);
    } else if (m[3]) out.push(<a key={k} href={`mailto:${m[3]}`} className={linkCls}>{m[3]}</a>);
    else out.push(<a key={k} href={`https://${m[4]}`} target="_blank" rel="noreferrer" className={linkCls}>{m[4]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text }) {
  const blocks = [];
  let list = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`u${blocks.length}`} className="list-disc pl-4 space-y-1 my-1">{list}</ul>);
    list = [];
  };
  text.split("\n").forEach((line, i) => {
    if (line.startsWith("- ")) list.push(<li key={i}>{renderInline(line.slice(2), `l${i}`)}</li>);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={i} className="my-1">{renderInline(line, `p${i}`)}</p>);
    }
  });
  flush();
  return <>{blocks}</>;
}

export default function ResumeChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [chips, setChips] = useState(() => defaultSuggestions(4, 0));
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const timer = useRef(null);
  const ctx = useRef({}); // lightweight conversation context (last intent/entities)

  const close = useCallback(() => {
    setOpen(false);
    btnRef.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-resume-chat", onOpen);
    return () => window.removeEventListener("open-resume-chat", onOpen);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const ask = (q) => {
    const text = q.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      const a = respond(text, ctx.current);
      ctx.current = a.state;
      setMsgs((m) => [...m, { from: "bot", text: a.text, sources: a.sources }]);
      setChips(a.suggestions.length ? a.suggestions : defaultSuggestions(3, a.state.turn));
      setTyping(false);
    }, 400);
  };

  return (
    <>
      <button
        ref={btnRef} onClick={() => (open ? close() : setOpen(true))} aria-label="Ask about Ashish" aria-expanded={open}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full border-2 border-[#ccff00] text-[#ccff00] bg-black/70 backdrop-blur flex items-center justify-center hover:bg-[#ccff00] hover:text-black transition-colors"
      >
        <FaCommentDots />
      </button>
      {open && (
        <div
          role="dialog" aria-label="Ask my resume" data-lenis-prevent onKeyDown={(e) => e.key === "Escape" && close()}
          className="fixed z-40 left-6 bottom-24 w-[min(380px,calc(100vw-2rem))] max-h-[70vh] max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-sm:max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] flex flex-col bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-white"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-start gap-3 shrink-0">
            <div>
              <h3 className="font-black tracking-tighter text-lg">ASK MY RESUME</h3>
              <p className="font-mono text-[10px] text-white/40 mt-1">Answers come straight from my resume — runs in your browser, no AI service.</p>
            </div>
            <button onClick={close} aria-label="Close chat" className="text-white/40 hover:text-white mt-1"><FaTimes /></button>
          </div>
          <div ref={listRef} data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 text-sm" aria-live="polite">
            {msgs.map((m, i) =>
              m.from === "me" ? (
                <div key={i} className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-[#ccff00] text-black px-3 py-1.5 font-medium break-words">{m.text}</div>
              ) : (
                <div key={i} className="max-w-[92%] rounded-xl rounded-bl-sm bg-white/10 text-gray-200 px-3 py-2 break-words">
                  <Rich text={m.text} />
                  {m.sources?.length > 0 && <div className="mt-2 font-mono text-[10px] text-[#ccff00]/80">source: {m.sources.join(" + ")}</div>}
                </div>
              )
            )}
            {typing && (
              <div className="w-fit rounded-xl bg-white/10 px-3 py-2 flex gap-1" aria-label="Typing">
                {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: `${d * 150}ms` }} />)}
              </div>
            )}
            {!typing && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-300 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="p-3 border-t border-white/10 flex gap-2 shrink-0">
            <input
              ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Your question" placeholder="Ask a question…"
              className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-[#ccff00]/50 placeholder:text-white/30"
            />
            <button type="submit" className="px-3 rounded-lg bg-[#ccff00] text-black text-xs font-bold font-mono">SEND</button>
          </form>
        </div>
      )}
    </>
  );
}
