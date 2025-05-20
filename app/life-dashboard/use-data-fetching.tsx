'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Standard response type for all data fetching operations
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
}

export interface MutationResult<T> {
	success: boolean;
	data?: T;
	_id?: string;
	error?: string | null;
}

export function useDataFetching<T>(
	fetchFn: () => Promise<ApiResponse<T>>,
	errorMessage: string = 'Failed to fetch data'
) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const result = await fetchFn();
			if (result.data) {
				setData(result.data);
			} else if (result.error) {
				toast('Error', {
					description: errorMessage,
				});
				console.error(result.error);
			}
		} catch (error) {
			toast('Error', {
				description: errorMessage,
			});
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [fetchFn, errorMessage]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, refetch: fetchData };
}

export function useMutation<T, P>(
	mutationFn: (params: P) => Promise<MutationResult<T>>,
	options: {
		onSuccess?: (data: MutationResult<T>) => void;
		onError?: (error: string) => void;
		successMessage?: string;
		errorMessage?: string;
	} = {}
) {
	const [loading, setLoading] = useState(false);
	const { onSuccess, onError, successMessage, errorMessage = 'Operation failed' } = options;

	const mutate = async (params: P) => {
		setLoading(true);
		try {
			const result = await mutationFn(params);

			if (result.success) {
				if (successMessage) {
					toast('Success', {
						description: successMessage,
					});
				}
				if (onSuccess) {
					onSuccess(result);
				}
				return result;
			} else {
				const message = result.error || errorMessage;
				toast('Error', {
					description: message,
				});
				if (onError) {
					onError(message);
				}
				return result;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : errorMessage;
			toast('Error', {
				description: message,
			});
			if (onError) {
				onError(message);
			}
			return {
				success: false,
				error: message,
			} as MutationResult<T>;
		} finally {
			setLoading(false);
		}
	};

	return { mutate, loading };
}
