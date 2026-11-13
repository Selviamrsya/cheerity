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
    <div className="flex flex-col items-center gap-1.5 rounded-md border border-card-border bg-white p-2.5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:gap-2 sm:p-8 md:p-10">
      <Image src={src} alt={alt} width={56} height={56} className="h-9 w-9 shrink-0 object-contain sm:h-14 sm:w-14" />
      <div className="flex flex-col items-center">
        <h3 className="font-poppins text-[11px] font-semibold text-text-main sm:text-lg">
          {title}
        </h3>
        <p className="mt-0.5 font-inter text-[10px] leading-tight text-text-muted sm:mt-1 sm:text-xs sm:leading-relaxed md:text-sm">
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
        "flex flex-col items-center rounded-md p-1.5 text-center sm:p-3 xl:p-6",
        delay
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className="mb-1 h-6 w-6 object-contain sm:h-9 sm:w-9 xl:mb-1.5 xl:h-14 xl:w-14"
      />

      <p className="font-inter text-[8px] leading-tight text-white sm:text-[10px] xl:text-xs xl:leading-relaxed">
        {text}
      </p>
    </div>
  );
}