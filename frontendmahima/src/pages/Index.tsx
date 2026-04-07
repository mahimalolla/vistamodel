import { useState, useCallback } from "react";
import { ArrowLeftRight, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import VistaHeader from "@/components/VistaHeader";
import LanguagePanel from "@/components/LanguagePanel";
import MicButton from "@/components/MicButton";
import WaveformVisualizer from "@/components/WaveformVisualizer";

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<"spanish" | "english">("spanish");
  const [sourceTranscript, setSourceTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const targetLanguage = sourceLanguage === "spanish" ? "english" : "spanish";

  const languageLabels = {
    spanish: { name: "Español", code: "ES" },
    english: { name: "English", code: "EN" },
  };

  const handleToggleMic = useCallback(() => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setSourceTranscript("");
      setTranslatedText("");
    }
  }, [isListening]);

  const handleSwapLanguages = useCallback(() => {
    setSourceLanguage((prev) => (prev === "spanish" ? "english" : "spanish"));
    setSourceTranscript("");
    setTranslatedText("");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <VistaHeader />

      {/* Language Selector */}
      <div className="flex items-center justify-center gap-3 px-6 py-4">
        <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {languageLabels[sourceLanguage].code}
        </span>
        <span className="text-sm font-medium text-foreground">
          {languageLabels[sourceLanguage].name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapLanguages}
          className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </Button>
        <span className="text-sm font-medium text-foreground">
          {languageLabels[targetLanguage].name}
        </span>
        <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {languageLabels[targetLanguage].code}
        </span>
      </div>

      {/* Translation Panels */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-6 pb-4 max-w-5xl mx-auto w-full">
        <LanguagePanel
          language={languageLabels[sourceLanguage].name}
          languageCode={languageLabels[sourceLanguage].code}
          transcript={sourceTranscript}
          isActive={isListening}
          accentColor={sourceLanguage}
        />
        <LanguagePanel
          language={languageLabels[targetLanguage].name}
          languageCode={languageLabels[targetLanguage].code}
          transcript={translatedText}
          isActive={false}
          accentColor={targetLanguage}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 pb-6 pt-2">
        <WaveformVisualizer isActive={isListening} />
        <MicButton isListening={isListening} onToggle={handleToggleMic} />
        <div className="flex items-center gap-2 mt-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground text-[11px] gap-1.5 h-7">
            <Volume2 className="w-3 h-3" />
            Auto-play
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-[11px] gap-1.5 h-7">
            <Settings className="w-3 h-3" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
