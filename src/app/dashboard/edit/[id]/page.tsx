'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import { getRouletteById, updateRoulette, type Segment } from '@/lib/roulettes';
import { getCurrentUser, getSavedUserPlan, createUser, type User } from '@/lib/user';
import ColorPicker from '@/components/ColorPicker';

// Динамический импорт для избежания SSR проблем
const Wheel = dynamic(
  () => import('react-custom-roulette').then((mod) => ({ default: mod.Wheel })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
        <span className="text-white font-bold">Загрузка...</span>
      </div>
    )
  }
);

const defaultColors = [
  '#EC4899', '#3B82F6', '#EF4444', '#10B981', 
  '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'
];

export default function EditRoulettePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rouletteName, setRouletteName] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeTab, setActiveTab] = useState<'segments' | 'design' | 'settings'>('segments');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customDesign, setCustomDesign] = useState({
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    textColor: '#000000'
  });
  const [activeColorPicker, setActiveColorPicker] = useState<{
    segmentId: string;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Загружаем данные пользователя
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Если нет данных пользователя, создаем пользователя с постоянным ID
      const tempUser = createUser({
        name: 'Пользователь',
        email: 'user@example.com'
      }, false); // false означает, что это не новая регистрация, используем сохраненный план
      setUser(tempUser);
    }

    // Загружаем данные рулетки для редактирования
    const rouletteId = params.id as string;
    const rouletteData = getRouletteById(rouletteId);
    
    if (rouletteData) {
      // Проверяем, принадлежит ли рулетка текущему пользователю
      const currentUserId = currentUser?.id;
      if (currentUserId && rouletteData.userId !== currentUserId) {
        // Рулетка не принадлежит текущему пользователю
        router.push('/dashboard');
        return;
      }
      
      setRouletteName(rouletteData.name);
      setSegments(rouletteData.segments);
      if (rouletteData.customDesign) {
        setCustomDesign({
          backgroundColor: rouletteData.customDesign.backgroundColor || '#ffffff',
          borderColor: rouletteData.customDesign.borderColor || '#000000',
          textColor: rouletteData.customDesign.textColor || '#000000'
        });
      }
    } else {
      // Рулетка не найдена, перенаправляем в дашборд
      router.push('/dashboard');
      return;
    }
    
    setLoading(false);
  }, [router, params.id]);

  const addSegment = () => {
    // Проверяем лимиты для бесплатного плана
    const maxSegments = user?.plan === 'pro' ? 20 : 6;
    
    if (segments.length >= maxSegments) {
      if (user?.plan === 'free') {
        alert(`Достигнут лимит бесплатного плана (${maxSegments} сегментов). Обновитесь до PRO для создания до 20 сегментов.`);
      } else {
        alert(`Достигнут максимальный лимит сегментов (${maxSegments}).`);
      }
      return;
    }

    const newSegment: Segment = {
      id: Date.now().toString(),
      text: `Приз ${segments.length + 1}`,
      color: defaultColors[segments.length % defaultColors.length],
      weight: 1
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (id: string) => {
    if (segments.length > 2) {
      setSegments(segments.filter(seg => seg.id !== id));
    }
  };

  const updateSegment = (id: string, field: keyof Segment, value: string | number) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, [field]: value } : seg
    ));
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

  const saveRouletteHandler = () => {
    if (!rouletteName.trim()) {
      alert('Пожалуйста, введите название рулетки');
      return;
    }

    if (segments.length < 2) {
      alert('Рулетка должна содержать минимум 2 сегмента');
      return;
    }

    try {
      const rouletteId = params.id as string;
      const updatedRoulette = updateRoulette(rouletteId, {
        name: rouletteName,
        segments: segments,
        customDesign: customDesign,
      });
      
      if (updatedRoulette) {
        console.log('Рулетка обновлена:', updatedRoulette);
        router.push('/dashboard');
      } else {
        alert('Ошибка при сохранении изменений');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении рулетки');
    }
  };

  // Преобразуем сегменты для react-custom-roulette
  const wheelData = segments.map(segment => ({
    option: segment.text,
    style: { 
      backgroundColor: segment.color, 
      textColor: user?.plan === 'pro' ? customDesign.textColor : 'white' 
    }
  }));

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GIFTY</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">План:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.plan === 'pro' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user?.plan === 'pro' ? 'PRO' : 'FREE'}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Обновить данные"
                >
                  🔄
                </button>
              </div>
              <span className="text-gray-600">Редактирование рулетки</span>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
              </button>
              <button
                onClick={saveRouletteHandler}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreviewMode ? (
          // Preview Mode
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {rouletteName || 'Рулетка'}
            </h1>
            <div className="flex flex-col items-center space-y-6">
              <div 
                className="p-8 rounded-xl"
                style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
              >
                <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleStopSpinning}
                outerBorderColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                outerBorderWidth={8}
                innerBorderColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                innerBorderWidth={4}
                radiusLineColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                radiusLineWidth={2}
                fontSize={16}
                textDistance={60}
                                  spinDuration={0.8}
                />
              </div>
              <button
                onClick={handlePreviewSpin}
                disabled={mustSpin}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Roulette Name */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Название рулетки</h2>
                <input
                  type="text"
                  value={rouletteName}
                  onChange={(e) => setRouletteName(e.target.value)}
                  placeholder="Введите название рулетки"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white"
                />
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('segments')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'segments'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Сегменты
                    </button>
                    <button
                      onClick={() => setActiveTab('design')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'design'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Дизайн
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'settings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Настройки
                      {user?.plan === 'free' && (
                        <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">PRO</span>
                      )}
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'segments' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Призы</h3>
                        <button
                          onClick={addSegment}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          + Добавить приз
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {segments.map((segment, index) => (
                          <div key={segment.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={segment.text}
                                  onChange={(e) => updateSegment(segment.id, 'text', e.target.value)}
                                  placeholder="Описание приза"
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={segment.color}
                                  onChange={(e) => updateSegment(segment.id, 'color', e.target.value)}
                                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                {user?.plan === 'pro' && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">Вес:</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={segment.weight}
                                      onChange={(e) => updateSegment(segment.id, 'weight', parseInt(e.target.value) || 1)}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
                                    />
                                  </div>
                                )}
                                {segments.length > 2 && (
                                  <button
                                    onClick={() => removeSegment(segment.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Image Upload */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Изображение приза {user?.plan === 'free' && <span className="text-purple-600">(PRO)</span>}
                              </label>
                              <ImageUpload
                                onImageSelect={(file) => {
                                  console.log('Image selected for segment:', segment.id, file);
                                }}
                                currentImage={segment.image}
                                disabled={user?.plan === 'free'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {user?.plan === 'free' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-purple-800 font-medium">PRO функции</span>
                          </div>
                          <p className="text-purple-700 text-sm mt-2">
                            Загрузка изображений для призов и настройка весов доступны в PRO версии
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'design' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Настройки дизайна</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Цветовая схема сегментов
                          </label>
                          <p className="text-xs text-gray-500 mb-3">
                            Нажмите на сегмент, затем выберите цвет для его изменения
                          </p>
                          
                          {/* Выбор сегментов */}
                          <div className="mb-4">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {segments.map((segment, index) => (
                                <button
                                  key={segment.id}
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setActiveColorPicker({
                                      segmentId: segment.id,
                                      position: {
                                        x: rect.right + 10,
                                        y: rect.top
                                      }
                                    });
                                  }}
                                  className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-left"
                                >
                                  <div 
                                    className="w-6 h-6 rounded border border-gray-300"
                                    style={{ backgroundColor: segment.color }}
                                  ></div>
                                  <span className="text-sm text-gray-700 truncate">
                                    {segment.text || `Приз ${index + 1}`}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {user?.plan === 'pro' ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цвет заднего фона рулетки
                              </label>
                              <input
                                type="color"
                                value={customDesign.backgroundColor}
                                onChange={(e) => setCustomDesign({...customDesign, backgroundColor: e.target.value})}
                                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цвет границ
                              </label>
                              <input
                                type="color"
                                value={customDesign.borderColor}
                                onChange={(e) => setCustomDesign({...customDesign, borderColor: e.target.value})}
                                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цвет текста
                              </label>
                              <input
                                type="color"
                                value={customDesign.textColor}
                                onChange={(e) => setCustomDesign({...customDesign, textColor: e.target.value})}
                                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span className="text-purple-800 font-medium">PRO функции</span>
                            </div>
                            <p className="text-purple-700 text-sm mt-2">
                              Расширенные настройки дизайна доступны в PRO версии
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Дополнительные настройки</h3>
                      
                      {user?.plan === 'free' ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Обновите до PRO</h4>
                          <p className="text-gray-600 mb-4">
                            Получите доступ к расширенным настройкам, включая веса призов и кастомизацию
                          </p>
                          <Link 
                            href="/dashboard/subscription"
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium inline-block"
                          >
                            Обновить план
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm text-gray-700">Публичная рулетка</span>
                            </label>
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm text-gray-700">Показывать результаты</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Предпросмотр</h3>
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    className="scale-75 origin-center p-4 rounded-lg"
                    style={{ backgroundColor: user?.plan === 'pro' ? customDesign.backgroundColor : 'transparent' }}
                  >
                    <Wheel
                      mustStartSpinning={mustSpin}
                      prizeNumber={prizeNumber}
                      data={wheelData}
                      onStopSpinning={handleStopSpinning}
                      outerBorderColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                      outerBorderWidth={6}
                      innerBorderColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                      innerBorderWidth={3}
                      radiusLineColor={user?.plan === 'pro' ? customDesign.borderColor : '#ffffff'}
                      radiusLineWidth={1}
                      fontSize={12}
                      textDistance={45}
                      spinDuration={0.5}
                    />
                  </div>
                  <button
                    onClick={handlePreviewSpin}
                    disabled={mustSpin}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mustSpin ? 'Крутится...' : 'Тест'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Color Picker */}
      <ColorPicker
        isOpen={!!activeColorPicker}
        position={activeColorPicker?.position || { x: 0, y: 0 }}
        currentColor={
          activeColorPicker 
            ? segments.find(s => s.id === activeColorPicker.segmentId)?.color || '#000000'
            : '#000000'
        }
        onColorChange={(color) => {
          if (activeColorPicker) {
            updateSegment(activeColorPicker.segmentId, 'color', color);
          }
        }}
        onClose={() => setActiveColorPicker(null)}
      />
    </div>
  );
}