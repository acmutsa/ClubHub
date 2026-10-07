import { BUCKET } from "@/r2/r2-client";
import { r2 } from "@/r2/r2-client";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const URL_EXPIRES_IN = 60 * 2;
const RESUME_TYPES = "application/pdf"

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("resume");

  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (!RESUME_TYPES.includes(file.type)) return Response.json({ error: "Unsupported type" }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Too large" }, { status: 413 });

  const key = `resumes/${crypto.randomUUID()}`;

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    Metadata: { originalName: encodeURIComponent(file.name) },
  }));

  return Response.json({ key });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) return Response.json({ error: "No key" }, { status: 400 });

  const signedUrl = await getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: URL_EXPIRES_IN },
  );
  return Response.json({ url: signedUrl });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  
  if (!key) return Response.json({ error: "No key" }, { status: 400 });

  await r2.send( new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }))
  return Response.json({ message: "Resume deleted successfully" });
}
  