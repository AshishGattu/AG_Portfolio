import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";

// All data below is fictional.
const FIELDS = [
  { key: "named_insured", label: "Named Insured", value: "Northwind Freight Co.", json: "Northwind Freight Co.", conf: 0.98 },
  { key: "policy_no", label: "Policy No.", value: "NWF-2026-04417", json: "NWF-2026-04417", conf: 0.99 },
  { key: "effective_date", label: "Effective Date", value: "01 / 01 / 2026", json: "2026-01-01", conf: 0.97 },
  { key: "expiration_date", label: "Expiration Date", value: "01 / 01 / 2027", json: "2027-01-01", conf: 0.97 },
  { key: "property_address", label: "Property Address", value: "42 Harbor Rd, Springfield", json: "42 Harbor Rd, Springfield", conf: 0.94 },
  { key: "construction_type", label: "Construction Type", value: "Masonry Non-Combustible", json: "masonry_non_combustible", conf: 0.91 },
  { key: "building_limit", label: "Building Limit", value: "$850,000", json: 850000, conf: 0.96 },
  { key: "contents_limit", label: "Contents Limit", value: "$120,000", json: 120000, conf: 0.95 },
  { key: "deductible", label: "Deductible", value: "$10,000", json: 10000, conf: 0.98 },
];

// JSON lines; `n` = number of mapped fields needed before the line shows.
const LINES = [
  { t: "{", n: 0 },
  { i: 1, k: "form_type", v: "commercial_property_application", n: 0, c: "," },
  ...FIELDS.slice(0, 6).map((f, idx) => ({ i: 1, k: f.key, v: f.json, n: idx + 1, c: "," })),
  { i: 1, k: "limits", open: true, n: 7 },
  { i: 2, k: "building", v: FIELDS[6].json, n: 7, c: "," },
  { i: 2, k: "contents", v: FIELDS[7].json, n: 8 },
  { i: 1, t: "},", n: 8 },
  { i: 1, k: "deductible", v: FIELDS[8].json, n: 9 },
  { t: "}", n: 9 },
];

const STAGES = [
  { id: "INGEST", title: "INGEST" },
  { id: "EXTRACT", title: "AZURE AI DOCUMENT INTELLIGENCE" },
  { id: "MAP", title: "GPT-5 MINI → SCHEMA" },
  { id: "ASK", title: "ASK THE DOCUMENT" },
];
const ROWS = Math.ceil(FIELDS.length / 2);

const Val = ({ v }) =>
  typeof v === "number" ? (
    <span className="text-sky-300/70">{v}</span>
  ) : (
    <span className="text-[#ccff00]">"{v}"</span>
  );

function JsonLine({ l }) {
  const pad = { paddingLeft: `${(l.i || 0) * 1.1}rem` };
  if (l.t) return <div style={pad} className="text-white/60">{l.t}</div>;
  return (
    <div style={pad} className="whitespace-nowrap">
      <span className="text-white">"{l.k}"</span>
      <span className="text-white/50">: </span>
      {l.open ? <span className="text-white/60">{"{"}</span> : <Val v={l.v} />}
      <span className="text-white/50">{l.c}</span>
    </div>
  );
}

