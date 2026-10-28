import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  //   SidebarGroupItem,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Permission } from "@/constants/permissions";
import { Calendar, Home, Users } from "lucide-react";
import Link from "next/link";

interface ClubAdminSidebarProps {
  permissions: Permission[];
  className?: string;
}

export const ClubAdminSidebar = ({
  permissions,
  className,
}: ClubAdminSidebarProps) => {
  return (
    <Sidebar className={className}>
      <SidebarHeader>
        <h1 className="text-lg font-bold">Admin</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {permissions.includes(Permission.MEMBERS_VIEW) && <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/members">
                    <Users />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>}
              {permissions.includes(Permission.EVENTS_CREATE) && !permissions.includes(Permission.EVENTS_VIEW) && <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/events/new">
                    <Calendar />
                    <span>New event</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>}
              {permissions.includes(Permission.EVENTS_VIEW) && <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/events">
                    <Calendar />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
