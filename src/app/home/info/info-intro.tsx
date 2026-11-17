import Link from "next/link"
import { Button } from "@/components/ui/button"

export function InfoIntro() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-24">
      <p className="text-xs tracking-[.2em] uppercase">Welcome to ClubHub</p>
      <h2 className="mt-4 font-display text-4xl leading-none font-extrabold tracking-[-.045em] sm:text-5xl lg:text-6xl">
        Club management made simple.
      </h2>
      <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
        ClubHub connects students and organizations in one place to discover clubs, manage memberships, and take part in
        campus events. Students get one home for everything happening on campus, and organizers get the tools to run a
        club without spreadsheets, group chats and paper sign-in sheets.
      </p>
      <Button asChild size="lg" className="mt-10">
        <Link href="/sign-up">Create Account</Link>
      </Button>
    </section>
  )
}
