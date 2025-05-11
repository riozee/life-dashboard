'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Star, Trash, FileText } from 'lucide-react';
import {
	fetchNotes,
	addNote as createNote,
	toggleNoteRead as toggleRead,
	setNotePriority as setPriority,
	deleteNote as removeNote,
} from '@/lib/note-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataFetching, useMutation } from '@/hooks/use-data-fetching';

interface NoteItemProps {
	note: string;
	onDelete: () => void;
	createdAt?: Date;
	isRead?: boolean;
	priority?: number;
	onToggleRead?: () => void;
	onSetPriority?: (priority: number) => void;
}

function NoteItem({
	note,
	onDelete,
	createdAt = new Date(),
	isRead = false,
	priority = 0,
	onToggleRead = () => {},
	onSetPriority = () => {},
}: NoteItemProps) {
	// Function to get priority color based on level
	const getPriorityColor = (level: number) => {
		switch (level) {
			case 1:
				return 'bg-blue-100 text-blue-700';
			case 2:
				return 'bg-green-100 text-green-700';
			case 3:
				return 'bg-yellow-100 text-yellow-700';
			case 4:
				return 'bg-orange-100 text-orange-700';
			case 5:
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-muted';
		}
	};

	return (
		<div className="group relative transition-colors hover:bg-muted/50 border mb-1">
			{/* Top section - Note content */}
			<div className="p-2 relative">
				<p className={`pr-7 text-sm ${isRead ? 'text-muted-foreground' : 'font-medium'}`}>
					{note}
				</p>
				{priority > 0 && (
					<div
						className={`absolute right-1 top-1 rounded-full h-4 w-4 flex items-center justify-center ${getPriorityColor(
							priority
						)}`}
					>
						<span className="text-[10px] font-medium">{priority}</span>
					</div>
				)}
			</div>

			{/* Bottom section - Only visible on hover */}
			<div className="h-0 overflow-hidden group-hover:h-auto group-hover:py-1 transition-all px-1">
				<div className="flex items-center justify-between">
					<div className="text-[10px] text-muted-foreground">
						{createdAt.toLocaleString()}
					</div>

					<div className="flex items-center gap-0.5">
						{/* Read/Unread toggle */}
						<Button
							variant="ghost"
							size="sm"
							className="h-5 w-5 p-0"
							onClick={onToggleRead}
							title={isRead ? 'Mark as unread' : 'Mark as read'}
						>
							{isRead ? (
								<CheckCircle className="h-3 w-3" />
							) : (
								<Circle className="h-3 w-3" />
							)}
						</Button>

						{/* Priority stars */}
						<div className="flex">
							{[1, 2, 3, 4, 5].map(level => (
								<Button
									key={level}
									variant="ghost"
									size="sm"
									className="h-5 w-4 p-0"
									onClick={() => onSetPriority(level)}
								>
									<Star
										className={`h-2.5 w-2.5 ${
											level <= priority
												? 'fill-yellow-500 text-yellow-500'
												: 'text-muted-foreground'
										}`}
									/>
								</Button>
							))}
						</div>

						{/* Delete button */}
						<Button
							variant="ghost"
							size="sm"
							className="h-5 w-5 p-0 text-destructive"
							onClick={onDelete}
						>
							<Trash className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

// Define a more specific type for notes outside the component
// so it can be reused and is consistent
export type Note = {
	_id: string;
	content: string;
	createdAt: Date;
	isRead: boolean;
	priority: number;
};

export function Notes() {
	const [newNote, setNewNote] = useState('');

	// Use our standardized data fetching hook
	const {
		data: notesDataRaw,
		loading: l1,
		refetch: refetchNotes,
	} = useDataFetching<Note[]>(fetchNotes, 'Failed to fetch notes');

	// Convert string dates to Date objects
	const notesData = notesDataRaw
		? notesDataRaw.map(note => ({
				...note,
				createdAt: new Date(
					note.createdAt instanceof Date ? note.createdAt : note.createdAt
				),
		  }))
		: [];

	// Use standardized mutation hook for adding notes
	const { mutate: addNoteMutation, loading: l2 } = useMutation(createNote, {
		onSuccess: () => {
			refetchNotes();
			setNewNote('');
		},
		errorMessage: 'Failed to add note',
	});

	const { mutate: deleteNoteMutation, loading: l3 } = useMutation(removeNote, {
		onSuccess: () => refetchNotes(),
		errorMessage: 'Failed to delete note',
	});

	const { mutate: toggleReadMutation, loading: l4 } = useMutation(toggleRead, {
		onSuccess: () => refetchNotes(),
		errorMessage: 'Failed to toggle note read status',
	});

	const { mutate: setPriorityMutation, loading: l5 } = useMutation(setPriority, {
		onSuccess: () => refetchNotes(),
		errorMessage: 'Failed to set note priority',
	});

	// Calculate dashboard metrics
	const calculateTotalNotes = () => notesData.length;
	const calculateUnreadNotes = () => notesData.filter(note => !note.isRead).length;
	const calculateHighPriorityNotes = () =>
		notesData.filter(note => note.priority >= 4 && !note.isRead).length;

	// Sort notes: unread notes first (sorted by priority), then read notes (sorted by creation date)
	const sortedNotesData = [...notesData].sort((a, b) => {
		// First sort by read status (unread comes first)
		if (a.isRead !== b.isRead) {
			return a.isRead ? 1 : -1;
		}

		// For unread notes, sort by priority (higher comes first)
		if (!a.isRead) {
			if (a.priority !== b.priority) {
				return b.priority - a.priority;
			}
		}

		// Sort by creation date (newer first)
		return b.createdAt.getTime() - a.createdAt.getTime();
	});

	return (
		<div className="flex flex-col h-full">
			{/* Error handling moved to toast notifications */}

			{/* Dashboard section */}
			<div className="bg-muted/40 p-3">
				<div className="flex justify-between items-center">
					<h2 className="text-sm font-medium flex items-center gap-1">
						<FileText className="h-4 w-4" />
					</h2>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">{calculateTotalNotes()}</span>
						<span className="text-sm font-medium text-blue-500">
							{calculateUnreadNotes()}
						</span>
						<span className="text-sm font-medium text-amber-500">
							{calculateHighPriorityNotes()}
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				<ScrollArea className="h-full">
					<div className="p-1">
						{[l1, l2, l3, l4, l5].some(Boolean) ? (
							// Show skeleton loaders while loading
							<>
								<Skeleton className="h-16 w-full mb-2" />
								<Skeleton className="h-16 w-full mb-2" />
								<Skeleton className="h-16 w-full mb-2" />
							</>
						) : (
							sortedNotesData.map(note => (
								<NoteItem
									key={note._id}
									note={note.content}
									createdAt={note.createdAt}
									isRead={note.isRead}
									priority={note.priority}
									onDelete={() => deleteNoteMutation(note._id)}
									onToggleRead={async () => {
										if (notesData.find(_ => _._id === note._id)) {
											await toggleReadMutation({
												_id: note._id,
												isRead: !note.isRead,
											});
										}
									}}
									onSetPriority={priority =>
										setPriorityMutation({ _id: note._id, priority })
									}
								/>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Input Footer */}
			<div className="border-t bg-background p-2">
				<Textarea
					value={newNote}
					onChange={e => setNewNote(e.target.value)}
					placeholder="Add a new note..."
					className="resize-none w-full h-4 text-sm overflow-auto scrollbar-hide p-1"
					onKeyDown={e => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							if (newNote.length) addNoteMutation(newNote.trim());
						}
					}}
				/>
			</div>
		</div>
	);
}
