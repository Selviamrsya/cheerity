import ImageKit from "imagekit";
import config from "@/lib/config";
import { NextResponse } from "next/server";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

export async function GET() {
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
