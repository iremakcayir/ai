"use client";

import { create } from "zustand";
import { personas, type Persona, type PersonaId } from "@ai/persona-config";

interface PersonaState {
  personas: Persona[];
  activePersona: Persona | null;
  selectPersona: (id: PersonaId) => void;
  clearPersona: () => void;
}

const usePersonaStore = create<PersonaState>((set) => ({
  personas,
  activePersona: null,
  selectPersona: (id) =>
    set((state) => ({
      activePersona: state.personas.find((persona) => persona.id === id) ?? null,
    })),
  clearPersona: () => set({ activePersona: null }),
}));

export default usePersonaStore;
