"use client";
import { UserProp } from "../lib/types/users";

export default function AdminUserTable({ user }: UserProp) {
    const isSuperAdmin = user.role === "super_admin";
    
    return (
        <div>admin-user-table</div>
    )
}
