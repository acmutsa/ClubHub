import { z } from "zod";
import { adminClubSelectSchema } from "@/lib/validators/club";

export type AdminSelectClub = z.infer<typeof adminClubSelectSchema>;
