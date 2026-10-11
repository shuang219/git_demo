import { Router, Request, Response } from 'express';
import { createAIService } from '../services/aiService';

const router = Router();

const SYSTEM_PROMPT = `你是一个专为视障人士设计的AI视觉辅助助手。你的职责是：
1. 用简洁、清晰的中文描述环境信息
2. 识别并播报障碍物、交通信号灯、文字等
3. 提供安全出行建议
4. 回答用户关于周围环境的问题
请始终以安全为第一优先级，语言简洁明了，避免冗长描述。`;

// Streaming chat endpoint
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const aiService = createAIService();
    const appLink = req.get('Referer') || req.get('Origin') || `${req.protocol}://${req.get('host')}`;

    // CRITICAL: brief async pause before SSE headers
    await new Promise((resolve) => setTimeout(resolve, 50));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });

    const finalSystemPrompt = systemPrompt || SYSTEM_PROMPT;

    for await (const chunk of aiService.chatDefault(message, finalSystemPrompt, appLink)) {
      if (clientDisconnected || res.writableEnded) break;
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    } else {
      res.end();
    }
  }
});

export default router;
