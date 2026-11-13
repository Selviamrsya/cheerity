/**
 * One-off class-name migration helper.
 * Maps legacy CSS class tokens to Tailwind utility strings.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const map = {
  "form-input":
    "w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-2.75 font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400",
  "form-textarea": "min-h-20 resize-none",
  "form-label": "font-inter text-[13.5px] font-semibold text-gray-700",
  "form-error": "mt-0.5 text-xs text-red-600",
  "form-group": "mb-5 flex flex-col gap-1.5",
  "form-error-box":
    "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-800",
  "form-login-group": "flex flex-col gap-1.5",
  "btn btn-primary btn-auto":
    "inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50",
  "btn btn-outline btn-auto":
    "inline-flex w-auto items-center justify-center gap-2 rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light disabled:opacity-50",
  "btn btn-primary":
    "relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50",
  "btn btn-outline":
    "inline-flex items-center justify-center rounded-sm border border-outline bg-white px-6 py-2 font-inter text-[15px] font-semibold text-on-surface transition-all hover:bg-bg-light",
  "admin-layout": "flex min-h-screen flex-col",
  "institution-layout": "flex min-h-screen flex-col",
  "root-layout": "flex min-h-screen flex-col",
  "admin-page-container":
    "mx-auto w-full max-w-330 px-4 pb-16 pt-24 md:px-9 md:pb-20 md:pt-[108px]",
  "institution-page-container":
    "mx-auto w-full max-w-330 px-4 pb-16 pt-20 md:px-9 md:pb-20 md:pt-[84px]",
  "institution-page-profile": "mx-auto w-full max-w-330 px-4 py-4 md:px-9",
  "user-page-container":
    "mx-auto w-full max-w-330 px-4 pb-10 pt-8 md:px-9 md:pb-14 md:pt-12",
  "user-page-profile": "mx-auto w-full max-w-330 px-4 py-4 md:px-9",
  "page-container":
    "mx-auto w-full max-w-345 px-4 pb-10 pt-8 md:px-6 md:pb-14 md:pt-12",
  "admin-verify-page": "flex flex-col shadow-sm",
  "admin-header":
    "flex flex-col gap-4 border-b border-outline pb-4 sm:flex-row sm:items-center sm:justify-between",
  "institution-header":
    "mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
  "user-header": "mt-2 mb-3 md:mt-4",
  "admin-title":
    "mb-1 font-poppins text-[22px] font-medium tracking-tight text-text-main md:text-[26px]",
  "institution-title":
    "font-poppins text-[22px] font-medium tracking-tight text-on-surface md:text-[26px]",
  "admin-subtitle": "font-inter text-[13.5px] leading-relaxed text-text-muted",
  "institution-subtitle": "font-inter text-sm text-text-muted md:text-[15px]",
  "admin-stats-grid":
    "my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  "institution-stats-grid":
    "my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  "admin-stat-card-warning": "border-warning-border bg-warning-bg",
  "admin-stat-card":
    "flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  "institution-stat-card":
    "flex flex-col justify-between gap-1 rounded-sm border border-card-border bg-surface px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  "admin-stat-header": "flex items-center justify-between text-xs",
  "institution-stat-header": "flex items-center justify-between text-xs",
  "admin-stat-label-warning": "text-warning",
  "admin-stat-label":
    "font-inter text-[11px] font-medium uppercase tracking-wide text-text-muted",
  "institution-stat-label":
    "font-inter text-[11px] font-medium uppercase tracking-wide text-text-muted",
  "admin-stat-value-warning": "text-warning",
  "admin-stat-value":
    "font-poppins text-2xl font-extrabold leading-tight tracking-tight text-text-main",
  "institution-stat-value":
    "font-poppins text-2xl font-extrabold leading-tight tracking-tight text-text-main",
  "chart-card":
    "mb-4 flex min-h-100 w-full flex-col rounded-sm border border-card-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  "chart-header":
    "flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between",
  "chart-title-group": "flex items-center gap-2.5",
  "chart-icon-box":
    "flex h-[34px] w-[34px] items-center justify-center rounded-sm bg-primary-50 text-primary-800",
  "chart-title": "font-poppins text-lg font-medium text-text-main",
  "chart-subtitle": "mt-1 font-inter text-xs text-text-muted",
  "chart-filter-group":
    "inline-flex self-start rounded-lg border border-outline bg-surface-container p-1 sm:self-auto",
  "chart-filter-btn":
    "cursor-pointer rounded-md border-none bg-transparent px-4 py-1.5 font-inter text-xs font-medium capitalize text-text-muted transition-all hover:text-text-main data-[active=true]:bg-surface data-[active=true]:text-primary-900 data-[active=true]:shadow-sm",
  "chart-svg-container": "relative w-full flex-1 overflow-x-auto",
  "chart-svg": "h-80 min-w-[600px] w-full overflow-visible",
  "chart-grid-line": "stroke-outline stroke-1",
  "chart-grid-text": "fill-text-subtle font-inter text-xs font-medium",
  "chart-line":
    "fill-none stroke-primary-800 stroke-[3.5] [stroke-linecap:round] [stroke-linejoin:round]",
  "chart-point":
    "fill-surface stroke-primary-800 stroke-[1.5] transition-all data-[active=true]:fill-primary-800 data-[active=true]:stroke-[2.5]",
  "chart-axis-label":
    "fill-text-subtle font-poppins text-xs font-medium transition-[fill] data-[active=true]:fill-primary-900",
  "chart-tooltip":
    "pointer-events-none absolute z-10 mt-[-10px] -translate-x-1/2 -translate-y-full rounded-md bg-text-main px-3 py-2 font-inter text-[11.5px] text-surface shadow-lg",
  "chart-tooltip-count": "font-medium text-surface",
  "chart-tooltip-date": "text-xs text-text-subtle",
  "admin-table-card":
    "flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:px-9",
  "institution-table-card":
    "relative flex flex-col px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6",
  "user-table-card":
    "relative flex flex-col bg-surface px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-9",
  "institution-donation-form":
    "relative flex flex-col py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  "admin-filter-row":
    "mb-1 flex flex-wrap items-center justify-between gap-4",
  "admin-search-wrapper": "relative flex min-w-[250px] max-w-[420px] items-center",
  "admin-search-icon":
    "pointer-events-none absolute left-2.5 h-[15px] w-[15px] shrink-0 text-text-muted",
  "admin-search-input":
    "w-full rounded-md border border-outline bg-bg-light py-2 pr-3 pl-8 font-inter text-[11px] text-text-main outline-none transition-all placeholder:text-text-muted focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10",
  "admin-table-header":
    "flex flex-col border-b border-card-border sm:flex-row sm:items-center sm:justify-between",
  "institution-table-header":
    "flex flex-col border-b border-card-border sm:flex-row sm:items-center sm:justify-between",
  "admin-table-title":
    "mt-2.5 mb-4 font-poppins text-lg font-medium text-text-main",
  "institution-table-title":
    "mb-4 font-poppins text-lg font-medium text-text-main",
  "admin-table-wrapper": "overflow-x-auto",
  "institution-table-wrapper": "overflow-x-auto",
  "admin-table": "w-full border-collapse text-left",
  "institution-table": "w-full border-collapse text-left",
  "admin-table-th":
    "border-b border-card-border px-3 py-3 font-inter text-[11px] font-medium tracking-wide text-text-subtle uppercase sm:px-4",
  "institution-table-th":
    "border-b border-card-border px-3 py-3 font-inter text-[11px] font-semibold tracking-wide text-text-subtle uppercase sm:px-4",
  "admin-table-tr": "transition-colors hover:bg-bg-light",
  "institution-table-tr": "transition-colors hover:bg-bg-light",
  "admin-table-td":
    "border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4",
  "institution-table-td":
    "relative border-b border-card-border px-3 py-3.5 font-inter text-[11px] text-text-main sm:px-4",
  "admin-table-icon-btn":
    "inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800",
  "institution-table-icon-btn":
    "inline-flex items-center justify-center bg-transparent p-1.5 text-text-muted shadow-none transition-colors hover:bg-transparent hover:text-primary-800",
  "admin-badge-pending":
    "border border-warning-border bg-warning-bg text-warning",
  "admin-badge-approved":
    "border border-success-border bg-success-bg text-success",
  "admin-badge-rejected":
    "border border-danger-border bg-danger-bg text-danger",
  "admin-badge":
    "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold",
  "institution-badge-pending":
    "border border-warning-border bg-warning-bg text-warning",
  "institution-badge-approved":
    "border border-success-border bg-success-bg text-success",
  "institution-badge-rejected":
    "border border-danger-border bg-danger-bg text-danger",
  "institution-badge":
    "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-inter text-xs font-semibold",
  "admin-tabs":
    "mb-6 mt-4 flex flex-1 justify-start gap-4 overflow-x-auto border-b border-outline sm:gap-6",
  "admin-tab":
    "shrink-0 border-b-2 border-transparent pb-3 font-inter text-sm font-semibold text-text-muted no-underline whitespace-nowrap transition-colors hover:text-primary-800 data-[active=true]:border-primary-800 data-[active=true]:text-primary-800",
  "admin-detail-card":
    "flex w-full flex-col gap-6 px-0 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-0",
  "admin-detail-row":
    "grid grid-cols-1 gap-1 border-b border-card-border py-3.5 font-inter sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3",
  "admin-detail-label":
    "text-[11.5px] font-bold tracking-wide text-text-subtle uppercase",
  "admin-detail-value": "text-[13.5px] font-medium text-text-main",
  "admin-btn-accept":
    "inline-flex items-center gap-2 rounded-md border-none bg-primary-800 px-6 py-2.5 font-inter text-[12.5px] font-medium text-surface transition-colors hover:bg-primary-900",
  "admin-btn-reject":
    "cursor-pointer rounded-md border border-danger-border bg-danger-bg px-6 py-2.5 font-inter text-[12.5px] font-medium text-danger transition-all hover:bg-danger-border",
  "institution-banner-title": "mb-1 font-poppins text-lg font-medium",
  "institution-banner-desc":
    "font-inter text-[11px] leading-relaxed text-primary-100",
  "institution-banner-btn":
    "inline-flex items-center gap-2 self-start rounded-md bg-surface px-[22px] py-2.5 font-inter text-[11px] font-medium whitespace-nowrap text-primary-900 no-underline shadow-sm transition-all hover:bg-primary-50 sm:self-auto",
  "modal-backdrop":
    "fixed inset-0 z-999 bg-black/50 backdrop-blur-xs",
  "modal-container":
    "fixed top-1/2 left-1/2 z-1000 max-h-[90vh] w-[90%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7",
  "modal-header":
    "mb-5 flex items-center justify-between border-b border-outline pb-3",
  "modal-title": "text-lg font-bold sm:text-xl",
  "modal-close-btn":
    "cursor-pointer border-none bg-transparent text-lg text-on-surface-variant",
  "modal-section-title":
    "mt-4 mb-2 text-sm font-bold tracking-wide text-primary-900 uppercase",
  "modal-form": "flex flex-col gap-3.5",
  "modal-success": "p-5 text-center",
  "modal-success-icon":
    "mx-auto mb-4 flex h-15 w-15 items-center justify-center rounded-full bg-primary-100 text-[28px] text-primary",
  "navbar scrolled":
    "fixed top-0 right-0 left-0 z-50 border-b border-outline bg-white/95 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md",
  "navbar-inner":
    "mx-auto flex h-18 w-full max-w-345 items-center justify-between px-4 md:px-6",
  "navbar-logo": "flex items-center",
  "navbar-link":
    "relative bg-transparent px-2.5 py-2 text-sm font-medium text-on-surface-variant no-underline transition-colors after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-t after:bg-primary after:transition-transform after:content-[''] hover:bg-transparent hover:text-primary hover:after:scale-x-100 data-[active=true]:font-semibold data-[active=true]:text-primary data-[active=true]:after:scale-x-100 md:px-3.5",
  "navbar-icon-btn":
    "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface",
  "navbar-signin-btn":
    "flex items-center gap-2 rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark",
  "navbar-avatar": "h-9 w-9 rounded-full object-cover",
  "notification-dot":
    "absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500",
  "notif-dropdown":
    "absolute top-12 right-0 z-100 w-80 overflow-hidden rounded-sm border border-outline bg-white shadow-lg",
  "notif-header":
    "flex items-center justify-between border-b border-outline bg-gray-50 px-4 py-3",
  "notif-badge": "rounded-full bg-primary px-2 py-0.5 text-[11px] text-white",
  "notif-list": "max-h-[280px] overflow-y-auto",
  "notif-item":
    "cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 data-[unread=true]:bg-green-50",
  "notif-item-title": "text-[11px] font-semibold text-gray-900",
  "notif-item-message": "mt-0.5 text-xs text-gray-600",
  "notif-empty": "p-6 text-center text-[11px] text-gray-400",
  "profile-dropdown":
    "absolute top-12 right-0 z-50 w-65 overflow-hidden rounded-sm border border-outline bg-surface p-2 shadow-lg",
  "profile-dropdown-header":
    "flex items-center gap-3 border-b border-outline px-3 py-2.5",
  "profile-dropdown-info": "min-w-0 overflow-hidden",
  "profile-dropdown-name":
    "truncate font-poppins text-[13.5px] leading-tight font-semibold text-text-main",
  "profile-dropdown-email":
    "mt-0.5 truncate font-inter text-[11.5px] text-text-muted",
  "profile-dropdown-menu": "py-1",
  "profile-dropdown-item":
    "flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 font-inter text-[12.5px] font-semibold text-text-main no-underline transition-all hover:bg-primary-50 hover:text-primary-800",
  "profile-dropdown-footer": "border-t border-outline pt-1",
  "profile-dropdown-signout":
    "flex w-full cursor-pointer items-center gap-2.5 rounded-sm border-none bg-transparent px-3 py-2 text-left font-inter text-[12.5px] font-semibold text-danger transition-all hover:bg-danger-bg",
  "site-footer": "bg-primary px-4 py-9 text-white md:px-16 md:pb-11 md:pt-9",
  "site-footer-inner":
    "mx-auto flex max-w-330 flex-col items-start gap-3 text-left",
  "site-footer-logo": "[&_img]:brightness-0 [&_img]:invert",
  "site-footer-tagline": "mt-3 font-poppins text-sm font-light text-green-200",
  "horizontal-line": "w-full border-t-2 border-surface",
  "site-footer-copy": "mt-2 text-[11px] text-green-100",
  "find-donation-header": "mt-2 mb-3 md:mt-4",
  "find-donation-title":
    "font-poppins text-[22px] font-bold text-on-surface md:text-[26px]",
  "find-donation-subtitle":
    "max-w-[560px] text-[15px] text-on-surface-variant",
  "find-donation-filters": "mt-2 mb-4 flex flex-wrap gap-2",
  "find-donation-search":
    "flex min-w-60 flex-1 items-center gap-1.5 rounded-sm border border-outline bg-white px-3.5",
  "find-donation-search-input":
    "w-full border-none py-2.5 text-sm outline-none",
  "find-donation-select":
    "cursor-pointer appearance-none rounded-sm border border-outline bg-white bg-[length:14px_14px] bg-[position:right_10px_center] bg-no-repeat py-2.5 pr-8 pl-3.5 text-sm text-on-surface outline-none transition-colors hover:border-slate-300 focus:border-primary bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
  "find-donation-count": "mb-1 text-sm text-gray-500",
  "find-donation-empty": "py-12 text-center text-gray-500",
  "donation-grid":
    "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  "donation-grid-home": "xl:grid-cols-3",
  "donation-card":
    "overflow-hidden rounded-sm border border-outline bg-white",
  "donation-card_cover":
    "relative h-50 w-full cursor-pointer overflow-hidden",
  "donation-card_body": "p-4",
  "donation-card_institution": "mb-2 flex items-center gap-2",
  "donation-card_title":
    "mb-1 line-clamp-2 font-poppins text-base leading-snug font-semibold text-on-surface transition-colors hover:text-primary",
  "donation-card_location": "mb-2 flex items-center justify-between",
  "donation-card_location-left":
    "flex items-center gap-1 text-[12.5px] text-on-surface [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:shrink-0",
  "donation-card_distance":
    "rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant",
  "donation-card_progress": "mb-4",
  "donation-card_progress-bar":
    "ml-1 h-2 w-full overflow-hidden rounded-full bg-surface-container",
  "donation-card_progress-fill":
    "relative h-full rounded-full bg-primary transition-[width] duration-1000",
  "donation-card_progress-text":
    "mt-1.5 ml-1 text-[11px] text-on-surface-variant",
  "donate-now-button":
    "mt-3 block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline transition-all hover:bg-primary-dark hover:-translate-y-px",
  "donation-overview-section":
    "mt-18 flex w-full flex-col gap-4 p-2 md:flex-row md:p-0",
  "donation-detail-tabs-section": "mt-7 w-full px-0 sm:px-0",
  "donation-detail-tabs-content": "flex flex-col gap-2",
  "donation-overview-cover":
    "relative h-[250px] w-full shrink-0 overflow-hidden rounded-sm bg-gray-100 md:h-[280px] md:w-[320px]",
  "donation-overview-img": "h-full w-full object-cover",
  "donation-overview-placeholder":
    "flex h-full w-full items-center justify-center bg-green-50",
  "donation-overview-category-badge":
    "absolute top-5 left-[18px] rounded-full bg-primary-800/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs",
  "donation-overview-info": "flex flex-1 flex-col gap-2",
  "donation-overview-title": "text-2xl font-bold text-gray-900",
  "donation-overview-institution": "flex items-center gap-2.5",
  "donation-overview-institution-avatar":
    "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-surface",
  "donation-overview-institution-name": "text-sm font-semibold text-gray-700",
  "donation-overview-location":
    "ml-0.5 flex items-center gap-1 text-[11px] text-gray-600",
  "donation-overview-delivery": "ml-1",
  "delivery-badge":
    "mt-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700",
  "pickup-badge":
    "inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700",
  "upload-area":
    "rounded-sm border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-all hover:border-primary hover:bg-primary-50 sm:p-16",
  "upload-placeholder": "flex flex-col items-center gap-2",
  "upload-placeholder-text": "text-sm font-medium text-on-surface",
  "upload-placeholder-hint": "text-xs text-gray-400",
  "upload-preview": "relative max-h-60 w-full overflow-hidden rounded-md",
  "upload-preview-img": "h-60 w-full object-cover",
  "upload-remove-btn":
    "absolute top-2 right-2 cursor-pointer rounded-full border-none bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600/80",
  "donation-request-info-box":
    "mb-3 rounded-lg border border-green-200 bg-green-50 p-3.5",
  "pw-toggle-btn":
    "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent text-gray-500",
  "fade-in": "animate-fade-in",
  "stagger-1": "delay-100",
  "stagger-2": "delay-200",
  "stagger-3": "delay-300",
  "stagger-4": "delay-400",
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === "scripts"
    )
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const keys = Object.keys(map).sort((a, b) => b.length - a.length);
let changedFiles = 0;

for (const file of walk(path.join(ROOT))) {
  let src = fs.readFileSync(file, "utf8");
  let next = src;
  for (const key of keys) {
    next = next.split(key).join(map[key]);
  }
  if (next !== src) {
    fs.writeFileSync(file, next);
    changedFiles++;
    console.log("updated", path.relative(ROOT, file));
  }
}

console.log("done", changedFiles);
