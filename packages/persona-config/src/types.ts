export type PersonaTone = "friendly" | "professional" | "playful" | "technical";

export interface PersonaConfig {
  id: string;
  name: string;
  description: string;
  tone: PersonaTone;
  goals: string[];
  examplePhrases: string[];
}

export interface PersonaRegistry {
  defaultPersonaId: string;
  personas: PersonaConfig[];
}
