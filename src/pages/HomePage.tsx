import { FC } from "react";
import HeroSection from "../components/home/HeroSection";
import FeaturedServices from "../components/home/FeaturedServices";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";

const HomePage: FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <Testimonials />
      <CTASection />
    </>
  );
};

export default HomePage;
