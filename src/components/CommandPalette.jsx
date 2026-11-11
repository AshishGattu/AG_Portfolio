import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { scrollToSection, RESUME_URL, OPEN_PALETTE_EVENT } from "../lib/scrollTo";

const SECTIONS = [
  ["hero", "Home"], ["about", "About"], ["projects", "Projects"], ["experience", "Experience"],
  ["case-study", "Case Study"], ["certifications", "Certifications"], ["skills", "Skills"],
  ["education", "Education"], ["activities", "Activities"], ["contact", "Contact"],
];
const EMAIL = "ashishg2204@gmail.com";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    setCopied(false);
  }, []);

  const commands = useMemo(() => [
    ...SECTIONS.map(([id, name]) => ({
      id: `goto-${id}`, label: `goto ${name.toLowerCase()}`, hint: "navigate",
      run: () => scrollToSection(id),
    })),
    {
      id: "resume", label: "download resume", hint: "pdf",
      run: () => {
        const a = document.createElement("a");
        a.href = RESUME_URL; a.download = "Ashish_Gattu_Resume_2026.pdf";
        document.body.appendChild(a); a.click(); a.remove();
      },
    },
    { id: "email", label: "email ashish", hint: EMAIL, run: () => { window.location.href = `mailto:${EMAIL}`; } },
    {
      id: "copy", label: "copy email", hint: EMAIL, keepOpen: true,
      run: async () => {
        try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(close, 900); }
        catch { window.location.href = `mailto:${EMAIL}`; }
      },
    },
    { id: "gh", label: "open github", hint: "external", run: () => window.open("https://github.com/AshishGattu", "_blank", "noopener") },
    { id: "li", label: "open linkedin", hint: "external", run: () => window.open("https://linkedin.com/in/ashish-gattu", "_blank", "noopener") },
    { id: "chat", label: "ask my resume", hint: "chat", run: () => window.dispatchEvent(new Event("open-resume-chat")) },
  ], [close]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const words = q.split(/\s+/);
    return commands.filter((c) => {
      const l = c.label.toLowerCase();
      const lw = l.split(/\s+/);
      return l.includes(q) || words.every((w) => lw.some((x) => x.startsWith(w)));
    });
  }, [query, commands]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    returnFocus.current = document.activeElement;
    inputRef.current?.focus();
    return () => {
      window.__lenis?.start();
      const el = returnFocus.current;
      if (el && el.focus) el.focus();
    };
  }, [open]);

  const scrollActive = (el) => el?.scrollIntoView({ block: "nearest" });

  const run = (c) => {
    if (!c) return;
    c.run();
    if (!c.keepOpen) close();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (results.length ? (a + 1) % results.length : 0)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0)); }
    else if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
    else if (e.key === "Tab") { e.preventDefault(); inputRef.current?.focus(); }
  };

  if (!open) return null;
  const activeId = results[active] ? `cmd-${results[active].id}` : undefined;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-[18vh] px-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl font-mono text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="text-[#ccff00]" aria-hidden="true">&gt;</span>
          <input
            ref={inputRef} value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={activeId}
            aria-label="Type a command" placeholder="type a command…" spellCheck="false" autoComplete="off"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/30"
          />
          <kbd className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <ul id="cmd-list" role="listbox" data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-xs text-white/40">no matching command</li>}
          {results.map((c, i) => (
            <li
              key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i === active}
              onMouseEnter={() => setActive(i)} onClick={() => run(c)}
              ref={i === active ? scrollActive : undefined}
              className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm cursor-pointer ${i === active ? "bg-[#ccff00]/10 text-[#ccff00]" : "text-white/70"}`}
            >
              <span>{c.id === "copy" && copied ? "copied ✓" : c.label}</span>
              <span className="text-[10px] text-white/30">{c.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
