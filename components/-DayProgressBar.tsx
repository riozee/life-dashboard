'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export function DayProgressBar({ className }: { className?: string }) {
	const [progress, setProgress] = useState(0);
	const [timeLeft, setTimeLeft] = useState('');
	const [timeOfDay, setTimeOfDay] = useState<'working' | 'evening' | 'morning'>('working');

	useEffect(() => {
		// Calculate initial progress and time left
		const calculateProgressAndTimeLeft = () => {
			const now = new Date();
			const hours = now.getHours();
			const minutes = now.getMinutes();
			const seconds = now.getSeconds();
			const milliseconds = now.getMilliseconds();

			// Determine time of day
			if (hours >= 19 || hours < 0) {
				setTimeOfDay('evening');
				return 0;
			} else if (hours >= 0 && hours < 6) {
				setTimeOfDay('morning');
				return 0;
			} else {
				setTimeOfDay('working');
			}

			// Calculate end time (7pm/19:00)
			const endHour = 19;

			// Calculate total milliseconds from current time to 7pm
			let millisecondsUntilEnd;
			if (hours < endHour) {
				// Same day
				const hoursUntilEnd = endHour - hours - 1;
				const minutesUntilEnd = 60 - minutes - 1;
				const secondsUntilEnd = 60 - seconds;
				const msUntilEnd = 1000 - milliseconds;

				millisecondsUntilEnd =
					hoursUntilEnd * 3600 * 1000 +
					minutesUntilEnd * 60 * 1000 +
					secondsUntilEnd * 1000 +
					msUntilEnd;

				// Adjust if milliseconds calculation caused overflow
				if (msUntilEnd === 1000) {
					millisecondsUntilEnd += 1000;
				}
			} else {
				// Next day (shouldn't happen with our time of day check, but just in case)
				millisecondsUntilEnd = 0;
			}

			// Total milliseconds in the working period (6am to 7pm)
			const totalWorkingMilliseconds = 13 * 3600 * 1000; // 13 hours = 7pm - 6am

			// Calculate elapsed milliseconds since 6am
			const elapsedSince6am = totalWorkingMilliseconds - millisecondsUntilEnd;

			// Calculate progress percentage
			const percentage = (elapsedSince6am / totalWorkingMilliseconds) * 100;

			// Format time left in HH:mm:ss.ms format with 2-digit ms precision
			const hoursLeft = Math.floor(millisecondsUntilEnd / (3600 * 1000));
			const minutesLeft = Math.floor((millisecondsUntilEnd % (3600 * 1000)) / (60 * 1000));
			const secondsLeft = Math.floor((millisecondsUntilEnd % (60 * 1000)) / 1000);
			// Format milliseconds with 2 digits only, like in Clock.tsx
			const msLeft = Math.floor((millisecondsUntilEnd % 1000) / 10);

			const formattedHours = String(hoursLeft).padStart(2, '0');
			const formattedMinutes = String(minutesLeft).padStart(2, '0');
			const formattedSeconds = String(secondsLeft).padStart(2, '0');
			const formattedMs = String(msLeft).padStart(2, '0');

			setTimeLeft(`${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMs}`);

			return percentage;
		};

		// Update progress immediately
		setProgress(calculateProgressAndTimeLeft());

		// Update in real-time (every 16.7ms for ~60fps)
		const interval = setInterval(() => {
			setProgress(calculateProgressAndTimeLeft());
		}, 16.7);

		return () => clearInterval(interval);
	}, []);

	if (timeOfDay === 'evening') {
		return (
			<div
				className={cn(
					'w-full text-sm text-muted-foreground font-light text-center bottom-1.5',
					className
				)}
			>
				Good Night
			</div>
		);
	}

	if (timeOfDay === 'morning') {
		return (
			<div
				className={cn(
					'w-full text-sm text-muted-foreground font-light text-center bottom-1.5',
					className
				)}
			>
				Good Morning
			</div>
		);
	}

	return (
		<div className={cn('w-full relative', className)}>
			<div className="flex items-center w-full">
				<div className="flex-1 h-[0.08em] bg-primary/50 rounded-full relative bottom-1.5">
					<div className="h-full bg-primary" style={{ width: `${progress}%` }} />
					<div
						className="absolute top-[0.05em] text-primary transition-all"
						style={{ left: `${progress}%`, transform: 'translate(-55%, -50%)' }}
					>
						<ChevronRight size="1.5em" />
					</div>
				</div>
				<span className="mx-1 text-xs text-muted-foreground"></span>
				<div
					className="font-mono text-[0.8em] text-muted-foreground font-light whitespace-nowrap"
					style={{ transform: 'translateY(-28%)' }}
				>
					{timeLeft} left until 7 PM
				</div>
			</div>
		</div>
	);
}
