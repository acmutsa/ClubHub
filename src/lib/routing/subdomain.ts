export function getBasePath(
  host: string,
): string{

  if (host.split(".").length > 1){
      return host.split(".")[0]
    }
    return ""
}
