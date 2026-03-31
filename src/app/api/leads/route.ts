import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Convert boolean if it's string
    const inputData = {
      ...data,
      hasDownPayment: data.hasDownPayment === true || data.hasDownPayment === "true",
    };

    const lead = await prisma.lead.create({
      data: inputData
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
