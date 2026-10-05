import * as React from "react";
import { cn } from "@/lib/utils";
import {
  tableCardClass,
  tableCellClass,
  tableClass,
  tableHeadClass,
  tableIconBtnClass,
  tableRowClass,
  tableWrapperClass,
} from "@/lib/ui";

export function TableCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(tableCardClass, className)} {...props} />;
}

export function TableWrap({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(tableWrapperClass, className)} {...props} />;
}

export function Table({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return <table className={cn(tableClass, className)} {...props} />;
}

export function Th({
  className,
  ...props
}: React.ComponentProps<"th">) {
  return <th className={cn(tableHeadClass, className)} {...props} />;
}

export function Tr({
  className,
  ...props
}: React.ComponentProps<"tr">) {
  return <tr className={cn(tableRowClass, className)} {...props} />;
}

export function Td({
  className,
  ...props
}: React.ComponentProps<"td">) {
  return <td className={cn(tableCellClass, className)} {...props} />;
}

export function TableIconLink({
  className,
  ...props
}: React.ComponentProps<"a">) {
  return <a className={cn(tableIconBtnClass, className)} {...props} />;
}
