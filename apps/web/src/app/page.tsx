"use client";

import usePersonaStore from "../state/personaStore";
import { PersonaCard } from "../components/PersonaCard";
import { PersonaInfoPanel } from "../components/PersonaInfoPanel";

export default function HomePage() {
  const { personas, activePersona, selectPersona, clearPersona } =
    usePersonaStore((state) => ({
      personas: state.personas,
      activePersona: state.activePersona,
      selectPersona: state.selectPersona,
      clearPersona: state.clearPersona,
    }));

  return (
    <main>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
          Takımınız için doğru kişiliği seçin
        </h1>
        <p style={{ margin: 0, color: "#4b5563", maxWidth: "760px" }}>
          Persona seçenekleri arasından seçim yaparak uzmanlık, iletişim üslubu ve özel prompt
          talimatlarını keşfedin. Seçiminiz, API isteklerine otomatik olarak taşınacak ve ekip
          deneyimini kişiselleştirecek.
        </p>
      </header>

      <section className="persona-grid" aria-label="Persona seçenekleri">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isActive={activePersona?.id === persona.id}
            onSelect={(id) =>
              activePersona?.id === id ? clearPersona() : selectPersona(id)
            }
          />
        ))}
      </section>

      <PersonaInfoPanel persona={activePersona} />
    </main>
  );
}
