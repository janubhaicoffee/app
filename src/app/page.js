import "./page.css";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import ProcessSection from "@/components/home/ProcessSection";
import StorySection from "@/components/home/StorySection";

export default function Home() {
  return (
    <main className="main-content">
      <Hero />
      <TrustBar />
      <ProcessSection />
      <StorySection />
    </main>
  );
}
