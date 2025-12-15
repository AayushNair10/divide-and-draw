import HeroSection from "@/components/HeroSection";
import GameRules from "@/components/GameRules";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate("/begin");
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <HeroSection onPlayClick={handlePlayClick} />
        </div>
        
        <div className="flex justify-center mb-8">
          <GameRules />
        </div>
        
        <div className="flex justify-center mb-16">
          <button
            onClick={handlePlayClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 text-lg"
            style={{ color: '#ffffff' }}
          >
            🎨 Start Playing
          </button>
        </div> 
      </div>
    </div>
  );
};

export default Index;