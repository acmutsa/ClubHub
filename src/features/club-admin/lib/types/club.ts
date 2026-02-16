import { z } from "zod";
import { adminClubSelectSchema } from "@/features/club-admin/lib/validators/club";

export type AdminSelectClub = z.infer<typeof adminClubSelectSchema>;
