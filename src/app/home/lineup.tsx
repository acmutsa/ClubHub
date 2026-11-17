import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const tickets = [
  { tag: "GM", title: "General Meeting", dot: "#12a36b", tone: "bg-black text-white -rotate-2" },
  { tag: "HACK", title: "Hackathon", dot: "#8b4be8", tone: "bg-white text-black rotate-1" },
  { tag: "GAME", title: "Game Night", dot: "#8b4be8", tone: "bg-black text-white -rotate-1" },
]

export function Lineup() {
  return (
    <section id="events" className="py-25 pb-22.5">
      <div className="wrap">
        <p className="font-mono text-xs tracking-[.2em] text-brand-blue uppercase">This week&apos;s lineup</p>
        <h2 className="mt-3.5 mb-14 max-w-xl text-4xl leading-[.98] font-extrabold tracking-[-.045em] sm:text-5xl lg:text-6xl">
          Grab a ticket. Free for you, priceless for your résumé.
        </h2>

        <div className="grid gap-7 md:grid-cols-3">
          {tickets.map((t) => (
            <Card
              key={t.title}
              className={cn(
                "grid min-h-52 grid-cols-[1fr_4rem] gap-0 overflow-hidden rounded-2xl border-4 border-black py-0 shadow-[0.3rem_0.3rem_0_var(--color-black)]",
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

              <div className="relative grid place-items-center border-l-2 border-dashed border-current">
                <span className="rotate-180 text-xs tracking-[.2em] [writing-mode:vertical-rl]">CHECK IN</span>
                <i className="absolute -top-2.5 -left-2.5 size-4.5 rounded-full border-2 border-current bg-background" />
                <i className="absolute -bottom-2.5 -left-2.5 size-4.5 rounded-full border-2 border-current bg-background" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}