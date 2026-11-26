import ImageKit from "imagekit";
import config from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request.headers);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit("imagekitAuth");
  if (!rl.allowed) {
    return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
  }

  const {
    env: {
      imagekit: { publicKey, privateKey, urlEndpoint },
    },
  } = config;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json(
      { error: "ImageKit credentials not configured in environment variables." },
      { status: 500 }
    );
  }

  const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });

  return NextResponse.json(imagekit.getAuthenticationParameters());
}
