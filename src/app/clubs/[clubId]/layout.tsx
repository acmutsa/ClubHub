import Navbar from "@/components/navbar";
import { db } from "@/db";
import { clubs } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Layout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: {
        clubId: string;
    };
}>) {

    const club = await db.query.clubs.findFirst({
        where: eq(clubs.id, params.clubId),
    });
    return (
        <div>
            <Navbar clubName={club?.name ?? ""} clubId={club?.id} />
            {children}
        </div>
    );
}