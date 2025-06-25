'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CustomWheel } from '@/components/CustomWheel';
import { useWheel, useSpinWheel } from '@/lib/graphql/hooks';
import { getCurrentUser, createUser, type User } from '@/lib/user';
import { formatDateSafely } from '@/lib/dateUtils';

import { createDrawCompletedNotification, createNewParticipantNotification } from '@/lib/notifications';

export default function RoulettePage() {
  const params = useParams();
  const router = useRouter();
  const wheelId = params.id as string;
  
  // GraphQL запросы
  const { data: wheelQueryData, loading: wheelLoading, error: wheelError, refetch: refetchWheel } = useWheel(wheelId);
  const [spinWheel] = useSpinWheel();
  
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [user, setUser] = useState<User | null>(null);


  const wheel = wheelQueryData?.wheel;

  // Функция для получения или создания пользователя
  const getOrCreateUser = () => {
    let currentUser = getCurrentUser();
    if (!currentUser) {
      // Создаем временного пользователя
      currentUser = createUser({ 
        name: 'Пользователь', 
        email: `temp_${Date.now()}@gifty.local` 
      });
      console.log('Создан новый пользователь:', currentUser);
    }
    return currentUser;
  };

  useEffect(() => {
    setIsClient(true);
    // Получаем или создаем пользователя
    const currentUser = getOrCreateUser();
    setUser(currentUser);
    console.log('👤 Current user in roulette page:', currentUser);
  }, []);



  const handleSpinClick = () => {
    if (!mustSpin && wheel) {
      const newPrizeNumber = Math.floor(Math.random() * wheel.segments.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setWinner(null);
    }
  };

  const handleStopSpinning = async () => {
    if (!wheel) return;
    
    setMustSpin(false);
    const winningSegment = wheel.segments[prizeNumber];
    
    // Получаем имя пользователя: либо введенное имя участника, либо имя зарегистрированного пользователя
    const currentUser = getOrCreateUser();
    console.log('Пользователь при розыгрыше:', currentUser);
    console.log('hasJoined:', hasJoined, 'participantName:', participantName);
    
    const winnerName = hasJoined && participantName 
      ? participantName 
      : currentUser.name;
    
    console.log('Имя победителя:', winnerName);
    
    setWinner(`${winnerName} выиграл: ${winningSegment.option}`);

    try {
      // Отправляем результат через GraphQL
      await spinWheel({
        variables: {
          input: {
            wheelId: wheel.id,
            result: winningSegment.option,
            participant: winnerName
          }
        }
      });

      // Перезагружаем данные рулетки для обновления истории
      refetchWheel();

      // Создаем уведомление о завершении розыгрыша
      createDrawCompletedNotification(
        currentUser.id,
        winningSegment.option,
        wheel.title,
        wheel.id,
        winnerName
      );
    } catch (error) {
      console.error('Ошибка при сохранении результата:', error);
    }
  };

  const handleJoinRoulette = () => {
    if (participantName.trim()) {
      setHasJoined(true);
      
      // Создаем уведомление о новом участнике
      const currentUser = getOrCreateUser();
      if (wheel) {
        createNewParticipantNotification(
          currentUser.id,
          participantName,
          wheel.title,
          wheel.id
        );
      }
    }
  };

  if (wheelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Загрузка рулетки...</p>
        </div>
      </div>
    );
  }

  if (wheelError || !wheel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-red-500/20 border border-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Рулетка не найдена</h2>
          <p className="text-gray-300 mb-6">Возможно, рулетка была удалена или у вас нет доступа к ней</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg font-medium"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  // Преобразуем сегменты для кастомной рулетки
  const wheelData = wheel.segments.map(segment => ({
    option: segment.option,
    style: { 
      backgroundColor: segment.style.backgroundColor, 
      textColor: segment.style.textColor || 'white' 
    },
    image: segment.image || undefined,
    imagePosition: { x: 0, y: 0 } // Позиция по умолчанию для просмотра
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">колесо подарков</span>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Назад к дашборду</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {wheel.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-lg text-gray-300 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <span>Создатель: <span className="text-white font-semibold">{(() => {
                  const currentUser = getOrCreateUser();
                  // Если это рулетка текущего пользователя, показываем его актуальное имя
                  if (wheel.user.id === currentUser.id || wheel.user.name === 'Гость') {
                    return currentUser.name;
                  }
                  // Иначе показываем имя создателя из базы
                  return wheel.user.name || 'Пользователь';
                })()}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📅</span>
                </div>
                <span>Создано: <span className="text-white font-semibold">{formatDateSafely(wheel.createdAt)}</span></span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 lg:p-12 mb-8">
            <div className="flex flex-col items-center space-y-8">
              
              {/* Wheel */}
              <div className="relative">
                <div className="p-4 rounded-xl transition-all duration-300">
                  {isClient ? (
                    (() => {
                                             console.log('🎨 Wheel custom design:', wheel.customDesign);
                       console.log('👤 Current user:', user);
                       console.log('👤 Wheel owner:', wheel.user);
                       console.log('🔒 Is PRO?', user?.plan === 'pro' || (wheel.user.id === user?.id && wheel.user.plan === 'pro'));
                      return (
                        <CustomWheel
                          mustStartSpinning={mustSpin}
                          prizeNumber={prizeNumber}
                          data={wheelData}
                          onStopSpinning={handleStopSpinning}
                          customDesign={wheel.customDesign}
                          isPro={user?.plan === 'pro' || (wheel.user.id === user?.id && wheel.user.plan === 'pro')}
                          size="large"
                        />
                      );
                    })()
                  ) : (
                    <div className="w-80 h-80 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center shadow-2xl">
                      <span className="text-white font-bold text-lg">Подготовка рулетки...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Name Input */}
              {!hasJoined && (
                <div className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-md w-full border border-gray-600/30">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Присоединиться к розыгрышу
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Введите ваше имя"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                    />
                    <button
                      onClick={handleJoinRoulette}
                      disabled={!participantName.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Присоединиться
                    </button>
                  </div>
                </div>
              )}

              {/* Spin Button */}
              {hasJoined && (
                <button
                  onClick={handleSpinClick}
                  disabled={mustSpin}
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px]"
                >
                  {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                </button>
              )}

              {/* Winner Display */}
              {winner && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold mb-2">Поздравляем!</h3>
                  <p className="text-lg font-medium">{winner}</p>
                </div>
              )}
            </div>
          </div>

          {/* Segments List */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Призы в рулетке</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wheel.segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gray-700/50 border border-gray-600/30 hover:bg-gray-700/70 transition-all"
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-lg"
                    style={{ backgroundColor: segment.style.backgroundColor }}
                  ></div>
                  <span className="text-gray-200 font-medium">{segment.option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Draw History */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">История розыгрышей</h3>
            {(!wheel.spins || wheel.spins.length === 0) ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/30">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium">История розыгрышей пуста</p>
                <p className="text-gray-500 text-sm mt-2">Проведите первый розыгрыш, чтобы увидеть результаты здесь</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wheel.spins.slice(-10).reverse().map((spin, index) => (
                <div
                  key={spin.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-700/50 border border-gray-600/30 hover:bg-gray-700/70 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">🏆</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {spin.participant || spin.user?.name || 'Участник'} выиграл: <span className="text-yellow-300">{spin.result}</span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {(() => {
                          // Проверяем, есть ли валидная дата
                          if (spin.createdAt && !isNaN(new Date(spin.createdAt).getTime())) {
                            const date = new Date(spin.createdAt);
                            return `📅 ${date.toLocaleDateString('ru-RU')} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
                          }
                          return `📅 Дата не указана`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    #{wheel.spins.length - index}
                  </div>
                </div>
                                ))}
              </div>
            )}
            {wheel.spins && wheel.spins.length > 10 && (
              <div className="text-center mt-6">
                <p className="text-gray-400">Показано последние 10 розыгрышей из {wheel.spins.length}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 