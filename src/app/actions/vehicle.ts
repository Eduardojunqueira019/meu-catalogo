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
 
export async function uploadVehicleImage(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) throw new Error("Imagem não fornecida.");

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
      
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Error in uploadVehicleImage:", error);
    return { success: false, error: error.message || "Erro no upload." };
  }
}
 
export interface CreateVehicleInput {
  name: string;
  price: number;
  year: number;
  km: number;
  gearbox: string;
  type: string;
  options: string;
  description: string;
  status: string;
  imageUrls: string[];
}
 
export async function createVehicle(input: CreateVehicleInput) {
  try {
    const { name, price, year, km, gearbox, type, options, description, status, imageUrls } = input;
 
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
