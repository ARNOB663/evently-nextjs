import mongoose from 'mongoose';

// Set up connection event listeners
function setupConnectionListeners() {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB: Disconnected');
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
    
    // Log connection attempt (hide sensitive info)
    const maskedUri = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log('🔄 MongoDB: Connecting...');
    
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(connectionString, opts)
      .then((mongoose) => {
        const dbName = mongoose.connection.db?.databaseName || 'events-platform';
        console.log(`✅ MongoDB Connected - Database: ${dbName}`);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Failed:', error.message);
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

