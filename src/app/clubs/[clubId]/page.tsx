import { requireAuthContext } from "@/lib/auth/get-auth-context";

export default async function Page() {
  const context = await requireAuthContext();

  return (
    <div>
      <h2>{context.club.name}</h2>
      <p>Session: {context.user.email}</p>
    </div>
  );
}
