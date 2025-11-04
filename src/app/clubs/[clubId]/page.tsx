export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  return <div>Club {clubId}</div>;
}
