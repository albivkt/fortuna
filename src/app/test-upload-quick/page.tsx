'use client';

import { useState } from 'react';

export default function TestUploadQuickPage() {
  const [result, setResult] = useState<string>('');

  const quickTest = async () => {
    try {
      setResult('Тестируем...');
      
      // Создаем простое тестовое изображение
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Красный фон
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        
        // Белый текст
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST', 50, 60);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setResult('❌ Ошибка создания blob');
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'test.png');

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setResult(`✅ Успешно! URL: ${data.url}`);
          console.log('Результат:', data);
        } else {
          setResult(`❌ Ошибка: ${data.error}`);
          console.error('Ошибка:', data);
        }
      }, 'image/png');
    } catch (error) {
      setResult(`❌ Исключение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      console.error('Исключение:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Быстрый тест загрузки</h1>
      
      <div className="space-y-4">
        <button
          onClick={quickTest}
          className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 text-lg"
        >
          🧪 Быстрый тест загрузки изображения
        </button>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-mono">{result}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>Этот тест:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Создает простое изображение 100x100 с текстом "TEST"</li>
            <li>Отправляет его на /api/upload-image</li>
            <li>Показывает результат</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 