"use client";

import { cn } from "@/lib/utils";

interface HeatmapProps {
  /** 7x24 matrix: [dayOfWeek][hour] = count. Day 0 = Sunday */
  data: number[][];
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensityClass(value: number, max: number): string {
  if (max === 0 || value === 0) return "bg-muted/30";
  const ratio = value / max;
  if (ratio < 0.15) return "bg-primary/10";
  if (ratio < 0.3) return "bg-primary/20";
  if (ratio < 0.5) return "bg-primary/40";
  if (ratio < 0.7) return "bg-primary/60";
  if (ratio < 0.85) return "bg-primary/80";
  return "bg-primary";
}

export function Heatmap({ data, className }: HeatmapProps) {
  // Find max value for scaling
  const max = data.reduce(
    (m, row) => Math.max(m, ...row),
    0
  );

  // Only show hours 6-23 (6am to 11pm) to save space
  const startHour = 6;
  const endHour = 23;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Hour labels */}
      <div className="flex items-center gap-[2px] ml-10">
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
            {h % 3 === 0 ? `${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}` : ""}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {DAYS.map((day, dayIdx) => (
        <div key={day} className="flex items-center gap-[2px]">
          <span className="w-10 text-[10px] text-muted-foreground font-medium shrink-0 text-right pr-2">
            {day}
          </span>
          {hours.map((hour) => {
            const value = data[dayIdx]?.[hour] ?? 0;
            return (
              <div
                key={hour}
                className={cn(
                  "flex-1 aspect-square rounded-[2px] min-w-[10px] transition-colors",
                  getIntensityClass(value, max)
                )}
                title={`${day} ${hour}:00 — ${value} event${value !== 1 ? "s" : ""}`}
              />
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 pt-1">
        <span className="text-[9px] text-muted-foreground mr-1">Less</span>
        {[0, 0.15, 0.3, 0.5, 0.7, 0.85, 1].map((ratio, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-[2px]",
              getIntensityClass(ratio * max, max)
            )}
          />
        ))}
        <span className="text-[9px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}
