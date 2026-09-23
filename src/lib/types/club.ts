import { z } from "zod";
import { adminClubSchema } from "../validators/club";

export type AdminClub = z.infer<typeof adminClubSchema>;
