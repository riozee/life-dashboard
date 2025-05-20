'use server';

import { fetchDocuments, insertDocument, updateDocument, deleteDocument } from './db-actions';

export type TaskDocument = {
	_id?: string;
	title: string;
	progress: number;
	description: string;
	startDate: Date;
	order: number;
};

// The collection name for tasks
const COLLECTION_NAME = 'tasks';

// Convert DB document to client Task format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDocumentToTask = (doc: any): TaskDocument & { id: string } => {
	return {
		id: doc._id.toString(),
		_id: doc._id.toString(),
		title: doc.title,
		progress: doc.progress,
		description: doc.description,
		startDate: new Date(doc.startDate),
		order: doc.order,
	};
};

// Fetch all tasks
export async function fetchTasks() {
	try {
		const result = await fetchDocuments<TaskDocument>(COLLECTION_NAME, {}, 100);

		if (result.error || !result.data) {
			return { data: null, error: result.error || 'No data returned' };
		}

		const tasks = result.data.map(mapDocumentToTask);
		return { data: tasks, error: null };
	} catch (error) {
		console.error('Error in fetchTasks:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Add a new task
export async function addTask(task: Omit<TaskDocument, '_id'>) {
	try {
		// Convert the date for proper storage
		const taskToStore = {
			...task,
			startDate: new Date(task.startDate),
		};

		const result = await insertDocument<TaskDocument>(COLLECTION_NAME, taskToStore);

		if (result.error || !result.data.success) {
			return { success: false, id: null, error: result.error || 'Failed to add task' };
		}

		return {
			success: true,
			id: result.data._id,
			error: null,
		};
	} catch (error) {
		console.error('Error in addTask:', error);
		return {
			success: false,
			id: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update a task
export async function updateTask(id: string, updates: Partial<TaskDocument>) {
	try {
		// If the update contains a date, ensure it's a proper Date object
		if (updates.startDate) {
			updates.startDate = new Date(updates.startDate);
		}

		const result = await updateDocument<TaskDocument>(COLLECTION_NAME, id, updates);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update task' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error in updateTask:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Delete a task
export async function deleteTask(id: string) {
	try {
		const result = await deleteDocument<TaskDocument>(COLLECTION_NAME, id);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to delete task' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error in deleteTask:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update task order (for drag and drop functionality)
export async function updateTaskOrders(taskOrders: { id: string; order: number }[]) {
	try {
		// Use Promise.all to update all tasks in parallel
		const updatePromises = taskOrders.map(({ id, order }) =>
			updateDocument<TaskDocument>(COLLECTION_NAME, id, { order })
		);

		const results = await Promise.all(updatePromises);

		// Check if any updates failed
		const failedUpdates = results.filter(result => !result.data.success || result.error);

		if (failedUpdates.length > 0) {
			return {
				success: false,
				error: `Failed to update ${failedUpdates.length} task orders`,
			};
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error in updateTaskOrders:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
