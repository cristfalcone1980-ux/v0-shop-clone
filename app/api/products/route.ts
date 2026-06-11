import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Función interna para enviar la notificación a Telegram
async function sendTelegramNotification(name: string, price: string | number) {
  const BOT_TOKEN = "TU_TOKEN_AQUÍ" // Reemplaza con tu token real
  const CHAT_ID = "TU_CHAT_ID_AQUÍ"   // Reemplaza con tu ID de chat real
  
  const message = `🚀 *¡Nuevo producto creado!*\n\n📦 *Nombre:* ${name}\n💰 *Precio:* ${price}€`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error("Error enviando notificación a Telegram:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, price, image_url, amazon_affiliate_link } = body

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description: description || null,
          price: parseFloat(price),
          currency: 'EUR',
          image_url: image_url || null,
          amazon_affiliate_link: amazon_affiliate_link || null,
          user_id: user.id,
        },
      ])
      .select()

    if (error) {
      console.error('[v0] Insert error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // 🔥 CAMBIO AQUÍ: La inserción en Supabase ha sido un éxito, disparamos Telegram sin retrasar la respuesta de la API
    sendTelegramNotification(name, price).catch(err => 
      console.error("Error asíncrono en Telegram:", err)
    );

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[v0] API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[v0] API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
