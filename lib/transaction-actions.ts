'use server';

import { fetchDocuments, insertDocument, updateDocument, deleteDocument } from './db-actions';

// Define Transaction type
export type Transaction = {
	_id?: string;
	id?: string;
	amount: number;
	type: 'income' | 'expense';
	description: string;
	date: Date;
};

// Collection name for transactions
const COLLECTION_NAME = 'transactions';

// Fetch all transactions
export async function fetchTransactions() {
	try {
		const result = await fetchDocuments<Transaction>(COLLECTION_NAME, {}, 100);

		if (result.error || !result.data) {
			return { data: null, error: result.error || 'No data returned' };
		}

		// Parse dates and convert _id to string id
		const parsedTransactions = result.data.map(transaction => ({
			...transaction,
			id: transaction._id?.toString() || '',
			date: new Date(transaction.date),
		}));

		return { data: parsedTransactions, error: null };
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Add a new transaction
export async function addTransaction(transaction: Omit<Transaction, '_id' | 'id'>) {
	try {
		// Ensure date is a Date object
		const transactionToInsert = {
			...transaction,
			date: new Date(transaction.date),
		};

		const result = await insertDocument<Transaction>(COLLECTION_NAME, transactionToInsert);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to add transaction' };
		}

		return {
			success: true,
			id: result.data._id,
			error: null,
		};
	} catch (error) {
		console.error('Error adding transaction:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Delete a transaction
export async function deleteTransaction(id: string) {
	try {
		const result = await deleteDocument<Transaction>(COLLECTION_NAME, id);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to delete transaction' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error deleting transaction:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update a transaction
export async function updateTransaction(id: string, update: Partial<Transaction>) {
	try {
		// If the update contains a date, ensure it's a proper Date object
		if (update.date) {
			update.date = new Date(update.date);
		}

		const result = await updateDocument<Transaction>(COLLECTION_NAME, id, update);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update transaction' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error updating transaction:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
