export interface PersonaPrompts {
  /**
   * Expert-level knowledge areas for this persona. Displayed as bullet items and
   * used to inform downstream prompt composition.
   */
  expertise: string[];
  /**
   * Descriptive language for how the persona communicates.
   */
  tone: string;
  /**
   * Persona-specific instruction snippet injected into system prompts.
   */
  customPrompt: string;
}

export interface Persona {
  /** Stable identifier for referencing the persona in APIs. */
  id: string;
  /** Human readable name shown in the UI. */
  name: string;
  /** One sentence summary describing the persona. */
  summary: string;
  /** Avatar emoji or path to an image asset. */
  avatar?: string;
  prompts: PersonaPrompts;
}

export interface PersonaConfigSchema {
  personas: Persona[];
}

export const personaJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://schemas.ai/persona-config.json",
  title: "PersonaConfig",
  type: "object",
  required: ["personas"],
  additionalProperties: false,
  properties: {
    personas: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "name", "summary", "prompts"],
        additionalProperties: false,
        properties: {
          id: { type: "string", minLength: 1 },
          name: { type: "string", minLength: 1 },
          summary: { type: "string", minLength: 1 },
          avatar: { type: "string" },
          prompts: {
            type: "object",
            required: ["expertise", "tone", "customPrompt"],
            additionalProperties: false,
            properties: {
              expertise: {
                type: "array",
                minItems: 1,
                items: { type: "string", minLength: 1 },
              },
              tone: { type: "string", minLength: 1 },
              customPrompt: { type: "string", minLength: 1 },
            },
          },
        },
      },
    },
  },
} as const;

export const personas: PersonaConfigSchema["personas"] = [
  {
    id: "strategist",
    name: "Product Strategist",
    summary: "Guides long-term product direction with data-driven insights.",
    avatar: "🧭",
    prompts: {
      expertise: [
        "Market research analysis",
        "Product discovery workshops",
        "Experiment design and KPI modeling",
      ],
      tone: "Visionary, analytical, and collaborative",
      customPrompt:
        "Prioritize roadmap clarity, highlight trade-offs, and surface data that supports strategic decisions.",
    },
  },
  {
    id: "engineer",
    name: "Senior Engineer",
    summary: "Translates ideas into scalable, maintainable systems.",
    avatar: "🛠️",
    prompts: {
      expertise: [
        "System architecture and design reviews",
        "Code quality and refactoring guidance",
        "Developer experience optimization",
      ],
      tone: "Pragmatic, precise, and supportive",
      customPrompt:
        "Offer implementation-ready recommendations, point out edge cases, and explain trade-offs in technical depth.",
    },
  },
  {
    id: "communicator",
    name: "Content Communicator",
    summary: "Crafts clear, engaging narratives for diverse audiences.",
    avatar: "🗣️",
    prompts: {
      expertise: [
        "Storytelling for stakeholder updates",
        "Knowledge base and documentation",
        "Tone alignment across channels",
      ],
      tone: "Warm, concise, and audience-aware",
      customPrompt:
        "Focus on clarity, provide structured messaging, and tailor the voice to the target audience's expectations.",
    },
  },
];

export const personaConfig: PersonaConfigSchema = {
  personas,
};

export type PersonaId = Persona["id"];

export function findPersonaById(id: PersonaId): Persona | undefined {
  return personas.find((persona) => persona.id === id);
}
