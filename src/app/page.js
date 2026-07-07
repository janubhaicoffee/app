import "./page.css";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import FeaturedProduct from "@/components/home/FeaturedProduct";
import ProcessSection from "@/components/home/ProcessSection";
import StorySection from "@/components/home/StorySection";
import WhyJanuBhai from "@/components/home/WhyJanuBhai";
import Reviews from "@/components/home/Reviews";
import InstagramGallery from "@/components/home/InstagramGallery";

export default function Home() {
  return (
    <main className="main-content">
      <Hero />
      <TrustBar />
      <FeaturedProduct />
      <ProcessSection />
      <StorySection />
      <WhyJanuBhai />
      <Reviews />
      <InstagramGallery />
    </main>
  );
}
