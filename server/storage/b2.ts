import "server-only";
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, ListObjectVersionsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SubjectError } from "@/server/subjects/service";
let client: S3Client | undefined;
function storage() {
  const { B2_ENDPOINT: endpoint, B2_REGION: region, B2_KEY_ID: key, B2_APPLICATION_KEY: secret, B2_BUCKET_NAME: bucket } = process.env;
  if (!endpoint || !region || !key || !secret || !bucket || !/^https:\/\/s3\.[a-z0-9-]+\.backblazeb2\.com$/.test(endpoint)) throw new SubjectError(503, "STORAGE_UNAVAILABLE", "File storage is unavailable. Please try again later.");
  client ??= new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId: key, secretAccessKey: secret }, requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED" });
  return { client, bucket };
}
export function ensureStorage() { storage(); }
export async function uploadUrl(key: string, size: number) {
  const { client, bucket } = storage();
  return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: "application/pdf", ContentLength: size }), { expiresIn: 120 });
}
export async function validatePdf(key: string, size: number) {
  const { client, bucket } = storage();
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })).catch(error => {
    if (error?.$metadata?.httpStatusCode === 404) throw new SubjectError(409, "UPLOAD_INCOMPLETE", "The file hasn’t finished uploading. Try again or remove the unfinished upload.");
    throw error;
  });
  if (head.ContentLength !== size || head.ContentType !== "application/pdf" || !head.VersionId) throw new SubjectError(400, "INVALID_PDF", "The uploaded file doesn’t match the selected PDF. Delete it and try again.");
  const data = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, VersionId: head.VersionId, Range: "bytes=0-1023" }));
  const bytes = await data.Body?.transformToByteArray();
  if (!bytes || !new TextDecoder().decode(bytes).startsWith("%PDF-")) throw new SubjectError(400, "INVALID_PDF", "This file isn’t a valid PDF. Delete it and choose a PDF document.");
  return head.VersionId;
}
export async function fileUrl(key: string, versionId: string, title: string, download: boolean) {
  const { client, bucket } = storage();
  const name = title.replace(/[^a-zA-Z0-9 ._-]/g, "_").slice(0, 120).replace(/\.pdf$/i, "") + ".pdf";
  const encoded = encodeURIComponent(name).replace(/['()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase());
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key, VersionId: versionId, ResponseContentType: "application/pdf", ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename="document.pdf"; filename*=UTF-8''${encoded}` }), { expiresIn: 300 });
}
/** Remove versions, not just a hide marker, and never touch another object's prefix. */
export async function removeFile(key: string, keepVersion?: string) {
  const { client, bucket } = storage();
  let keyMarker: string | undefined, versionMarker: string | undefined;
  do {
    const page = await client.send(new ListObjectVersionsCommand({ Bucket: bucket, Prefix: key, KeyMarker: keyMarker, VersionIdMarker: versionMarker }));
    for (const entry of [...(page.Versions ?? []), ...(page.DeleteMarkers ?? [])]) if (entry.Key === key && entry.VersionId && entry.VersionId !== keepVersion) await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key, VersionId: entry.VersionId }));
    keyMarker = page.IsTruncated ? page.NextKeyMarker : undefined;
    versionMarker = page.NextVersionIdMarker;
  } while (keyMarker);
}
