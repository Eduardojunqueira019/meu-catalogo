"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

export async function createVehicle(formData: FormData) {
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const year = Number(formData.get("year"));
  const km = Number(formData.get("km"));
  const gearbox = formData.get("gearbox") as string;
  const type = formData.get("type") as string;
  const options = formData.get("options") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  const files = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (const file of files) {
    if (file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      imageUrls.push(`/uploads/${fileName}`);
    }
  }

  await prisma.vehicle.create({
    data: {
      name,
      price,
      year,
      km,
      gearbox,
      type,
      options,
      description,
      status,
      images: JSON.stringify(imageUrls)
    }
  });

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  return { success: true };
}
