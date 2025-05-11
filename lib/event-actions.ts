'use server';

import { fetchDocuments, insertDocument, updateDocument, deleteDocument } from './db-actions';

// Event interface matching our component
interface EventData {
	_id?: string;
	date: Date;
	title: string;
	description?: string;
}

// Collection name for events
const COLLECTION_NAME = 'events';

// Fetch all events
export async function fetchEvents() {
	try {
		const result = await fetchDocuments<EventData>(COLLECTION_NAME);

		if (result.error || !result.data) {
			return { data: null, error: result.error || 'Failed to fetch events' };
		}

		// Process dates from MongoDB strings to Date objects
		const processedEvents = result.data.map(event => ({
			...event,
			_id: event._id?.toString() || '',
			date: new Date(event.date),
		}));

		return { data: processedEvents, error: null };
	} catch (error) {
		console.error('Error fetching events:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Add a new event
export async function addEvent(event: Omit<EventData, '_id'>) {
	try {
		const result = await insertDocument<EventData>(COLLECTION_NAME, {
			...event,
			date: new Date(event.date), // Ensure date is a Date object
		});

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to add event' };
		}

		return { success: true, _id: result.data._id, error: null };
	} catch (error) {
		console.error('Error adding event:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Delete an event
export async function removeEvent(id: string) {
	try {
		const result = await deleteDocument<EventData>(COLLECTION_NAME, id);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to delete event' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error deleting event:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update an event
export async function updateEvent(id: string, eventData: Partial<EventData>) {
	try {
		const result = await updateDocument<EventData>(COLLECTION_NAME, id, eventData);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update event' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error updating event:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
