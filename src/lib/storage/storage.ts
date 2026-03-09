import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BlobRef<TMeta = unknown> = {
  key: string;
  url: string;
  etag?: string;
  size?: number;
  contentType?: string;
  meta?: TMeta;
};

type ListOptions = {
  /** Only return keys that begin with this prefix. */
  prefix?: string;
  /** Maximum number of keys to return (default 1000). */
  maxKeys?: number;
  /** Continuation token for paginated results. */
  continuationToken?: string;
};

type ListResult = {
  keys: string[];
  /** If `true` there are more results – pass `continuationToken` to fetch the next page. */
  isTruncated: boolean;
  continuationToken?: string;
};

// ---------------------------------------------------------------------------
// S3 / R2 client
// ---------------------------------------------------------------------------

const BUCKET = "clubhub";

function getS3Client() {
  const endpoint = process.env.BLOB_URL;
  const accessKeyId = process.env.BLOB_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BLOB_ACCESS_KEY_SECRET;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing S3/R2 credentials. Ensure BLOB_URL, BLOB_ACCESS_KEY_ID, and BLOB_ACCESS_KEY_SECRET are set in your .env file.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

let _client: S3Client | null = null;
function client() {
  if (!_client) _client = getS3Client();
  return _client;
}

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

export abstract class BlobSystem<TMeta> {
  protected readonly bucket: string;

  constructor(bucket: string = BUCKET) {
    this.bucket = bucket;
  }

  /**
   * Build the object key used to store the blob.
   * Subclasses must implement this to define key-naming conventions
   * (e.g. `clubs/<clubId>/thumbnails/<uuid>.<ext>`).
   */
  protected abstract buildKey(meta: TMeta, contentType: string): string;

  // ─── helpers ────────────────────────────────────────────────────────

  /** Derive the file extension from a MIME content-type. */
  protected extensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "application/pdf": "pdf",
    };
    return map[contentType] ?? "bin";
  }

  // ─── Presigned URLs ────────────────────────────────────────────────

  /** Generate a presigned PUT URL for client-direct uploads. */
  async getPresignedPutUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(client(), command, { expiresIn });
  }

  /** Generate a presigned GET URL for client-direct downloads / viewing. */
  async getPresignedGetUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(client(), command, { expiresIn });
  }

  // ─── Server-side CRUD ──────────────────────────────────────────────

  /** Delete a blob by key. */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await client().send(command);

    if (
      !response.$metadata.httpStatusCode ||
      response.$metadata.httpStatusCode >= 400
    ) {
      throw new Error("Failed to delete blob");
    }
  }

  /** Check whether a blob exists without downloading it. */
  async exists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await client().send(command);
      return (
        !!response.$metadata.httpStatusCode &&
        response.$metadata.httpStatusCode < 400
      );
    } catch {
      return false;
    }
  }

  /** List blob keys, optionally filtered by prefix. */
  async list(options: ListOptions = {}): Promise<ListResult> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: options.prefix,
      MaxKeys: options.maxKeys ?? 1000,
      ContinuationToken: options.continuationToken,
    });

    const response = await client().send(command);

    if (
      !response.$metadata.httpStatusCode ||
      response.$metadata.httpStatusCode >= 400
    ) {
      throw new Error("Failed to list blobs");
    }

    return {
      keys: (response.Contents ?? []).map((o: _Object) => o.Key!),
      isTruncated: response.IsTruncated ?? false,
      continuationToken: response.NextContinuationToken,
    };
  }
}
