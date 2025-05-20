'use server';

import { connectToDatabase } from './mongodb';
import { Document, Filter, OptionalUnlessRequiredId, ObjectId } from 'mongodb';

// Generic function to fetch documents from a collection
export async function fetchDocuments<T extends Document>(
	collectionName: string,
	query: Filter<T> = {},
	limit: number = 100,
	skip: number = 0
): Promise<{ data: T[] | null; error?: string }> {
	try {
		const { db } = await connectToDatabase();
		const collection = db.collection<T>(collectionName);
		const documents = await collection.find(query).skip(skip).limit(limit).toArray();

		return { data: JSON.parse(JSON.stringify(documents)) };
	} catch (error) {
		console.error('Error fetching documents:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Function to fetch a single document by ID
export async function fetchDocumentById<T extends Document>(
	collectionName: string,
	_id: string
): Promise<{ data: T | null; error?: string }> {
	try {
		const { db } = await connectToDatabase();
		const collection = db.collection<T>(collectionName);
		const document = await collection.findOne({ _id: new ObjectId(_id) } as Filter<T>);

		return { data: document ? JSON.parse(JSON.stringify(document)) : null };
	} catch (error) {
		console.error('Error fetching document by ID:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Function to insert a document
export async function insertDocument<T extends Document>(
	collectionName: string,
	document: OptionalUnlessRequiredId<T>
): Promise<{ data: { success: boolean; _id?: string }; error?: string }> {
	try {
		const { db } = await connectToDatabase();
		const collection = db.collection<T>(collectionName);
		const result = await collection.insertOne(document);

		return {
			data: {
				success: result.acknowledged,
				_id: result.insertedId?.toString(),
			},
		};
	} catch (error) {
		console.error('Error inserting document:', error);
		return {
			data: { success: false },
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Function to update a document
export async function updateDocument<T extends Document>(
	collectionName: string,
	_id: string,
	update: Partial<T>
): Promise<{
	data: { success: boolean; matchedCount: number; modifiedCount: number };
	error?: string;
}> {
	try {
		const { db } = await connectToDatabase();
		const collection = db.collection<T>(collectionName);
		const result = await collection.updateOne({ _id: new ObjectId(_id) } as Filter<T>, {
			$set: update,
		});

		return {
			data: {
				success: result.acknowledged,
				matchedCount: result.matchedCount,
				modifiedCount: result.modifiedCount,
			},
		};
	} catch (error) {
		console.error('Error updating document:', error);
		return {
			data: { success: false, matchedCount: 0, modifiedCount: 0 },
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Function to delete a document
export async function deleteDocument<T extends Document>(
	collectionName: string,
	_id: string
): Promise<{ data: { success: boolean; deletedCount: number }; error?: string }> {
	try {
		const { db } = await connectToDatabase();
		const collection = db.collection<T>(collectionName);
		const result = await collection.deleteOne({ _id: new ObjectId(_id) } as Filter<T>);

		return {
			data: {
				success: result.acknowledged,
				deletedCount: result.deletedCount || 0,
			},
		};
	} catch (error) {
		console.error('Error deleting document:', error);
		return {
			data: { success: false, deletedCount: 0 },
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
