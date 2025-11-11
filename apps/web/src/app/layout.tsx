import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Personas",
  description: "Persona-driven AI web experience"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
