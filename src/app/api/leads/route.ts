import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Initialize Pusher (Server-side)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "sa1",
  useTLS: true,
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Convert boolean if it's string
    const inputData = {
      ...data,
      hasDownPayment: data.hasDownPayment === true || data.hasDownPayment === "true",
    };

    const lead = await prisma.lead.create({
      data: inputData,
      include: { vehicle: true }
    });

    // 1. TRIGGER REAL-TIME NOTIFICATION
    try {
      if (process.env.PUSHER_KEY) {
        await pusher.trigger("admin-notifications", "new-lead", {
          id: lead.id,
          name: lead.name,
          whatsapp: lead.whatsapp,
          city: lead.city,
          vehicle: lead.vehicle?.name || "Geral",
          price: lead.vehicle?.price || 0,
        });
      }
    } catch (pushError) {
      console.error("Error triggering Pusher:", pushError);
    }

    // 2. SEND AUTOMATIC EMAIL
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Catalogo <onboarding@resend.dev>',
          to: 'wdc25@outlook.com', // Using user contact as fallback/admin
          subject: `🚗 Novo Lead: ${lead.name}`,
          html: `
            <h1>Novo Lead Recebido!</h1>
            <p><strong>Nome:</strong> ${lead.name}</p>
            <p><strong>WhatsApp:</strong> ${lead.whatsapp}</p>
            <p><strong>Cidade:</strong> ${lead.city}</p>
            <p><strong>Veículo:</strong> ${lead.vehicle?.name || "Geral"}</p>
            <p><strong>Renda Mensal:</strong> ${lead.income || "Não informada"}</p>
            <p><strong>Entrada:</strong> ${lead.hasDownPayment ? lead.downPayment : "Não possui"}</p>
            <hr />
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/leads">Ver todos os leads no Painel Admin</a></p>
          `
        });
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
