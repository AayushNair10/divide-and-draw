import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center">
      <div className="text-center">
        <div className="sketch-border p-8 bg-card max-w-md mx-auto">
          <div className="sketch-number mx-auto mb-6">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-4 hand-drawn-underline">
            Converting to Sketch...
          </h2>
          <p className="text-muted-foreground mb-6">
            We're turning your image into a beautiful sketch! This might take a moment.
          </p>
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-primary rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-sm text-muted-foreground">Processing image...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;