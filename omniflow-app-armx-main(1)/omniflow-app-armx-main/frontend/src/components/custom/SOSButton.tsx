import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export default function SOSButton() {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const HOLD_MS = 3000;

  const startPress = useCallback(() => {
    setPressing(true);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setPressing(false);
        setProgress(0);
        toast.success('🚨 SOS 已发送！紧急联系人已收到您的位置信息。', {
          duration: 5000,
        });
      }
    }, 50);
  }, []);

  const endPress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPressing(false);
    setProgress(0);
  }, []);

  return (
    <button
      className="relative w-full py-8 bg-[#EF4444] hover:bg-red-700 rounded-2xl overflow-hidden transition-all active:scale-95 flex flex-col items-center gap-2 select-none"
      style={{ boxShadow: pressing ? '0 0 40px rgba(239,68,68,0.7)' : '0 0 30px rgba(239,68,68,0.4)' }}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      aria-label="SOS 紧急求助"
    >
      {/* Progress bar */}
      {pressing && (
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-white/60 transition-none"
          style={{ width: `${progress}%` }}
        />
      )}
      <span className="text-3xl font-black tracking-widest text-white">SOS 求助</span>
      <span className="text-sm text-white/80">
        {pressing ? `正在发送... ${Math.round((progress / 100) * 3)}s` : '长按 3 秒发送位置给紧急联系人'}
      </span>
    </button>
  );
}
