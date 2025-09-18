export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messages: ChatMessage[];
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  embedding?: number[];
}

export interface RAGResponse {
  answer: string;
  sources?: NewsArticle[];
  sessionId: string;
}