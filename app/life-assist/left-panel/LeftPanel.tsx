// filepath: /home/rioze/shared/coding/life-dashboard/app/life-assist/LeftPanel.tsx
'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { RenderElementProps, RenderLeafProps, Editable } from 'slate-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Type, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Available fonts
const FONTS = [
	{ name: 'Sans-serif', value: 'font-sans' },
	{ name: 'Serif', value: 'font-serif' },
	{ name: 'Monospace', value: 'font-mono' },
];

// Available themes
const THEMES = [
	{ name: 'Light', value: 'light', bg: 'bg-white', text: 'text-gray-900' },
	{ name: 'Sepia', value: 'sepia', bg: 'bg-amber-50', text: 'text-amber-900' },
	{ name: 'Dark', value: 'dark', bg: 'bg-gray-900', text: 'text-gray-50' },
];

// Font sizes
const FONT_SIZES = [
	{ name: 'Small', value: 14 },
	{ name: 'Medium', value: 16 },
	{ name: 'Large', value: 18 },
	{ name: 'Extra Large', value: 20 },
];

const LeftPanel = () => {
	// State for reader preferences
	const [fontSize, setFontSize] = useState(FONT_SIZES[1].value);
	const [fontFamily, setFontFamily] = useState(FONTS[0].value);
	const [theme, setTheme] = useState(THEMES[0]);
	const [showToolbar, setShowToolbar] = useState(true);
	const lastScrollTop = useRef(0);
	const readerRef = useRef<HTMLDivElement>(null);

	// Track scroll direction to show/hide toolbar
	useEffect(() => {
		const handleScroll = () => {
			if (!readerRef.current) return;

			const scrollTop = readerRef.current.scrollTop;
			if (scrollTop < lastScrollTop.current) {
				// Scrolling up
				setShowToolbar(true);
			} else if (scrollTop > 20) {
				// Scrolling down and not at the top
				setShowToolbar(false);
			}

			lastScrollTop.current = scrollTop;
		};

		const readerElement = readerRef.current;
		if (readerElement) {
			readerElement.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (readerElement) {
				readerElement.removeEventListener('scroll', handleScroll);
			}
		};
	}, []);

	// Simple paragraph renderer
	const renderElement = useCallback((props: RenderElementProps) => {
		return (
			<p {...props.attributes} className="mb-4">
				{props.children}
			</p>
		);
	}, []);

	// Simple text renderer
	const renderLeaf = useCallback((props: RenderLeafProps) => {
		return <span {...props.attributes}>{props.children}</span>;
	}, []);

	// Handle font size increment/decrement
	const adjustFontSize = (increment: boolean) => {
		const currentIndex = FONT_SIZES.findIndex(size => size.value === fontSize);
		if (increment && currentIndex < FONT_SIZES.length - 1) {
			setFontSize(FONT_SIZES[currentIndex + 1].value);
		} else if (!increment && currentIndex > 0) {
			setFontSize(FONT_SIZES[currentIndex - 1].value);
		}
	};

	// Toggle between font families
	const toggleFontFamily = () => {
		const currentIndex = FONTS.findIndex(font => font.value === fontFamily);
		const nextIndex = (currentIndex + 1) % FONTS.length;
		setFontFamily(FONTS[nextIndex].value);
	};

	return (
		<Card className="h-full border-none py-0">
			<CardContent className="flex flex-col h-full relative pt-0 px-0">
				{/* Text reader area */}
				<div
					ref={readerRef}
					className={`flex-1 border rounded-md overflow-auto p-6 ${theme.bg} ${theme.text} transition-colors duration-200 shadow-sm`}
				>
					<div
						className={`${fontFamily} prose prose-lg max-w-none`}
						style={{
							fontSize: `${fontSize}px`,
							lineHeight: '1.7',
							letterSpacing: theme.value === 'dark' ? '0.015em' : '0.01em',
						}}
					>
						<Editable
							renderElement={renderElement}
							renderLeaf={renderLeaf}
							className="outline-none min-h-full max-w-none focus:outline-none"
						/>
					</div>
				</div>

				{/* Floating reader preferences toolbar */}
				<div
					className={cn(
						'absolute bottom-6 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center gap-2 transition-all duration-300',
						showToolbar
							? 'opacity-100 translate-y-0'
							: 'opacity-0 translate-y-8 pointer-events-none'
					)}
				>
					{/* Font type toggle */}
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleFontFamily}
						className="size-8"
						title="Change font style"
					>
						<Type className="size-4" />
					</Button>

					{/* Font size decrease */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => adjustFontSize(false)}
						className="size-8"
						title="Decrease font size"
						disabled={fontSize === FONT_SIZES[0].value}
					>
						<Minus className="size-4" />
					</Button>

					{/* Font size increase */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => adjustFontSize(true)}
						className="size-8"
						title="Increase font size"
						disabled={fontSize === FONT_SIZES[FONT_SIZES.length - 1].value}
					>
						<Plus className="size-4" />
					</Button>

					{/* Theme buttons */}
					{THEMES.map(t => (
						<Button
							key={t.value}
							variant={theme.value === t.value ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setTheme(t)}
							className="size-8"
							title={`${t.name} theme`}
						>
							{t.value === 'light' ? (
								<Sun className="size-4" />
							) : t.value === 'dark' ? (
								<Moon className="size-4" />
							) : (
								<span className="text-amber-600 font-bold">S</span>
							)}
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default LeftPanel;
