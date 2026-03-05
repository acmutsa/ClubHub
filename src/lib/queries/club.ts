'use server'
import { db } from "@/db/index";
import { clubs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getClub(clubId: string) {
  if (!clubId?.trim()) {
    return null;
  } ``
  const club = await db.query.clubs.findFirst({ where: eq(clubs.id, clubId) });
  return club || null;
}

export async function getClubBySlug(slug: string) {
  if (!slug?.trim()) {
    return null;
  } ``
  const club = await db.query.clubs.findFirst({ where: eq(clubs.slug, slug) });
  return club || null;
}

export async function checkSlugUniqueness(slug: string) {
  const existingSlug = await db.query.clubs.findFirst({ where: eq(clubs.slug, slug) });
  return existingSlug == null;
}