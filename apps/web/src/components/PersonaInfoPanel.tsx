"use client";

import type { Persona } from "@ai/persona-config";

interface PersonaInfoPanelProps {
  persona: Persona | null;
}

export function PersonaInfoPanel({ persona }: PersonaInfoPanelProps) {
  if (!persona) {
    return (
      <div className="placeholder-panel">
        <h2>No persona selected</h2>
        <p>Choose a persona to see their expertise, tone, and tailored prompt guidance.</p>
      </div>
    );
  }

  return (
    <aside className="persona-info-panel" aria-live="polite">
      <h2>
        {persona.avatar && <span style={{ marginRight: "0.75rem" }}>{persona.avatar}</span>}
        {persona.name}
      </h2>
      <p style={{ fontSize: "1.05rem", marginBottom: "1.5rem" }}>{persona.summary}</p>
      <section>
        <h3 style={{ marginBottom: "0.75rem" }}>Uzmanlık Alanları</h3>
        <ul>
          {persona.prompts.expertise.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Ses Tonu</h3>
        <p style={{ margin: 0 }}>{persona.prompts.tone}</p>
      </section>
      <section style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Özel Prompt Talimatı</h3>
        <p style={{ margin: 0 }}>{persona.prompts.customPrompt}</p>
      </section>
    </aside>
  );
}
