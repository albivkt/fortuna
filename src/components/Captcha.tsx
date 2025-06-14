'use client';

import { useState, useEffect, useRef } from 'react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  onReset?: () => void;
}

// Простая математическая CAPTCHA
export default function Captcha({ onVerify, onReset }: CaptchaProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Генерация нового вопроса
  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, result: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        result = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        result = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        result = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        result = 2;
    }
    
    setQuestion(`${num1} ${operation} ${num2} = ?`);
    setCorrectAnswer(result);
    drawCaptcha(`${num1} ${operation} ${num2} = ?`);
  };

  // Рисование CAPTCHA на canvas
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Полная очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Белый фон
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Легкий шум - только несколько светлых линий
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Основной текст - крупный и черный
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Рисуем текст в центре без сильных искажений
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Сначала обводка для контраста
    ctx.strokeText(text, centerX, centerY);
    // Затем заливка
    ctx.fillText(text, centerX, centerY);
    
    console.log('CAPTCHA drawn with text:', text, 'color:', ctx.fillStyle);
  };

  // Проверка ответа
  const checkAnswer = () => {
    if (isLocked) return;
    
    const userNum = parseInt(userAnswer);
    if (userNum === correctAnswer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      setUserAnswer('');
      
      if (attempts >= 2) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          generateQuestion();
        }, 30000); // Блокировка на 30 секунд
      } else {
        generateQuestion();
      }
      onVerify(false);
    }
  };

  // Сброс CAPTCHA
  const resetCaptcha = () => {
    setIsVerified(false);
    setUserAnswer('');
    setAttempts(0);
    setIsLocked(false);
    generateQuestion();
    onReset?.();
  };

  // Инициализация
  useEffect(() => {
    generateQuestion();
  }, []);

  // Принудительное обновление canvas при изменении вопроса
  useEffect(() => {
    if (question) {
      // Небольшая задержка для гарантии, что canvas готов
      setTimeout(() => {
        drawCaptcha(question);
      }, 100);
    }
  }, [question]);

  // Обработка Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLocked && !isVerified) {
      checkAnswer();
    }
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-medium">CAPTCHA пройдена</span>
          <button
            onClick={resetCaptcha}
            className="text-green-600 hover:text-green-800 text-sm underline"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Подтвердите, что вы не робот
          </label>
          <button
            onClick={generateQuestion}
            disabled={isLocked}
            className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50"
            title="Обновить CAPTCHA"
          >
            🔄
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <canvas
            ref={canvasRef}
            width={200}
            height={60}
            className="border border-gray-300 rounded bg-white"
          />
          
          <div className="flex-1">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
              onKeyPress={handleKeyPress}
              disabled={isLocked}
              placeholder="Ответ"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white"
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
            />
            
            <button
              onClick={checkAnswer}
              disabled={isLocked || !userAnswer}
              className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {isLocked ? 'Заблокировано' : 'Проверить'}
            </button>
          </div>
        </div>
        
        {attempts > 0 && !isLocked && (
          <div className="text-red-600 text-sm">
            Неверный ответ. Попыток осталось: {3 - attempts}
          </div>
        )}
        
        {isLocked && (
          <div className="text-red-600 text-sm">
            Слишком много неверных попыток. Попробуйте через 30 секунд.
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Решите математический пример для продолжения
        </div>
      </div>
    </div>
  );
} 