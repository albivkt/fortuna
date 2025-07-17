'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { CustomWheel } from '@/components/CustomWheel';
import { useWheel, useUpdateWheel, type CreateWheelInput, useMe } from '@/lib/graphql/hooks';
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

export default function EditRoulettePage() {
  const params = useParams();
  const router = useRouter();
  const wheelId = params.id as string;
  
  // GraphQL запросы
  const { data: wheelData, loading: wheelLoading, error: wheelError } = useWheel(wheelId);
  const [updateWheel, { loading: updating }] = useUpdateWheel();
  
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
      
      console.log('🔍 Edit page authenticated user:', {
        id: authenticatedUser.id,
        plan: actualPlan
      });
    } else if (!meLoading && !meData?.me) {
      // Неавторизованный пользователь - создаем временного
      const localUser = getCurrentUser();
      
      const tempUser: User = {
        id: `temp_${Date.now()}`,
        name: localUser?.name || 'Гость',
        email: localUser?.email || `temp_${Date.now()}@gifty.local`,
        plan: 'free'
      };
      
      setUser(tempUser);
      
      console.log('🔍 Edit page guest user created:', tempUser);
      console.log('📋 Local user data:', localUser);
    }
  }, [meData, meLoading, planData]);

  // Загружаем данные рулетки при получении данных
  useEffect(() => {
    if (wheelData?.wheel && user) {
      const wheel = wheelData.wheel;
      
      // Для временных пользователей разрешаем редактирование всех рулеток
      // так как они все принадлежат одному сеансу
      console.log('Загружена рулетка для редактирования:', wheel.title);
      console.log('🔍 Сырые данные рулетки:', wheel);
      console.log('🔍 Сырые сегменты из БД:', wheel.segments);
      console.log('🔍 Детали сегментов из БД:', wheel.segments.map((s: any, i: number) => ({ 
        index: i, 
        option: s.option, 
        hasImage: !!s.image, 
        imageUrl: s.image,
        imageLength: s.image?.length || 0,
        imageType: typeof s.image,
        imageRaw: JSON.stringify(s.image),
        style: s.style
      })));
    
      setRouletteName(wheel.title);
      
      // Проверяем, есть ли уже изображения в локальном состоянии
      const hasLocalImages = segments.some(s => s.image && s.image.trim() !== '');
      console.log('🔍 Есть ли локальные изображения:', hasLocalImages);
      
      if (!hasLocalImages) {
        // Только если нет локальных изображений, загружаем из БД
        const transformedSegments = wheel.segments.map((segment: any, index: number) => {
          console.log(`🔄 Трансформируем сегмент ${index}:`, {
            original: segment.image,
            originalType: typeof segment.image,
            originalLength: segment.image?.length || 0,
            isEmpty: !segment.image,
            isEmptyString: segment.image === '',
            isNull: segment.image === null,
            isUndefined: segment.image === undefined,
            trimmed: segment.image && segment.image.trim(),
            afterTransform: (segment.image && segment.image.trim() !== '') ? segment.image : null
          });
          
          return {
            text: segment.option,
            color: segment.style.backgroundColor,
            image: (segment.image && segment.image.trim() !== '') ? segment.image : null,
            imagePosition: segment.imagePosition ? { x: segment.imagePosition.x, y: segment.imagePosition.y } : { x: 0, y: 0 }
          };
        });
        
        console.log('🔄 Трансформированные сегменты:', transformedSegments.map((s, i) => ({ 
          index: i, 
          text: s.text, 
          hasImage: !!s.image, 
          imageUrl: s.image,
          imageLength: s.image?.length || 0
        })));
        
        setSegments(transformedSegments);
      } else {
        console.log('🔄 Пропускаем загрузку из БД - есть локальные изображения');
      }
      
      // Восстанавливаем кастомный дизайн, если он есть
      if (wheel.customDesign) {
        setCustomDesign({
          backgroundColor: wheel.customDesign.backgroundColor || 'transparent',
          borderColor: wheel.customDesign.borderColor || '#ffffff',
          textColor: wheel.customDesign.textColor || 'white',
          centerImage: wheel.customDesign.centerImage || ''
        });
      }
    }
  }, [wheelData, user, router, segments.length]);

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
    }
  };

  const removeSegment = (index: number) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const updateSegment = (index: number, field: 'text' | 'color' | 'image', value: string | null) => {
    console.log(`🔄 updateSegment вызван:`, { index, field, value, valueType: typeof value });
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    console.log(`🔄 updateSegment новое состояние сегмента ${index}:`, newSegments[index]);
    console.log(`🔄 updateSegment все сегменты после обновления:`, newSegments.map((s, i) => ({ index: i, text: s.text, hasImage: !!s.image, imageUrl: s.image })));
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
      console.log('💾 Сохранение рулетки...');
      console.log('👤 User plan:', user?.plan);
      console.log('🎨 Custom design:', customDesign);
      console.log('🔍 Текущие сегменты перед сохранением:', segments.map((s, i) => ({ 
        index: i, 
        text: s.text, 
        hasImage: !!s.image, 
        imageUrl: s.image,
        imageLength: s.image?.length || 0
      })));
      
      const wheelInput: CreateWheelInput = {
        title: rouletteName,
        segments: segments.map(segment => ({
          option: segment.text,
          style: {
            backgroundColor: segment.color,
                    textColor: user?.plan === 'pro' ? customDesign.textColor : 'white'
      },
      image: segment.image && segment.image.trim() !== '' ? segment.image : undefined,
      imagePosition: { x: segment.imagePosition.x, y: segment.imagePosition.y }
        })),
        isPublic: wheelData?.wheel?.isPublic || false,
        customDesign: customDesign
      };
      
      console.log('📤 Отправляемые данные:', wheelInput);
      console.log('🔍 Сегменты в wheelInput:', wheelInput.segments.map((s, i) => ({ 
        index: i, 
        option: s.option, 
        hasImage: !!s.image, 
        imageUrl: s.image,
        imageLength: s.image?.length || 0
      })));

      const result = await updateWheel({
        variables: { 
          id: wheelId,
          input: wheelInput 
        }
      });

      if (result.data?.updateWheel) {
        console.log('✅ Рулетка обновлена:', result.data.updateWheel);
        console.log('🔍 Сохраненные сегменты:', result.data.updateWheel.segments.map((s: any, i: number) => ({ 
          index: i, 
          option: s.option, 
          hasImage: !!s.image, 
          imageUrl: s.image,
          imageLength: s.image?.length || 0
        })));
        console.log('✅ Сохраненный customDesign:', result.data.updateWheel.customDesign);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Ошибка обновления рулетки:', error);
      alert('Ошибка при сохранении изменений');
    }
  };

  // Преобразуем сегменты для кастомной рулетки
  const wheelData_display = segments.map(segment => ({
    option: segment.text,
    style: { 
      backgroundColor: segment.color, 
      textColor: user?.plan === 'pro' ? customDesign.textColor : 'white'
    },
    image: segment.image && segment.image.trim() !== '' ? segment.image : undefined,
    imagePosition: segment.imagePosition
  }));

  // Отладочная информация
  console.log('🎯 Edit page - segments state:', segments.map((s, i) => ({ 
    index: i, 
    text: s.text, 
    hasImage: !!s.image, 
    imageUrl: s.image,
    imageType: typeof s.image
  })));
  console.log('🎯 Edit page - wheelData_display:', wheelData_display.map((s, i) => ({ 
    index: i, 
    option: s.option, 
    hasImage: !!s.image, 
    imageUrl: s.image,
    imageType: typeof s.image
  })));

  if (wheelLoading || !user) {
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

  if (wheelError || !wheelData?.wheel) {
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
            href="/dashboard"
            className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg font-medium"
          >
            Назад к дашборду
          </Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <Link href="/" className="text-2xl font-bold text-white">
                GIFTY
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">редактирование</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Назад к дашборду</span>
              </Link>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600/50 hover:text-white transition-all border border-gray-600/30"
              >
                {isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreviewMode ? (
          // Preview Mode
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              {rouletteName || 'Рулетка'}
            </h1>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 p-8 lg:p-12 mb-8">
              <div className="flex flex-col items-center space-y-8">
                <div 
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
                >
                  <CustomWheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData_display}
                    onStopSpinning={handleStopSpinning}
                    customDesign={customDesign}
                    isPro={user?.plan === 'pro'}
                    size="large"
                    isEditable={true}
                    onImagePositionChange={updateImagePosition}
                  />
                </div>
                <button
                  onClick={handlePreviewSpin}
                  disabled={mustSpin}
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-orange-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px]"
                >
                  {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div>
            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Редактирование
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  рулетки
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Настройте название, призы и дизайн вашей рулетки
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Settings */}
              <div className="space-y-6">
                <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white mb-6">Основные настройки</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Название рулетки
                      </label>
                  <input
                    type="text"
                    value={rouletteName}
                    onChange={(e) => setRouletteName(e.target.value)}
                    placeholder="Введите название рулетки"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                  />
                </div>
                  </div>
                  </div>

                {/* Segments */}
                <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Сегменты ({segments.length}/{user?.plan === 'pro' ? 20 : 6})
                    </h2>
                          <button
                            onClick={addSegment}
                      disabled={segments.length >= (user?.plan === 'pro' ? 20 : 6)}
                      className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                      Добавить
                          </button>
                        </div>
                        
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                          {segments.map((segment, index) => (
                      <div key={index} className="p-4 bg-gray-700/50 border border-gray-600/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-500/30 flex-shrink-0 overflow-hidden"
                              style={{ 
                                backgroundColor: segment.image ? 'transparent' : segment.color,
                                backgroundImage: segment.image ? `url(${segment.image})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              } as React.CSSProperties}
                            />
                            {segment.image && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-gray-700 flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={segment.text}
                            onChange={(e) => updateSegment(index, 'text', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                            placeholder="Название сегмента"
                          />
                          {segments.length > 2 && (
                            <button
                              onClick={() => removeSegment(index)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {/* Цвет */}
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-400 min-w-0 flex-shrink-0">Цвет:</label>
                            <input
                              type="color"
                              value={segment.color}
                              onChange={(e) => updateSegment(index, 'color', e.target.value)}
                              className="w-12 h-8 rounded border border-gray-500/30 bg-gray-600/50 cursor-pointer"
                              disabled={!!segment.image}
                            />
                            {segment.image && (
                              <span className="text-xs text-gray-500">Отключено при использовании изображения</span>
                            )}
                          </div>
                          
                          {/* Изображение - только для PRO */}
                          {user?.plan === 'pro' ? (
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">
                                <span className="inline-flex items-center">
                                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded mr-2">PRO</span>
                                  Изображение (вместо цвета):
                                </span>
                              </label>
                            <ImageUpload
                              onImageSelect={(imageUrl) => {
                                console.log('🖼️ Segment image uploaded:', imageUrl);
                                updateSegment(index, 'image', imageUrl);
                              }}
                              currentImage={segment.image ? segment.image : undefined}
                            />
                            {segment.image && (
                              <div className="mt-2">
                                <img
                                  src={segment.image as string}
                                  alt="Превью"
                                  className="w-16 h-16 object-cover rounded border border-gray-500/30"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  💡 Нажмите и перетащите изображение на рулетке для изменения позиции
                                </p>
                              </div>
                            )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/20">
                              <div className="flex items-center text-gray-400 text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Изображения для сегментов доступны только в PRO тарифе</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                          ))}
                        </div>

                  {segments.length >= (user?.plan === 'pro' ? 20 : 6) && (
                    <p className="text-sm text-gray-400 mt-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      {user?.plan === 'pro' 
                        ? 'Достигнуто максимальное количество сегментов (20)'
                        : 'Достигнуто максимальное количество сегментов для бесплатного плана (6). Обновитесь до PRO для большего количества сегментов.'
                      }
                    </p>
                        )}
                      </div>

                {/* PRO Design Settings */}
                {user?.plan === 'pro' && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-2 border-yellow-400/30">
                    <div className="flex items-center mb-6">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mr-3">PRO</span>
                      <h2 className="text-2xl font-bold text-white">Дизайн</h2>
                          </div>

                            <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет фона</label>
                        <input
                          type="color"
                          value={customDesign.backgroundColor}
                          onChange={(e) => setCustomDesign({...customDesign, backgroundColor: e.target.value})}
                          className="w-full h-10 rounded-lg border border-gray-600/30 bg-gray-700/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет границ</label>
                        <input
                          type="color"
                          value={customDesign.borderColor}
                          onChange={(e) => setCustomDesign({...customDesign, borderColor: e.target.value})}
                          className="w-full h-10 rounded-lg border border-gray-600/30 bg-gray-700/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Цвет текста</label>
                        <input
                          type="color"
                          value={customDesign.textColor}
                          onChange={(e) => setCustomDesign({...customDesign, textColor: e.target.value})}
                          className="w-full h-10 rounded-lg border border-gray-600/30 bg-gray-700/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Изображение в центре</label>
                        <ImageUpload
                          onImageSelect={(imageUrl) => {
                            console.log('🖼️ Center image uploaded:', imageUrl);
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
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl text-lg font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {updating ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>

              {/* Right Column - Preview */}
              <div className="flex flex-col">
                <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-700/50 w-full h-fit sticky top-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Предпросмотр
                  </h3>
                  <div className="flex justify-center">
                    <div 
                      className="p-4 rounded-xl transition-all duration-300"
                        style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
                      >
                        <CustomWheel
                          mustStartSpinning={false}
                          prizeNumber={0}
                          data={wheelData_display}
                          onStopSpinning={() => {}}
                          customDesign={customDesign}
                          isPro={user?.plan === 'pro'}
                          size="medium"
                          isEditable={false}
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}