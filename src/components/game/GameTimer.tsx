import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

interface GameTimerProps {
  timeRemaining: number;
}

export const GameTimer = ({ timeRemaining }: GameTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Badge variant="secondary" className="text-lg p-2">
      <Timer className="w-4 h-4 mr-1" />
      {formatTime(timeRemaining)}
    </Badge>
  );
};