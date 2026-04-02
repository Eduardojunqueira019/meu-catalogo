"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({
      where: { id }
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    return { success: false, error: error.message || "Erro ao excluir" };
  }
}

export async function getProfileConfig() {
  try {
    const profile = await prisma.profile.findFirst();
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
