const winston = require("winston");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProduction = process.env.NODE_ENV === "production";

// Vercel's filesystem is read-only at runtime, so only log to files locally.
const transports = [new winston.transports.Console()];
if (!isProduction) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
}

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    isProduction ? json() : combine(colorize(), devFormat)
  ),
  transports,
});

module.exports = logger;
