import ImageKit from "imagekit";
import config from "@/lib/config";
import { NextResponse } from "next/server";

export async function GET() {
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
