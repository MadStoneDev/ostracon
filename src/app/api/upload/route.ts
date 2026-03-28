import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { uploadToR2, generateFileKey, type R2Bucket } from "@/lib/r2";

/**
 * Upload a file to R2.
 * Accepts multipart form data with: file, bucket, prefix (optional).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "ostracon-images";
    const prefix = (formData.get("prefix") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate bucket name
    if (bucket !== "ostracon-avatars" && bucket !== "ostracon-images") {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/mpeg",
      "audio/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    const key = generateFileKey(user.id, file.name, prefix);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { url } = await uploadToR2(
      bucket as R2Bucket,
      key,
      buffer,
      file.type,
    );

    return NextResponse.json({ url, key, bucket });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
