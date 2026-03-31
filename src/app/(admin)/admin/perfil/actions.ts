"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

export async function saveProfile(formData: FormData) {
  const photo = formData.get("photo") as File;
  let photoUrl = formData.get("photoUrl") as string || "/placeholder-user.jpg";

  if (photo && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const fileName = `profile-${Date.now()}${path.extname(photo.name) || ".jpg"}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    photoUrl = `/uploads/${fileName}`;
  }

  const data = {
    name: formData.get("name") as string,
    role: formData.get("role") as string,
    whatsapp: formData.get("whatsapp") as string,
    instagram: formData.get("instagram") as string,
    facebook: (formData.get("facebook") as string) || "",
    storeName: formData.get("storeName") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    bio: formData.get("bio") as string,
    photoUrl,
  };

  const existing = await prisma.profile.findFirst();

  if (existing) {
    await prisma.profile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.profile.create({
      data,
    });
  }

  revalidatePath("/admin/perfil");
  revalidatePath("/catalogo");
  revalidatePath("/");
  
  return { success: true };
}
