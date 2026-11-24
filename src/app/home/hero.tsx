import Image from "next/image"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <header className="w-11/12 mx-auto grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <h1 className="mb-5 text-5xl md:text-9xl leading:[.94] font-extrabold tracking-[-.045em]">
          Explore
          <br />
          Join
          <br />
          Manage
        </h1>
        <svg className="block h-3.5 w-full max-w-xl" viewBox="0 0 540 14" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M2 7 Q 25 -1 47 7 T 92 7 T 137 7 T 182 7 T 227 7 T 272 7 T 317 7 T 362 7 T 407 7 T 452 7 T 497 7 T 538 7"
            fill="none" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round"
          />
        </svg>
        <p className="my-8 mx-4 max-w-xl text-base leading-relaxed">
          Every UTSA club and every meeting, all on one board. Pick your events, grab your spot, and check in at the door.
        </p>
        <div className="flex flex-wrap gap-3 pl-3">
          <Button asChild variant="link" className="rounded text-background bg-foreground">
            <Link href="/#events">See what's on</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded text-background bg-foreground">
            <Link href="/">Browse clubs</Link>
          </Button>
        </div>
      </div>

      <div className="relative mt-8 w-full max-w-sm justify-self-center lg:mt-0 lg:max-w-md lg:justify-self-end">
        <div className="relative aspect-[4/5] rotate-3 overflow-hidden rounded-3xl border-2 border-foreground">
          <Image
            src="/assets/student-union.jpg"
            alt="Image of student union"
            fill
            sizes="(max-width: 1024px) 24rem, 28rem"
            className="object-cover"
          />
        </div>

        <div className="absolute -top-7 -left-10 size-28 rounded-full animate-badge-spin ... motion-reduce:animate-none" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="size-full">
            <defs><path id="circ" d="M60 60 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0" /></defs>
            <text className="fill-foreground text-xs font-semibold tracking-[.18em]">
              <textPath href="#circ">CLUBS • EVENTS • PEOPLE • </textPath>
            </text>
          </svg>
        </div>
      </div>
    </header>
  );
}