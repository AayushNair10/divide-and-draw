import { Card } from "@/components/ui/card";

const GameRules = () => {
  return (
    <Card className="sketch-border p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center hand-drawn-underline">
        How to Play
      </h2>
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <span className="sketch-number">
            1
          </span>
          <p>Upload a picture → it becomes a sketch.</p>
        </div>
        
        <div className="flex gap-4 items-start">
          <span className="sketch-number">
            2
          </span>
          <div>
            <p className="font-semibold mb-1">Choose players:</p>
            <ul className="text-sm space-y-1 ml-2">
              <li>• 1 player → 4 quadrants</li>
              <li>• 2 players → 2 quadrants each</li>
              <li>• 4 players → 1 quadrant each</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-4 items-start">
          <span className="sketch-number">
            3
          </span>
          <p>Draw your part within the time limit.</p>
        </div>
        
        <div className="flex gap-4 items-start">
          <span className="sketch-number">
            4
          </span>
          <p>All drawings merge into one picture.</p>
        </div>
        
        <div className="flex gap-4 items-start">
          <span className="sketch-number">
            5
          </span>
          <p>See your accuracy score and results!</p>
        </div>
      </div>
    </Card>
  );
};

export default GameRules;