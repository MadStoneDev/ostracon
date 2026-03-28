/**
 * Client-side upload helper.
 * Sends files to /api/upload which handles R2 storage.
 */
export async function uploadFile(
  file: File,
  bucket: "ostracon-avatars" | "ostracon-images" = "ostracon-images",
  prefix = "",
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  if (prefix) formData.append("prefix", prefix);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}
