import Link from "next/link"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { ScrollPop } from "@/components/scroll-pop"
import { cn } from "@/lib/utils"

const tickets = [
  { tag: "GM", title: "General Meeting", dot: "#12a36b", tone: "bg-black text-white -rotate-2" },
  { tag: "HACK", title: "Hackathon", dot: "#8b4be8", tone: "bg-white text-black rotate-1" },
  { tag: "GAME", title: "Game Night", dot: "#8b4be8", tone: "bg-black text-white -rotate-1" },
]

export function Lineup() {
  return (
    <section id="events" className="w-11/12 mx-auto py-25 pb-22.5">
      <div className="wrap">
        <p className="font-mono text-xs tracking-[.2em] text-brand-blue uppercase">This week's lineup</p>
        <h2 className="mt-3.5 mb-14 max-w-xl text-4xl leading-[.98] font-extrabold tracking-[-.045em] sm:text-5xl lg:text-6xl">
          Grab a ticket. Free for you, priceless for your résumé.
        </h2>

        <div className="grid gap-7 md:grid-cols-3">
            {tickets.map((t) => (
              <ScrollPop key={t.title}>
                <Link
                  href={'/sign-in?next=/events/${t.slug}'}
                  aria-label={'${t.title}: sign in to get your ticket'}
                  className="group block rounded-2xl outline-offset-4"
                  >
                <Card
                  className={cn(
                    "grid min-h-52 grid-rows-[1fr_auto] gap-0 overflow-hidden rounded-2xl border-4 border-black py-0 shadow-[0.3rem_0.3rem_0_var(--color-black)]",
                    "transition-[translate,box-shadow] duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[0.5rem_0.5rem_0_var(--color-black)]",
                    t.tone
                  )}
                >
                  <CardContent className="flex flex-col justify-between px-5.5 py-5">
                    <span className="flex items-center gap-2 text-[0.625rem] tracking-[.18em]">
                      <span className="size-2 rounded-full border-2" style={{ borderColor: t.dot }} />
                      {t.tag}
                    </span>
                    <div>
                      <CardTitle className="mb-3 text-4xl leading-[.95] font-extrabold tracking-[-.045em]">
                        {t.title}
                      </CardTitle>
                      <CardDescription className="text-[0.625rem] leading-[1.7] tracking-[.06em] text-current opacity-90">
                        [CLUB NAME]<br />[DATE] · [TIME] · [ROOM]
                      </CardDescription>
                    </div>
                  </CardContent>
                  <div className="relative flex items-center justify-center border-t-2 border-dashed border-current">
                    <span className="text-xs tracking-[.2em]">CHECK IN</span>
                    <i className="mx-1 absolute -top-2.5 -left-1 size-4.5 rounded-full border-2 border-current bg-background" />
                    <i className="mx-1 absolute -top-2.5 -right-1 size-4.5 rounded-full border-2 border-current bg-background" />
                  </div>
                </Card>
              </Link>
            </ScrollPop>
          ))}
        </div>
      </div>
    </section>
  )
}