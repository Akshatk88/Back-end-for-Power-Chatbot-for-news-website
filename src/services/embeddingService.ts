import axios from 'axios';
import { chunkText } from '../utils/helpers';
import { NewsArticle } from '../types';


export class EmbeddingService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'https://api.jina.ai/v1/embeddings',
        {
          input: text,
          model: 'jina-embeddings-v2-base-en'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async embedNewsArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
    const embeddedArticles: NewsArticle[] = [];
    
    for (const article of articles) {
      try {
        // Chunk content for better embeddings
        const chunks = chunkText(article.content);
        const chunkEmbeddings = await Promise.all(
          chunks.map(chunk => this.embedText(chunk))
        );
        
        // Use average embedding of chunks for the article
        const avgEmbedding = chunkEmbeddings.reduce((acc, embedding) => {
          return acc.map((val, idx) => val + (embedding[idx] || 0));
        }, new Array(512).fill(0)).map(val => val / chunkEmbeddings.length);
        
        embeddedArticles.push({
          ...article,
          embedding: avgEmbedding
        });
      } catch (error) {
        console.warn(`Failed to embed article "${article.title}":`, error);
      }
    }
    
    return embeddedArticles;
  }
}