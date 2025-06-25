/**
 * Безопасно форматирует дату для отображения
 * @param dateValue - значение даты (строка, Date или null/undefined)
 * @param locale - локаль для форматирования (по умолчанию 'ru-RU')
 * @param fallback - текст для отображения если дата невалидна (по умолчанию 'Дата неизвестна')
 * @returns отформатированная дата или fallback текст
 */
export function formatDateSafely(
  dateValue: string | Date | null | undefined, 
  locale: string = 'ru-RU',
  fallback: string = 'Дата неизвестна'
): string {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleDateString(locale);
  } catch (error) {
    console.warn('Ошибка при форматировании даты:', error);
    return fallback;
  }
}

/**
 * Безопасно форматирует дату и время для отображения
 * @param dateValue - значение даты (строка, Date или null/undefined)
 * @param locale - локаль для форматирования (по умолчанию 'ru-RU')
 * @param fallback - текст для отображения если дата невалидна (по умолчанию 'Дата неизвестна')
 * @returns отформатированная дата и время или fallback текст
 */
export function formatDateTimeSafely(
  dateValue: string | Date | null | undefined, 
  locale: string = 'ru-RU',
  fallback: string = 'Дата неизвестна'
): string {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleString(locale);
  } catch (error) {
    console.warn('Ошибка при форматировании даты и времени:', error);
    return fallback;
  }
} 