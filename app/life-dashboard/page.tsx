import { Notes } from '@/app/life-dashboard/-Notes';
import { CashFlow } from '@/app/life-dashboard/-CashFlow';
import { ProgressTracker } from '@/app/life-dashboard/-ProgressTracker';
import { EventCalendar } from '@/app/life-dashboard/-Events';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function Page() {
	return (
		<ResizablePanelGroup direction="horizontal">
			<ResizablePanel className="h-full">
				<Notes />
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel className="h-full">
				<ProgressTracker />
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel className="h-full">
				<EventCalendar />
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel className="h-full">
				<CashFlow />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
