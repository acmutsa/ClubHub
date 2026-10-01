import { z } from "zod";
import {
  clubFiltersSchema,
  clubSchema,
  createClubSchema,
  insertClubSchema,
  updateClubSchema,
} from "@/lib/validators/club";
import {
  clubMembershipFiltersSchema,
  clubMembershipSchema,
  createClubMembershipSchema,
  insertClubMembershipSchema,
  updateClubMembershipSchema,
} from "@/lib/validators/club-membership";
import {
  clubRoleSchema,
  createClubRoleSchema,
  updateClubRoleSchema,
} from "@/lib/validators/club-role";
import {
  clubSocialLinkSchema,
  createClubSocialLinkSchema,
  updateClubSocialLinkSchema,
} from "@/lib/validators/club-social-link";
import {
  clubSponsorSchema,
  createClubSponsorSchema,
  updateClubSponsorSchema,
} from "@/lib/validators/club-sponsor";

// Club
export type Club = z.infer<typeof clubSchema>;
export type CreateClubInput = z.infer<typeof createClubSchema>;
export type InsertClubInput = z.infer<typeof insertClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type ClubFilters = z.infer<typeof clubFiltersSchema>;

// Club membership
export type ClubMembership = z.infer<typeof clubMembershipSchema>;
export type CreateClubMembershipInput = z.infer<typeof createClubMembershipSchema>;
export type InsertClubMembershipInput = z.infer<typeof insertClubMembershipSchema>;
export type UpdateClubMembershipInput = z.infer<typeof updateClubMembershipSchema>;
export type ClubMembershipFilters = z.infer<typeof clubMembershipFiltersSchema>;

// Club role
export type ClubRole = z.infer<typeof clubRoleSchema>;
export type CreateClubRoleInput = z.infer<typeof createClubRoleSchema>;
export type UpdateClubRoleInput = z.infer<typeof updateClubRoleSchema>;

// Club social link
export type ClubSocialLink = z.infer<typeof clubSocialLinkSchema>;
export type CreateClubSocialLinkInput = z.infer<typeof createClubSocialLinkSchema>;
export type UpdateClubSocialLinkInput = z.infer<typeof updateClubSocialLinkSchema>;

// Club sponsor
export type ClubSponsor = z.infer<typeof clubSponsorSchema>;
export type CreateClubSponsorInput = z.infer<typeof createClubSponsorSchema>;
export type UpdateClubSponsorInput = z.infer<typeof updateClubSponsorSchema>;
