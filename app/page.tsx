import {
  Capabilities,
  ClosingCTA,
  ConsolePreview,
  Hero,
  LandingFooter,
  LandingHeader,
  SafetyModel,
} from "@/components/landing/landing";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-midnight">
      <LandingHeader />
      <main>
        <Hero />
        <Capabilities />
        <SafetyModel />
        <ConsolePreview />
        <ClosingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
