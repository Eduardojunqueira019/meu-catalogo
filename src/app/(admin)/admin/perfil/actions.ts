"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveProfile(formData: FormData) {
  const photo = formData.get("photo") as File;
  let photoUrl = formData.get("photoUrl") as string || "/placeholder-user.jpg";
 
  const logo = formData.get("logo") as File;
  let storeLogoUrl = formData.get("logoUrl") as string || "";
 
  // Perfil Photo Upload
  if (photo && photo.size > 0) {
    const arrayBuffer = await photo.arrayBuffer();
    const fileName = `profile-${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    
    const { data, error } = await supabase.storage
      .from("veiculos")
      .upload(fileName, arrayBuffer, {
        contentType: photo.type,
        upsert: false
      });
 
    if (error) {
      console.error("Error uploading profile photo:", error);
      throw new Error("Erro ao subir foto de perfil para o Supabase");
    }
 
    const { data: { publicUrl } } = supabase.storage
      .from("veiculos")
      .getPublicUrl(fileName);
      
    photoUrl = publicUrl;
  }
 
  // Store Logo Upload
  if (logo && logo.size > 0) {
    const arrayBuffer = await logo.arrayBuffer();
    const fileName = `logo-${Date.now()}-${logo.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    
    const { data, error } = await supabase.storage
      .from("veiculos")
      .upload(fileName, arrayBuffer, {
        contentType: logo.type,
        upsert: false
      });
 
    if (error) {
      console.error("Error uploading store logo:", error);
      throw new Error("Erro ao subir logomarca para o Supabase");
    }
 
    const { data: { publicUrl } } = supabase.storage
      .from("veiculos")
      .getPublicUrl(fileName);
      
    storeLogoUrl = publicUrl;
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
    storeLogoUrl,
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
