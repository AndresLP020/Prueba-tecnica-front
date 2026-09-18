import type { Metadata } from "next";
import { Unbounded, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { brand } from "@/lib/brand.config";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${brand.name} — consultoría de crecimiento`,
  description:
    "Agencia demo. Briefing, calificación de proyectos y siguiente paso de trabajo.",
  robots: { index: true, follow: true },
  openGraph: {
    title: `${brand.name} (demo)`,
    description: brand.tagline,
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${unbounded.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-bone">{children}</body>
    </html>
  );
}
