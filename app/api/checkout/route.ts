import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Leemos los datos que envía el botón naranja de la tienda
    const body = await request.json();

    // 2. Le pasamos esos mismos datos al archivo de la carpeta simup
    const response = await fetch(`${request.nextUrl.origin}/api/simup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      // 3. Le devolvemos la respuesta con la URL de pago al botón de la tienda
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Error en la pasarela' }, { status: 500 });
  } catch (error) {
    console.error('Error en el puente de checkout:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
// Cambia esto:
const response = await fetch(`${request.nextUrl.origin}/api/simup`, {

// Por esto:
const response = await fetch(`${request.nextUrl.origin}/api/sumup`, {
