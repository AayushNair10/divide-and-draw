// src/Pages/Results.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { RotateCcw, Trophy } from "lucide-react";
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

  const playAgain = () => navigate("/begin");

  const handleDownload = () => {
    if (!merged) return;
    const a = document.createElement("a");
    a.href = merged;
    a.download = "collaborative_sketch.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
                      onClick={handleDownload}
                      className="sketch-border"
                    >
                      Download
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

            

            {/* Individual Drawings Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-center mb-4">All 4 Drawings</h3>
              <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                {/* Drawing 1 - Top Left */}
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Drawing 1 (Top-Left)
                    </Badge>
                  </div>
                  {drawing1 ? (
                    <img
                      src={drawing1}
                      alt="Drawing 1"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-muted-foreground">
                      Empty
                    </div>
                  )}
                </Card>

                {/* Drawing 2 - Top Right */}
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Drawing 2 (Top-Right)
                    </Badge>
                  </div>
                  {drawing2 ? (
                    <img
                      src={drawing2}
                      alt="Drawing 2"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-muted-foreground">
                      Empty
                    </div>
                  )}
                </Card>

                {/* Drawing 3 - Bottom Left */}
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Drawing 3 (Bottom-Left)
                    </Badge>
                  </div>
                  {drawing3 ? (
                    <img
                      src={drawing3}
                      alt="Drawing 3"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-muted-foreground">
                      Empty
                    </div>
                  )}
                </Card>

                {/* Drawing 4 - Bottom Right */}
                <Card className="sketch-border p-4 bg-white dark:bg-gray-900">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Drawing 4 (Bottom-Right)
                    </Badge>
                  </div>
                  {drawing4 ? (
                    <img
                      src={drawing4}
                      alt="Drawing 4"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-muted-foreground">
                      Empty
                    </div>
                  )}
                </Card>
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