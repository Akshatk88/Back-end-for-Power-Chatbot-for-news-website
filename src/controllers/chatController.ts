import  { Request, Response } from 'express';
import  { EmbeddingService } from '../services/embeddingService';
import  { VectorService } from '../services/vectorService';
import  { GeminiService } from '../services/geminiService';
import  { RedisService } from '../services/redisService';

const embeddingService = new EmbeddingService(process.env.JINA_API_KEY!);
const vectorService = new VectorService(process.env.QDRANT_URL);
const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);
const redisService = new RedisService();

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({
        success: false,
        error: 'Session ID and message are required'
      });
      return;
    }

    // Store user message
    await redisService.updateSession(sessionId, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate embedding for query
    const queryEmbedding = await embeddingService.embedText(message);

    // Search similar articles
    const similarArticles = await vectorService.searchSimilar(queryEmbedding, 5);

    // Generate response using Gemini
    const response = await geminiService.generateResponse(message, similarArticles);

    // Store bot response
    await redisService.updateSession(sessionId, {
      role: 'bot',
      content: response,
      timestamp: new Date()
    });

    res.json({
      success: true,
      answer: response,
      sources: similarArticles.map(article => ({
        title: article.title,
        url: article.url,
        score: article
      })),
      sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
};