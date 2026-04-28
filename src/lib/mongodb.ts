import mongoose from 'mongoose';
import { logger } from './logger';
import { env } from './env';

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseConnection | undefined;
}

const MONGODB_URI = env.MONGODB_URI;

function getMongoDatabaseName(uri: string) {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i);
  const databaseName = match?.[1]?.trim();

  return databaseName ? decodeURIComponent(databaseName) : undefined;
}

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your .env.local file');
}

const MONGODB_DATABASE_NAME = getMongoDatabaseName(MONGODB_URI);

if (!MONGODB_DATABASE_NAME) {
  throw new Error(
    'MONGODB_URI must include an explicit database name to avoid falling back to the default test database'
  );
}

const cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    logger.info('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DATABASE_NAME,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        logger.info(
          `✅ MongoDB connected successfully (db=${MONGODB_DATABASE_NAME})`
        );
        return mongoose;
      })
      .catch((error) => {
        logger.error('❌ MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
