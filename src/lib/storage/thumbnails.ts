import { randomUUID } from "crypto";
import { BlobSystem } from "./storage";

type ThumbnailMeta = {
  clubId: string;
  thumbnailId: string;
};

class ThumbnailStorage extends BlobSystem<ThumbnailMeta> {
  protected buildKey(meta: ThumbnailMeta, contentType: string): string {
    const ext = this.extensionFromContentType(contentType);
    return `clubs/${meta.clubId}/thumbnails/${meta.thumbnailId}.${ext}`;
  }

  /** Generate a presigned PUT URL for a new thumbnail upload. Returns the key, thumbnailId, and upload URL. */
  async getUploadUrl(clubId: string, contentType: string) {
    const thumbnailId = randomUUID();
    const key = this.buildKey({ clubId, thumbnailId }, contentType);
    const uploadUrl = await this.getPresignedPutUrl(key, contentType);
    return { key, thumbnailId, uploadUrl };
  }

  /** Generate a presigned GET URL for viewing a thumbnail. */
  async getThumbnailUrl(key: string) {
    return this.getPresignedGetUrl(key);
  }

  async deleteThumbnailByKey(key: string) {
    return this.delete(key);
  }

  async existsThumbnailByKey(key: string) {
    return this.exists(key);
  }

  /** List all thumbnails in a club's library. */
  async listClubThumbnails(slug: string) {
    return this.list({ prefix: `clubs/${slug}/thumbnails/` });
  }
}

export const thumbnailStorage = new ThumbnailStorage();
