"use server";

import { prisma } from "@/lib/prisma";

export async function logPublication(vehicleId: string, channel: string, publishLink: string) {
  try {
    const publication = await prisma.publication.create({
      data: {
        vehicleId,
        channel,
        publishLink,
        status: "enviado"
      }
    });
    return { success: true, publication };
  } catch (error) {
    console.error("Error logging publication:", error);
    return { success: false, error: "Failed to log publication" };
  }
}
