"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  userRating?: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  userRating,
  onChange,
  size = "sm",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
      onClick={(e) => e.stopPropagation()}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hovered ? star <= hovered : star <= (userRating || 0);
        const avgFilled = !hovered && !userRating && star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            className={cn(
              "p-0 border-0 bg-transparent cursor-pointer transition-colors",
              onChange ? "hover:scale-110" : "cursor-default"
            )}
            onMouseEnter={() => onChange && setHovered(star)}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(star);
            }}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? "fill-primary text-primary"
                  : avgFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-1 text-xs text-muted-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}
