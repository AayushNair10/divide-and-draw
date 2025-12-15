import { Button } from "@/components/ui/button";
import heroSketch from "@/assets/logo.png";

interface HeroSectionProps {
  onPlayClick: () => void;
}

const HeroSection = ({ onPlayClick }: HeroSectionProps) => {
  return (
    <div className="text-center mb-12">
      <div className="mb-8">
        <img 
          src={heroSketch} 
          alt="Collaborative drawing illustration showing people working together on a divided canvas"
          className="w-full max-w-2xl mx-auto rounded-lg sketch-border"
        />
      </div>
      
      <h1 className="text-5xl font-bold mb-4 hand-drawn-underline">
        Divide and Draw
      </h1>
      
      <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
        One picture, many hands! Turn any image into a collaborative drawing challenge. 
        Upload your photo, watch it transform into a sketch, and work together to recreate it.
      </p>
    </div>
  );
};

export default HeroSection;