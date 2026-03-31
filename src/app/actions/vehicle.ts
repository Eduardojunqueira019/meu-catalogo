"use server";
 
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
 
export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({
      where: { id }
    });
    
    revalidatePath("/catalogo");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: error.message || "Erro ao deletar" };
  }
}
 
export async function createVehicle(formData: FormData) {
  try {
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
        const arrayBuffer = await file.arrayBuffer();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        
        const { data, error } = await supabase.storage
          .from("veiculos")
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            upsert: false
          });
 
        if (error) {
          console.error("Error uploading image:", error);
          throw new Error("Erro ao subir imagem para o Supabase");
        }
 
        const { data: { publicUrl } } = supabase.storage
          .from("veiculos")
          .getPublicUrl(fileName);
          
        imageUrls.push(publicUrl);
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
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: error.message || "Erro desconhecido ao salvar." };
  }
}
