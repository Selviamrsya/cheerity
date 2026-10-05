import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

import { headers } from "next/headers";

export async function GET() {
  const reqHeaders = await headers();
  const session = await getSession(reqHeaders);
  return NextResponse.json(session);
}