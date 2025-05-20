# Database Communication Standards

This document outlines our standardized approach for communicating with the database in the Life Dashboard application.

## Response Structures

All server actions follow these standardized response structures:

### Fetch Operations (GET)

```typescript
interface ApiResponse<T> {
	data: T | null;
	error: string | null;
}
```

### Mutation Operations (POST, PUT, DELETE)

```typescript
interface MutationResponse<T = unknown> {
	success: boolean;
	data?: T;
	id?: string;
	error?: string;
}
```

## Server Actions Implementation

All server actions follow these patterns:

1. Use typed parameters and return types
2. Wrap operations in try/catch blocks
3. Return standardized response objects
4. Log errors on the server side

### Example Fetch Action

```typescript
export async function fetchNotes() {
	try {
		const notes = await db.collection('notes').find().toArray();
		return createApiResponse<Note[]>(notes);
	} catch (error) {
		console.error('Error in fetchNotes:', error);
		return createApiResponse<Note[]>(
			null,
			error instanceof Error ? error.message : 'Failed to fetch notes'
		);
	}
}
```

### Example Mutation Action

```typescript
export async function addNote(content: string) {
	try {
		if (!content.trim()) {
			return createErrorResponse('Note content cannot be empty');
		}

		const result = await db.collection('notes').insertOne({
			content,
			createdAt: new Date(),
			isRead: false,
			priority: 0,
		});

		return createSuccessResponse({ id: result.insertedId });
	} catch (error) {
		console.error('Error in addNote:', error);
		return createErrorResponse(error instanceof Error ? error.message : 'Failed to add note');
	}
}
```

## React Hooks for Data Fetching

We use two standardized hooks for data fetching and mutations:

### `useDataFetching<T>`

This hook standardizes data fetching operations:

```typescript
const { data, loading, refetch } = useDataFetching<Note[]>(fetchNotes, 'Failed to fetch notes');
```

### `useMutation<T, P>`

This hook standardizes mutation operations:

```typescript
const { mutate: addNoteMutation, loading: addingNote } = useMutation(createNote, {
	onSuccess: () => {
		refetchNotes();
		setNewNote('');
	},
	errorMessage: 'Failed to add note',
});
```

## Error Handling

Errors are handled consistently using toast notifications:

1. Server-side errors are logged using `console.error`
2. Client-side errors are displayed using toast notifications
3. Error messages are user-friendly and actionable

## Loading States

Loading states are handled consistently across the application:

1. Initial data fetching shows skeleton loaders
2. Mutation operations show appropriate loading indicators
3. Loading states are managed by our custom hooks

## Optimistic Updates

For operations where immediate feedback is important:

1. Update the UI optimistically
2. Execute the server action
3. Revert to the previous state if the operation fails
4. Always refetch fresh data after mutations to ensure consistency

## Type Safety

All data structures have explicit TypeScript interfaces:

1. Define types for all data models
2. Use these types consistently in components and server actions
3. Avoid using `any` type

By following these standards, we ensure a consistent, maintainable, and type-safe approach to database communication throughout the application.
