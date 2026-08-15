"use server";

import { revalidatePath } from "next/cache";

import {
  getPortalNotifications,
  markPortalNotificationsRead,
  searchPortal,
} from "@/features/staff-portal/services/staff-portal.service";

export async function searchPortalAction(query: string) {
  if (!/^NQ-[0-9]{6}-[0-9]{6}$/i.test(query.trim())) return [];
  return searchPortal(query.trim());
}

export async function loadNotificationsAction() {
  return getPortalNotifications();
}

export async function markNotificationsReadAction(activity?: string) {
  await markPortalNotificationsRead(activity);
  revalidatePath("/", "layout");
}
