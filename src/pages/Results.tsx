// src/Pages/Results.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, Trophy, Sparkles, Loader2, Download } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface LocationState {
  originalDataUrl?: string | null;
  mergedDataUrl?: string | null;
  drawing1?: string | null;
  drawing2?: string | null;
  drawing3?: string | null;
  drawing4?: string | null;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const original = state.originalDataUrl ?? null;
  const merged = state.mergedDataUrl ?? null;
  const drawing1 = state.drawing1 ?? null;
  const drawing2 = state.drawing2 ?? null;
  const drawing3 = state.drawing3 ?? null;
  const drawing4 = state.drawing4 ?? null;

  // AI Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const playAgain = () => navigate("/begin");

  const handleDownload = (imageUrl: string, filename: string) => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleEnhanceWithAI = async () => {
    if (!merged) return;
    
    setIsEnhancing(true);
    setEnhanceError(null);
    setEnhancedImage(null);
    setAiDescription(null);

    try {
      const response = await fetch("http://localhost:8000/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merged }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enhance image");
      }

      const data = await response.json();
      
      if (data.success && data.enhanced_image) {
        setEnhancedImage(data.enhanced_image);
        setAiDescription(data.description);
      } else {
        throw new Error(data.error || "Enhancement failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to enhance with AI";
      setEnhanceError(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="sketch-border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">Game Complete!</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Here is your final sketch
              </p>
            </div>

            {/* Side-by-side: Original vs Merged */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Original Sketch */}
              <div>
                <h3 className="text-xl font-bold text-center mb-4">Original Sketch</h3>
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  {original ? (
                    <img
                      src={original}
                      alt="Original sketch"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                      No original sketch
                    </div>
                  )}
                </Card>
              </div>

              {/* Merged Drawing */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h3 className="text-xl font-bold">Your Team's Creation</h3>
                  {merged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(merged, "collaborative_sketch.png")}
                      className="sketch-border"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  {merged ? (
                    <img
                      src={merged}
                      alt="Merged creation"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                      No merged drawing
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* AI Enhancement Section */}
            <div className="mb-8">
              <Card className="sketch-border p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    AI Enhancement
                  </h3>
                  <p className="text-muted-foreground">
                    Let AI reconstruct your drawing into a polished image (without seeing the original!)
                  </p>
                </div>
                
                {!enhancedImage && !isEnhancing && !enhanceError && (
                  <div className="text-center">
                    <Button
                      onClick={handleEnhanceWithAI}
                      disabled={!merged}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Enhanced Image
                    </Button>
                  </div>
                )}

                {isEnhancing && (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <span className="text-purple-600 font-medium">AI is analyzing and recreating your drawing...</span>
                    <span className="text-sm text-muted-foreground">This may take 10-20 seconds</span>
                  </div>
                )}

                {enhanceError && (
                  <div className="text-center">
                    <div className="text-red-500 mb-4">{enhanceError}</div>
                    <Button
                      onClick={handleEnhanceWithAI}
                      variant="outline"
                      className="sketch-border"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {enhancedImage && (
                  <div className="space-y-4">
                    {aiDescription && (
                      <div className="text-center text-sm text-muted-foreground italic">
                        AI interpretation: "{aiDescription}"
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Team's Drawing */}
                      <div>
                        <h4 className="font-bold text-center mb-2">Your Drawing</h4>
                        <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                          <img
                            src={merged!}
                            alt="Team's drawing"
                            className="w-full h-auto rounded-lg"
                          />
                        </Card>
                      </div>
                      
                      {/* AI Enhanced */}
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h4 className="font-bold">AI Reconstruction</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(enhancedImage, "ai_enhanced.png")}
                            className="sketch-border"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                          <img
                            src={enhancedImage}
                            alt="AI enhanced"
                            className="w-full h-auto rounded-lg"
                          />
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Individual Drawings Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-center mb-4">All 4 Drawings</h3>
              <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                {[
                  { img: drawing1, label: "Drawing 1 (Top-Left)" },
                  { img: drawing2, label: "Drawing 2 (Top-Right)" },
                  { img: drawing3, label: "Drawing 3 (Bottom-Left)" },
                  { img: drawing4, label: "Drawing 4 (Bottom-Right)" },
                ].map((item, idx) => (
                  <Card key={idx} className="sketch-border p-4 bg-white dark:bg-gray-900">
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.label}
                      </Badge>
                    </div>
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-muted-foreground">
                        Empty
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Play Again Button */}
            <div className="flex justify-center">
              <button
                onClick={playAgain}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                style={{ color: '#ffffff' }}
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;