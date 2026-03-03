"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserName, updateUserEmail, updateUserRole, updateUserClubs } from "@/actions/user";
import type { UserRole } from "@/lib/types/user";

interface EditUserModalProps {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditUserModal({ userId, name, email, role, isOpen, onClose, onSave }: EditUserModalProps) {
  const [newName, setNewName] = React.useState(name);
  const [newEmail, setNewEmail] = React.useState(email);
  const [newRole, setNewRole] = React.useState(role);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (newName !== name) await updateUserName(userId, newName);
      if (newEmail !== email) await updateUserEmail(userId, newEmail);
      if (newRole !== role) await updateUserRole(userId, newRole);
      onClose();
      onSave();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder={role} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem className="cursor-pointer" value="user">User</SelectItem>
                        <SelectItem className="cursor-pointer" value="admin">Admin</SelectItem>
                        <SelectItem className="cursor-pointer" value="super_admin">Super Admin</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button className="cursor-pointer" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="ml-2 cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}