import axios from 'axios';
import { NewsArticle } from '../types';

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(userQuery: string, contextArticles: NewsArticle[]): Promise<string> {
    try {
      const context = contextArticles
        .map(article => `Source: ${article.title}\nContent: ${article.content.substring(0, 500)}...`)
        .join('\n\n');

      const prompt = `You are a helpful news assistant. Use the provided news context to answer the user's question accurately and concisely.

Context Articles:
${context}

User Question: ${userQuery}

Please provide a helpful answer based on the context. If the context doesn't contain relevant information, say "I don't have enough information about that topic in my current news database."`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response');
    }
  }
}