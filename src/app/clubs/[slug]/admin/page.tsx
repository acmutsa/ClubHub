export default async function Page({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  return <div>Admin Overview for {clubId}</div>;
}
