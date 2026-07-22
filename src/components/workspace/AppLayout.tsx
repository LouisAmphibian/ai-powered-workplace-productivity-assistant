import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger />
                <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
              </div>
              <ThemeToggle />
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </WorkspaceProvider>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
