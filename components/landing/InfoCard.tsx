import Image from "next/image";
import { cn } from "@/lib/utils";

export function InfoCard({
  src,
  alt,
  title,
  text,
}: {
  src: string;
  alt: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-card-border bg-white p-8 md:p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <Image src={src} alt={alt} width={56} height={56} className="shrink-0" />
      <div className="flex flex-col items-center">
        <h3 className="font-poppins text-lg font-semibold text-text-main">
          {title}
        </h3>
        <p className="mt-1 font-inter text-sm leading-relaxed text-text-muted">
          {text}
        </p>
      </div>
    </div>
  );
}

export function TutorialStep({
  src,
  alt,
  text,
  delay,
}: {
  src: string;
  alt: string;
  text: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md p-6 md:p-8 text-center",
        delay
      )}
    >
      <Image src={src} alt={alt} width={64} height={64} className="mb-3 h-14 w-14 object-contain" />
      <p className="font-inter text-sm leading-relaxed text-white">{text}</p>
    </div>
  );
}
