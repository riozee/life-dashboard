'use client';

import React, { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Provider } from 'react-redux';
import lifeAssistStore from './store';
import LeftPanel from './left-panel/LeftPanel';
import RightPanel from './right-panel/RightPanel';
import Editor from './left-panel/Editor';

export default function AppLayout() {
	const [isMobile, setIsMobile] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	// Check if we're on mobile
	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Initial check
		checkIfMobile();

		// Add event listener for window resize
		window.addEventListener('resize', checkIfMobile);

		// Clean up
		return () => window.removeEventListener('resize', checkIfMobile);
	}, []);

	return (
		<Provider store={lifeAssistStore}>
			<Editor>
				{isMobile ? (
					// Mobile layout with Sheet
					<div className="flex flex-col h-full">
						<div className="flex-1 bg-background rounded-lg">
							<LeftPanel />
						</div>

						{/* Fixed chat button */}
						<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
							<SheetTrigger asChild>
								<Button
									className="fixed bottom-4 right-4 rounded-full size-12 shadow-lg p-0 flex items-center justify-center"
									variant="default"
								>
									<MessageSquare className="size-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="p-0 w-full sm:max-w-md">
								<RightPanel />
							</SheetContent>
						</Sheet>
					</div>
				) : (
					// Desktop layout with ResizablePanels
					<ResizablePanelGroup direction="horizontal" className="h-full">
						<ResizablePanel
							defaultSize={70}
							minSize={30}
							className="bg-background rounded-lg"
						>
							<LeftPanel />
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize={30} minSize={30} className="">
							<RightPanel />
						</ResizablePanel>
					</ResizablePanelGroup>
				)}
			</Editor>
		</Provider>
	);
}
