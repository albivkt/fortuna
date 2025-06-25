 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { CustomWheel } from '@/components/CustomWheel';
import { useCreateWheel, type CreateWheelInput, useMe } from '@/lib/graphql/hooks';
import { getCurrentUser } from '@/lib/user';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL запрос для получения актуального плана пользователя
const GET_PLAN_LIMITS = gql`
  query GetPlanLimits {
    planLimits {
      maxWheels
      maxSegments
      allowImages
      allowWeights
      allowCustomDesign
      allowStatistics
    }
    me {
      id
      email
      name
      plan
      planExpiresAt
    }
  }
`;

interface User {
  id: string;
  name?: string;
  email: string;
  plan: 'free' | 'pro';
  createdAt?: string;
}

const defaultColors = [
  '#EC4899', '#3B82F6', '#EF4444', '#10B981', 
  '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'
];

export default function CreateRoulettePage() {
  const router = useRouter();
  const [createWheel, { loading: creating }] = useCreateWheel();
  
  // Получаем информацию о пользователе через GraphQL
  const { data: meData, loading: meLoading } = useMe();
  
  // Получаем актуальный план пользователя из GraphQL
  const { data: planData, loading: planLoading } = useQuery(GET_PLAN_LIMITS, {
    errorPolicy: 'ignore'
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [rouletteName, setRouletteName] = useState('');
  const [segments, setSegments] = useState([
    { text: 'Приз 1', color: defaultColors[0], image: null as string | null, imagePosition: { x: 0, y: 0 } },
    { text: 'Приз 2', color: defaultColors[1], image: null as string | null, imagePosition: { x: 0, y: 0 } }
  ]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [customDesign, setCustomDesign] = useState({
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    textColor: 'white',
    centerImage: ''
  });

  useEffect(() => {
    if (meData?.me) {
      // Авторизованный пользователь
      const authenticatedUser = meData.me;
      const actualPlan = planData?.me?.plan?.toLowerCase() || authenticatedUser.plan?.toLowerCase() || 'free';
      
      const userWithActualPlan: User = {
        id: authenticatedUser.id,
        name: authenticatedUser.name || 'Пользователь',
        email: authenticatedUser.email,
        plan: actualPlan as 'free' | 'pro'
      };
      
      setUser(userWithActualPlan);
      
      console.log('🔍 Create page authenticated user:', {
        id: authenticatedUser.id,
        plan: actualPlan
      });
    } else if (!meLoading && !meData?.me) {
      // Неавторизованный пользователь - создаем временного
      const localUser = getCurrentUser();
      
      const tempUser: User = {
        id: `temp_${Date.now()}`,
        name: localUser?.name || 'Гость',
        email: localUser?.email || `temp_${Date.now()}@example.com`,
        plan: 'free'
      };
      
      setUser(tempUser);
      
      console.log('🔍 Create page guest user created:', tempUser);
      console.log('📋 Local user data:', localUser);
    }
  }, [meData, meLoading, planData]);

  const addSegment = () => {
    const maxSegments = user?.plan === 'pro' ? 20 : 6;
    if (segments.length < maxSegments) {
      const colorIndex = segments.length % defaultColors.length;
      setSegments([...segments, { 
        text: `Приз ${segments.length + 1}`, 
        color: defaultColors[colorIndex],
        image: null,
        imagePosition: { x: 0, y: 0 }
      }]);
    } else {
      alert(`Достигнут лимит сегментов для вашего тарифа (${maxSegments}). Обновитесь до PRO для увеличения лимита.`);
    }
  };

  const removeSegment = (index: number) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, field: 'text' | 'color' | 'image', value: string | null) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const updateImagePosition = (index: number, position: { x: number; y: number }) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], imagePosition: position };
    setSegments(newSegments);
  };

  const handlePreviewSpin = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * segments.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
  };

  const saveRouletteHandler = async () => {
    if (!rouletteName.trim()) {
      alert('Пожалуйста, введите название рулетки');
      return;
    }

    if (segments.length < 2) {
      alert('Рулетка должна содержать минимум 2 сегмента');
      return;
    }

    try {
      console.log('🎡 Создание рулетки через GraphQL...');
      console.log('👤 User plan:', user?.plan);
      console.log('🎨 Custom design:', customDesign);
      console.log('✅ Will send custom design:', user?.plan === 'pro' ? customDesign : undefined);
      
      const wheelInput: CreateWheelInput = {
        title: rouletteName,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
            textColor: user?.plan === 'pro' ? customDesign.textColor : 'white'
          },
          image: segment.image || undefined,
          imagePosition: segment.imagePosition
        })),
        isPublic: false,
        customDesign: user?.plan === 'pro' ? customDesign : undefined
      };

      console.log('📝 Данные для создания:', wheelInput);

      const result = await createWheel({
        variables: { input: wheelInput }
      });

      console.log('✅ Результат создания:', result);

      if (result.data?.createWheel) {
        console.log('🎉 Рулетка успешно создана:', result.data.createWheel);
        alert('Рулетка успешно создана!');
        
        // Небольшая задержка для обновления кэша
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else if (result.errors) {
        console.error('❌ Ошибки GraphQL:', result.errors);
        alert('Ошибка при создании рулетки: ' + result.errors.map(e => e.message).join(', '));
      }
    } catch (error) {
      console.error('❌ Ошибка создания рулетки:', error);
      alert('Ошибка при создании рулетки: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  // Преобразуем сегменты для кастомной рулетки
  const wheelData = segments.map(segment => ({
    option: segment.text,
    style: { 
      backgroundColor: segment.color, 
      textColor: user?.plan === 'pro' ? customDesign.textColor : 'white' 
    },
    image: segment.image || undefined,
    imagePosition: segment.imagePosition
  }));

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-sm text-gray-400 hidden sm:block">создание рулетки</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
              >
                Назад к панели
              </Link>
              {user?.plan !== 'pro' && (
                <button
                  onClick={() => {
                    const updatedUser = { ...user, plan: 'pro' as 'free' | 'pro' };
                    setUser(updatedUser);
                    console.log('🎉 Пользователь обновлен до PRO плана для тестирования');
                  }}
                  className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors border border-yellow-400/30 text-sm"
                >
                  Тест PRO
                </button>
              )}
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600/50 hover:text-white transition-colors border border-gray-600"
              >
                {isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Создайте свою
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                рулетку подарков
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Настройте сегменты, выберите цвета и создайте уникальную рулетку
            </p>
          </div>

          {isPreviewMode ? (
            // Preview Mode
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 lg:p-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-8">
                  {rouletteName || 'Новая рулетка'}
                </h2>
                <div className="flex flex-col items-center space-y-8">
                  <div 
                    className="p-8 rounded-xl"
                    style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
                  >
                    <CustomWheel
                      mustStartSpinning={mustSpin}
                      prizeNumber={prizeNumber}
                      data={wheelData}
                      onStopSpinning={handleStopSpinning}
                      customDesign={customDesign}
                      isPro={user?.plan === 'pro'}
                      size="large"
                    />
                  </div>
                  <button
                    onClick={handlePreviewSpin}
                    disabled={mustSpin}
                    className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Settings */}
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Основные настройки
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Название рулетки
                    </label>
                    <input
                      type="text"
                      value={rouletteName}
                      onChange={(e) => setRouletteName(e.target.value)}
                      placeholder="Введите название рулетки"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Segments */}
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                                         <h2 className="text-xl font-semibold text-white">
                       Сегменты ({segments.length}/{user?.plan === 'pro' ? 20 : 6})
                     </h2>
                    <button
                      onClick={addSegment}
                      disabled={segments.length >= (user?.plan === 'pro' ? 20 : 6)}
                      className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Добавить
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {segments.map((segment, index) => (
                      <div key={index} className="bg-gray-700/50 border border-gray-600/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-full cursor-pointer flex-shrink-0 border-2 border-gray-500"
                            style={{ 
                              backgroundColor: segment.image ? 'transparent' : segment.color,
                              backgroundImage: segment.image ? `url(${segment.image})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                            onClick={() => {
                              if (!segment.image) {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = segment.color;
                                input.onchange = (e) => updateSegment(index, 'color', (e.target as HTMLInputElement).value);
                                input.click();
                              }
                            }}
                          >
                            {segment.image && (
                              <div className="w-full h-full rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={segment.text}
                            onChange={(e) => updateSegment(index, 'text', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-white placeholder-gray-400"
                            placeholder="Название сегмента"
                          />
                          {segments.length > 2 && (
                            <button
                              onClick={() => removeSegment(index)}
                              className="text-red-400 hover:text-red-300 p-1 flex-shrink-0 hover:bg-red-400/10 rounded"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Цвет */}
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-300 min-w-0 flex-shrink-0">Цвет:</label>
                            <input
                              type="color"
                              value={segment.color}
                              onChange={(e) => updateSegment(index, 'color', e.target.value)}
                              className="w-12 h-8 rounded border border-gray-500 cursor-pointer bg-gray-600"
                              disabled={!!segment.image}
                            />
                            {segment.image && (
                              <span className="text-xs text-gray-400">Отключено при использовании изображения</span>
                            )}
                          </div>
                          
                          {/* Изображение - только для PRO */}
                          {user?.plan === 'pro' ? (
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">
                                <span className="inline-flex items-center">
                                  <span className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded mr-2 border border-yellow-400/30">PRO</span>
                                  Изображение (вместо цвета):
                                </span>
                              </label>
                              <ImageUpload
                                onImageSelect={(imageUrl) => updateSegment(index, 'image', imageUrl)}
                                currentImage={segment.image || undefined}
                                disabled={false}
                              />
                              {segment.image && (
                                <p className="text-xs text-gray-400 mt-1">
                                  💡 Нажмите и перетащите изображение на рулетке для изменения позиции
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                              <div className="flex items-center text-gray-400 text-sm">
                                <span>🔒 Изображения для сегментов доступны только в PRO тарифе</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {segments.length >= (user?.plan === 'pro' ? 20 : 6) && (
                    <p className="text-sm text-gray-400 mt-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      {user?.plan === 'pro' 
                        ? 'Достигнуто максимальное количество сегментов (20)'
                        : 'Достигнуто максимальное количество сегментов для бесплатного плана (6). Обновитесь до PRO для большего количества сегментов.'
                      }
                    </p>
                  )}
                </div>

                {/* PRO Design Settings */}
                {user?.plan === 'pro' && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-yellow-400/30 p-6">
                    <div className="flex items-center mb-6">
                      <span className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded mr-3 border border-yellow-400/30">PRO</span>
                      <h2 className="text-xl font-semibold text-white">
                        Дизайн
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет фона</label>
                        <input
                          type="color"
                          value={customDesign.backgroundColor}
                          onChange={(e) => setCustomDesign({...customDesign, backgroundColor: e.target.value})}
                          className="w-full h-10 rounded border border-gray-500 bg-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет границ</label>
                        <input
                          type="color"
                          value={customDesign.borderColor}
                          onChange={(e) => setCustomDesign({...customDesign, borderColor: e.target.value})}
                          className="w-full h-10 rounded border border-gray-500 bg-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет текста</label>
                        <input
                          type="color"
                          value={customDesign.textColor}
                          onChange={(e) => setCustomDesign({...customDesign, textColor: e.target.value})}
                          className="w-full h-10 rounded border border-gray-500 bg-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Изображение в центре</label>
                        <ImageUpload
                          onImageSelect={(imageUrl) => {
                            setCustomDesign({...customDesign, centerImage: imageUrl});
                          }}
                          currentImage={customDesign.centerImage}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={saveRouletteHandler}
                  disabled={creating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Создание...' : 'Создать рулетку'}
                </button>
              </div>

                             {/* Right Column - Preview */}
               <div className="flex flex-col">
                 <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8 w-full h-fit sticky top-8">
                  <h3 className="text-lg font-semibold text-white mb-6 text-center">
                    👁️ Предпросмотр
                  </h3>
                  <div className="flex justify-center">
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
                    >
                      <CustomWheel
                        mustStartSpinning={false}
                        prizeNumber={0}
                        data={wheelData}
                        onStopSpinning={() => {}}
                        customDesign={customDesign}
                        isPro={user?.plan === 'pro'}
                        size="medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}