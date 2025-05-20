// Standard response types for server actions
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
}

export interface MutationResponse<T = unknown> {
	success: boolean;
	data?: T;
	id?: string;
	error?: string;
}

// Helper functions to create consistent responses
export function createApiResponse<T>(data: T | null, error: string | null = null): ApiResponse<T> {
	return { data, error };
}

export function createSuccessResponse<T>(data?: T, id?: string): MutationResponse<T> {
	return { success: true, data, id };
}

export function createErrorResponse(error: string): MutationResponse {
	return { success: false, error };
}
