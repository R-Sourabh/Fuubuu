import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import competitionsRouter from './routes/competitions';
import matchesRouter from './routes/matches';
import teamsRouter from './routes/teams';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) so the mobile app can communicate with us
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// Register API Routes
app.use('/api/competitions', competitionsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/teams', teamsRouter);

// A simple health check route to verify the server is running
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running correctly!',
    timestamp: new Date().toISOString(),
  });
});

// Catch-all route to handle 404 Not Found errors in JSON format
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
});

// Register Global Error Handling Middleware (must be registered after routes)
app.use(errorHandler);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

