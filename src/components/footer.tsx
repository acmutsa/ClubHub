import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex gap-3">
              <a
                href="https://github.com/UTSA-ACM"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 hover:opacity-70" />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 hover:opacity-70" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 hover:opacity-70" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 hover:opacity-70" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:organization@example.com">
                team@acmutsa.org
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Get Involved</h3>
            <Link href="https://rowdylink.utsa.edu/organization/acm" className="block text-sm hover:underline">
              Join the Club
            </Link>
            <Link href="https://acmutsa.org/events" className="block text-sm hover:underline">
              Upcoming Events
            </Link>
            <Link href="https://rowdylink.utsa.edu/organization/acm/roster" className="block text-sm hover:underline">
              Meet Our Officers
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Resources</h3>
            <Link href="/#about" className="block text-sm hover:underline">
              About
            </Link>
            <Link href="https://utsa.campuslabs.com/engage/organization/acm/contact" className="block text-sm hover:underline">
              Contact
            </Link>
            <Link href="/#students" className="block text-sm hover:underline">
              Students
            </Link>
            <Link href="/#organizations" className="block text-sm hover:underline">
              Organizations
            </Link>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>
            © {new Date().getFullYear()}
          </span>
          <p className="text-sm text-muted-foreground">
              A registered student organization @ The University of Texas at San Antonio.
            </p>
        </div>
      </div>
    </footer>
  );
}
