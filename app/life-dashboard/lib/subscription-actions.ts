'use server';

import { fetchDocuments, insertDocument, updateDocument, deleteDocument } from './db-actions';

// Define Subscription type
export type Subscription = {
	_id?: string;
	amount: number;
	name: string;
	info: string;
};

// Collection name for subscriptions
const COLLECTION_NAME = 'subscriptions';

// Fetch all subscriptions
export async function fetchSubscriptions() {
	try {
		const result = await fetchDocuments<Subscription>(COLLECTION_NAME);

		if (result.error || !result.data) {
			return { data: null, error: result.error || 'No data returned' };
		}

		const parsedSubscriptions = result.data.map(subscription => ({
			...subscription,
			_id: subscription._id?.toString() || '',
		}));

		return { data: parsedSubscriptions, error: null };
	} catch (error) {
		console.error('Error fetching subscriptions:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Add a new subscription
export async function addSubscription(subscription: Omit<Subscription, '_id'>) {
	try {
		const result = await insertDocument<Subscription>(COLLECTION_NAME, subscription);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to add subscription' };
		}

		return {
			success: true,
			_id: result.data._id,
			error: null,
		};
	} catch (error) {
		console.error('Error adding subscription:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update a subscription
export async function updateSubscription(_id: string, update: Partial<Subscription>) {
	try {
		const result = await updateDocument<Subscription>(COLLECTION_NAME, _id, update);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update subscription' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error updating subscription:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Delete a subscription
export async function deleteSubscription(_id: string) {
	try {
		const result = await deleteDocument<Subscription>(COLLECTION_NAME, _id);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to delete subscription' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error deleting subscription:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
