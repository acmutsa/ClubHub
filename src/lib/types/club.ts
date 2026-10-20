import { z } from "zod";
import { adminClubSelectSchema } from "../validators/club";

export type AdminSelectClub = z.infer<typeof adminClubSelectSchema>;
