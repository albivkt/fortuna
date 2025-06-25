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

  // Рисование CAPTCHA на canvas для темной темы
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Полная очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Темно-серый фон для темной темы
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Легкий шум - несколько темных линий
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Основной текст - крупный и белый
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E5E7EB';
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
      <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-300 font-medium">CAPTCHA пройдена</span>
          <button
            onClick={resetCaptcha}
            className="text-green-400 hover:text-green-300 text-sm underline"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Подтвердите, что вы не робот
          </label>
          <button
            onClick={generateQuestion}
            disabled={isLocked}
            className="text-orange-400 hover:text-orange-300 text-sm underline disabled:opacity-50"
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
            className="border border-gray-600/50 rounded bg-gray-700"
          />
          
          <div className="flex-1">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
              onKeyPress={handleKeyPress}
              disabled={isLocked}
              placeholder="Ответ"
              className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
            />
            
            <button
              onClick={checkAnswer}
              disabled={isLocked || !userAnswer}
              className="mt-2 w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLocked ? 'Заблокировано' : 'Проверить'}
            </button>
          </div>
        </div>
        
        {attempts > 0 && !isLocked && (
          <div className="text-red-400 text-sm">
            Неверный ответ. Попыток осталось: {3 - attempts}
          </div>
        )}
        
        {isLocked && (
          <div className="text-red-400 text-sm">
            Слишком много неверных попыток. Попробуйте через 30 секунд.
          </div>
        )}
        
        <div className="text-xs text-gray-400">
          Решите математический пример для продолжения
        </div>
      </div>
    </div>
  );
} 