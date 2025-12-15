// src/Pages/Draw.tsx - SIMPLIFIED VERSION
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { CountdownScreen } from "@/components/game/CountdownScreen";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { ReferenceSketch } from "@/components/game/ReferenceSketch";
import { GameProgress } from "@/components/game/GameProgress";

interface Player {
  name: string;
  quadrant: number;
}

interface GameState {
  currentPlayerIndex: number;
  timeRemaining: number;
  isPaused: boolean;
  completedQuadrants: number[];
  showCountdown: boolean;
  countdownValue: number;
}

interface LocationState {
  originalDataUrl?: string;
  sketchDataUrl?: string;
  playerConfig?: {
    count: 1 | 2 | 4;
    names: string[];
  };
  gameConfig?: {
    timePerQuadrant: number;
  };
}

/** Canonical mapping: turnIndex -> quadrant number (1-4) */
const resolveQuadrantForTurn = (turnIndex: number) => {
  const seq = [1, 2, 3, 4]; // TL, TR, BL, BR
  return seq[turnIndex % 4];
};

const Draw = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;

  const originalDataUrl = state.originalDataUrl ?? null;
  const sketchDataUrl = state.sketchDataUrl ?? null;
  const playerConfig = state.playerConfig ?? { count: 1 as 1 | 2 | 4, names: ["Player 1"] };
  const gameConfig = state.gameConfig ?? { timePerQuadrant: 45 };

  useEffect(() => {
    if (!sketchDataUrl) {
      navigate("/begin", { replace: true });
    }
  }, [sketchDataUrl, navigate]);

  const [players] = useState<Player[]>(
    () => playerConfig.names.slice(0, playerConfig.count).map((n) => ({ name: n, quadrant: 0 }))
  );

  const [gameState, setGameState] = useState<GameState>(() => ({
    currentPlayerIndex: 0,
    timeRemaining: gameConfig.timePerQuadrant ?? 45,
    isPaused: false,
    completedQuadrants: [],
    showCountdown: true,
    countdownValue: 3,
  }));

  // Store full canvas drawings (NOT cropped)
  const [canvasDrawings, setCanvasDrawings] = useState<(string | null)[]>([null, null, null, null]);
  const [saveTrigger, setSaveTrigger] = useState<number>(0);

  // Countdown
  useEffect(() => {
    if (gameState.showCountdown && gameState.countdownValue > 0) {
      const t = setTimeout(() => setGameState(prev => ({ ...prev, countdownValue: prev.countdownValue - 1 })), 1000);
      return () => clearTimeout(t);
    } else if (gameState.showCountdown && gameState.countdownValue === 0) {
      setGameState(prev => ({ ...prev, showCountdown: false }));
    }
  }, [gameState.showCountdown, gameState.countdownValue]);

  // Timer
  useEffect(() => {
    if (gameState.timeRemaining > 0 && !gameState.isPaused && !gameState.showCountdown) {
      const t = setTimeout(() => setGameState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 })), 1000);
      return () => clearTimeout(t);
    } else if (gameState.timeRemaining === 0 && !gameState.showCountdown) {
      handleTimeUp();
    }
  }, [gameState.timeRemaining, gameState.isPaused, gameState.showCountdown]);

  const getQuadrantLabel = (quadrant: number) => {
    const labels: Record<number, string> = {
      1: "Top Left",
      2: "Top Right",
      3: "Bottom Left",
      4: "Bottom Right",
    };
    return labels[quadrant] ?? `Quadrant ${quadrant}`;
  };

  // Store the FULL canvas drawing
  const handleCanvasSave = (fullDataUrl: string) => {
    const turnIndex = gameState.currentPlayerIndex;
    console.log(`💾 Saving full drawing for turn ${turnIndex} (Q${resolveQuadrantForTurn(turnIndex)})`);
    setCanvasDrawings(prev => {
      const copy = [...prev];
      copy[turnIndex] = fullDataUrl;
      return copy;
    });
  };

  /**
   * Merge by taking all 4 complete drawings and arranging them in a 2x2 grid
   * Each drawing is shrunk to fit in a quadrant of the final image
   * Final image size matches the original sketch
   */
  const mergeDrawings = async (): Promise<string | null> => {
    console.log("🎨 Starting merge of 4 complete drawings...");

    if (!sketchDataUrl) {
      console.error("No sketch reference");
      return null;
    }

    // Get target dimensions from original sketch
    const refImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = sketchDataUrl;
    }).catch(() => null);

    if (!refImg) return null;

    const targetW = refImg.width;
    const targetH = refImg.height;
    const quadW = Math.floor(targetW / 2);
    const quadH = Math.floor(targetH / 2);

    console.log(`  Target size: ${targetW}x${targetH}`);
    console.log(`  Each quadrant will be: ${quadW}x${quadH}`);

    // Create final canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);

    // Position mapping for 2x2 grid
    // Drawing 1 (turn 0) -> Top-Left (0, 0)
    // Drawing 2 (turn 1) -> Top-Right (quadW, 0)
    // Drawing 3 (turn 2) -> Bottom-Left (0, quadH)
    // Drawing 4 (turn 3) -> Bottom-Right (quadW, quadH)
    const positions = [
      { x: 0, y: 0, label: "Top-Left" },
      { x: quadW, y: 0, label: "Top-Right" },
      { x: 0, y: quadH, label: "Bottom-Left" },
      { x: quadW, y: quadH, label: "Bottom-Right" }
    ];

    // Process each complete drawing
    for (let turnIdx = 0; turnIdx < 4; turnIdx++) {
      const drawing = canvasDrawings[turnIdx];
      const pos = positions[turnIdx];
      const quadrantNum = resolveQuadrantForTurn(turnIdx);

      if (!drawing) {
        console.log(`  Drawing ${turnIdx + 1} (Q${quadrantNum}) missing - ${pos.label}`);
        continue;
      }

      // Load the complete drawing
      const img = await new Promise<HTMLImageElement | null>((resolve) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = drawing;
      });

      if (!img) continue;

      console.log(`  Placing complete drawing ${turnIdx + 1} at ${pos.label} (${pos.x}, ${pos.y})`);

      // Draw the COMPLETE image, scaled down to fit the quadrant
      ctx.drawImage(
        img,
        pos.x, pos.y, quadW, quadH  // Destination: scale to fit quadrant
      );
    }

    console.log("  ✓ Merge complete!");
    return canvas.toDataURL("image/png");
  };

  const handleTimeUp = () => {
    const turnIndex = gameState.currentPlayerIndex;
    const currentQuadrant = resolveQuadrantForTurn(turnIndex);
    const newCompleted = [...gameState.completedQuadrants, currentQuadrant];

    console.log(`⏰ Time up for turn ${turnIndex} (Q${currentQuadrant})`);

    // Trigger save
    setSaveTrigger(s => s + 1);

    const totalTurns = 4;
    if (turnIndex < totalTurns - 1) {
      // Next turn
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentPlayerIndex: prev.currentPlayerIndex + 1,
          timeRemaining: gameConfig.timePerQuadrant ?? 45,
          isPaused: false,
          completedQuadrants: newCompleted,
          showCountdown: true,
          countdownValue: 3,
        }));
      }, 350);
    } else {
      // Final turn - merge and go to results
      setTimeout(async () => {
        setGameState(prev => ({ ...prev, completedQuadrants: newCompleted, isPaused: true }));
        
        // Wait for last save
        await new Promise(r => setTimeout(r, 300));

        console.log("🎨 Merging all drawings...");
        const mergedDataUrl = await mergeDrawings();

        navigate("/results", {
          state: {
            originalDataUrl: sketchDataUrl,
            mergedDataUrl: mergedDataUrl,
            // Pass individual drawings for display
            drawing1: canvasDrawings[0],
            drawing2: canvasDrawings[1],
            drawing3: canvasDrawings[2],
            drawing4: canvasDrawings[3],
          },
        });
      }, 500);
    }
  };

  // Current player - dynamically assign quadrant based on current turn
  const currentPlayer = (() => {
    const nPlayers = playerConfig.count;
    const turnIndex = gameState.currentPlayerIndex;
    const quadrant = resolveQuadrantForTurn(turnIndex);
    
    if (nPlayers === 1) {
      return {
        name: players[0].name,
        quadrant: quadrant
      };
    } else {
      const playerIndex = turnIndex % players.length;
      return {
        name: players[playerIndex].name,
        quadrant: quadrant
      };
    }
  })();

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="absolute top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      {gameState.showCountdown ? (
        <CountdownScreen
          playerName={currentPlayer.name}
          quadrantLabel={getQuadrantLabel(currentPlayer.quadrant)}
          countdownValue={gameState.countdownValue}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DrawingCanvas
              currentPlayer={currentPlayer}
              timeRemaining={gameState.timeRemaining}
              currentPlayerIndex={gameState.currentPlayerIndex}
              getQuadrantLabel={getQuadrantLabel}
              onSave={handleCanvasSave}
              saveTrigger={saveTrigger}
              targetDimensions={sketchDataUrl}
            />

            <div className="space-y-6">
              <ReferenceSketch
                currentPlayer={currentPlayer}
                completedQuadrants={gameState.completedQuadrants}
                sketchSrc={sketchDataUrl ?? undefined}
                originalSrc={originalDataUrl ?? undefined}
              />

              <GameProgress
                players={players}
                currentPlayerIndex={gameState.currentPlayerIndex}
                completedQuadrants={gameState.completedQuadrants}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Draw;