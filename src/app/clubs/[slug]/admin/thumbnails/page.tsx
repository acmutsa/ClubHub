import { thumbnailStorage } from "@/lib/storage/thumbnails";
import { ThumbnailLibrary } from "@/components/clubs/admin/thumbnail-library";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await thumbnailStorage.listClubThumbnails(slug);
  const thumbnails = await Promise.all(
    result.keys.map(async (key) => ({
      key,
      url: await thumbnailStorage.getThumbnailUrl(key),
    })),
  );

  return <ThumbnailLibrary slug={slug} initialThumbnails={thumbnails} />;
}
