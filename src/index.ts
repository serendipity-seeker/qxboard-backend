import { createServer } from "http";
import app from "./app";
import prisma from "./client";
import config from "./config/config";
import logger from "./config/logger";
import { SocketService } from "./services/socket.service";
import { indexer } from "./services/indexer.service";

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO service
const socketService = SocketService.getInstance();
socketService.initialize(httpServer);

prisma.$connect().then(() => {
  logger.info("Connected to SQL Database");

  // Start the indexer with cron job
  indexer.start().then(() => {
    logger.info("Indexer started with cron schedule");
  }).catch(err => {
    logger.error(`Failed to start indexer: ${err}`);
  });

  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
});

// Handle unexpected errors
const exitHandler = () => {
  if (httpServer) {
    httpServer.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (httpServer) {
    httpServer.close();
  }
});
