import type { ChatChunk } from '../../../shared/types/api';

export async function streamChat(
  message: string,
  onChunk: (text: string) => void,
  systemPrompt?: string,
): Promise<void> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, systemPrompt }),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`);
  }
  if (!response.body) {
    throw new Error('AI 响应无数据流');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed: ChatChunk = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
          } catch (_e) { /* ignore malformed SSE chunk */ }
        }
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed: ChatChunk = JSON.parse(data);
          if (parsed.content) onChunk(parsed.content);
        } catch (_e) { /* ignore malformed SSE chunk */ }
      }
    }
  }
}
