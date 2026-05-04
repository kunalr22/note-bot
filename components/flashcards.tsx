"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Flashcard = { front: string; back: string }

function Flashcard({ card }: { card: Flashcard }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <button
      onClick={() => setRevealed((r) => !r)}
      className="w-full text-left rounded-2xl border border-border bg-card px-6 py-5 transition-colors hover:bg-muted/50 focus:outline-none"
    >
      <p className="text-sm font-medium text-foreground">{card.front}</p>

      <div
        className={cn(
          "grid transition-all duration-300",
          revealed ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Answer</p>
            <p className="text-sm text-foreground">{card.back}</p>
          </div>
        </div>
      </div>

      <p className={cn("mt-3 text-xs text-muted-foreground transition-opacity", revealed && "opacity-0")}>
        Click to reveal
      </p>
    </button>
  )
}

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card, i) => (
        <Flashcard key={i} card={card} />
      ))}
    </div>
  )
}
