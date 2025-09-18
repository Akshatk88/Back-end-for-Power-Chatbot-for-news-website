import { Request, Response } from 'express';
import { RedisService } from '../services/redisService';
import { generateSessionId } from '../utils/helpers';

const redisService = new RedisService();

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = generateSessionId();
    await redisService.createSession(sessionId);
    
    res.json({
      success: true,
      sessionId,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
};

export const getSessionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const messages = await redisService.getChatHistory(sessionId);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session history'
    });
  }
};

export const clearSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    await redisService.clearSession(sessionId);
    
    res.json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Clear session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear session'
    });
  }
};