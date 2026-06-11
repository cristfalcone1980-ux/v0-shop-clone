import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializamos Supabase con tus variables de entorno globales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // =======================================================
    // 1. MODIFICACIÓN EN LA BASE DE DATOS (SUPABASE)
    // =======================================================
    // Usamos el ID que viene en la orden para buscarla y actualizarla
    const orderId = orderData.orderId || orderData.id;

    if (orderId) {
      const { error: dbError } = await supabase
        .from('orders') // Cambia 'orders' por el nombre exacto de tu tabla si es diferente (ej: 'pedidos')
        .update({ status: 'completado' }) // El estado que quieras ponerle para tus afiliados
        .eq('id', orderId);

      if (dbError) {
        console.error('Error al actualizar en Supabase:', dbError);
        // No frenamos el flujo por si queremos que Telegram avise igual, pero dejamos el registro
      }
    } else {
      console.warn('No se encontró un ID de orden en los datos recibidos');
    }

    // =======================================================
    // 2. VALIDACIÓN DE TELEGRAM
    // =======================================================
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram no está configurado en Vercel');
      return NextResponse.json(
        { error: 'Telegram no está configurado' },
        { status: 500 }
      );
    }

    // =======================================================
    // 3. CONSTRUCCIÓN DEL MENSAJE (Cambiamos el texto a COMPLETADO)
    // =======================================================
    let message = '🛍️ <b>¡NUEVA COMPRA CONFIRMADA!</b>\n\n';
    if (orderId) message += `📋 <b>ID de Orden:</b> ${orderId}\n`;
    message += `📅 Hora: ${new Date(orderData.timestamp || Date.now()).toLocaleString('es-ES')}\n\n`;

    message += '<b>Productos:</b>\n';
    
    if (orderData.items && Array.isArray(orderData.items)) {
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
    } else {
      message += 'Detalles de productos no disponibles.\n\n';
    }

    message += `<b>💰 Total: $${(orderData.total || 0).toFixed(2)}</b>\n`;
    message += `\n🚀 Estado: PAGO COMPLETADO (Simup)`;

    // =======================================================
    // 4. ENVIAR MENSAJE A TELEGRAM
    // =======================================================
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
      { success: true, message: 'Base de datos actualizada y notificación enviada' },
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
