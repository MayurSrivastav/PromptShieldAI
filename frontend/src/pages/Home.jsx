import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldCheck, ShieldAlert, Sparkles, Zap,
  BrainCircuit, Lock, ArrowRight, ListFilter, Database, Webhook,
} from "lucide-react";
import { scanPrompt } from "../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 1) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

function CircuitBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0b0a08]">
      <motion.div
        animate={{ x: [0, 120, 0], y: [0, -80, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute top-16 left-10 h-[440px] w-[440px] rounded-full bg-amber-500/[0.06] blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, -130, 0], y: [0, 110, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        className="absolute bottom-10 right-10 h-[420px] w-[420px] rounded-full bg-amber-700/[0.05] blur-[140px]"
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
        <defs>
          <pattern id="circuit" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 H40 M80 60 H120 M60 0 V40 M60 80 V120" stroke="#d4a843" strokeWidth="1" fill="none" />
            <circle cx="60" cy="60" r="3" fill="#d4a843" />
            <circle cx="0" cy="60" r="2" fill="#d4a843" opacity="0.6" />
            <circle cx="120" cy="60" r="2" fill="#d4a843" opacity="0.6" />
            <circle cx="60" cy="0" r="2" fill="#d4a843" opacity="0.6" />
            <circle cx="60" cy="120" r="2" fill="#d4a843" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>

      {[15, 45, 75].map((top, i) => (
        <motion.div
          key={i}
          className="absolute h-px"
          style={{
            top: `${top}%`, left: 0, width: "40%",
            background: "linear-gradient(90deg, transparent, #d4a843aa, transparent)",
          }}
          animate={{ x: ["-40%", "140%"] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.5))]" />
    </div>
  );
}

function RadarScanner({ scanning, result }) {
  const score = result?.toxicityScore ?? 0;
  const blocked = result?.action === "BLOCKED";
  const color = !result ? "#d4a843" : blocked ? "#e8615f" : "#4caf7d";

  return (
    <div style={{ position: "relative", width: 176, height: 176, margin: "0 auto" }}>
      {[1, 0.72, 0.44].map((r, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: `${r * 100}%`, height: `${r * 100}%`,
            top: `${(1 - r) * 50}%`, left: `${(1 - r) * 50}%`,
            borderRadius: "50%",
            border: `1px solid ${color}55`,
          }}
        />
      ))}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: scanning ? 1.4 : 6, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${color}${scanning ? "70" : "30"}, transparent 30%)`,
        }}
      />

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 68, height: 68, marginTop: -34, marginLeft: -34,
        borderRadius: "50%",
        background: "linear-gradient(150deg, #2a2520, #161310)",
        border: `1.5px solid ${color}88`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 30px ${color}33, inset 0 1px 1px #ffffff10, inset 0 -6px 14px #00000077`,
      }}>
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="idle" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Shield size={28} color={color} strokeWidth={1.6} />
            </motion.div>
          ) : blocked ? (
            <motion.div key="blocked" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <ShieldAlert size={28} color={color} strokeWidth={1.6} />
            </motion.div>
          ) : (
            <motion.div key="allowed" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <ShieldCheck size={28} color={color} strokeWidth={1.6} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: `${50 - Math.sin(score * 6) * 38}%`,
            left: `${50 + Math.cos(score * 6) * 38}%`,
            width: 12, height: 12, marginTop: -6, marginLeft: -6,
            borderRadius: "50%", background: color,
            boxShadow: `0 0 16px 5px ${color}99`,
          }}
        />
      )}
    </div>
  );
}

