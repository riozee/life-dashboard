'use client';

import * as React from 'react';
import { House, Settings, Zap } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
	user: {
		name: 'Rioze',
		email: 'rioze.dev',
		avatar: 'https://avatars.githubusercontent.com/u/92718232?v=4',
	},
	navMain: [
		{
			name: 'Home',
			url: '/',
			icon: House,
		},
		{
			name: 'life-dashboard',
			url: '/life-dashboard',
			icon: Zap,
		},
		{
			name: 'life-assist',
			url: '/life-assist',
			icon: Settings,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="#">
								<Zap className="h-5 w-5" />
								<span className="text-base font-semibold">life-dashboard</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
