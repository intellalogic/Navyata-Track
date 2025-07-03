"use client";

import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { Scissors } from "lucide-react";
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!user) {
    return <>{children}</>;
  }

  const homePath = user?.role === 'owner' ? '/' : '/tailoring';

  return (
    <SidebarProvider>
      {/* MOBILE LAYOUT */}
      <div className="md:hidden">
        <header className="flex items-center gap-4 border-b p-2 px-4 bg-background sticky top-0 z-30">
          <SidebarTrigger />
           <Link href={homePath} className="flex items-center gap-2">
              <div className="p-1 bg-primary rounded-md">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Navyata Track</h2>
            </Link>
        </header>
        {/* On mobile, the Sidebar component will render as a Sheet that is controlled by the SidebarTrigger */}
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <main className="p-4">
            {children}
        </main>
      </div>
      
      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex">
        <Sidebar className="h-screen sticky top-0">
          <AppSidebar />
        </Sidebar>
        <div className="flex-1">
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
