import app from './app';
import { connectRedis } from './config/database';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();