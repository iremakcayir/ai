"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { Persona } from "@ai/persona-config";
import usePersonaStore from "../state/personaStore";

export interface ApiPersonaContextValue {
  persona: Persona | null;
  /**
   * Headers that should be merged into API requests for persona-awareness.
   */
  headers: Record<string, string>;
}

const ApiPersonaContext = createContext<ApiPersonaContextValue>({
  persona: null,
  headers: {},
});

export const ApiPersonaProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const persona = usePersonaStore((state) => state.activePersona);
  const value = useMemo<ApiPersonaContextValue>(() => {
    if (!persona) {
      return { persona: null, headers: {} };
    }

    return {
      persona,
      headers: {
        "x-persona-id": persona.id,
        "x-persona-tone": persona.prompts.tone,
      },
    };
  }, [persona]);

  return (
    <ApiPersonaContext.Provider value={value}>
      {children}
    </ApiPersonaContext.Provider>
  );
};

export const useApiPersona = () => useContext(ApiPersonaContext);
