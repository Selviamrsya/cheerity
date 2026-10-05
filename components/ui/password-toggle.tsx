import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordToggle({
  visible,
  onToggle,
  className,
}: {
  visible: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent text-gray-500",
        className
      )}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
