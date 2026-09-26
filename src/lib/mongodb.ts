import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn("⚠️ Warning: MONGODB_URI is not defined in environment variables.");
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so connection is cached across HMR
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri || "mongodb://127.0.0.1:27017/victoronosemuode");
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, instantiate client
  const client = new MongoClient(uri || "");
  clientPromise = client.connect();
}

/**
 * Connects to MongoDB using cached client promise
 */
export async function connectToDatabase(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the default database
 */
export async function getDb(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db();
}
