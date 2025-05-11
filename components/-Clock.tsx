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
	const day = time.toLocaleDateString(undefined, { weekday: 'long' });

	// Format date
	const date = time.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const hours = time.getHours();

	// Format minutes and seconds with leading zeros
	const minutes = time.getMinutes().toString().padStart(2, '0');
	const seconds = time.getSeconds().toString().padStart(2, '0');

	// Format milliseconds with leading zeros (first 2 digits only)
	const milliseconds = Math.floor(time.getMilliseconds() / 10)
		.toString()
		.padStart(2, '0');

	return (
		<div className="font-mono">
			<div>{`${day} ${date} ${hours}:${minutes}:${seconds}.${milliseconds}`}</div>
		</div>
	);
}
