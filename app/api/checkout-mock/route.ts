import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerName, total, items, email } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Mensaje enriquecido con emojis para facilitar la lectura en tu móvil
    const message = `🧪 **[SIMULACIÓN] ¡Nueva Compra Recibida!**\n\n` +
                    `🆔 **Orden:** #${orderId}\n` +
                    `👤 **Cliente:** ${customerName} (${email})\n` +
                    `💰 **Total Simulado:** $${total.toFixed(2)}\n` +
                    `📦 **Artículos:**\n${items.map((i: any) => `• ${i.name} (x${i.quantity || 1})`).join('\n')}`;

    const telegramUrl = `https://telegram.org{botToken}/sendMessage`;

    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) throw new Error('Error al conectar con la API de Telegram');

    return NextResponse.json({ success: true, message: 'Simulación procesada y notificada' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
