import { z } from "zod";
import { adminClubSelectSchema } from "../validators/club";

export type AdminSelectClub = z.infer<typeof adminClubSelectSchema>

export interface AdminClubRow {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    ownerName: string;
    memberCount: number;
    eventCount: number;
    slug: string;
}