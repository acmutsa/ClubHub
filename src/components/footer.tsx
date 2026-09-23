import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
import CreatedWithClubHub from "./created-with-clubhub";

interface FooterProps {
  clubId: string;
  clubName: string;
  //we will need to add an array of link for the clubs socials/contact info and image/logo
}

export default function Footer({ clubId, clubName }: FooterProps) {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">{clubName}</h2>
            <p className="text-sm text-muted-foreground">
              A registered student organization @ Example University.
            </p>

            <CreatedWithClubHub />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Get Involved</h3>
            <Link href="/join" className="block text-sm hover:underline">
              Join the Club
            </Link>
            <Link href="/events" className="block text-sm hover:underline">
              Upcoming Events
            </Link>
            <Link href="/officers" className="block text-sm hover:underline">
              Meet the Officers
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Resources</h3>
            <Link href="/about" className="block text-sm hover:underline">
              About
            </Link>
            <Link href="/contact" className="block text-sm hover:underline">
              Contact
            </Link>
            <Link
              href="/constitution"
              className="block text-sm hover:underline"
            >
              Constitution
            </Link>
            <Link
              href="/code-of-conduct"
              className="block text-sm hover:underline"
            >
              Code of Conduct
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Connect</h3>

            <p className="text-sm text-muted-foreground">
              <a href="mailto:organization@example.com">
                organization@example.com
              </a>
            </p>

            <div className="flex gap-3">
              <a
                href="https://github.com"
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
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {clubName}
          </span>
        </div>
      </div>
    </footer>
  );
}
