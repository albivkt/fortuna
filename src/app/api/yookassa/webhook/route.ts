import { NextRequest, NextResponse } from 'next/server';
import { validateWebhook, type YooKassaWebhookData, parseAmount } from '@/lib/yookassa';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const webhookData: YooKassaWebhookData = await request.json();
    
    console.log('🔔 Получено уведомление от ЮKassa:', JSON.stringify(webhookData, null, 2));

    // Валидация webhook
    if (!validateWebhook(webhookData)) {
      console.error('❌ Невалидный webhook от ЮKassa');
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    const { type, event, object: paymentObject } = webhookData;

    // Обрабатываем только события платежей
    if (type === 'notification' && event === 'payment.succeeded') {
      await handleSuccessfulPayment(paymentObject);
    } else if (type === 'notification' && event === 'payment.canceled') {
      await handleCanceledPayment(paymentObject);
    } else {
      console.log('ℹ️ Неизвестный тип события:', { type, event });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentObject: any) {
  try {
    const { id: paymentId, metadata, amount } = paymentObject;
    
    if (!metadata || !metadata.userId) {
      console.error('❌ Отсутствуют метаданные в платеже:', paymentId);
      return;
    }

    const { userId, plan, period } = metadata;
    const paymentAmount = parseAmount(amount.value);

    console.log('✅ Обработка успешного платежа:', {
      paymentId,
      userId,
      plan,
      period,
      amount: paymentAmount
    });

    // Вычисляем дату окончания подписки
    const startDate = new Date();
    const endDate = new Date();
    
    if (period === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Создаем запись о подписке
    const subscription = await prisma.subscription.create({
      data: {
        plan,
        status: 'ACTIVE',
        amount: paymentAmount,
        currency: 'RUB',
        period,
        startDate,
        endDate,
        userId,
      },
    });

    // Обновляем план пользователя
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: endDate,
      },
    });

    console.log('✅ Подписка активирована:', {
      subscriptionId: subscription.id,
      userId,
      plan,
      expiresAt: endDate
    });

  } catch (error) {
    console.error('❌ Ошибка активации подписки:', error);
    throw error;
  }
}

async function handleCanceledPayment(paymentObject: any) {
  try {
    const { id: paymentId, metadata } = paymentObject;
    
    console.log('❌ Платеж отменен:', {
      paymentId,
      metadata
    });

    // Здесь можно добавить логику для обработки отмененных платежей
    // Например, отправка уведомления пользователю

  } catch (error) {
    console.error('❌ Ошибка обработки отмененного платежа:', error);
    throw error;
  }
}