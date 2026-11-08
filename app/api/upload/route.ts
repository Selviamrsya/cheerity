import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import config from "@/lib/config";
import { rateLimit, RATE_LIMIT_ERROR } from "@/lib/ratelimit";

// Allowed image MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimit("upload");
    if (!rl.allowed) {
      return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPEG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const {
      env: {
        imagekit: { publicKey, privateKey, urlEndpoint },
      },
    } = config;

    if (!publicKey || !privateKey || !urlEndpoint) {
      return NextResponse.json(
        { error: "ImageKit credentials not configured" },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to avoid collisions
    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;

    // Sanitize folder to a safe ImageKit folder path
    const safeFolder = folder
      .replace(/[^a-zA-Z0-9\-_\/]/g, "")
      .replace(/\/{2,}/g, "/")
      .replace(/^\/+|\/+$/g, "");

    const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    const result = await imagekit.upload({
      file: buffer,
      fileName: uniqueName,
      folder: safeFolder || undefined,
    });

    if (!result?.url) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
