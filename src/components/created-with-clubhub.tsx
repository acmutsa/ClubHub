import Link from "next/link";
import Image from "next/image";

export default function CreatedWithClubHub() {
    return (
        <div className="flex flex-row gap-2 p-2 bg-foreground rounded-lg">
            <Image src="/assets/logo.png" alt="ClubKit Logo" width={25} height={25} />
            <Link className="text-center text-sm text-background hover:underline font-semibold p-1 rounded-md" href="https://github.com/acmutsa/ClubKit"> Created with ClubHub</Link>
        </div>
    );
}