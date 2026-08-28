import { NextResponse } from "next/server";

// next-auth@4 doesn't support Edge Runtime — handle auth at layout/page level
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};