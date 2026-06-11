import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pedido = await req.json();

  const token = "TU_TOKEN_TELEGRAM";
  const chatId = "TU_CHAT_ID";

  const mensaje = `
🛒 Nuevo pedido recibido
ID: ${pedido.id}
Cliente: ${pedido.nombre}
Total: ${pedido.total}€
  `;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensaje,
      parse_mode: "Markdown"
    })
  });

  return NextResponse.json({ ok: true });
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pedido = await req.json();

  const token = "TU_TOKEN_TELEGRAM";
  const chatId = "TU_CHAT_ID";

  // Construir lista de productos
  const productosTexto = pedido.productos
    .map(
      (p: any) =>
        `• ${p.nombre} x${p.cantidad} — ${p.precio}€`
    )
    .join("\n");

  const mensaje = `
🛒 *Nuevo pedido recibido*

📦 *Pedido:* ${pedido.id}
📅 *Fecha:* ${pedido.fecha}

👤 *Cliente:* ${pedido.nombre}
📧 *Email:* ${pedido.email}
📱 *Teléfono:* ${pedido.telefono}

🏠 *Dirección:*
${pedido.direccion}
${pedido.ciudad}, ${pedido.cp}
${pedido.pais}

💳 *Pago:* ${pedido.metodoPago}

🛍️ *Productos:*
${productosTexto}

💰 *Total:* ${pedido.total}€
  `;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensaje,
      parse_mode: "Markdown"
    })
  });

  return NextResponse.json({ ok: true });
}
