import { MongoClient, Db } from 'mongodb';

const uri = (process.env.MONGODB_URI || '').trim();
const dbName = (process.env.MONGODB_DB_NAME || 'hackathon').trim();

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const PLACEHOLDER_HOST = 'cluster.mongodb.net';
const isPlaceholderUri = () =>
  !uri ||
  uri.includes(PLACEHOLDER_HOST) ||
  uri.includes('user:password') ||
  uri === 'mongodb+srv://';

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Get your connection string from MongoDB Atlas: Connect → Drivers → copy the URI (e.g. mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/) and set it in .env or Vercel Environment Variables.'
    );
  }
  if (isPlaceholderUri()) {
    throw new Error(
      'MONGODB_URI looks like a placeholder. Replace with your real Atlas URI: in Atlas go to your cluster → Connect → Drivers → copy the full URI (host will be like cluster0.xxxxx.mongodb.net, not cluster.mongodb.net).'
    );
  }
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
}

export type RegistrationDoc = {
  _id?: string;
  teamName: string;
  leadName: string;
  leadUSN: string;
  leadPhone: string;
  members: Array<{ name: string; usn: string }>;
  createdAt: Date;
};
