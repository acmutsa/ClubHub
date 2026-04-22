export const adminPermissions = {
    VIEW_ADMIN: 1 << 0,
    MANAGE_MEMBERS: 1 << 1,
    MANAGE_EVENTS: 1 << 2,
    TRANSFER_OWNERSHIP: 1 << 3,
    MANAGE_CLUB: 1 << 4,
}

export const ADMIN_MASK = 
    adminPermissions.VIEW_ADMIN |
    adminPermissions.MANAGE_MEMBERS |
    adminPermissions.MANAGE_EVENTS |
    adminPermissions.TRANSFER_OWNERSHIP |
    adminPermissions.MANAGE_CLUB;

export const permissionList = [
    { label: "View Admin", value: adminPermissions.VIEW_ADMIN },
    { label: "Manage Members", value: adminPermissions.MANAGE_MEMBERS },
    { label: "Manage Events", value: adminPermissions.MANAGE_EVENTS },
    { label: "Transfer Ownership", value: adminPermissions.TRANSFER_OWNERSHIP },
    { label: "Manage Club", value: adminPermissions.MANAGE_CLUB },
]