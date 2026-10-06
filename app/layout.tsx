import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEMO_BANNER } from "@/lib/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedScan AI — Clinical Operations Command Center (Demo)",
  description:
    "DEMO / SIMULATED CLINICAL OPERATIONS. A visual prototype of a healthcare command center for intake, screening, queue management and department coordination. Fictional data only — no real clinical systems are connected.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-midnight text-slate-50 antialiased">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <span className="sr-only">{DEMO_BANNER}</span>
      </body>
    </html>
  );
}
