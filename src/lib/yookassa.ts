// Интеграция с ЮKassa API
import { v4 as uuidv4 } from 'uuid';

// Конфигурация ЮKassa
export const YOOKASSA_CONFIG = {
  shopId: '1141058',
  secretKey: 'test_WqZwj6VXGxXs7OUM2DUNjKBP_VHwFBv3Ag8WPf3b_6U',
  apiUrl: 'https://api.yookassa.ru/v3'
};

// Типы для ЮKassa
export interface YooKassaAmount {
  value: string;
  currency: string;
}

export interface YooKassaConfirmation {
  type: 'redirect';
  return_url: string;
}

export interface YooKassaPaymentRequest {
  amount: YooKassaAmount;
  confirmation: YooKassaConfirmation;
  capture: boolean;
  description?: string;
  metadata?: Record<string, string>;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  amount: YooKassaAmount;
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface YooKassaWebhookData {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    amount: YooKassaAmount;
    created_at: string;
    description?: string;
    metadata?: Record<string, string>;
  };
}

// Создание заголовков для аутентификации
function createAuthHeaders(): HeadersInit {
  const credentials = Buffer.from(`${YOOKASSA_CONFIG.shopId}:${YOOKASSA_CONFIG.secretKey}`).toString('base64');
  
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
    'Idempotence-Key': uuidv4()
  };
}

// Создание платежа
export async function createPayment(
  amount: number, // сумма в копейках
  description: string,
  returnUrl: string,
  metadata?: Record<string, string>
): Promise<YooKassaPaymentResponse> {
  try {
    const paymentData: YooKassaPaymentRequest = {
      amount: {
        value: (amount / 100).toFixed(2), // конвертируем копейки в рубли
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      capture: true,
      description,
      metadata
    };

    console.log('🔄 Создание платежа ЮKassa:', paymentData);

    const response = await fetch(`${YOOKASSA_CONFIG.apiUrl}/payments`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка создания платежа ЮKassa:', errorText);
      throw new Error(`ЮKassa API error: ${response.status} - ${errorText}`);
    }

    const result: YooKassaPaymentResponse = await response.json();
    console.log('✅ Платеж ЮKassa создан:', result);

    return result;
  } catch (error) {
    console.error('❌ Ошибка при создании платежа:', error);
    throw error;
  }
}

// Получение информации о платеже
export async function getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
  try {
    const response = await fetch(`${YOOKASSA_CONFIG.apiUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_CONFIG.shopId}:${YOOKASSA_CONFIG.secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка получения платежа ЮKassa:', errorText);
      throw new Error(`ЮKassa API error: ${response.status} - ${errorText}`);
    }

    const result: YooKassaPaymentResponse = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Ошибка при получении платежа:', error);
    throw error;
  }
}

// Создание возврата
export async function createRefund(
  paymentId: string,
  amount: number, // сумма в копейках
  description?: string
): Promise<any> {
  try {
    const refundData = {
      amount: {
        value: (amount / 100).toFixed(2),
        currency: 'RUB'
      },
      payment_id: paymentId,
      description
    };

    const response = await fetch(`${YOOKASSA_CONFIG.apiUrl}/refunds`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(refundData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка создания возврата ЮKassa:', errorText);
      throw new Error(`ЮKassa API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Возврат ЮKassa создан:', result);

    return result;
  } catch (error) {
    console.error('❌ Ошибка при создании возврата:', error);
    throw error;
  }
}

// Проверка валидности webhook от ЮKassa
export function validateWebhook(webhookData: YooKassaWebhookData): boolean {
  // Базовая валидация структуры данных
  return !!(
    webhookData.type &&
    webhookData.event &&
    webhookData.object &&
    webhookData.object.id &&
    webhookData.object.status
  );
}

// Получение суммы платежа из строки
export function parseAmount(amountString: string): number {
  return Math.round(parseFloat(amountString) * 100); // конвертируем в копейки
}

// Форматирование суммы для отображения
export function formatAmount(amountInKopecks: number): string {
  return (amountInKopecks / 100).toFixed(2) + ' ₽';
}