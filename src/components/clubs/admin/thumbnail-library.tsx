"use client";

import { useState, useRef, useCallback } from "react";
import {
  getUploadUrlAction,
  confirmUploadAction,
  deleteThumbnailAction,
} from "@/actions/thumbnails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type Thumbnail = {
  key: string;
  url: string;
};

interface ThumbnailLibraryProps {
  clubId: string;
  initialThumbnails: Thumbnail[];
}

export function ThumbnailLibrary({
  clubId,
  initialThumbnails,
}: ThumbnailLibraryProps) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>(initialThumbnails);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Thumbnail | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      selectedFileRef.current = file;
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    const file = selectedFileRef.current;
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Get a presigned PUT URL from the server
      const urlResult = await getUploadUrlAction({
        clubId,
        contentType: file.type,
      });

      if (!urlResult?.data?.uploadUrl || !urlResult?.data?.key) {
        toast.error("Failed to get upload URL");
        return;
      }

      const { uploadUrl, key } = urlResult.data;

      // Step 2: Upload the file directly to R2 via the presigned URL
      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putResponse.ok) {
        toast.error("Upload to storage failed");
        return;
      }

      // Step 3: Confirm the upload on the server (revalidates the page)
      const confirmResult = await confirmUploadAction({ clubId, key });

      if (confirmResult?.data?.thumbnail) {
        setThumbnails((prev) => [...prev, confirmResult.data!.thumbnail]);
        toast.success("Thumbnail uploaded");
      } else {
        toast.error("Upload confirmation failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadOpen(false);
      setPreview(null);
      selectedFileRef.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [clubId]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteThumbnailAction({
        clubId,
        key: deleteTarget.key,
      });
      if (result?.data?.success) {
        setThumbnails((prev) => prev.filter((t) => t.key !== deleteTarget.key));
        toast.success("Thumbnail deleted");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [clubId, deleteTarget]);

  const resetUploadDialog = useCallback(() => {
    setPreview(null);
    selectedFileRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                Thumbnails
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your club&apos;s thumbnail library
              </p>
            </div>

            {/* Upload Dialog Trigger */}
            <Dialog
              open={uploadOpen}
              onOpenChange={(open) => {
                setUploadOpen(open);
                if (!open) resetUploadDialog();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Thumbnail
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Thumbnail</DialogTitle>
                  <DialogDescription>
                    Choose an image to add to your thumbnail library.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <label
                    htmlFor="thumbnail-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-muted-foreground/50"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 rounded-md object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to select an image
                        </span>
                      </>
                    )}
                    <input
                      id="thumbnail-file"
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <DialogFooter>
                  <Button
                    disabled={!preview || uploading}
                    onClick={handleUpload}
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── Grid / Empty State ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl p-4">
        {thumbnails.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 py-20">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              No thumbnails yet. Upload one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {thumbnails.map((thumb) => (
              <div
                key={thumb.key}
                className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
              >
                <Image
                  src={thumb.url}
                  alt="Thumbnail"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteTarget(thumb)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Dialog ─────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Thumbnail</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this thumbnail? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="flex justify-center py-2">
              <img
                src={deleteTarget.url}
                alt="Thumbnail to delete"
                className="max-h-32 rounded-md object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
