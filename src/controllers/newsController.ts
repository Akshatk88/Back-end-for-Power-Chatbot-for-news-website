import   { Request, Response } from 'express';
import  { scrapeNewsArticles } from '../utils/newScraper';
import  { EmbeddingService } from '../services/embeddingService';
import   { VectorService } from '../services/vectorService';

const embeddingService = new EmbeddingService(process.env.JINA_API_KEY!);
const vectorService = new VectorService(process.env.QDRANT_URL!);

export const ingestNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const rssFeed = process.env.NEWS_RSS_FEED!;
    
    console.log('Scraping news articles...');
    const articles = await scrapeNewsArticles(rssFeed);
    console.log(`Scraped ${articles.length} articles`);

    console.log('Generating embeddings...');
    const embeddedArticles = await embeddingService.embedNewsArticles(articles);
    console.log(`Generated embeddings for ${embeddedArticles.length} articles`);

    console.log('Initializing vector database...');
    await vectorService.initializeCollection();

    console.log('Storing articles in vector database...');
    await vectorService.storeArticles(embeddedArticles);

    res.json({
      success: true,
      message: `Successfully ingested ${embeddedArticles.length} news articles`,
      articles: embeddedArticles.length
    });

  } catch (error) {
    console.error('News ingestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ingest news articles'
    });
  }
};