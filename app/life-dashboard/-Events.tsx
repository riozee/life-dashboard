'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import {
	fetchEvents,
	addEvent as addEventToDb,
	removeEvent,
} from '@/app/life-dashboard/lib/event-actions';
import { useDataFetching, useMutation } from '@/app/life-dashboard/use-data-fetching';

interface Event {
	_id: string;
	date: Date;
	title: string;
	description?: string;
}

export function EventCalendar() {
	const [newEventInput, setNewEventInput] = useState('');
	const [inputError, setInputError] = useState(false);

	// Use our standardized data fetching hook
	const {
		data: eventsDataRaw,
		loading: l1,
		refetch: refetchEvents,
	} = useDataFetching<Event[]>(fetchEvents, 'Failed to fetch events');

	// Convert string dates to Date objects, similar to Notes.tsx and ProgressTracker.tsx
	const eventsData = eventsDataRaw
		? eventsDataRaw.map(event => ({
				...event,
				date: new Date(event.date instanceof Date ? event.date : event.date),
		  }))
		: [];

	// Use standardized mutation hooks for CRUD operations
	const { mutate: addEventMutation, loading: l2 } = useMutation(addEventToDb, {
		onSuccess: () => {
			refetchEvents();
			setNewEventInput('');
			setInputError(false);
		},
		errorMessage: 'Failed to add event',
	});

	const { mutate: deleteEventMutation, loading: l3 } = useMutation(
		(id: string) => removeEvent(id),
		{
			onSuccess: () => refetchEvents(),
			errorMessage: 'Failed to delete event',
		}
	);

	const parseEventInput = (input: string): Omit<Event, '_id'> | null => {
		// Input format: "(date) [time] [title] ("description")"
		// Example: "3/23 22:30 sleep "sleep early tonight""
		// or just: "22:30 sleep "sleep early tonight""

		let date = new Date();
		let remaining = input.trim();
		let description = '';

		// Extract description if present (quoted text at the end)
		const descriptionMatch = remaining.match(/"([^"]+)"$/);
		if (descriptionMatch) {
			description = descriptionMatch[1];
			remaining = remaining.substring(0, remaining.lastIndexOf('"')).trim();
		}

		// Check if input starts with a date (numbers separated by slashes)
		const dateRegex = /^(\d{1,4}\/\d{1,2}(?:\/\d{1,4})?) /;
		const dateMatch = remaining.match(dateRegex);

		if (dateMatch) {
			const dateParts = dateMatch[1].split('/').map(Number);

			// If we have 2 numbers (month/day)
			if (dateParts.length === 2) {
				date.setMonth(dateParts[0] - 1);
				date.setDate(dateParts[1]);
			}
			// If we have 3 numbers (year/month/day)
			else if (dateParts.length === 3) {
				date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
			}

			remaining = remaining.substring(dateMatch[0].length);
		}

		// Extract time (numbers separated by colons)
		const timeRegex = /^(\d{1,2}:\d{2}(?::\d{2})?) /;
		const timeMatch = remaining.match(timeRegex);

		if (!timeMatch) {
			return null; // Time is required
		}

		const timeParts = timeMatch[1].split(':').map(Number);
		date.setHours(timeParts[0]);
		date.setMinutes(timeParts[1]);
		if (timeParts.length > 2) {
			date.setSeconds(timeParts[2]);
		} else {
			date.setSeconds(0);
		}

		remaining = remaining.substring(timeMatch[0].length);

		// Remaining text is the title
		const title = remaining.trim();
		if (!title) {
			return null; // Title is required
		}

		return {
			date,
			title,
			description: description || undefined,
		};
	};

	const handleAddEvent = () => {
		if (!newEventInput.trim() || [l1, l2, l3].some(Boolean)) {
			return;
		}

		const event = parseEventInput(newEventInput);

		if (event) {
			// Add to the database using our standardized mutation hook
			addEventMutation({
				date: event.date,
				title: event.title,
				description: event.description,
			});
		} else {
			setInputError(true);
		}
	};

	const handleDeleteEvent = (id: string) => {
		if ([l1, l2, l3].some(Boolean)) return;

		deleteEventMutation(id);
	};

	// Group events by day
	const groupEventsByDay = () => {
		const grouped: { [key: string]: Event[] } = {};
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to start of day for comparison

		eventsData
			.filter(event => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
				return eventDate.getTime() >= today.getTime(); // Only keep today and future events
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.forEach(event => {
				const dateStr = event.date.toDateString();
				if (!grouped[dateStr]) {
					grouped[dateStr] = [];
				}
				grouped[dateStr].push(event);
			});

		return Object.entries(grouped);
	};

	// Calculate relative day text
	const getRelativeDayText = (dateStr: string) => {
		const eventDate = new Date(dateStr);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		eventDate.setHours(0, 0, 0, 0);

		const diffDays = Math.round(
			(eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays === -1) return 'Yesterday';
		if (diffDays > 1) return `In ${diffDays} days`;
		return `${Math.abs(diffDays)} days ago`;
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const groupedEvents = groupEventsByDay();

	// Create a loading skeleton
	const EventSkeleton = () => (
		<div className="p-3">
			{[1, 2].map(day => (
				<div key={day} className="mb-4 last:mb-0">
					<div className="flex justify-between items-center mb-2">
						<div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
						<div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
					</div>

					{[1, 2, 3].map(item => (
						<div
							key={item}
							className="group relative mb-1 last:mb-0 pl-4 py-1 rounded-sm"
						>
							<div className="flex items-start">
								<div className="flex-1">
									<div className="flex gap-2 items-center">
										<div className="h-4 w-14 bg-muted rounded animate-pulse"></div>
										<div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
									</div>
									{item % 2 === 0 && (
										<div className="h-3 w-48 mt-1 bg-muted rounded animate-pulse"></div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			))}
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="bg-muted/40 p-3">
				<div className="flex justify-between items-center">
					<h2 className="text-sm font-medium flex items-center gap-1">
						<Calendar className="h-4 w-4" />
						{[l1, l2, l3].some(Boolean) && (
							<Loader2 className="h-3 w-3 animate-spin ml-1" />
						)}
					</h2>
					<span className="text-sm font-medium">
						{groupedEvents.reduce((total, [, events]) => total + events.length, 0)}
					</span>
				</div>
			</div>

			<Separator />

			{/* Timeline view */}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					{[l1, l2, l3].some(Boolean) ? (
						<EventSkeleton />
					) : (
						<div className="p-3">
							{groupedEvents.length > 0 ? (
								groupedEvents.map(([dateStr, dayEvents]) => (
									<div key={dateStr} className="mb-4 last:mb-0">
										<div className="flex justify-between items-center mb-2">
											<h3 className="text-sm font-medium">
												{new Date(dateStr).toLocaleDateString(undefined, {
													month: 'short',
													day: 'numeric',
												})}
											</h3>
											<span className="text-xs text-muted-foreground">
												{getRelativeDayText(dateStr)}
											</span>
										</div>

										{dayEvents.map(event => (
											<div
												key={event._id.toString()}
												className="group relative mb-1 last:mb-0 pl-4 py-1 hover:bg-muted/50 rounded-sm transition-colors"
											>
												<div className="flex items-start">
													<div className="flex-1">
														<div className="text-sm">
															<span className="text-muted-foreground">
																{formatTime(event.date)}
															</span>
															<span className="mx-1.5">·</span>
															<span className="font-medium">
																{event.title}
															</span>
														</div>
														{event.description && (
															<div className="text-xs text-muted-foreground mt-0.5">
																{event.description}
															</div>
														)}
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={() =>
															handleDeleteEvent(event._id.toString())
														}
														disabled={[l1, l2, l3].some(Boolean)}
													>
														x
													</Button>
												</div>
											</div>
										))}
									</div>
								))
							) : (
								<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
									<p>No events found</p>
									<p className="text-xs mt-1">Add your first event below</p>
								</div>
							)}
						</div>
					)}
				</ScrollArea>
			</div>

			{/* Input area */}
			<div className="border-t bg-background p-2">
				<div className="flex space-x-2 items-center">
					<div className="relative flex-1">
						<Input
							value={newEventInput}
							onChange={e => {
								setNewEventInput(e.target.value);
								if (inputError) setInputError(false);
							}}
							placeholder='(MM/DD) [HH:mm] [title] ("desc")'
							className={`text-xs h-8 ${inputError ? 'border-destructive' : ''}`}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									handleAddEvent();
								}
							}}
							disabled={[l1, l2, l3].some(Boolean)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
