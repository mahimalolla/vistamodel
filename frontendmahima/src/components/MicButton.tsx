import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MicButtonProps {
  isListening: boolean;
  onToggle: () => void;
}

const MicButton = ({ isListening, onToggle }: MicButtonProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <div className="absolute w-16 h-16 rounded-full bg-destructive/15 animate-pulse-ring" />
          <div className="absolute w-14 h-14 rounded-full bg-destructive/10 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />
        </>
      )}
      <Button
        variant={isListening ? "mic-active" : "mic"}
        size="icon"
        onClick={onToggle}
        className="relative z-10 w-12 h-12 [&_svg]:size-5"
      >
        {isListening ? <MicOff /> : <Mic />}
      </Button>
    </div>
  );
};

export default MicButton;
