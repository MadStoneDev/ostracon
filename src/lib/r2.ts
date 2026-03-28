import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export type R2Bucket = "ostracon-avatars" | "ostracon-images";

/**
 * Upload a file to R2 and return the public URL.
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  body: Buffer | Uint8Array | Blob,
  contentType: string,
): Promise<{ url: string; key: string }> {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const url = `${R2_PUBLIC_URL}/${bucket}/${key}`;
  return { url, key };
}

/**
 * Delete a file from R2.
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

/**
 * Generate a unique file key with path prefix.
 */
export function generateFileKey(
  userId: string,
  filename: string,
  prefix = "",
): string {
  const ext = filename.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = prefix ? `${prefix}/` : "";
  return `${path}${userId}/${timestamp}-${random}.${ext}`;
}
