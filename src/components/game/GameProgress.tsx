import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Player {
  name: string;
  quadrant: number;
}

interface GameProgressProps {
  players: Player[];
  currentPlayerIndex: number;
  completedQuadrants: number[];
}

export const GameProgress = ({ players, currentPlayerIndex, completedQuadrants }: GameProgressProps) => {
  return (
    <Card className="sketch-border p-6">
      <h3 className="text-lg font-bold mb-4">Game Progress</h3>
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === currentPlayerIndex
                ? "bg-primary/10 border-2 border-primary"
                : completedQuadrants.includes(player.quadrant)
                ? "bg-secondary/10"
                : "bg-muted/10"
            }`}
          >
            <span className="font-medium">{player.name}</span>
            <Badge
              variant={
                index === currentPlayerIndex
                  ? "default"
                  : completedQuadrants.includes(player.quadrant)
                  ? "secondary"
                  : "outline"
              }
            >
              {index === currentPlayerIndex
                ? "Drawing"
                : completedQuadrants.includes(player.quadrant)
                ? "Complete"
                : "Waiting"}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};