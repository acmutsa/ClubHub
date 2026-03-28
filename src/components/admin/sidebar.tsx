"use client";

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
} from "@/components/ui/sidebar"
import { Home, Building2, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";
 
export default function AppSidebar() {
  const pathname = usePathname();
  const segment = pathname.split('/');
  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }
    const temp = "/" + segment[1] + "/2" + segment[2];
    if (temp === href) {
      return true;
    }
    return false;
  }

  return (
    <Sidebar className="absolute h-full min-h-0">
      <SidebarContent className="flex flex-1 min-h-0">
        <SidebarGroup >
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/admin")} asChild>
                  <Link href={"/admin"}>
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/admin/clubs")} asChild>
                  <Link href={"/admin/clubs"}>
                    <Building2 />
                    <span>Clubs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/admin/events")} asChild>
                  <Link href={"/admin/events"}>
                    <Calendar />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/admin/users")} asChild>
                  <Link href={"/admin/users"}>
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}