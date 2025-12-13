import { db } from "@/db/index";
import { clubs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getClub = async (clubId: string) => {
  const club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
  return club;
};
