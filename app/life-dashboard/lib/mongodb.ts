import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
	throw new Error('Please define the MONGODB_DB environment variable');
}

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
	// Check if we have a cached connection
	if (cachedClient && cachedDb) {
		// Load from cache
		return {
			client: cachedClient,
			db: cachedDb,
		};
	}

	// Create a new client and connect
	const client = new MongoClient(uri);
	await client.connect();
	const db = client.db(dbName);

	// Cache the client and db connections
	cachedClient = client;
	cachedDb = db;

	return {
		client,
		db,
	};
}

export { cachedClient as client, cachedDb as db };
