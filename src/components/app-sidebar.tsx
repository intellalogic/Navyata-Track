"use client";

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Scissors, ShoppingCart, CreditCard, LogOut, UserCircle, BarChart, Palette } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setOpenMobile } = useSidebar();

  const allNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analysis', label: 'Analysis', icon: BarChart },
    { href: '/tailoring', label: 'Tailoring', icon: Scissors },
    { href: '/sales', label: 'Sales', icon: ShoppingCart },
    { href: '/designs', label: 'Designs', icon: Palette },
    { href: '/expenses', label: 'Expenses', icon: CreditCard },
  ];

  const navItems = user?.role === 'staff'
    ? allNavItems.filter((item) => !['/', '/analysis'].includes(item.href))
    : allNavItems;

  const homePath = user?.role === 'owner' ? '/' : '/tailoring';

  const handleLogout = () => {
    logout();
    setOpenMobile(false);
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="p-4">
         <Link href={homePath} onClick={() => setOpenMobile(false)} className="flex items-center gap-2.5">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Scissors className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Navyata Track
            </h2>
          </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={() => setOpenMobile(false)} className="w-full">
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="justify-start w-full"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
           <SidebarSeparator className="my-1"/>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="justify-start w-full">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto">
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton className="justify-start w-full" disabled>
                    <UserCircle className="h-4 w-4 mr-2" />
                    <span className="capitalize">{user?.role}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
