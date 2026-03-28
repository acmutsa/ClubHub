"use server";

import { authAction } from "@/lib/safe-action";
import { thumbnailStorage } from "@/lib/storage/thumbnails";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import isClubAdmin from "@/lib/membership";
import { returnValidationErrors } from "next-safe-action";
import { db } from "@/db/index";
import { thumbnails } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── List ────────────────────────────────────────────────────────────────────

const listThumbnailsSchema = z.object({
  slug: z.string().min(1, "club slug is required"),
});

export const listThumbnailsAction = authAction
  .inputSchema(listThumbnailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { slug } = parsedInput;

    if (!(await isClubAdmin(ctx.userId, slug))) {
      returnValidationErrors(z.null(), {
        _errors: [
          "You do not have permission to view thumbnails for this club",
        ],
      });
    }

    const result = await thumbnailStorage.listClubThumbnails(slug);

    const thumbnails = await Promise.all(
      result.keys.map(async (key) => ({
        key,
        url: await thumbnailStorage.getThumbnailUrl(key),
      })),
    );

    return { thumbnails };
  });

// ─── Get Upload URL ──────────────────────────────────────────────────────────

const getUploadUrlSchema = z.object({
  slug: z.string().min(1, "club slug is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export const getUploadUrlAction = authAction
  .inputSchema(getUploadUrlSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { slug, contentType } = parsedInput;

    if (!(await isClubAdmin(ctx.userId, slug))) {
      returnValidationErrors(z.null(), {
        _errors: [
          "You do not have permission to upload thumbnails for this club",
        ],
      });
    }

    const { key, thumbnailId, uploadUrl } = await thumbnailStorage.getUploadUrl(
      slug,
      contentType,
    );

    return { key, thumbnailId, uploadUrl };
  });

// ─── Confirm Upload ──────────────────────────────────────────────────────────

const confirmUploadSchema = z.object({
  slug: z.string().min(1, "club slug is required"),
  key: z.string().min(1, "Key is required"),
});

export const confirmUploadAction = authAction
  .inputSchema(confirmUploadSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { slug, key } = parsedInput;

    if (!(await isClubAdmin(ctx.userId, slug))) {
      returnValidationErrors(z.null(), {
        _errors: [
          "You do not have permission to upload thumbnails for this club",
        ],
      });
    }

    // Insert a record into the thumbnails DB table (store the R2 key)
    const [record] = await db
      .insert(thumbnails)
      .values({ url: key })
      .returning();

    // Get a presigned GET URL for the newly uploaded thumbnail
    const presignedUrl = await thumbnailStorage.getThumbnailUrl(key);

    revalidatePath(`/clubs/${slug}/admin/thumbnails`);

    return {
      success: true,
      thumbnail: { key, url: presignedUrl, thumbnailId: record.id },
    };
  });

// ─── Get or Create Thumbnail DB Record ───────────────────────────────────────

const getOrCreateThumbnailSchema = z.object({
  slug: z.string().min(1, "club slug is required"),
  key: z.string().min(1, "Thumbnail key is required"),
});

/**
 * Given an R2 key, find the existing DB record or create one.
 * Used when selecting a library thumbnail that may pre-date DB records.
 */
export const getOrCreateThumbnailAction = authAction
  .inputSchema(getOrCreateThumbnailSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { slug, key } = parsedInput;

    if (!(await isClubAdmin(ctx.userId, slug))) {
      returnValidationErrors(z.null(), {
        _errors: [
          "You do not have permission to manage thumbnails for this club",
        ],
      });
    }

    // Check if a DB record already exists for this key
    const existing = await db.query.thumbnails.findFirst({
      where: eq(thumbnails.url, key),
    });

    if (existing) {
      return { thumbnailId: existing.id };
    }

    // Create a new record
    const [record] = await db
      .insert(thumbnails)
      .values({ url: key })
      .returning();

    return { thumbnailId: record.id };
  });

// ─── Delete ──────────────────────────────────────────────────────────────────

const deleteThumbnailSchema = z.object({
  slug: z.string().min(1, "club slug is required"),
  key: z.string().min(1, "Thumbnail key is required"),
});

export const deleteThumbnailAction = authAction
  .inputSchema(deleteThumbnailSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { slug, key } = parsedInput;

    if (!(await isClubAdmin(ctx.userId, slug))) {
      returnValidationErrors(z.null(), {
        _errors: [
          "You do not have permission to delete thumbnails for this club",
        ],
      });
    }

    db.transaction(async (tx) => {
      // Delete the DB record if it exists
      await tx.delete(thumbnails).where(eq(thumbnails.url, key));

      // Delete in blob
      try {
        await thumbnailStorage.deleteThumbnailByKey(key);
      } catch (error) {
        tx.rollback();
        console.error("Failed to delete thumbnail from blob storage:", error);
      }
    });

    revalidatePath(`/clubs/${slug}/admin/thumbnails`);

    return { success: true };
  });
