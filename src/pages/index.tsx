import Head from "next/head";
import Footer from "@/components/Footer";
import LandingHeader from "@/components/Landing/LandingHeader";
import HeroSection from "@/components/Landing/HeroSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import HowWorks from "@/components/Landing/HowWorks";
import ReasonToUse from "@/components/Landing/ReasonToUse";
import FAQ from "@/components/Landing/FAQ";

export default function Home() {
  return (
    <>
      <Head>
        <title>더줄게</title>
        <meta name="description" content="더줄게 - 더 많은 급여를 드리는 알바 플랫폼" />
      </Head>
      <LandingHeader />
      <HeroSection />
      <HowWorks />
      <ReasonToUse />
      <FeaturesSection />
      <FAQ />
      <Footer />
    </>
  );
}
