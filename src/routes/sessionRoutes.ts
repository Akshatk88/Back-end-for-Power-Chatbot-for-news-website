import { Router } from 'express';
import { createSession, getSessionHistory, clearSession } from '../controllers/sessionController';

const router = Router();

router.post('/', createSession);
router.get('/:sessionId/history', getSessionHistory);
router.delete('/:sessionId', clearSession);

export default router;