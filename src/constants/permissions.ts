// Club permissions; the database stores the value (e.g. "events.create")
export enum Permission {
  DASHBOARD_VIEW = "dashboard.view",
  EVENTS_VIEW = "events.view",
  EVENTS_CREATE = "events.create",
  EVENTS_EDIT = "events.edit",
  EVENTS_DELETE = "events.delete",
  EVENT_CATEGORIES_MANAGE = "eventCategories.manage",
  GALLERY_VIEW = "gallery.view",
  MEMBERS_VIEW = "members.view",
  MEMBERS_INVITE = "members.invite",
  MEMBERS_EDIT = "members.edit",
  MEMBERS_CHANGE_ROLE = "members.changeRole",
  ROLES_VIEW = "roles.view",
  ROLES_MANAGE = "roles.manage",
  SUB_ORGS_MANAGE = "subOrgs.manage",
  SEMESTERS_MANAGE = "semesters.manage",
  CLUB_SETTINGS_VIEW = "club.settings.view",
  CLUB_SETTINGS_MANAGE = "club.settings.manage",
}
export const ALL_PERMISSIONS = Object.values(Permission);

export type PermissionCategory =
  | "Dashboard"
  | "Events"
  | "Gallery"
  | "Members"
  | "Roles"
  | "Sub-orgs"
  | "Semesters"
  | "Club";

type PermissionMeta = {
  label: string;
  description: string;
  category: PermissionCategory;
};

export const PERMISSION_META = {
  [Permission.DASHBOARD_VIEW]: {
    label: "View dashboard",
    description: "View the club dashboard.",
    category: "Dashboard",
  },

  [Permission.EVENTS_VIEW]: {
    label: "View events",
    description: "View club events.",
    category: "Events",
  },
  [Permission.EVENTS_CREATE]: {
    label: "Create events",
    description: "Create club events.",
    category: "Events",
  },
  [Permission.EVENTS_EDIT]: {
    label: "Edit events",
    description: "Update club events.",
    category: "Events",
  },
  [Permission.EVENTS_DELETE]: {
    label: "Delete events",
    description: "Delete club events.",
    category: "Events",
  },
  [Permission.EVENT_CATEGORIES_MANAGE]: {
    label: "Manage event categories",
    description: "Create, edit, and delete event categories.",
    category: "Events",
  },

  [Permission.GALLERY_VIEW]: {
    label: "View gallery",
    description: "View the club gallery.",
    category: "Gallery",
  },

  [Permission.MEMBERS_VIEW]: {
    label: "View members",
    description: "View club members.",
    category: "Members",
  },
  [Permission.MEMBERS_INVITE]: {
    label: "Invite members",
    description: "Invite users to the club.",
    category: "Members",
  },
  [Permission.MEMBERS_EDIT]: {
    label: "Edit members",
    description: "Update club members.",
    category: "Members",
  },
  [Permission.MEMBERS_CHANGE_ROLE]: {
    label: "Change member roles",
    description: "Assign members to roles below your own role.",
    category: "Members",
  },

  [Permission.ROLES_VIEW]: {
    label: "View roles",
    description: "View club roles and permissions.",
    category: "Roles",
  },
  [Permission.ROLES_MANAGE]: {
    label: "Manage roles",
    description: "Create, edit, and reorder club roles.",
    category: "Roles",
  },

  [Permission.SUB_ORGS_MANAGE]: {
    label: "Manage sub-orgs",
    description: "Create, edit, and delete sub-organizations.",
    category: "Sub-orgs",
  },

  [Permission.SEMESTERS_MANAGE]: {
    label: "Manage semesters",
    description: "Create, edit, and delete semesters.",
    category: "Semesters",
  },

  [Permission.CLUB_SETTINGS_VIEW]: {
    label: "View club settings",
    description: "View club settings.",
    category: "Club",
  },
  [Permission.CLUB_SETTINGS_MANAGE]: {
    label: "Manage club settings",
    description: "Update club settings.",
    category: "Club",
  },
} satisfies Record<Permission, PermissionMeta>;
