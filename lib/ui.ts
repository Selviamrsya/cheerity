import { cva, type VariantProps } from "class-variance-authority";

export const formControlClass =
  "w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-75";

export const formLabelClass =
  "font-inter text-[13.5px] font-semibold text-gray-700";

export const formErrorClass = "mt-0.5 text-xs text-red-600";

export const formHintClass = "mt-1 text-xs text-on-surface-variant";

export const formGroupClass = "flex flex-col gap-1.5";

export const formErrorBoxClass =
  "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-800";

export const pageContainerClass = {
  default:
    "mx-auto w-full max-w-330 px-4 pb-10 pt-8 md:px-9 md:pb-14 md:pt-12",
  wide: "mx-auto w-full max-w-345 px-4 pb-10 pt-8 md:px-6 md:pb-14 md:pt-12",
  admin:
    "mx-auto w-full max-w-330 px-4 pb-16 pt-8 md:px-9 md:pb-20",
  institution:
    "mx-auto w-full max-w-330 px-4 pb-16 pt-8 md:px-9 md:pb-20",
  profile: "mx-auto w-full max-w-330 px-4 py-4 md:px-9",
} as const;

export const filterSelectClass =
  "w-full cursor-pointer appearance-none rounded-sm border border-outline bg-white bg-[length:14px_14px] bg-[position:right_10px_center] bg-no-repeat py-2.5 pr-8 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary sm:w-auto bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]";

export const filterSearchWrapClass =
  "flex min-w-0 flex-1 items-center gap-1.5 rounded-sm border border-outline bg-white px-3.5 sm:min-w-60";

export const pageTitleClass =
  "font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]";

export const pageSubtitleClass =
  "font-inter text-sm leading-relaxed text-text-muted md:text-[15px]";

export const statsGridClass =
  "my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";

export const donationGridClass =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const tableWrapperClass = "overflow-x-auto";

export const tableClass = "w-full border-collapse text-left";

export const tableHeadClass =
  "border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold uppercase tracking-wide text-text-subtle sm:px-4";

export const tableRowClass = "transition-colors hover:bg-bg-light";

export const tableCellClass =
  "border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4";

export const tableCardClass =
  "relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6 md:px-9";

export const tableIconBtnClass =
  "inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800";

export const navLinkClass = cva(
  "relative bg-transparent px-2.5 py-2 text-sm font-medium no-underline transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t after:bg-primary after:transition-transform after:content-[''] hover:bg-transparent hover:after:scale-x-100 md:px-3.5",
  {
    variants: {
      tone: {
        default:
          "text-on-surface-variant hover:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:after:scale-x-100",
        overlay:
          "text-white/90 hover:text-white data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:after:scale-x-100 after:bg-white",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export const navIconBtnClass = cva(
  "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-all",
  {
    variants: {
      tone: {
        default:
          "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        overlay: "text-white hover:bg-white/15 hover:text-white",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export type NavTone = NonNullable<VariantProps<typeof navLinkClass>["tone"]>;
