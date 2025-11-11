import defaultRegistry from "../personas/default.json" assert { type: "json" };
import type { PersonaRegistry } from "./types";

export type { PersonaConfig, PersonaRegistry, PersonaTone } from "./types";

export const personas: PersonaRegistry = defaultRegistry;

export function getPersonaById(personaId: string) {
  return personas.personas.find((persona) => persona.id === personaId);
}

export function getDefaultPersona() {
  return getPersonaById(personas.defaultPersonaId);
}
