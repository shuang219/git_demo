import { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat } from '../../services/aiApi';
import { toast } from 'sonner';
import VoiceIndicator from './VoiceIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  onQueryResult?: (text: string) => void;
}

const QUICK_QUERIES = [
  { label: '前方有什么？', query: '请描述我前方的环境和障碍物情况' },
  { label: '识别信号灯', query: '前方的交通信号灯是什么状态？我能过马路吗？' },
  { label: '帮我读文字', query: '请识别并播报前方可见的文字信息' },
  { label: '周围安全吗？', query: '请评估当前环境的安全状况，有没有危险源？' },
];

export default function AIChatPanel({ onQueryResult }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      let fullText = '';
      await streamChat(
        text.trim(),
        (chunk) => {
          fullText += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
          );
        },
      );
      onQueryResult?.(fullText);
    } catch (err) {
      toast.error('AI 响应失败，请稍后重试');
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onQueryResult]);

  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('您的浏览器不支持语音识别');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('语音识别失败，请重试');
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage]);

  return (
    <div className="flex flex-col gap-4">
      <VoiceIndicator isListening={isListening} isProcessing={isProcessing} />

      {/* Quick query buttons */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_QUERIES.map((q) => (
          <button
            key={q.label}
            onClick={() => sendMessage(q.query)}
            disabled={isProcessing}
            className="bg-[#1E293B] border border-[#334155] hover:border-[#2563EB] hover:bg-[#1e3a5f] text-white text-sm font-medium py-3 px-3 rounded-xl transition-all disabled:opacity-50 text-left"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Chat history */}
      {messages.length > 0 && (
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 max-h-64 overflow-y-auto flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#0F172A] text-[#E2E8F0] border border-[#334155]'
                }`}
              >
                {msg.content || (
                  <span className="flex gap-1">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="输入指令或问题..."
          disabled={isProcessing}
          className="flex-1 bg-[#0F172A] border border-[#334155] text-white placeholder-[#94A3B8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] disabled:opacity-50"
        />
        <button
          onClick={startVoice}
          disabled={isProcessing || isListening}
          className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition-all"
          aria-label="语音输入"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button
          onClick={() => sendMessage(input)}
          disabled={isProcessing || !input.trim()}
          className="bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition-all"
          aria-label="发送"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
