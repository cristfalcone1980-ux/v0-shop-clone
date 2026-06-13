import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'EUR', description } = body;

    const tokenResponse = await fetch('https://api.sumup.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.NEXT_PUBLIC_SUMUP_API_KEY!,
        client_secret: process.env.SUMUP_SECRET_KEY!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const checkoutResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: `order_${Date.now()}`,
        amount,
        currency,
        description,
        return_url: `${request.nextUrl.origin}/payment/success`,
      }),
    });

    const data = await checkoutResponse.json();

    if (data.id) {
      return NextResponse.json({
        success: true,
        checkoutUrl: `https://pay.sumup.com/b2c/DROPBAY/${data.id}`,
      });
    }

    return NextResponse.json({ success: false, error: data }, { status: 500 });

  } catch (error) {
    console.error('Error SumUp:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
