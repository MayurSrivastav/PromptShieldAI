import React from 'react';
import { motion } from 'framer-motion';
import {
  User, Globe, Server, ListFilter, BrainCircuit, Database,
  ArrowRight, ArrowDown, CheckCircle2, XCircle,
} from 'lucide-react';

function ArchBox({ icon, title, subtitle }) {
  return (
    <div style={{
      background: '#d4a8430f',
      border: '1.5px solid #d4a84380',
      borderRadius: 14,
      padding: '12px 10px',
      minWidth: 110,
      textAlign: 'center',
      boxShadow: '0 0 20px -8px #d4a84366',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, margin: '0 auto 10px',
        background: '#d4a84335',
        color: '#f0c668',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{title}</div>
      <div style={{ fontSize: 11.5, color: '#f0c66880', marginTop: 3 }}>{subtitle}</div>
    </div>
  );
}

function FlowStep({ n, title, desc, outcome }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
      style={{
        display: 'flex', gap: 16,
        background: '#ffffff05', border: '1px solid #ffffff10',
        borderRadius: 14, padding: 18,
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: '#d4a84320', color: '#d4a843', fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#ffffff65', lineHeight: 1.6 }}>{desc}</div>
        {outcome && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '4px 10px', borderRadius: 999,
            background: outcome.type === 'block' ? '#e8615f15' : '#4caf7d15',
            color: outcome.type === 'block' ? '#f0918f' : '#7fcba3',
            fontSize: 12, fontWeight: 600,
          }}>
            {outcome.type === 'block' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
            {outcome.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0a08', color: '#fff', padding: '60px 24px 100px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>
            How <span style={{ color: '#d4a843' }}>PromptShield</span> works
          </h1>
          <p style={{ color: '#ffffff65', fontSize: 15.5, maxWidth: 600, lineHeight: 1.7, marginBottom: 48 }}>
            A walkthrough of the architecture and the exact path a prompt takes
            from the browser to a logged decision.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>System architecture</h2>

          <div style={{
  display: 'flex', flexWrap: 'wrap', alignItems: 'center',
  justifyContent: 'center', gap: 8,
  background: '#ffffff03', border: '1px solid #ffffff0f',
  borderRadius: 18, padding: 24,
  overflowX: 'auto',
}}>
            <ArchBox icon={<User size={17} />} title="User" subtitle="Browser" />
<ArrowRight size={18} color="#ffffff30" />
<ArchBox icon={<Globe size={17} />} title="React frontend" subtitle="Scanner UI" />
<ArrowRight size={18} color="#ffffff30" />
<ArchBox icon={<Server size={17} />} title="Spring Boot API" subtitle="7 REST endpoints" />
<ArrowRight size={18} color="#ffffff30" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ArchBox icon={<ListFilter size={17} />} title="Rule engine" subtitle="Keyword match" />
              <ArchBox icon={<BrainCircuit size={17} />} title="AI moderation" subtitle="Toxicity score" />
            </div>

            <ArrowRight size={18} color="#ffffff30" />
            <ArchBox icon={<Database size={17} />} title="PostgreSQL" subtitle="scan_logs, rules" />
          </div>

          <p style={{ fontSize: 13, color: '#ffffff45', marginTop: 14, textAlign: 'center' }}>
            The Rule engine runs first; the AI model is only called if the rule engine doesn't already block the prompt.
          </p>
        </section>

        {/* Step by step flow */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>What happens to one prompt</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FlowStep
              n="1"
              title="User submits a prompt"
              desc="The React frontend sends a POST request to /api/scan with the raw prompt text."
            />
            <FlowStep
              n="2"
              title="Rule engine checks keywords first"
              desc="The backend loads all active rules from PostgreSQL and checks if the prompt contains any banned keyword."
              outcome={{ type: 'block', text: 'Keyword found → blocked instantly, no AI call' }}
            />
            <FlowStep
              n="3"
              title="AI model scores toxicity"
              desc="If the rule engine doesn't block it, the prompt is sent to an AI model which returns a toxicity score between 0 and 1."
              outcome={{ type: 'block', text: 'Score above threshold → blocked' }}
            />
            <FlowStep
              n="4"
              title="Decision is logged"
              desc="Whatever the outcome, a ScanLog row is saved with the prompt, score, action, reason, and timestamp."
            />
            <FlowStep
              n="5"
              title="Result returned to the user"
              desc="The frontend receives the verdict and renders it instantly — blocked prompts never reach a downstream LLM."
              outcome={{ type: 'allow', text: 'Clean prompt → allowed' }}
            />
          </div>
        </section>

        {/* Tech stack */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Tech stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Frontend', value: 'React, Tailwind, Framer Motion' },
              { label: 'Backend', value: 'Java Spring Boot' },
              { label: 'Database', value: 'PostgreSQL' },
              { label: 'AI model', value: 'OpenRouter API' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#ffffff05', border: '1px solid #ffffff10',
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 11.5, color: '#d4a843', letterSpacing: 0.5, marginBottom: 6 }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}