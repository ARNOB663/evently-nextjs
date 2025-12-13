import mongoose from 'mongoose';
import { dbLogger } from './utils/logger';

// Set up connection event listeners
function setupConnectionListeners() {
  mongoose.connection.on('error', (err) => {
    dbLogger.error('Connection Error', err);
  });

  mongoose.connection.on('disconnected', () => {
    dbLogger.warn('Disconnected');
  });
}

// Initialize listeners once
let listenersInitialized = false;

// Function to get and process MongoDB connection string
function getConnectionString(): string {
  // Support both MONGODB_URI and MONGO_URI environment variable names
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI or MONGO_URI environment variable inside .env.local');
  }

  // Ensure the connection string includes the database name and connection options
  let connectionString = MONGODB_URI.trim();

  // If it's a MongoDB Atlas connection (mongodb+srv://) and doesn't have a database name, add it
  if (connectionString.startsWith('mongodb+srv://')) {
    // Check if database name is already in the connection string
    const hasDatabase = /mongodb\+srv:\/\/[^/]+\/[^?]+/.test(connectionString);
    
    if (!hasDatabase) {
      // Add database name
      if (connectionString.includes('?')) {
        // Has query params but no database name
        connectionString = connectionString.replace('?', '/events-platform?');
      } else {
        // No query params, add database name and options
        connectionString = `${connectionString}/events-platform?retryWrites=true&w=majority`;
      }
    } else if (!connectionString.includes('retryWrites')) {
      // Has database name but missing connection options
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}retryWrites=true&w=majority`;
    }
  } else if (connectionString.startsWith('mongodb://') && !connectionString.includes('/events-platform')) {
    // Local MongoDB connection - add database name if missing
    if (!connectionString.match(/\/[^?]+/)) {
      const separator = connectionString.includes('?') ? '' : '/';
      connectionString = `${connectionString}${separator}events-platform`;
    }
  }

  return connectionString;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Initialize connection event listeners (only once)
  if (!listenersInitialized) {
    setupConnectionListeners();
    listenersInitialized = true;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connectionString = getConnectionString();
    
    dbLogger.debug('Connecting...');
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Connection pool optimization
      minPoolSize: 2,
    };

    cached.promise = mongoose.connect(connectionString, opts)
      .then((mongoose) => {
        const dbName = mongoose.connection.db?.databaseName || 'events-platform';
        dbLogger.info(`Connected - Database: ${dbName}`);
        return mongoose;
      })
      .catch((error) => {
        dbLogger.error('Connection Failed', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

