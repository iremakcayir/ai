"use client";

import { useMemo } from "react";
import { usePersonaStore } from "../store/usePersonaStore";

export default function HomePage() {
  const registry = usePersonaStore((state) => state.registry);
  const selected = usePersonaStore((state) => state.selected);
  const selectPersona = usePersonaStore((state) => state.selectPersona);

  const title = useMemo(() => selected?.name ?? "Choose a persona", [selected]);

  return (
    <main className="px-6 py-12">
      <section className="mx-auto flex max-w-4xl flex-col gap-10 rounded-3xl bg-white/60 p-10 shadow-lg ring-1 ring-brand-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
            Persona Switcher
          </p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Explore different AI assistant personalities sourced from the shared
            persona configuration package.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            {registry.personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => selectPersona(persona.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-500 dark:hover:bg-brand-900/40 ${
                  persona.id === selected?.id
                    ? "border-brand-500 bg-brand-100 font-semibold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200"
                    : "border-transparent bg-white/70 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                }`}
              >
                <span className="block text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {persona.tone}
                </span>
                <span className="text-lg font-medium">{persona.name}</span>
              </button>
            ))}
          </aside>

          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {selected?.description}
            </h2>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Goals
              </h3>
              <ul className="mt-2 space-y-2 text-slate-700 dark:text-slate-200">
                {selected?.goals?.map((goal) => (
                  <li key={goal} className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Example Phrases
              </h3>
              <ul className="mt-2 space-y-3 text-slate-700 dark:text-slate-200">
                {selected?.examplePhrases?.map((phrase) => (
                  <li
                    key={phrase}
                    className="rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/50"
                  >
                    “{phrase}”
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
