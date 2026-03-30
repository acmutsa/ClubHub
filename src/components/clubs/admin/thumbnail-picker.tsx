"use client";

import { useState, useRef, useCallback } from "react";
import {
  getUploadUrlAction,
  confirmUploadAction,
  getOrCreateThumbnailAction,
} from "@/actions/thumbnails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, ImageIcon, X, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type Thumbnail = {
  key: string;
  url: string;
  thumbnailId?: number;
};

interface ThumbnailPickerProps {
  slug: string;
  initialThumbnails: Thumbnail[];
  value: number | null;
  onChange: (thumbnailId: number | null, previewUrl?: string) => void;
}

export function ThumbnailPicker({
  slug,
  initialThumbnails,
  value,
  onChange,
}: ThumbnailPickerProps) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>(initialThumbnails);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    () => {
      if (value) {
        const match = initialThumbnails.find((t) => t.thumbnailId === value);
        return match?.url ?? null;
      }
      return null;
    },
  );
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
      // Step 1: Get presigned URL
      const urlResult = await getUploadUrlAction({
        slug,
        contentType: file.type,
      });

      if (!urlResult?.data?.uploadUrl || !urlResult?.data?.key) {
        toast.error("Failed to get upload URL");
        return;
      }

      const { uploadUrl, key } = urlResult.data;

      // Step 2: Upload to R2
      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putResponse.ok) {
        toast.error("Upload to storage failed");
        return;
      }

      // Step 3: Confirm (creates DB record)
      const confirmResult = await confirmUploadAction({ slug, key });

      if (confirmResult?.data?.thumbnail) {
        const newThumb = confirmResult.data.thumbnail;
        setThumbnails((prev) => [...prev, newThumb]);

        // Auto-select the newly uploaded thumbnail
        onChange(newThumb.thumbnailId, newThumb.url);
        setSelectedPreviewUrl(newThumb.url);
        toast.success("Thumbnail uploaded and selected");
      } else {
        toast.error("Upload confirmation failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setDialogOpen(false);
      setPreview(null);
      selectedFileRef.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [slug, onChange]);

  const handleSelectFromLibrary = useCallback(
    async (thumb: Thumbnail) => {
      setSelecting(true);
      try {
        // If we already have a DB id, use it directly
        if (thumb.thumbnailId) {
          onChange(thumb.thumbnailId, thumb.url);
          setSelectedPreviewUrl(thumb.url);
          setDialogOpen(false);
          return;
        }

        // Otherwise, get-or-create a DB record
        const result = await getOrCreateThumbnailAction({
          slug,
          key: thumb.key,
        });

        if (result?.data?.thumbnailId) {
          // Update local state with the resolved ID
          setThumbnails((prev) =>
            prev.map((t) =>
              t.key === thumb.key
                ? { ...t, thumbnailId: result.data!.thumbnailId }
                : t,
            ),
          );
          onChange(result.data.thumbnailId, thumb.url);
          setSelectedPreviewUrl(thumb.url);
        } else {
          toast.error("Failed to select thumbnail");
        }
      } catch {
        toast.error("Failed to select thumbnail");
      } finally {
        setSelecting(false);
        setDialogOpen(false);
      }
    },
    [slug, onChange],
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setSelectedPreviewUrl(null);
  }, [onChange]);

  return (
    <>
      {/* Selected thumbnail display */}
      {value && selectedPreviewUrl ? (
        <div className="relative w-full max-w-xs">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={selectedPreviewUrl}
              alt="Selected thumbnail"
              fill
              className="object-cover"
              sizes="320px"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="mr-1 h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to add a thumbnail
          </span>
        </button>
      )}

      {/* Upload / Library Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setPreview(null);
            selectedFileRef.current = null;
            if (fileRef.current) fileRef.current.value = "";
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Thumbnail</DialogTitle>
            <DialogDescription>
              Upload a new image or choose from your library.
            </DialogDescription>
          </DialogHeader>

          {/* Upload Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Upload New</h3>
            <label
              htmlFor="thumbnail-picker-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-36 rounded-md object-contain"
                />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select an image
                  </span>
                </>
              )}
              <input
                id="thumbnail-picker-file"
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {preview && (
              <Button
                type="button"
                disabled={uploading}
                onClick={handleUpload}
                className="w-full"
              >
                {uploading ? "Uploading…" : "Upload & Select"}
              </Button>
            )}
          </div>

          {/* Library Section */}
          {thumbnails.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Library</h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {thumbnails.map((thumb) => {
                  const isSelected = value === thumb.thumbnailId;
                  return (
                    <button
                      type="button"
                      key={thumb.key}
                      disabled={selecting}
                      onClick={() => handleSelectFromLibrary(thumb)}
                      className={`group relative aspect-video overflow-hidden rounded-lg border-2 bg-muted transition-all
                        ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"}`}
                    >
                      <Image
                        src={thumb.url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 25vw"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
