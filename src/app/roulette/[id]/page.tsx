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
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false); // Добавляем флаг для контроля состояния вращения
  const [randomOffset, setRandomOffset] = useState(0); // Сохраняем случайное смещение для стабильности

  // Ключи для localStorage
  const spinStateKey = `roulette_${wheelId}_spin_state`;
  const participantStateKey = `roulette_${wheelId}_participant_state`;


  const wheel = wheelQueryData?.wheel;

  // Функции для работы с localStorage
  const saveSpinState = (state: {
    mustSpin: boolean;
    isSpinning: boolean;
    prizeNumber: number;
    randomOffset: number;
    winner: string | null;
  }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(spinStateKey, JSON.stringify(state));
    }
  };

  const loadSpinState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(spinStateKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved spin state:', error);
        }
      }
    }
    return null;
  };

  const clearSpinState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(spinStateKey);
    }
  };

  const saveParticipantState = (state: {
    participantName: string;
    hasJoined: boolean;
  }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(participantStateKey, JSON.stringify(state));
    }
  };

  const loadParticipantState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(participantStateKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error parsing saved participant state:', error);
        }
      }
    }
    return null;
  };

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
    
    // Восстанавливаем состояние участника
    const savedParticipantState = loadParticipantState();
    if (savedParticipantState) {
      console.log('🔄 Восстанавливаем состояние участника:', savedParticipantState);
      setParticipantName(savedParticipantState.participantName || '');
      setHasJoined(savedParticipantState.hasJoined || false);
    }

    // Восстанавливаем состояние вращения только если рулетка загружена
    if (wheel) {
      const savedSpinState = loadSpinState();
      if (savedSpinState) {
        console.log('🔄 Восстанавливаем состояние вращения:', savedSpinState);
        
        // Проверяем, что состояние не завершенное (если есть winner, очищаем состояние)
        if (savedSpinState.winner) {
          console.log('🏁 Найден завершенный розыгрыш, отображаем результат');
          setWinner(savedSpinState.winner);
          setMustSpin(false);
          setIsSpinning(false);
          setPrizeNumber(savedSpinState.prizeNumber || 0);
          setRandomOffset(savedSpinState.randomOffset || 0);
        } else if (savedSpinState.mustSpin || savedSpinState.isSpinning) {
          console.log('🎯 Найдено активное вращение, восстанавливаем состояние');
          setPrizeNumber(savedSpinState.prizeNumber || 0);
          setRandomOffset(savedSpinState.randomOffset || 0);
          setMustSpin(savedSpinState.mustSpin || false);
          setIsSpinning(savedSpinState.isSpinning || false);
        }
      }
    }
    
    // Отладка данных спинов
    if (wheel?.spins) {
      console.log('🔍 Данные спинов:', wheel.spins);
      wheel.spins.forEach((spin, index) => {
        console.log(`Спин ${index + 1}:`, {
          id: spin.id,
          result: spin.result,
          participant: spin.participant,
          user: spin.user,
          createdAt: spin.createdAt
        });
      });
    }
  }, [wheel, wheelId]);



  const handleSpinClick = () => {
    if (!mustSpin && !isSpinning && wheel) {
      const newPrizeNumber = Math.floor(Math.random() * wheel.segments.length);
      const newRandomOffset = (Math.random() - 0.5) * 0.2; // Генерируем случайное смещение один раз
      
      console.log(`🎯 Новое вращение: выбран приз ${newPrizeNumber} (${wheel.segments[newPrizeNumber]?.option})`);
      console.log(`🎯 Случайное смещение: ${newRandomOffset}`);
      
      // Очищаем предыдущий результат
      setWinner(null);
      
      setPrizeNumber(newPrizeNumber);
      setRandomOffset(newRandomOffset);
      setMustSpin(true);
      setIsSpinning(true);

      // Сохраняем состояние вращения
      saveSpinState({
        mustSpin: true,
        isSpinning: true,
        prizeNumber: newPrizeNumber,
        randomOffset: newRandomOffset,
        winner: null
      });
    }
  };

  const handleStopSpinning = async (actualWinnerIndex?: number) => {
    if (!wheel) return;
    
    setMustSpin(false);
    setIsSpinning(false); // Сбрасываем флаг вращения
    
    // Используем actualWinnerIndex если он передан, иначе используем prizeNumber
    const winnerIndex = actualWinnerIndex !== undefined ? actualWinnerIndex : prizeNumber;
    const winningSegment = wheel.segments[winnerIndex];
    
    console.log(`🎯 Рулетка остановилась на призе ${prizeNumber} (ожидаемый)`);
    console.log(`🎯 Реальный победитель: ${winnerIndex}`);
    console.log(`🎯 Выигрышный сегмент:`, winningSegment);
    
    // Получаем имя пользователя: либо введенное имя участника, либо имя зарегистрированного пользователя
    const currentUser = getOrCreateUser();
    console.log('Пользователь при розыгрыше:', currentUser);
    console.log('hasJoined:', hasJoined, 'participantName:', participantName);
    
    let winnerName = hasJoined && participantName.trim() 
      ? participantName.trim() 
      : currentUser.name;
    
    // Если имя пользователя по умолчанию "Пользователь", делаем участника более конкретным
    if (winnerName === 'Пользователь' || !winnerName) {
      winnerName = hasJoined && participantName.trim() ? participantName.trim() : 'Участник';
    }
    
    console.log('Имя победителя:', winnerName);
    console.log('📤 Отправляем в GraphQL:', {
      wheelId: wheel.id,
      result: winningSegment.option,
      participant: winnerName
    });
    
    setWinner(`${winnerName} выиграл: ${winningSegment.option}`);

    // Сохраняем финальное состояние с результатом
    saveSpinState({
      mustSpin: false,
      isSpinning: false,
      prizeNumber: winnerIndex,
      randomOffset: randomOffset,
      winner: `${winnerName} выиграл: ${winningSegment.option}`
    });

    try {
      // Отправляем результат через GraphQL
      const spinResult = await spinWheel({
        variables: {
          input: {
            wheelId: wheel.id,
            result: winningSegment.option,
            participant: winnerName
          }
        }
      });
      
      console.log('✅ Результат сохранения:', spinResult.data?.spinWheel);

      // Перезагружаем данные рулетки, чтобы обновить историю розыгрышей
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
      
      // Сохраняем состояние участника
      saveParticipantState({
        participantName: participantName.trim(),
        hasJoined: true
      });
      
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
                       console.log('🔒 Wheel owner is PRO?', (wheel.user as any)?.plan?.toLowerCase() === 'pro');
                      return (
                        <CustomWheel
                          mustStartSpinning={mustSpin}
                          prizeNumber={prizeNumber}
                          data={wheelData}
                          onStopSpinning={handleStopSpinning}
                          customDesign={wheel.customDesign}
                          isPro={(wheel.user as any)?.plan?.toLowerCase() === 'pro'}
                          size="large"
                          randomOffset={randomOffset}
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
                  disabled={mustSpin || isSpinning}
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px]"
                >
                  {mustSpin || isSpinning ? 'Крутится...' : 'Крутить колесо!'}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">История розыгрышей</h3>
              {wheel.spins && wheel.spins.length > 10 && (
                <button
                  onClick={() => setShowFullHistory(!showFullHistory)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {showFullHistory ? 'Показать последние 10' : `Показать все (${wheel.spins.length})`}
                </button>
              )}
            </div>
            
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
                <div className={`space-y-4 ${showFullHistory && wheel.spins.length > 10 ? 'max-h-96 overflow-y-auto' : ''}`}>
                  {(showFullHistory ? wheel.spins : wheel.spins.slice(-10)).map((spin, index) => {
                    // Отладочная информация
                    console.log('🔍 Отображение спина:', {
                      id: spin.id,
                      result: spin.result,
                      participant: spin.participant,
                      userName: spin.user?.name,
                      displayName: spin.participant || spin.user?.name || 'Участник'
                    });
                    
                    return (
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
                              <span className="text-blue-300 font-bold">
                                {(() => {
                                  const displayName = spin.participant || spin.user?.name || 'Участник';
                                  // Если имя пользователя "Пользователь", используем "Участник"
                                  return displayName === 'Пользователь' ? 'Участник' : displayName;
                                })()}
                              </span> выиграл: <span className="text-yellow-300">{spin.result}</span>
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
                          #{showFullHistory ? index + 1 : wheel.spins.length - 10 + index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {!showFullHistory && wheel.spins.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-gray-400 text-sm">
                      Показано последние 10 розыгрышей из {wheel.spins.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 