import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { authLimiter } from "./middlewares/rateLimiter";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";
import routes from "./routes/v1";
import swaggerDocs from "./config/swagger";
import xss from "./middlewares/xss";

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(compression());

app.use(cors());
app.options("*", cors());

if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Add an endpoint to manually trigger the indexer
app.post('/v1/admin/indexer/run', async (req, res) => {
  try {
    const { runIndexer } = await import('./services/indexer.service');
    await runIndexer();
    res.status(200).json({ message: 'Indexer job triggered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger indexer job', error: String(error) });
  }
});

app.use("/v1", routes);

app.use(errorConverter);
app.use(errorHandler);

swaggerDocs(app, config.port);

export default app;
