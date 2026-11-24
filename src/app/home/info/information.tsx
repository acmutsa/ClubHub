import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { InfoArt } from "./info-art"
import { audiences } from "./info-data"
import { InfoIntro } from "./info-intro"
import { ScrollPop } from "@/components/scroll-pop"

export default function Info() {
  return (
    <>
      <InfoIntro />
      <section className="w-11/12 mx-auto border-y-2 border-foreground py-16 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 sm:px-6 lg:px-8">
          {audiences.map((a, i) => (
            <div key={a.id} id={a.id} className="grid items-center gap-12 md:grid-cols-2">
              <div className={cn("mx-auto w-full max-w-sm", i % 2 === 1 && "md:order-2")}>
                <ScrollPop>
                  <div
                    className={cn(
                      "aspect-square rounded-3xl border-4 border-black bg-white p-6 shadow-[0.4rem_0.4rem_0_var(--color-black)]",
                      i % 2 === 0 ? "-rotate-2" : "rotate-2"
                    )}
                  >
                    <InfoArt kind={a.id} />
                  </div>
                </ScrollPop>
              </div>

              <Card className="gap-6 rounded-3xl border-4 border-black bg-black py-8 text-white">
                <CardHeader>
                  <CardTitle className="font-display text-3xl font-extrabold tracking-[-.045em] sm:text-4xl">
                    For {a.label}
                  </CardTitle>
                  <CardDescription className="text-base text-white/80">{a.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-6">
                    {a.features.map((f) => (
                      <li key={f.title} className="flex gap-4">
                        <span className="grid size-10 flex-none place-items-center rounded-full bg-white text-black">
                          <f.icon className="size-5" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold">{f.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-white/80">{f.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
