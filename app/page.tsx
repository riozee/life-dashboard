import { AppSidebar } from '@/components/app-sidebar';
import { Clock } from '@/components/-Clock';
import { Notes } from '@/components/-Notes';
import { CashFlow } from '@/components/-CashFlow';
import { ProgressTracker } from '@/components/-ProgressTracker';
import { EventCalendar } from '@/components/-Events';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { DayProgressBar } from '@/components/-DayProgressBar';

export default function Page() {
	return (
		<SidebarProvider defaultOpen={false} className="h-screen">
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<Clock />
						<Separator
							orientation="vertical"
							className="m-2 data-[orientation=vertical]:h-4"
						/>
						<div className="flex-1 min-w-[320px]">
							<DayProgressBar className="mt-3" />
						</div>
					</div>
				</header>
				<Separator />
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
			</SidebarInset>
		</SidebarProvider>
	);
}
