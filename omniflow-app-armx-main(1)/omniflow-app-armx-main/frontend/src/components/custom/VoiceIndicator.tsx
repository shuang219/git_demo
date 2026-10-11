interface VoiceIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
}

export default function VoiceIndicator({ isListening, isProcessing }: VoiceIndicatorProps) {
  return (
    <div className="bg-[#1E293B] p-5 rounded-2xl border border-[#334155] flex flex-col items-center gap-3">
      <div className="flex gap-1 items-end h-10">
        {isListening ? (
          [1.0, 1.2, 0.8, 1.1, 0.9].map((delay, i) => (
            <div
              key={i}
              className="w-2 bg-[#2563EB] rounded-full"
              style={{
                height: `${[16, 32, 40, 24, 36][i]}px`,
                animation: `bounce ${delay}s infinite`,
              }}
            />
          ))
        ) : isProcessing ? (
          [1.0, 1.2, 0.8, 1.1, 0.9].map((delay, i) => (
            <div
              key={i}
              className="w-2 bg-[#F59E0B] rounded-full"
              style={{
                height: `${[16, 32, 40, 24, 36][i]}px`,
                animation: `bounce ${delay}s infinite`,
              }}
            />
          ))
        ) : (
          [16, 32, 40, 24, 36].map((h, i) => (
            <div key={i} className="w-2 bg-[#334155] rounded-full" style={{ height: `${h}px` }} />
          ))
        )}
      </div>
      <p className="text-[#94A3B8] text-sm font-medium">
        {isListening ? '正在聆听指令...' : isProcessing ? 'AI 正在分析...' : '点击麦克风开始'}
      </p>
    </div>
  );
}
