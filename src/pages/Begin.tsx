// src/Pages/Begin.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Users, User, UserCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface PlayerConfig {
  count: 1 | 2 | 4;
  names: string[];
}

interface GameConfig {
  timePerQuadrant: number;
}

const Begin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig>({
    count: 1,
    names: ["Player 1"],
  });
  const [gameConfig, setGameConfig] = useState<GameConfig>({ timePerQuadrant: 45 });
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<number | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large! 📸",
        description: "Please upload an image smaller than 20MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setUploadedDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploadedFile(file);
  };

  const handlePlayerCountChange = (count: 1 | 2 | 4) => {
    const defaultNames = Array(count).fill("").map((_, i) => `Player ${i + 1}`);
    // Keep existing names where possible, fill rest with defaults
    const newNames = Array(count).fill("").map((_, i) => {
      if (i < playerConfig.names.length && playerConfig.names[i]) {
        return playerConfig.names[i];
      }
      return defaultNames[i];
    });
    setPlayerConfig({ count, names: newNames });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerConfig.names];
    newNames[index] = name;
    setPlayerConfig({ ...playerConfig, names: newNames });
  };

  const handleStartGame = async () => {
    if (!uploadedFile || !uploadedDataUrl) {
      toast({
        title: "No image uploaded! 🖼️",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    const emptyNames = playerConfig.names.filter((name) => !name || !name.trim());
    if (emptyNames.length > 0) {
      toast({
        title: "Missing player names! 👤",
        description: "Please enter names for all players.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setConversionProgress(5);

    try {
      const fd = new FormData();
      fd.append("image", uploadedFile);

      const resp = await fetch("http://localhost:8000/convert", {
        method: "POST",
        body: fd,
      });

      setConversionProgress(30);

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server responded ${resp.status}: ${txt}`);
      }

      const data = await resp.json();
      setConversionProgress(80);

      if (!data.success || !data.sketch) {
        throw new Error(data.error || "Conversion failed or returned no sketch");
      }

      toast({
        title: "Sketch ready! ✨",
        description: "Taking you to the drawing canvas — good luck!",
      });

      setConversionProgress(100);

      navigate("/draw", {
        state: {
          originalDataUrl: uploadedDataUrl,
          sketchDataUrl: data.sketch as string,
          playerConfig,
          gameConfig,
        },
      });
    } catch (err: any) {
      console.error("Conversion error:", err);
      toast({
        title: "Conversion failed 😕",
        description: err?.message || "An unknown error occurred while converting the image.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setConversionProgress(null);
    }
  };

  const getPlayerIcon = (count: 1 | 2 | 4) => {
    switch (count) {
      case 1:
        return <User className="w-6 h-6" />;
      case 2:
        return <Users className="w-6 h-6" />;
      case 4:
        return <UserCheck className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background paper-texture">
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="sketch-border">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 hand-drawn-underline">Let's Begin! 🎨</h1>
          <p className="text-lg text-muted-foreground">
            Upload your image, choose your team, and start creating together
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Image Upload */}
          <Card className="sketch-border p-6">
            <h2 className="text-xl font-bold mb-4 text-center">1. Upload Your Picture</h2>

            {!uploadedDataUrl ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your image here</p>
                <p className="text-sm text-muted-foreground">Click to browse • Max 20MB • JPG, PNG, WebP</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            ) : (
              <div className="text-center">
                <img src={uploadedDataUrl} alt="Uploaded preview" className="max-w-full max-h-64 mx-auto rounded-lg sketch-border mb-4" />
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="sketch-border">
                    Change Image
                  </Button>
                  <Button variant="ghost" onClick={() => { setUploadedDataUrl(null); setUploadedFile(null); }} className="sketch-border">
                    Remove
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            )}
          </Card>

          {/* Player Count */}
          <Card className="sketch-border p-6">
            <h2 className="text-xl font-bold mb-4 text-center">2. Choose Number of Players</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {([1, 2, 4] as const).map((count) => (
                <button
                  key={count}
                  className={`sketch-border h-20 flex flex-col items-center justify-center gap-2 rounded-lg transition-all ${
                    playerConfig.count === count
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {getPlayerIcon(count)}
                  <span className="font-bold">{count} Player{count > 1 ? "s" : ""}</span>
                  <span className="text-xs opacity-90">{count === 1 ? "4 quadrants" : count === 2 ? "2 each" : "1 each"}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Time */}
          <Card className="sketch-border p-6">
            <h2 className="text-xl font-bold mb-4 text-center">3. Time Per Quadrant</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[30, 45, 60].map((time) => (
                <button
                  key={time}
                  className={`sketch-border py-2 px-4 rounded-lg transition-all font-medium ${
                    gameConfig.timePerQuadrant === time && !showCustomTime
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                      : "bg-background border-border hover:bg-muted/50"
                  }`}
                  onClick={() => { setGameConfig({ timePerQuadrant: time }); setShowCustomTime(false); }}
                >
                  {time}s
                </button>
              ))}
              <button
                className={`sketch-border py-2 px-4 rounded-lg transition-all font-medium ${
                  showCustomTime
                    ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                    : "bg-background border-border hover:bg-muted/50"
                }`}
                onClick={() => setShowCustomTime(true)}
              >
                Custom
              </button>
            </div>

            {showCustomTime && (
              <div className="space-y-2">
                <Label htmlFor="custom-time" className="font-medium">Custom Time (15-150 seconds)</Label>
                <Input
                  id="custom-time"
                  type="number"
                  min={15}
                  max={150}
                  value={gameConfig.timePerQuadrant}
                  onChange={(e) => {
                    const value = Math.max(15, Math.min(150, parseInt(e.target.value) || 15));
                    setGameConfig({ timePerQuadrant: value });
                  }}
                  className="sketch-border"
                  placeholder="Enter seconds (15-150)"
                />
              </div>
            )}
          </Card>

          {/* Player Names */}
          <Card className="sketch-border p-6">
            <h2 className="text-xl font-bold mb-4 text-center">4. Enter Player Names</h2>
            <div className="space-y-4">
              {Array.from({ length: playerConfig.count }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`player-${index}`} className="font-medium">Player {index + 1}</Label>
                  <Input 
                    id={`player-${index}`} 
                    value={playerConfig.names[index] || ""} 
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)} 
                    placeholder={`Enter name for Player ${index + 1}`} 
                    className="sketch-border" 
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Start Button / Progress */}
          <div className="text-center">
            {isConverting ? (
              <div className="inline-flex items-center gap-3 bg-muted/10 rounded-full px-4 py-2">
                <Loader2 className="animate-spin" />
                <div className="text-left">
                  <div className="font-medium">Converting image to sketch…</div>
                  {conversionProgress !== null && <div className="text-xs text-muted-foreground">Progress: {conversionProgress}%</div>}
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105 text-lg"
                style={{ color: '#ffffff' }}
              >
                 Start Drawing Challenge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Begin;