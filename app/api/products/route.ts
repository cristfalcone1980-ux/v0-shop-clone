import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Función interna para enviar la notificación a Telegram (Corregida a GET)
async function sendTelegramNotification(name: string, price: string | number) {
  const BOT_TOKEN = "7339243760:AAEl7fO-O5q9h9M8hP7c8x8z8w8y8x8z84" // Tu token REAL terminado en 4
  const CHAT_ID = "7151205555"                                     // Tu Chat ID real
  
  const text = encodeURIComponent(`🚀 ¡Nuevo producto creado!\n\n📦 Nombre: ${name}\n💰 Precio: ${price}€`);

  try {
    // GET directo idéntico al del navegador
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`);
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

    // Disparamos Telegram sin retrasar la respuesta de la API
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
