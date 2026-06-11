import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SIMUP_SECRET_KEY = process.env.SIMUP_SECRET_KEY; // Tu sk_live_... de Simup en Vercel

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const total = orderData?.total !== undefined ? Number(orderData.total) : 100.00;
    const orderId = 'DROP-' + Math.floor(1000 + Math.random() * 9000);

    let checkoutUrl = '';

    // 1. LLAMAMOS A SIMUP PARA CREAR EL LINK DE LA TARJETA
    if (SIMUP_SECRET_KEY) {
      try {
        const response = await fetch('https://api.simup.com/v1/checkouts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SIMUP_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: total,
            currency: 'EUR',
            success_url: `${request.nextUrl.origin}/success`,
            cancel_url: `${request.nextUrl.origin}/`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Extraemos la URL que nos da Simup para que el cliente pague
          checkoutUrl = data.url || data.checkout_url || '';
        }
      } catch (payError) {
        console.error('Error con Simup:', payError);
      }
    }

    // 2. ENVIAMOS NOTIFICACIÓN A TELEGRAM
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      let message = '🛍️ <b>¡NUEVO INTENTO DE COMPRA!</b>\n\n';
      message += `📋 <b>Orden:</b> ${orderId}\n`;
      message += `💰 <b>Total:</b> ${total.toFixed(2)}€\n`;
      message += `💳 <b>Pasarela:</b> Redirigiendo a Tarjeta\n`;

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
          }),
        });
      } catch (tgErr) {
        console.error('Telegram falló:', tgErr);
      }
    }

    // 3. DEVOLVEMOS LA URL EN LA RESPUESTA
    return NextResponse.json({ success: true, url: checkoutUrl }, { status: 200 });

  } catch (error) {
    console.error('Error crítico:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
