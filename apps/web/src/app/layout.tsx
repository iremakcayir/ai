import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ApiPersonaProvider } from "../context/api-persona";

export const metadata: Metadata = {
  title: "AI Persona Playground",
  description: "Select and manage AI personas for tailored assistant experiences",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApiPersonaProvider>{children}</ApiPersonaProvider>
      </body>
    </html>
  );
}
