import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Player {
  name: string;
  quadrant: number;
}

interface ReferenceSketchProps {
  currentPlayer: Player;
  completedQuadrants: number[];
  sketchSrc?: string;
  originalSrc?: string;
}

export const ReferenceSketch = ({
  currentPlayer,
  completedQuadrants,
  sketchSrc,
  originalSrc,
}: ReferenceSketchProps) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const displayImage = showOriginal
    ? originalSrc || sketchSrc
    : sketchSrc || originalSrc;

  // Map quadrant numbers to grid positions
  // Quadrant 1 = Top-Left (row 0, col 0)
  // Quadrant 2 = Top-Right (row 0, col 1)
  // Quadrant 3 = Bottom-Left (row 1, col 0)
  // Quadrant 4 = Bottom-Right (row 1, col 1)
  const getQuadrantPosition = (quadrant: number) => {
    switch (quadrant) {
      case 1: return { row: 0, col: 0 }; // Top-Left
      case 2: return { row: 0, col: 1 }; // Top-Right
      case 3: return { row: 1, col: 0 }; // Bottom-Left
      case 4: return { row: 1, col: 1 }; // Bottom-Right
      default: return { row: 0, col: 0 };
    }
  };

  return (
    <Card className="sketch-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Reference Sketch</h3>

        {(originalSrc && sketchSrc) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowOriginal((prev) => !prev)}
            className="sketch-border"
          >
            {showOriginal ? "Show Sketch" : "Show Original"}
          </Button>
        )}
      </div>

      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Reference sketch"
            className="w-full h-auto max-h-64 object-contain rounded-lg sketch-border"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-muted/20 rounded-lg text-muted-foreground">
            No reference image available
          </div>
        )}

        {/* Quadrant Overlay - 2x2 Grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0">
          {/* Map quadrant numbers to their grid positions */}
          {[
            { quadrant: 1, position: 'Top-Left' },     // Row 0, Col 0
            { quadrant: 2, position: 'Top-Right' },    // Row 0, Col 1
            { quadrant: 3, position: 'Bottom-Left' },  // Row 1, Col 0
            { quadrant: 4, position: 'Bottom-Right' }  // Row 1, Col 1
          ].map(({ quadrant, position }) => {
            const isCurrent = quadrant === currentPlayer.quadrant;
            const isCompleted = completedQuadrants.includes(quadrant);
            
            return (
              <div
                key={quadrant}
                className={`border-2 ${
                  isCurrent
                    ? "border-primary bg-primary/20"
                    : isCompleted
                    ? "border-secondary bg-secondary/20"
                    : "border-muted bg-muted/10"
                } transition-all duration-300 flex items-center justify-center`}
              >
                {isCurrent && (
                  <Badge variant="default" className="text-xs font-bold">
                    Draw Here - {position}
                  </Badge>
                )}
                {isCompleted && !isCurrent && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Done
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Current: Quadrant {currentPlayer.quadrant} | 
        Completed: {completedQuadrants.join(", ") || "None"}
      </div>
    </Card>
  );
};