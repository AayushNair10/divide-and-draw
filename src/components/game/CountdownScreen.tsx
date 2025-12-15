import { Card } from "@/components/ui/card";

interface CountdownScreenProps {
  playerName: string;
  quadrantLabel: string;
  countdownValue: number;
}

export const CountdownScreen = ({ playerName, quadrantLabel, countdownValue }: CountdownScreenProps) => {
  return (
    <div className="min-h-screen bg-background paper-texture flex items-center justify-center">
      <Card className="sketch-border p-12 text-center">
        <h1 className="text-6xl font-bold mb-4">{playerName}'s Turn</h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Drawing {quadrantLabel} quadrant
        </p>
        <div className="text-8xl font-bold text-primary">
          {countdownValue}
        </div>
      </Card>
    </div>
  );
};