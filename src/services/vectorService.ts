import axios from 'axios';
import { NewsArticle } from '../types';

export class VectorService {
  private qdrantUrl: string;

  constructor(qdrantUrl: string = 'http://localhost:6333') {
    this.qdrantUrl = qdrantUrl;
  }

  async initializeCollection(collectionName: string = 'news'): Promise<void> {
    try {
      // Check if collection exists
      const response = await axios.get(`${this.qdrantUrl}/collections/${collectionName}`);
      console.log('Collection already exists');
    } catch (error) {
      // Create collection if it doesn't exist
      await axios.put(`${this.qdrantUrl}/collections/${collectionName}`, {
        vectors: {
          size: 512,
          distance: "Cosine"
        }
      });
      console.log('Collection created');
    }
  }

  async storeArticles(articles: NewsArticle[], collectionName: string = 'news'): Promise<void> {
    const points = articles
      .filter(article => article.embedding && article.embedding.length === 512)
      .map((article, index) => ({
        id: index,
        vector: article.embedding!,
        payload: {
          id: article.id,
          title: article.title,
          content: article.content,
          url: article.url,
          publishedAt: article.publishedAt.toISOString()
        }
      }));

    // Upload in batches
    const batchSize = 50;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await axios.put(
        `${this.qdrantUrl}/collections/${collectionName}/points?wait=true`,
        { points: batch }
      );
    }
  }

  async searchSimilar(queryEmbedding: number[], limit: number = 5, collectionName: string = 'news'): Promise<NewsArticle[]> {
    const response = await axios.post(
      `${this.qdrantUrl}/collections/${collectionName}/points/search`,
      {
        vector: queryEmbedding,
        limit: limit,
        with_payload: true
      }
    );

    return response.data.result.map((item: any) => ({
      id: item.payload.id,
      title: item.payload.title,
      content: item.payload.content,
      url: item.payload.url,
      publishedAt: new Date(item.payload.publishedAt),
      score: item.score
    }));
  }
}