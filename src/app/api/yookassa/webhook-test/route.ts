import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🧪 Тестовый webhook получен:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook test received successfully',
      timestamp: new Date().toISOString(),
      body 
    });
  } catch (error) {
    console.error('❌ Ошибка тестового webhook:', error);
    return NextResponse.json(
      { error: 'Test webhook error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook test endpoint is working',
    timestamp: new Date().toISOString(),
    instructions: [
      '1. Скопируйте этот URL: ' + (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/api/yookassa/webhook-test',
      '2. Вставьте его в настройки webhook в личном кабинете ЮKassa',
      '3. Проверьте, что webhook доходит до сервера'
    ]
  });
}