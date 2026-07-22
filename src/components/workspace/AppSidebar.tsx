import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  History,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "@/lib/workspace-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/email", label: "Smart Email", icon: Mail },
  { to: "/app/meeting", label: "Meeting Notes", icon: FileText },
  { to: "/app/planner", label: "Task Planner", icon: CalendarClock },
  { to: "/app/research", label: "Research", icon: BookOpen },
  { to: "/app/chat", label: "AI Chatbot", icon: MessageSquare },
] as const;

const SECONDARY = [
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/help", label: "Help", icon: HelpCircle },
] as const;

export function AppSidebar() {
  const { factCheck, setFactCheck } = useWorkspace();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">WorkSpace AI</div>
            <div className="truncate text-xs text-muted-foreground">Productivity Assistant</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(n.to, n.exact)}
                    tooltip={n.label}
                  >
                    <Link to={n.to}>
                      <n.icon className="h-4 w-4" />
                      <span>{n.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild isActive={isActive(n.to)} tooltip={n.label}>
                    <Link to={n.to}>
                      <n.icon className="h-4 w-4" />
                      <span>{n.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Responsible AI</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center justify-between gap-2 rounded-md border p-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="fact-check" className="text-sm">
                    Fact & Bias Check
                  </Label>
                  <p className="text-xs text-muted-foreground">Highlight unverified claims</p>
                </div>
              </div>
              <Switch id="fact-check" checked={factCheck} onCheckedChange={setFactCheck} />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="justify-start group-data-[collapsible=icon]:justify-center"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
