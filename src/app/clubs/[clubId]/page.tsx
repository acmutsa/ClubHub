export default function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = params;
  return <div>Club {clubId}</div>;
}
