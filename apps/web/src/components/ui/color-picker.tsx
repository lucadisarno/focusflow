import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#64748b", // slate
  "#78716c", // stone
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          disabled={disabled}
          className={cn(
            "w-10 h-10 rounded-md border-2 transition-transform hover:scale-105 focus:outline-none",
          )}
          style={{ backgroundColor: value, borderColor: value }}
          onClick={() => setOpen(!open)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="start">
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={cn(
                "w-9 h-9 rounded-md border-2 transition-all hover:scale-110 focus:outline-none",
                value === color
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
            />
          ))}
        </div>
        {/* Input hex manuale */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border shrink-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-xs border rounded px-2 py-1 bg-background font-mono"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}