'use client';

import React from 'react';
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import ThemeSwitcher from "@/components/theme/theme-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password";

  return (
    <>
      {isAuthPage ? (
        <main className="w-full">
          <ThemeSwitcher />
          {children}
        </main>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <SidebarTrigger className="z-50 absolute size-10 p-3 m-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground" />
            <ThemeSwitcher />
            {children}
          </main>
        </SidebarProvider>
      )}
    </>
  );
}