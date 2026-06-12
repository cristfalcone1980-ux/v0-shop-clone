import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SIMUP_SECRET_KEY = process.env.SIMUP_SECRET_KEY; // Tu clave sk_live_... de Simup

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    
    const total = orderData?.total !== undefined ? Number(orderData.total) : 100.00;
    const orderId = orderData?.orderId || orderData?.id || 'DROP-' + Math.floor(1000 + Math.random() * 9000);

    // =======================================================
    // 1. GENERAR EL ENLACE REAL DE LA PASARELA (SIMUP)
    // =======================================================
    let checkoutUrl = '';

    if (SIMUP_SECRET_KEY) {
      try {
        // Llamada a la API de Simup para crear una sesión de pago con tarjeta
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
          // Simup devuelve la URL para redirigir al cliente a la pantalla de la tarjeta
          checkoutUrl = data.url || data.checkout_url || '';
        } else {
          console.error('Simup rechazó las credenciales:', await response.text());
        }
      } catch (payError) {
        console.error('Error de conexión con la pasarela Simup:', payError);
      }
    }

    // =======================================================
    // 2. ENVIAR ALERTA A TELEGRAM
    // =======================================================
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      let message = '🛍️ <b>¡INTENTO DE COMPRA!</b>\n\n';
      message += `📋 <b>Orden:</b> ${orderId}\n`;
      message += `💰 <b>Total:</b> ${total.toFixed(2)}€\n`;
      message += `💳 <b>Método:</b> Tarjeta (Simup)\n`;
      if (checkoutUrl) {
        message += `🔗 <i>Pasarela de pago generada. Redirigiendo al cliente...</i>\n`;
      } else {
        message += `⚠️ <i>No se pudo generar el link de pago (Revisa tu clave en Vercel)</i>\n`;
      }

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

    // =======================================================
    // 3. RESPUESTA DE REDIRECCIÓN
    // =======================================================
    // Si la pasarela nos da la URL, se la devolvemos a la web para que mueva la pantalla del usuario
    if (checkoutUrl) {
      return NextResponse.json({ success: true, url: checkoutUrl }, { status: 200 });
    }

    // Si no hay claves configuradas, respondemos con éxito para desatascar el botón en la tienda
    return NextResponse.json(
      { success: true, message: 'Simulación activa o falta configuración de pasarela' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error crítico en checkout:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
