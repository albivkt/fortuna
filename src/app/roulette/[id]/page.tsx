'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getRouletteById, updateRouletteStats, type Roulette } from '@/lib/roulettes';
import { getCurrentUser } from '@/lib/user';
import { addDrawHistoryEntry } from '@/lib/drawHistory';
import { createDrawCompletedNotification, createNewParticipantNotification } from '@/lib/notifications';

// Динамический импорт для избежания SSR проблем
const Wheel = dynamic(
  () => import('react-custom-roulette').then((mod) => ({ default: mod.Wheel })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
        <span className="text-white font-bold text-lg">Загрузка рулетки...</span>
      </div>
    )
  }
);

export default function RoulettePage() {
  const params = useParams();
  const router = useRouter();
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    setIsClient(true);
    
    // Загружаем данные рулетки по ID
    const rouletteId = params.id as string;
    const rouletteData = getRouletteById(rouletteId);
    
    if (rouletteData) {
      setRoulette(rouletteData);
      
      // Получаем имя автора рулетки
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === rouletteData.userId) {
        setAuthorName(currentUser.name);
      } else {
        // Если это не текущий пользователь, показываем имя из данных рулетки
        setAuthorName(rouletteData.author);
      }
    }
    
    setLoading(false);
  }, [params.id]);

  const handleSpinClick = () => {
    if (!mustSpin && roulette) {
      const newPrizeNumber = Math.floor(Math.random() * roulette.segments.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    if (roulette) {
      const winningSegment = roulette.segments[prizeNumber];
      setWinner(winningSegment.text);
      
      // Сохраняем в историю розыгрышей
      try {
        addDrawHistoryEntry({
          wheelId: roulette.id,
          prize: winningSegment.text,
          participant: participantName || undefined,
          metadata: {
            color: winningSegment.color,
            segmentIndex: prizeNumber,
          }
        });
      } catch (error) {
        console.error('Ошибка при сохранении истории:', error);
      }

      // Создаем уведомление о завершении розыгрыша
      if (roulette.userId) {
        try {
          createDrawCompletedNotification(
            roulette.userId,
            winningSegment.text,
            roulette.name,
            roulette.id,
            participantName || undefined
          );
        } catch (error) {
          console.error('Ошибка при создании уведомления:', error);
        }
      }
      
      // Обновляем статистику для PRO пользователей
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.plan === 'pro' && roulette.userId === currentUser.id) {
        updateRouletteStats(roulette.id, winningSegment.id);
      }
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      prompt('Скопируйте эту ссылку:', shareUrl);
    });
  };

  const handleJoinDraw = () => {
    if (!participantName.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    setHasJoined(true);

    // Отправляем уведомление владельцу рулетки о новом участнике (PRO функция)
    if (roulette && roulette.userId) {
      try {
        createNewParticipantNotification(
          roulette.userId,
          participantName,
          roulette.name,
          roulette.id
        );
      } catch (error) {
        console.error('Ошибка при создании уведомления:', error);
      }
    }

    alert(`${participantName}, вы успешно присоединились к розыгрышу "${roulette?.name || 'рулетке'}"! Теперь можете крутить рулетку.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка рулетки...</p>
        </div>
      </div>
    );
  }

  if (!roulette) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Рулетка не найдена</h2>
          <p className="text-gray-600 mb-6">Возможно, рулетка была удалена или у вас нет доступа к ней</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  // Преобразуем сегменты для react-custom-roulette
  const wheelData = roulette.segments.map(segment => ({
    option: segment.text,
    style: { 
      backgroundColor: segment.color, 
      textColor: roulette.customDesign?.textColor || 'white' 
    }
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Поделиться
              </button>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Мои рулетки
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{roulette.name}</h1>
          <p className="text-gray-600">
            Создано {authorName} • {new Date(roulette.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Wheel */}
          <div 
            className="relative p-8 rounded-xl"
            style={{ backgroundColor: roulette.customDesign?.backgroundColor || 'transparent' }}
          >
            {isClient ? (
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleStopSpinning}
                outerBorderColor={roulette.customDesign?.borderColor || '#ffffff'}
                outerBorderWidth={8}
                innerBorderColor={roulette.customDesign?.borderColor || '#ffffff'}
                innerBorderWidth={4}
                radiusLineColor={roulette.customDesign?.borderColor || '#ffffff'}
                radiusLineWidth={2}
                fontSize={16}
                textDistance={60}
                spinDuration={0.8}
              />
            ) : (
              <div className="w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-lg">Подготовка рулетки...</span>
              </div>
            )}
          </div>

          {/* Participant Name Input */}
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя участника (необязательно)
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Введите имя участника"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                disabled={mustSpin || hasJoined}
              />
              {!hasJoined && participantName.trim() && (
                <button
                  onClick={handleJoinDraw}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                  disabled={mustSpin}
                >
                  Присоединиться
                </button>
              )}
            </div>
            {hasJoined && (
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Вы присоединились к розыгрышу!
              </p>
            )}
          </div>

          {/* Spin Button */}
          <button
            className="bg-purple-600 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleSpinClick}
            disabled={mustSpin}
          >
            {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
          </button>

          {/* Result Display */}
          {winner && (
            <div className="mt-8 p-6 bg-green-100 border-2 border-green-300 rounded-xl max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Поздравляем!</h3>
                {participantName ? (
                  <div className="text-green-700 text-lg">
                    <p className="mb-1">
                      <span className="font-semibold">{participantName}</span> выиграл:
                    </p>
                    <p className="font-bold text-xl">{winner}</p>
                  </div>
                ) : (
                  <p className="text-green-700 text-lg">
                    Выпал приз: <span className="font-semibold">{winner}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Prizes List */}
          <div className="w-full max-w-2xl mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Призы в рулетке</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {roulette.segments.map((segment, index) => (
                <div key={segment.id} className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <div 
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-gray-900 font-medium">{segment.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 