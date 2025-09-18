import { redisClient } from '../config/database';
import { ChatMessage, Session } from '../types';

const SESSION_TTL = 24 * 60 * 60; // 24 hours

export class RedisService {
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const data = await redisClient.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async createSession(sessionId: string): Promise<void> {
    const session: Session = {
      id: sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: []
    };
    
    await redisClient.setEx(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(session)
    );
  }

  async updateSession(sessionId: string, message: ChatMessage): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      await this.createSession(sessionId);
      return this.updateSession(sessionId, message);
    }

    session.messages.push(message);
    session.lastActivity = new Date();

    await redisClient.setEx(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(session)
    );
  }

  async clearSession(sessionId: string): Promise<void> {
    await redisClient.del(`session:${sessionId}`);
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }
}