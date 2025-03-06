import fs from "fs";
import path from "path";
import winston from "winston";

import config from "./config";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create format for daily log files
const getLogFileName = () => {
  const now = new Date();
  // Use UTC date for log file names
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  const monthDir = path.join(logsDir, `${year}-${month}`);
  if (!fs.existsSync(monthDir)) {
    fs.mkdirSync(monthDir, { recursive: true });
  }

  return path.join(monthDir, `${year}-${month}-${day}.log`);
};

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Create custom format with timestamp and structured data
const customFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.timestamp({ format: () => new Date().toISOString() }), // Use ISO format for UTC timestamps
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  winston.format.json()
);

// Console format with colors for better readability
const consoleFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.colorize(),
  winston.format.timestamp({ format: () => new Date().toISOString() }), // Use ISO format for UTC timestamps
  winston.format.printf(
    ({ level, message, timestamp, ...meta }) =>
      `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`
  )
);

const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
      format: consoleFormat
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: getLogFileName(),
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 30
    }),

    // Separate file for error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 30
    })
  ]
});

// Create a new file transport every day at midnight
setInterval(() => {
  const fileTransport = logger.transports.find(
    (transport) => transport instanceof winston.transports.File && transport.level !== "error"
  );
  if (fileTransport) {
    (fileTransport as any).filename = getLogFileName();
  }
}, 86400000); // 24 hours

export default logger;
