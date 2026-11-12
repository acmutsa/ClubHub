import SiteNavbar from "../_components/site-navbar";

// Route group so the site navbar wraps /clubs only, not the /clubs/[clubId]
// subsites (which have their own club navbar).
export default function DirectoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
