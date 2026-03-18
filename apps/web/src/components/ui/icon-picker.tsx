import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Folder, Briefcase, Home, Star, Heart, Zap, Target, Book,
  Music, Camera, Code, Coffee, Globe, Layers, Layout, Mail,
  Map, Monitor, Package, Palette, Phone, Settings, ShoppingCart,
  Smile, Tag, Truck, Users, type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "folder", icon: Folder },
  { name: "briefcase", icon: Briefcase },
  { name: "home", icon: Home },
  { name: "star", icon: Star },
  { name: "heart", icon: Heart },
  { name: "zap", icon: Zap },
  { name: "target", icon: Target },
  { name: "book", icon: Book },
  { name: "music", icon: Music },
  { name: "camera", icon: Camera },
  { name: "code", icon: Code },
  { name: "coffee", icon: Coffee },
  { name: "globe", icon: Globe },
  { name: "layers", icon: Layers },
  { name: "layout", icon: Layout },
  { name: "mail", icon: Mail },
  { name: "map", icon: Map },
  { name: "monitor", icon: Monitor },
  { name: "package", icon: Package },
  { name: "palette", icon: Palette },
  { name: "phone", icon: Phone },
  { name: "settings", icon: Settings },
  { name: "shopping-cart", icon: ShoppingCart },
  { name: "smile", icon: Smile },
  { name: "tag", icon: Tag },
  { name: "truck", icon: Truck },
  { name: "users", icon: Users },
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, color = "#6366f1", disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const CurrentIcon = ICON_OPTIONS.find((i) => i.name === value)?.icon ?? Folder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          disabled={disabled}
          className="w-10 h-10 rounded-md border-2 transition-transform hover:scale-105 focus:outline-none flex items-center justify-center bg-background"
          style={{ borderColor: color }}
          onClick={() => setOpen(!open)}
        >
          <CurrentIcon size={18} style={{ color }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="grid grid-cols-5 gap-1">
          {ICON_OPTIONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => { onChange(name); setOpen(false); }}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-md transition-all hover:scale-110 focus:outline-none",
                value === name ? "bg-accent scale-110 shadow-sm" : "hover:bg-accent/50"
              )}
            >
              <Icon size={16} style={{ color }} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}