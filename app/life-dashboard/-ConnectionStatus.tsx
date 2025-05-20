'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus({ className }: { className?: string }) {
	const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

	useEffect(() => {
		const checkConnection = async () => {
			try {
				const res = await fetch('/api/ping', {
					method: 'GET',
					headers: {
						'Cache-Control': 'no-cache',
					},
				});

				if (res.ok) {
					setStatus('connected');
				} else {
					setStatus('disconnected');
				}
			} catch {
				setStatus('disconnected');
			}
		};

		// Initial check
		checkConnection();

		// Set up interval to check every second
		const interval = setInterval(checkConnection, 1000);

		// Clean up interval on unmount
		return () => clearInterval(interval);
	}, []);

	return (
		<div className={cn('flex items-center gap-1.5', className)}>
			{status === 'loading' ? (
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
			) : status === 'connected' ? (
				<Wifi className="h-4 w-4 text-green-500" />
			) : (
				<WifiOff className="h-4 w-4 text-red-500" />
			)}
			<span className="text-xs text-muted-foreground">
				{status === 'loading'
					? 'Checking...'
					: status === 'connected'
					? 'Connected'
					: 'Disconnected'}
			</span>
		</div>
	);
}
