import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/yookassa';
import { PLAN_PRICES } from '@/lib/planLimits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, userId, userEmail } = body;

    // Валидация входных данных
    if (!period || !userId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }

    if (!['MONTHLY', 'YEARLY'].includes(period)) {
      return NextResponse.json(
        { error: 'Неверный период подписки' },
        { status: 400 }
      );
    }

    // Получаем сумму для выбранного периода
    const amount = PLAN_PRICES.PRO[period as keyof typeof PLAN_PRICES.PRO];
    const periodText = period === 'YEARLY' ? 'годовая' : 'месячная';
    
    // Создаем описание платежа
    const description = `Подписка GIFTY PRO (${periodText})`;
    
    // URL для возврата после оплаты
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success-simple`;

    // Метаданные для идентификации платежа
    const metadata = {
      userId,
      plan: 'PRO',
      period,
      userEmail: userEmail || ''
    };

    console.log('🔄 Создание платежа ЮKassa:', {
      amount,
      description,
      returnUrl,
      metadata
    });

    // Создаем платеж через ЮKassa
    const payment = await createPayment(
      amount,
      description,
      returnUrl,
      metadata
    );

    console.log('✅ Платеж ЮKassa создан успешно:', payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
      amount: payment.amount,
      description: payment.description
    });

  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка при создании платежа',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}