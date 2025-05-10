import { AppSidebar } from '@/components/app-sidebar';
import { Clock } from '@/components/-Clock';
import { Notes } from '@/components/-Notes';
import { CashFlow } from '@/components/-CashFlow';
import { ProgressTracker } from '@/components/-ProgressTracker';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

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
						<div className="flex h-full w-full items-center justify-center">
							<h1 className="text-2xl font-bold">enaknya diisi apa?</h1>
						</div>
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
