import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const width = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-container",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-1000"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
