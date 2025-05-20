import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Clock } from '@/components/-Clock';
import { Separator } from '@/components/ui/separator';
import { DayProgressBar } from '@/components/-DayProgressBar';
import { ConnectionStatus } from '@/app/life-dashboard/-ConnectionStatus';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Life Dashboard',
	description: 'A personal dashboard for life management',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
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
									<Separator
										orientation="vertical"
										className="m-2 data-[orientation=vertical]:h-4"
									/>
									<ConnectionStatus className="mr-4" />
								</div>
							</header>
							<Separator />
							{children}
						</SidebarInset>
					</SidebarProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
