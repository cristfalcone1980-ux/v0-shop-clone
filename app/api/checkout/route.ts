import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${request.nextUrl.origin}/api/sumup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Error en la pasarela' }, { status: 500 });
  } catch (error) {
    console.error('Error en el puente de checkout:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