function ScoreDial({ score }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? "#e8615f" : score >= 0.4 ? "#d4a843" : "#4caf7d";
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0 }}>
      <svg width="132" height="132" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="66" cy="66" r={r} fill="none" stroke="#ffffff12" strokeWidth="10" />
        <motion.circle
          cx="66" cy="66" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}cc)` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 30, fontWeight: 700, color, fontFamily: "Georgia, serif" }}>{pct}</span>
        <span style={{ fontSize: 10, letterSpacing: 2, color: "#ffffff66", marginTop: -2 }}>PERCENT</span>
      </div>
    </div>
  );
}

function PipelineSteps() {
  const steps = [
    { n: "01", icon: <ListFilter size={22} />, title: "Rule engine check", desc: "The prompt is checked against a configurable list of banned keywords first. A match blocks it instantly — no AI call needed." },
    { n: "02", icon: <BrainCircuit size={22} />, title: "AI toxicity scoring", desc: "If it clears the rule engine, an AI model scores it from 0 to 1. Anything above the threshold is blocked." },
    { n: "03", icon: <Database size={22} />, title: "Logged to PostgreSQL", desc: "Every scan — blocked or allowed — is saved with its score, reason, and timestamp for full auditability." },
    { n: "04", icon: <Webhook size={22} />, title: "Decision returned", desc: "The verdict, score, and reason are sent back instantly so the calling app can act on it." },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {steps.map((s, i) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-6"
        >
          <span className="text-xs font-mono text-amber-300/50">{s.n}</span>
          <div className="mt-3 h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-300">
            {s.icon}
          </div>
          <h4 className="mt-4 font-semibold text-[15px]">{s.title}</h4>
          <p className="mt-2 text-sm text-white/45 leading-relaxed">{s.desc}</p>
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 -right-2.5 text-amber-400/30">→</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await scanPrompt(prompt);
      setTimeout(() => { setResult(data); setLoading(false); }, 1200);
    } catch (err) {
      setError("Connection lost — make sure the Spring Boot backend is running.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleScan(); }
  };

  const stats = [
    { value: "2-layer", title: "Detection engine" },
    { value: "<2s", title: "Average scan time" },
    { value: "7", title: "REST API endpoints" },
    { value: "0", title: "Toxic prompts allowed" },
  ];

  const features = [
    { icon: <Shield size={30} />, title: "Rule engine", desc: "Custom keyword matching catches known attack patterns instantly, before any AI call is made." },
    { icon: <BrainCircuit size={30} />, title: "AI moderation", desc: "Every prompt that passes the rule engine is scored for toxicity by a language model." },
    { icon: <Lock size={30} />, title: "Two-step verification", desc: "Nothing reaches a downstream LLM until both detection layers agree it's safe." },
    { icon: <Zap size={30} />, title: "Real-time scoring", desc: "Scores return as a 0 to 1 toxicity score, displayed instantly in the dashboard." },
    { icon: <ShieldAlert size={30} />, title: "Full audit trail", desc: "Every scan — blocked or allowed — is logged to PostgreSQL with reason and timestamp." },
    { icon: <Sparkles size={30} />, title: "Configurable rules", desc: "Add, disable, or remove keyword rules live from the Rules dashboard, no redeploy needed." },
  ];

  return (
    <div className="min-h-screen text-white">
      <CircuitBackground />

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/[0.07] px-4 py-1.5 text-amber-300/90 text-sm">
          <Sparkles size={14} />
          Two-layer AI prompt firewall
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={2}
  className="mt-7 text-5xl md:text-6xl font-black leading-[1.2] tracking-tight">
          Every prompt meets
          <span className="block bg-gradient-to-r from-amber-300 via-white to-amber-200 bg-clip-text text-transparent pb-4">
  a guard, first.
</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="mt-6 text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
          PromptShield is a security middleware that sits between a user and any
          large language model. Every prompt is screened by a custom rule engine
          and an AI toxicity model before it's allowed through — so harmful
          content never reaches the model, and every decision is logged.
        </motion.p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr 1fr" : "1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <motion.div
  id="scanner"
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
  style={{
    background: "linear-gradient(165deg, #1c1813cc, #110f0ccc)",
              backdropFilter: "blur(24px)",
              border: "1px solid #ffffff14",
              borderRadius: 22,
              padding: 26,
              boxShadow: "0 30px 70px -24px #000000aa, inset 0 1px 1px #ffffff0a",
            }}
          >
            <RadarScanner scanning={loading} result={result} />

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a prompt to scan..."
              rows={4}
              style={{
                width: "100%", marginTop: 22,
                background: "#00000040",
                border: "1px solid #ffffff14",
                borderRadius: 14,
                padding: 16,
                color: "#fff",
                fontSize: 14.5,
                fontFamily: "inherit",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = "#d4a84370"; e.target.style.boxShadow = "0 0 0 3px #d4a8431a"; }}
              onBlur={e => { e.target.style.borderColor = "#ffffff14"; e.target.style.boxShadow = "none"; }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontSize: 12, color: "#ffffff44" }}>{prompt.length} / 5000</span>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleScan}
                disabled={loading || !prompt.trim()}
                style={{
                  border: "none", borderRadius: 11,
                  padding: "11px 26px",
                  background: loading || !prompt.trim() ? "#ffffff14" : "linear-gradient(135deg, #e8c068, #c4953a)",
                  color: loading || !prompt.trim() ? "#ffffff55" : "#251a08",
                  fontWeight: 600, fontSize: 14,
                  cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                  boxShadow: loading || !prompt.trim() ? "none" : "0 10px 28px -8px #d4a84388",
                }}
              >
                {loading ? "Scanning…" : "Scan prompt"}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: 14, color: "#f08785", fontSize: 13 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                style={{
                  background: result.action === "BLOCKED"
                    ? "linear-gradient(165deg, #e8615f1a, #1c1311cc)"
                    : "linear-gradient(165deg, #4caf7d1a, #11140fcc)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${result.action === "BLOCKED" ? "#e8615f40" : "#4caf7d40"}`,
                  borderRadius: 22,
                  padding: 26,
                  boxShadow: "0 30px 70px -24px #000000aa, inset 0 1px 1px #ffffff0a",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <ScoreDial score={result.toxicityScore} />
                  <div>
                    <div style={{
                      fontSize: 22, fontFamily: "Georgia, serif", fontStyle: "italic",
                      color: result.action === "BLOCKED" ? "#f0918f" : "#7fcba3",
                    }}>
                      {result.action === "BLOCKED" ? "Blocked" : "Allowed"}
                    </div>
                    <div style={{ fontSize: 13, color: "#ffffff70", marginTop: 4 }}>
                      {result.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 8 }}>
                      Scan #{result.id} · {new Date(result.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "#ffffff0a", borderRadius: 12, padding: 14,
                  fontSize: 13, color: "#ffffffb0", lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 1, color: "#ffffff50", marginBottom: 6 }}>
                    REASON
                  </div>
                  {result.reason}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold">What is PromptShield?</h2>
          <p className="mt-4 text-white/55 leading-relaxed max-w-2xl mx-auto">
            Anyone can send a prompt directly to a language model — including
            prompts designed to extract harmful instructions, harass, or
            manipulate the model into ignoring its own guardrails. PromptShield
            is a small but complete example of the kind of safety layer that
            production AI systems run in front of a model: a backend service
            that intercepts every prompt, checks it against rules and an AI
            model, and only forwards it if it's clean — logging the full
            decision trail in a database along the way.
          </p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black">How a prompt moves through the system</h2>
          <p className="mt-3 text-white/50 max-w-xl mx-auto">
            Four steps, fully logged, end to end.
          </p>
        </motion.div>
        <PipelineSteps />
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center hover:bg-white/[0.05] transition"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
                {s.value}
              </div>
              <p className="mt-2 text-sm text-white/45">{s.title}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black">What it actually checks</h2>
          <p className="mt-3 text-white/50 max-w-xl mx-auto">
            Two independent detection layers, one audit trail, zero exceptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 hover:border-amber-400/25 transition-colors"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-700/10 flex items-center justify-center text-amber-300">
                {f.icon}
              </div>
              <h3 className="mt-6 text-lg font-bold">{f.title}</h3>
              <p className="mt-2.5 text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative rounded-[32px] overflow-hidden border border-amber-400/15 bg-gradient-to-br from-amber-500/[0.06] via-[#100e0b] to-amber-700/[0.05] px-10 py-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black">Try it on your own prompt</h2>
          <p className="mt-4 text-white/55 max-w-md mx-auto">
            Scroll up and test a real prompt — clean, borderline, or clearly toxic.
          </p>
          <motion.button
  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
  onClick={() => document.getElementById("scanner")?.scrollIntoView({ behavior: "smooth", block: "center" })}
  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-black font-semibold px-7 py-3.5"
>
  Scan a prompt <ArrowRight size={16} />
</motion.button>
        </motion.div>
      </section>
    </div>
  );
}