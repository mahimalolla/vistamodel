interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer = ({ isActive }: WaveformVisualizerProps) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary transition-all duration-150"
          style={{
            animation: isActive ? `waveform 1s ease-in-out ${i * 0.15}s infinite` : "none",
            height: "12px",
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
