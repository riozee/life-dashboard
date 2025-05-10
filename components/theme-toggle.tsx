'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();

	return (
		<DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
			{theme === 'light' ? <Moon className="size-4 mr-2" /> : <Sun className="size-4 mr-2" />}
			{theme === 'light' ? 'Dark mode' : 'Light mode'}
		</DropdownMenuItem>
	);
}
