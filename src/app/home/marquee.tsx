import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Item = readonly [label: string, color: string]

const top: Item[] = [
  ["General Meeting", "#12a36b"], ["Workshop", "#3b6cf0"], ["Social", "#ff8a3d"], ["Hackathon", "#8b4be8"],
  ["Guest Speaker", "#6a5cf0"], ["Networking", "#1a9ad7"], ["Career Fair", "#1a9ad7"], ["Study Session", "#12a36b"],
]
const bottom: Item[] = [
  ["Cultural Event", "#e0364f"], ["Game Night", "#8b4be8"], ["Community Service", "#12a36b"], ["Competition", "#e0364f"],
  ["Study Session", "#12a36b"], ["Career Fair", "#1a9ad7"], ["Networking", "#8b4be8"],
]

function Row({ items, outlined = false, reverse = false }: { items: Item[]; outlined?: boolean; reverse?: boolean }) {
  const group = [...items, ...items] // two identical groups below => translateX(-50%) loops seamlessly
  return (
    <div
      className={cn(
        "flex w-max animate-slide gap-3.5 py-1 motion-reduce:animate-none",
        reverse && "-ml-30 [animation-direction:reverse]"
      )}
    >
      {[0, 1].map((g) => (
        <div key={g} className="flex gap-3.5" aria-hidden={g === 1}>
          {group.map(([label, color], i) => (
            // bg-white / text-black are fixed colors, so light/dark theme switching doesn't change them
            <Badge
              key={`${g}-${i}`}
              variant="outline"
              className={cn(
                "gap-2.5 rounded-full border-0 bg-white px-5.5 py-2.5 text-base whitespace-nowrap text-black hover:bg-white",
                outlined && "-rotate-[.6deg]"
              )}
            >
              <span
                className={cn("size-2.5 flex-none rounded-full", outlined && "border-2 bg-transparent")}
                style={outlined ? { borderColor: color } : { background: color }}
              />
              {label}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  )
}

export function Marquee() {
  return (
    <div className="-mx-4 mt-2.5 -rotate-1 overflow-hidden bg-black pt-4.5 pb-5.5" aria-hidden="true">
      <Row items={top} />
      <Row items={bottom} outlined reverse />
    </div>
  )
}