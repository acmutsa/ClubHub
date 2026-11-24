"use client";

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

const MIN_TRACK_ITEMS=(20)

function Row({
  items,
  outlined = false,
  reverse = false,
}: {
  items: Item[];
  outlined?: boolean;
  reverse?: boolean;
}) {
  const repeatCount = Math.max(
    1,
    Math.ceil(MIN_TRACK_ITEMS / items.length)
  );

  const track = Array.from({ length: repeatCount }, () => items).flat();

  return (
    <div className="flex w-full overflow-hidden py-2">
      <div
        className={cn(
          "flex w-max shrink-0 gap-3.5",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
      >
        {[0, 1].map((group) => (
          <div
            key={group}
            aria-hidden={group === 1}
            className="flex shrink-0 gap-3.5"
          >
            {track.map(([label, color], i) => (
              <Badge
                key={`${group}-${i}`}
                variant="outline"
                className={cn(
                  "gap-2 rounded-full border-0 bg-white py-2.5 size-11/12 text-base whitespace-nowrap text-black hover:bg-white",
                  outlined && "-rotate-[.6deg]"
                )}
              >
                <span
                  className={cn(
                    "size-2.5 flex-none rounded-full",
                    outlined && "border-2 bg-transparent"
                  )}
                  style={
                    outlined
                      ? { borderColor: color }
                      : { background: color }
                  }
                />
                {label}
              </Badge>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <div
      className="max-w-full mt-2.5 -rotate-1 overflow-hidden bg-black pt-2.5 pb-2.5"
      aria-hidden="true"
    >
      <Row items={top} />
      <Row items={bottom} outlined reverse />
    </div>
  );
}