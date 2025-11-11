import { create } from "zustand";
import type { PersonaConfig, PersonaRegistry } from "@ai/persona-config";
import { personas as personaRegistry } from "@ai/persona-config";

type PersonaState = {
  registry: PersonaRegistry;
  selected: PersonaConfig | null;
  selectPersona: (personaId: string) => void;
};

export const usePersonaStore = create<PersonaState>((set) => ({
  registry: personaRegistry,
  selected:
    personaRegistry.personas.find(
      (persona) => persona.id === personaRegistry.defaultPersonaId
    ) ?? null,
  selectPersona: (personaId: string) =>
    set((state) => ({
      selected:
        state.registry.personas.find((persona) => persona.id === personaId) ??
        state.selected,
    })),
}));
