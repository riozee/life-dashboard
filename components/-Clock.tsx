'use client';

import { useState, useEffect } from 'react';

export function Clock() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 10); // Update every 10ms for smooth millisecond display

		return () => clearInterval(timer);
	}, []);

	// Format day
	const day = time.toLocaleDateString('en-US', { weekday: 'long' });

	// Format date
	const date = time.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	// Format hours (with 12 hour format)
	const hours = time.getHours() % 12 || 12;
	const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

	// Format minutes and seconds with leading zeros
	const minutes = time.getMinutes().toString().padStart(2, '0');
	const seconds = time.getSeconds().toString().padStart(2, '0');

	// Format milliseconds with leading zeros (first 2 digits only)
	const milliseconds = Math.floor(time.getMilliseconds() / 10)
		.toString()
		.padStart(2, '0');

	return (
		<div className="font-mono">
			{`${day} ${date} ${hours}:${minutes}:${seconds}.${milliseconds} ${ampm}`}
		</div>
	);
}
