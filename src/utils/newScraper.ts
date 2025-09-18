import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { NewsArticle } from '../types';

const parser = new Parser();

export async function scrapeNewsArticles(rssFeed: string): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(rssFeed);
    const articles: NewsArticle[] = [];

    for (const item of feed.items.slice(0, 50)) {
      try {
        let content = item.contentSnippet || item.content || '';

        // If content is short, try to scrape the full article
        if (content.length < 500 && item.link) {
          try {
            const response = await axios.get(item.link!, { timeout: 5000 });
            const $ = cheerio.load(response.data);

            // Try to get main content - common selectors
            const selectors = [
              'article',
              '.article-body',
              '.post-content',
              '[class*="content"]',
              'main'
            ];

            for (const selector of selectors) {
              const articleContent = $(selector).text();
              if (articleContent.length > 500) {
                content = articleContent;
                break;
              }
            }
          } catch (scrapeError: unknown) {
            if (scrapeError instanceof Error) {
              console.warn(`Failed to scrape ${item.link}:`, scrapeError.message);
            } else {
              console.warn(`Failed to scrape ${item.link}:`, scrapeError);
            }
          }
        }

        articles.push({
          id: item.guid || item.link || Math.random().toString(),
          title: item.title || 'Untitled',
          content: content,
          url: item.link || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.warn(`Failed to process article:`, error.message);
        } else {
          console.warn(`Failed to process article:`, error);
        }
      }
    }

    return articles;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to parse RSS feed:', error.message);
    } else {
      console.error('Failed to parse RSS feed:', error);
    }
    return [];
  }
}
