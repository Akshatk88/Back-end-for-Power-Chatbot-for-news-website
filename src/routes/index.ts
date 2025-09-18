import { Router } from 'express';
import chatRoutes from './chatRoutes';
import sessionRoutes from './sessionRoutes';
import { ingestNews } from '../controllers/newsController';

const router = Router();

router.use('/chat', chatRoutes);
router.use('/sessions', sessionRoutes);
router.post('/ingest-news', ingestNews);

export default router;