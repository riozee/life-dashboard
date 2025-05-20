'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TranslateAndRephrase from './features/TranslateAndRephrase';
import { Button } from '@/components/ui/button';
import { PencilIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the apps data structure
const APPS = [
	{
		id: 'translate-and-rephrase',
		title: 'Translate and Rephrase',
		description: 'See the translation variations of the selected text',
		icon: PencilIcon,
		component: TranslateAndRephrase,
	},
	// More apps can be added here in the future
];

const RightPanel = () => {
	const [activeApp, setActiveApp] = useState<string | null>(null);

	// Get the current active app component
	const activeAppData = activeApp ? APPS.find(app => app.id === activeApp) : null;

	const handleOpenApp = (appId: string) => {
		setActiveApp(appId);
	};

	const handleCloseApp = () => {
		setActiveApp(null);
	};

	return (
		<Card className="h-full border-none overflow-hidden">
			<CardContent className="relative h-full">
				<AnimatePresence mode="wait">
					{!activeApp ? (
						<motion.div
							key="app-list"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="grid grid-cols-2 gap-4"
						>
							{APPS.map(app => (
								<motion.div
									key={app.id}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="cursor-pointer"
									onClick={() => handleOpenApp(app.id)}
								>
									<Card className="flex flex-row items-center p-3">
										<div className="text-2xl m-3 flex-shrink-0">
											<app.icon />
										</div>
										<div className="flex flex-col">
											<h3 className="font-medium">{app.title}</h3>
											<p className="text-xs text-muted-foreground">
												{app.description}
											</p>
										</div>
									</Card>
								</motion.div>
							))}
						</motion.div>
					) : (
						<motion.div
							key="app-content"
							initial={{ y: 300, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 300, opacity: 0 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							className="h-full relative"
						>
							<div className="h-full border border-dashed border-black dark:border-white rounded-lg overflow-hidden flex flex-col">
								<div className="bg-muted px-4 py-2 flex justify-between items-center border-b">
									<h3 className="font-medium">{activeAppData?.title}</h3>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleCloseApp}
										className="h-7 w-7 p-0 hover:bg-muted/50"
									>
										<X size={16} />
									</Button>
								</div>
								<div className="flex-1 p-4 overflow-auto">
									{activeAppData?.component && <activeAppData.component />}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
};

export default RightPanel;
