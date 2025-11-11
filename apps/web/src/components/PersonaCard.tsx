"use client";

import type { Persona, PersonaId } from "@ai/persona-config";

interface PersonaCardProps {
  persona: Persona;
  isActive: boolean;
  onSelect: (id: PersonaId) => void;
}

export function PersonaCard({ persona, isActive, onSelect }: PersonaCardProps) {
  return (
    <button
      type="button"
      className="persona-card"
      aria-pressed={isActive}
      onClick={() => onSelect(persona.id)}
    >
      <div style={{ fontSize: "2.25rem" }}>{persona.avatar ?? ""}</div>
      <h3>{persona.name}</h3>
      <p>{persona.summary}</p>
    </button>
  );
}
