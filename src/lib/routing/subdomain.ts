export function getSubdomain(host: string): string {
  if (host.split(".").length > 1) {
    return host.split(".")[0];
  }
  return "";
}

export function modifyBasePath(
  clubId: string,
  host: string,
  path: string,
): string {
  const hostName = getSubdomain(host);
  if (hostName) {
    return path;
  }
  return `/clubs/${clubId}${path}`;
}
