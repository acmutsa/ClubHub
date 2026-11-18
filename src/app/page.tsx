import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { // Not sure if we need to keep this. I just noticed the metadata says UTSA Clubs and not ClubHub. Discuss in meeting on Tues
  title: "ClubHub",
  description: "Every club on campus, in one place.",
};

export default function HomePage() {
  return (
    <>
      <header>
        {/* Check if the sign in/up buttons are desired at meeting on Tues */}
        {
        <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/sign-up">Create account</Link>
        </Button>
        </div>
        }
      </header>
      <main>
        <section className="text-balance md:text-xl mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl mx-auto max-w-3xl px-6 py-20 text-center">
            Every club on campus, in one place.
          </h1>
          <p className="mt-4 text-lg ">
            ClubHub is where students find orgs and events, and where orgs manage
            their members, events, and attendance.
          </p>
          <p className="mt-2 text-sm">
            Skip out on the FOMO. <a href="/sign-up" className="underline underline-offset-4"> Sign up now. </a>
          </p>
          {
            <div className="mt-2 text-center text-sm">
              Already have an account?{" "}
              <a href="/sign-in" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          }
        </section>
      </main>
    </>
  );
}