function Stage({ stage, scanRows, scanY, mapped, docStyle }) {
  const scanning = stage === 1;
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center w-full">
      {/* Paper */}
      <motion.div style={docStyle} className="relative">
        <div className="absolute -top-3 left-2 z-20 flex gap-2 font-mono text-[10px]">
          {["HTTP", "EMAIL"].map((c) => (
            <span
              key={c}
              className={`px-2 py-0.5 rounded-full border bg-black/80 transition-colors ${
                stage === 0 ? "border-[#ccff00] text-[#ccff00] animate-pulse" : "border-white/20 text-white/50"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="relative rotate-[-2deg] bg-[#f4f4f0] text-neutral-800 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-5 md:p-6">
          <div className="flex justify-between items-baseline border-b border-neutral-400 pb-2 mb-4">
            <div className="font-serif font-bold text-sm md:text-base tracking-wide uppercase">Commercial Property Application</div>
            <div className="font-mono text-[9px] text-neutral-500">FORM CP-01 / PG 1 of 2</div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {FIELDS.map((f, i) => {
                const seen = stage >= 2 || (scanning && Math.floor(i / 2) < scanRows);
                const isMapped = i < mapped;
                return (
                  <div key={f.key} className={`relative px-1.5 py-1 ${i === 4 ? "col-span-2" : ""}`}>
                    <div className="font-mono text-[8px] uppercase tracking-wider text-neutral-500">{f.label}</div>
                    <div className={`font-serif text-xs md:text-sm transition-colors duration-300 ${isMapped ? "bg-[#ccff00]/60" : ""}`}>{f.value}</div>
                    {seen && (
                      <>
                        <span className="absolute inset-0 border border-[#8fb300] bg-[#ccff00]/10 rounded-[2px]" />
                        <span className="absolute -top-2 right-0 bg-black text-[#ccff00] font-mono text-[8px] px-1 rounded-sm leading-4">
                          {f.key} {f.conf.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {scanning && (
              <motion.div
                style={{ top: scanY }}
                className="absolute left-[-8px] right-[-8px] h-0.5 bg-[#ccff00] shadow-[0_0_14px_2px_#ccff00] pointer-events-none"
              />
            )}
          </div>
          <div className="mt-5 pt-2 border-t border-dashed border-neutral-400 font-mono text-[8px] text-neutral-400">
            Scanned copy — signature on file
          </div>
        </div>
      </motion.div>

      {/* Code + chat */}
      <div className="flex flex-col gap-3 min-w-0">
        <div className="rounded-2xl bg-[#0a0a0a] overflow-x-auto border border-white/10 p-4 font-mono text-[11px] md:text-xs leading-relaxed min-h-[18rem]">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="ml-2 text-white/30 text-[10px]">extraction.json</span>
          </div>
          {LINES.map((l, idx) =>
            stage >= 2 && mapped >= l.n ? (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                <JsonLine l={l} />
              </motion.div>
            ) : (
              <div key={idx} className="h-[1.45em]" />
            )
          )}
        </div>
        <AnimatePresence>
          {stage === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-3 text-sm space-y-2"
            >
              <div className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-[#ccff00] text-black px-3 py-1.5 font-medium">
                What's the building deductible?
              </div>
              <div className="w-fit max-w-[90%] rounded-xl rounded-bl-sm bg-white/10 text-gray-200 px-3 py-1.5">
                $10,000 — from the Deductible field.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Rail({ stage }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 font-mono text-[10px] md:text-xs">
      {STAGES.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`flex items-center gap-2 transition-colors ${i <= stage ? "text-[#ccff00]" : "text-white/30"}`}>
            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] ${i === stage ? "bg-[#ccff00] text-black border-[#ccff00]" : i < stage ? "border-[#ccff00]" : "border-white/20"}`}>
              {i + 1}
            </span>
            <span className="hidden sm:inline tracking-widest">{s.id}</span>
          </div>
          {i < STAGES.length - 1 && <span className={`h-px w-4 md:w-10 ${i < stage ? "bg-[#ccff00]" : "bg-white/15"}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CaseStudy() {
  const ref = useRef(null);
  const [desktop, setDesktop] = useState(false);
  const [stage, setStage] = useState(0);
  const [scanRows, setScanRows] = useState(0);
  const [mapped, setMapped] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scanProg = useTransform(scrollYProgress, [0.25, 0.5], [0, 1], { clamp: true });
  const scanY = useTransform(scanProg, (v) => `${v * 100}%`);
  const docX = useTransform(scrollYProgress, [0, 0.1], [-120, 0]);
  const docOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const docStyle = desktop ? { x: docX, opacity: docOpacity } : {};

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!desktop) return;
    const s = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    setStage(s);
    const sp = Math.min(1, Math.max(0, (p - 0.25) / 0.25));
    setScanRows(Math.min(ROWS, Math.round(sp * ROWS + 0.4)));
    const mp = Math.min(1, Math.max(0, (p - 0.5) / 0.22));
    setMapped(p < 0.5 ? 0 : Math.min(FIELDS.length, Math.ceil(mp * FIELDS.length)));
  });

  // Mobile: static final state.
  const view = desktop
    ? { stage, scanRows, mapped }
    : { stage: 3, scanRows: ROWS, mapped: FIELDS.length };

  return (
    <section ref={ref} className="relative md:h-[300vh] py-20 md:py-0 overflow-x-clip">
      <div className="md:sticky md:top-0 md:h-screen flex flex-col justify-center px-6 md:px-20 md:pt-20 max-w-7xl mx-auto gap-5 md:gap-6">
        <div>
          <p className="font-mono text-xs text-[#ccff00] tracking-widest mb-2">CASE STUDY // MAAZE UNDERWRITING SOLUTIONS</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            DOCUMENT{" "}
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #ccff00" }}>
              → JSON
            </span>
          </h2>
          <p className="text-gray-400 mt-3 text-sm md:text-base">Varied-layout insurance forms in, schema-aligned JSON out.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Rail stage={view.stage} />
          <p className="font-mono text-[11px] text-white/50 tracking-widest h-4">{STAGES[view.stage].title}</p>
        </div>

        <Stage {...view} scanY={scanY} docStyle={docStyle} />

        <p className="font-mono text-[10px] text-white/30">Illustrative data. Real client documents are confidential.</p>
      </div>
    </section>
  );
}
