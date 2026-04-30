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
import { AdminSelectClub } from "@/lib/types/club";
import { Calendar, Home, Image, Users } from "lucide-react";
import Link from "next/link";
import { TransferOwnershipButton } from "@/components/shared/membership/buttons";

interface ClubAdminSidebarProps {
  club: AdminSelectClub;
  className?: string;
  isOwner?: boolean;
  baseUrl: string;
}

export const ClubAdminSidebar = ({
  club,
  className,
  isOwner,
  baseUrl,
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
                  <Link href={`${baseUrl}/admin`}>
                    <Home />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`${baseUrl}/admin/members`}>
                    <Users />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`${baseUrl}/admin/events`}>
                    <Calendar />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`${baseUrl}/admin/thumbnails`}>
                    <Image />
                    <span>Thumbnails</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isOwner && (
                <SidebarMenuItem>
                  <TransferOwnershipButton slug={club.slug} />
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
