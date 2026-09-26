import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      "❌ MongoDB URI is missing. Please define MONGODB_URI or MONGO_URI in your .env or .env.local file."
    );
  }
  return uri;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, cache the connection across hot module reloads
  if (!global._mongoClientPromise) {
    const uri = getMongoUri();
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode
  const uri = getMongoUri();
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Connects to MongoDB using the cached client promise
 */
export async function connectToDatabase(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the victoronosemuode database
 */
export async function getDb(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db("victoronosemuode");
}
