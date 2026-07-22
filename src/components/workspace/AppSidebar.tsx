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
import { Mail, FileText, CalendarClock, Sparkles, ShieldCheck } from "lucide-react";
import { useWorkspace, type View } from "@/lib/workspace-context";

const NAV: Array<{ id: View; label: string; icon: typeof Mail }> = [
  { id: "email", label: "Smart Email", icon: Mail },
  { id: "meeting", label: "Meeting Notes", icon: FileText },
  { id: "planner", label: "Task Planner", icon: CalendarClock },
];

export function AppSidebar() {
  const { view, setView, factCheck, setFactCheck } = useWorkspace();
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
                <SidebarMenuItem key={n.id}>
                  <SidebarMenuButton
                    isActive={view === n.id}
                    onClick={() => setView(n.id)}
                    tooltip={n.label}
                  >
                    <n.icon className="h-4 w-4" />
                    <span>{n.label}</span>
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
                  <Label htmlFor="fact-check" className="text-sm">Fact & Bias Check</Label>
                  <p className="text-xs text-muted-foreground">Highlight unverified claims</p>
                </div>
              </div>
              <Switch id="fact-check" checked={factCheck} onCheckedChange={setFactCheck} />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          v1.0 · Demo mock outputs
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
