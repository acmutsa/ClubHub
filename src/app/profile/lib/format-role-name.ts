export function formatRoleName(roleName: string) {
  const words = roleName.trim().toLowerCase().replace(/_+/g, " ").replace(/\s+/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
