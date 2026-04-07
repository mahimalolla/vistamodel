import { Mic } from "lucide-react";

interface LanguagePanelProps {
  language: string;
  languageCode: string;
  transcript: string;
  isActive: boolean;
  accentColor: "spanish" | "english";
}

const LanguagePanel = ({ language, languageCode, transcript, isActive, accentColor }: LanguagePanelProps) => {
  return (
    <div className={`flex-1 flex flex-col rounded-xl border transition-all duration-300 ${isActive ? "border-primary/30 vista-glow" : "border-border/60"} bg-card`}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40">
        <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">{languageCode}</span>
        <span className="text-sm font-medium text-foreground">{language}</span>
        {isActive && (
          <div className="ml-auto flex items-center gap-1.5">
            <Mic className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-primary font-medium tracking-wide">LIVE</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[180px] max-h-[380px] px-4 py-3">
        {transcript ? (
          <p className="text-foreground/90 leading-relaxed text-sm">{transcript}</p>
        ) : (
          <p className="text-muted-foreground/40 text-sm">
            {isActive ? "Listening…" : "Translation will appear here"}
          </p>
        )}
      </div>
    </div>
  );
};

export default LanguagePanel;
