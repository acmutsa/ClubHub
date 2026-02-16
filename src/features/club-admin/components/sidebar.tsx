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
import { AdminSelectClub } from "@/features/clubs/lib/types/club";
import { Calendar, Home, Users } from "lucide-react";
import Link from "next/link";

interface ClubAdminSidebarProps {
  club: AdminSelectClub;
  className?: string;
}

export const ClubAdminSidebar = ({
  club,
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
                  <Link href={`/admin`}>
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/admin/members`}>
                    <Users />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/admin/events`}>
                    <Calendar />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
