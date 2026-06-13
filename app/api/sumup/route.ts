import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'EUR', description } = body;

    const response = await fetch('https://sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUMUP_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: `order_${Date.now()}`,
        amount,
        currency,
        description,
        merchant_code: 'MT0E3WXG',
        redirect_url: `${request.nextUrl.origin}/payment/success`,
      }),
    });

    const data = await response.json();
    console.error('SumUp response:', JSON.stringify(data));

    if (data.id && data.redirect_url) {
      return NextResponse.json({
        success: true,
        checkoutUrl: data.redirect_url,
      });
    }

    return NextResponse.json({ success: false, error: data }, { status: 500 });

  } catch (error) {
    console.error('Error SumUp:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
