import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Tell Winston that the logs will be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use to print out messages. 
const transports = [
  // Allow the use of the console to print messages
  new winston.transports.Console(),
  // Allow to print errors in a separate file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Allow to print all logs in a separate file
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

// Export the logger
export default logger;

// Export convenience methods
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// API request/response logging helper
export const logApiRequest = (method: string, url: string, statusCode?: number, duration?: number, meta?: any) => {
  const message = `${method} ${url}${statusCode ? ` - ${statusCode}` : ''}${duration ? ` - ${duration}ms` : ''}`;
  
  if (statusCode && statusCode >= 400) {
    logger.error(message, meta);
  } else {
    logger.http(message, meta);
  }
};

// Database operation logging helper
export const logDbOperation = (operation: string, table: string, duration?: number, error?: any) => {
  const message = `DB ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`;
  
  if (error) {
    logger.error(`${message} - ERROR: ${error.message}`, { error, operation, table });
  } else {
    logger.debug(message, { operation, table });
  }
};

// Transaction processing logging helper
export const logTransaction = (action: string, transactionId: string, meta?: any) => {
  logger.info(`Transaction ${action}: ${transactionId}`, meta);
};

// GoCardless API logging helper
export const logGoCardlessOperation = (operation: string, accountId?: string, success?: boolean, error?: any) => {
  const message = `GoCardless ${operation}${accountId ? ` for account ${accountId}` : ''}`;
  
  if (error) {
    logger.error(`${message} - ERROR: ${error.message}`, { error, operation, accountId });
  } else if (success) {
    logger.info(`${message} - SUCCESS`, { operation, accountId });
  } else {
    logger.debug(message, { operation, accountId });
  }
};

// AI Categorization logging helper
export const logAiCategorization = (description: string, categoryId: string, confidence: number, duration?: number) => {
  logger.info(`AI Categorization: "${description}" -> ${categoryId} (confidence: ${confidence})${duration ? ` - ${duration}ms` : ''}`);
};

// Sync operation logging helper
export const logSyncOperation = (jobId: string, status: 'started' | 'completed' | 'failed', meta?: any) => {
  const message = `Sync job ${jobId} ${status}`;
  
  if (status === 'failed') {
    logger.error(message, meta);
  } else {
    logger.info(message, meta);
  }
};