'use server';

import { fetchDocuments, insertDocument, updateDocument, deleteDocument } from './db-actions';
import { Document } from 'mongodb';

// Define the Note interface
export interface Note extends Document {
	content: string;
	isRead: boolean;
	priority: number;
	createdAt: Date;
}

const COLLECTION_NAME = 'notes';

// Fetch all notes
export async function fetchNotes() {
	try {
		const result = await fetchDocuments<Note>(COLLECTION_NAME);

		if (result.error || !result.data) {
			return { data: null, error: result.error || 'No data returned' };
		}

		// Parse dates and convert _id to string id
		const parsedNotes = result.data.map(note => ({
			...note,
			_id: note._id?.toString() || '',
			createdAt: new Date(note.createdAt),
		}));

		return { data: parsedNotes, error: null };
	} catch (error) {
		console.error('Error fetching notes:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Add a new note
export async function addNote(noteContent: string) {
	try {
		const newNote = {
			content: noteContent,
			isRead: false,
			priority: 0,
			createdAt: new Date(),
		} as Note;

		const result = await insertDocument<Note>(COLLECTION_NAME, newNote);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to add note' };
		}

		return {
			success: true,
			_id: result.data._id,
			error: null,
		};
	} catch (error) {
		console.error('Error adding note:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update note's read status
export async function toggleNoteRead({ _id, isRead }: { _id: string; isRead: boolean }) {
	try {
		const result = await updateDocument<Note>(COLLECTION_NAME, _id, { isRead });

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update note' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error updating note read status:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Update note's priority
export async function setNotePriority({ _id, priority }: { _id: string; priority: number }) {
	try {
		const result = await updateDocument<Note>(COLLECTION_NAME, _id, { priority });

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to update note priority' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error updating note priority:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

// Delete a note
export async function deleteNote(id: string) {
	try {
		const result = await deleteDocument<Note>(COLLECTION_NAME, id);

		if (result.error || !result.data.success) {
			return { success: false, error: result.error || 'Failed to delete note' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error deleting note:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
