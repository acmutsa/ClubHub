export const GLOBAL_PATHS = ["/profile", "/settings"];

export function isGlobalPath(pathname: string) {
  return GLOBAL_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function getRootHost(host: string, localRootHost: string) {
  if (host.endsWith(`.${localRootHost}`)) return localRootHost;

  const [hostname, port] = host.split(":");
  const rootHostname = hostname.split(".").slice(1).join(".");

  return port ? `${rootHostname}:${port}` : rootHostname;
}
