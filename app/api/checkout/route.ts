import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validar que tenemos las credenciales de Telegram
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram no está configurado');
      return NextResponse.json(
        { error: 'Telegram no está configurado' },
        { status: 500 }
      );
    }

    // Construir el mensaje para Telegram
    let message = '🛍️ <b>¡NUEVA COMPRA!</b>\n\n';
    message += '📋 <b>Detalles de la orden:</b>\n';
    message += `📅 Hora: ${new Date(orderData.timestamp).toLocaleString('es-ES')}\n\n`;

    message += '<b>Productos:</b>\n';
    orderData.items.forEach(
      (
        item: {
          productName: string;
          quantity: number;
          price: number;
          subtotal: number;
        },
        index: number
      ) => {
        message += `${index + 1}. ${item.productName}\n`;
        message += `   Cantidad: ${item.quantity} x $${item.price.toFixed(2)}\n`;
        message += `   Subtotal: $${item.subtotal.toFixed(2)}\n\n`;
      }
    );

    message += `<b>💰 Total: $${orderData.total.toFixed(2)}</b>\n`;
    message += `\n✅ Estado: Pendiente de pago`;

    // Enviar mensaje a Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error de Telegram:', error);
      throw new Error('Error al enviar mensaje a Telegram');
    }

    return NextResponse.json(
      { success: true, message: 'Compra registrada y notificación enviada' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json(
      { error: 'Error al procesar la compra' },
      { status: 500 }
    );
  }
}
