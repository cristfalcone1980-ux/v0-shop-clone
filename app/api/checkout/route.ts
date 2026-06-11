import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // 1. Validar que tenemos las credenciales de Telegram que vimos en tus fotos
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram no está configurado en las variables de Vercel');
      return NextResponse.json(
        { error: 'Telegram no está configurado' },
        { status: 500 }
      );
    }

    // 2. Construir el mensaje de forma segura (añadiendo salvavidas por si faltan campos)
    const orderId = orderData.orderId || orderData.id || 'N/A';
    const total = orderData.total !== undefined ? Number(orderData.total).toFixed(2) : '0.00';
    const timestamp = orderData.timestamp ? new Date(orderData.timestamp).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');

    let message = '🛍️ <b>¡NUEVA COMPRA!</b>\n\n';
    message += `📋 <b>ID Orden:</b> ${orderId}\n`;
    message += `📅 <b>Hora:</b> ${timestamp}\n\n`;

    message += '<b>Productos:</b>\n';
    
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item: any, index: number) => {
        const pName = item.productName || 'Producto';
        const pQty = item.quantity || 1;
        const pPrice = item.price !== undefined ? Number(item.price).toFixed(2) : '0.00';
        const pSub = item.subtotal !== undefined ? Number(item.subtotal).toFixed(2) : '0.00';

        message += `${index + 1}. ${pName}\n`;
        message += `   Cantidad: ${pQty} x $${pPrice}\n`;
        message += `   Subtotal: $${pSub}\n\n`;
      });
    } else {
      message += '• Detalles de los artículos no disponibles.\n\n';
    }

    message += `<b>💰 Total: $${total}</b>\n`;
    message += `\n✅ Estado: Procesado correctamente`;

    // 3. Enviar mensaje a Telegram de forma aislada
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
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
        const errorText = await response.text();
        console.error('Error directo de la API de Telegram:', errorText);
      }
    } catch (telegramError) {
      // Si Telegram falla por red o restricción, el checkout NO se congela
      console.error('Fallo de red al conectar con Telegram:', telegramError);
    }

    // 4. Responder SIEMPRE con un 200 a la web para que nunca se quede congelada
    return NextResponse.json(
      { success: true, message: 'Checkout finalizado' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error crítico en la lectura de datos del checkout:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar los datos de la compra' },
      { status: 500 }
    );
  }
}
