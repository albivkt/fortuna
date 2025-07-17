'use client';

import { useState } from 'react';
import { CustomWheel } from '@/components/CustomWheel';

export default function DebugCenterImagePage() {
  const [centerImage, setCenterImage] = useState('');
  const [testImageUrl, setTestImageUrl] = useState('https://via.placeholder.com/100x100/ff0000/ffffff?text=TEST');

  const segments = [
    { option: 'Приз 1', style: { backgroundColor: '#ff6b6b', textColor: 'white' } },
    { option: 'Приз 2', style: { backgroundColor: '#4ecdc4', textColor: 'white' } },
    { option: 'Приз 3', style: { backgroundColor: '#45b7d1', textColor: 'white' } },
    { option: 'Приз 4', style: { backgroundColor: '#96ceb4', textColor: 'white' } },
    { option: 'Приз 5', style: { backgroundColor: '#feca57', textColor: 'white' } },
    { option: 'Приз 6', style: { backgroundColor: '#ff9ff3', textColor: 'white' } }
  ];

  const customDesign = {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    textColor: 'white',
    centerImage: centerImage
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Тестирование центрального изображения
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - настройки */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Настройки</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL изображения для центра:
                </label>
                <input
                  type="text"
                  value={centerImage}
                  onChange={(e) => setCenterImage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тестовые изображения:
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setCenterImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iI2ZmNjY2NiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+VEVTVCAxPC90ZXh0Pgo8L3N2Zz4K')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Красный круг TEST 1
                  </button>
                  <button
                    onClick={() => setCenterImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzAwYWE2NiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+VEVTVCAyPC90ZXh0Pgo8L3N2Zz4K')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    Зеленый круг TEST 2
                  </button>
                  <button
                    onClick={() => setCenterImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzAwNzdiZiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+VEVTVCAzPC90ZXh0Pgo8L3N2Zz4K')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Синий круг TEST 3
                  </button>
                  <button
                    onClick={() => setCenterImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzAwN2JmZiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0Ij5URVNUPC90ZXh0Pgo8L3N2Zz4K')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Синий круг с текстом
                  </button>
                  <button
                    onClick={() => setCenterImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmMDAwMCIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+Q0VOVEVSPC90ZXh0Pgo8L3N2Zz4K')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Красный квадрат CENTER
                  </button>
                  <button
                    onClick={() => setCenterImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77hwAAAABJRU5ErkJggg==')}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                  >
                    Простое PNG (1x1 пиксель)
                  </button>
                  <button
                    onClick={() => setCenterImage('')}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    Убрать изображение
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Информация:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Текущий URL:</strong> {centerImage || 'Не установлен'}</p>
                <p><strong>PRO статус:</strong> Включен</p>
                <p><strong>Кастомный дизайн:</strong> {JSON.stringify(customDesign, null, 2)}</p>
              </div>
            </div>
          </div>

          {/* Правая колонка - рулетка */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Рулетка</h2>
            
            <div className="flex justify-center">
              <CustomWheel
                mustStartSpinning={false}
                prizeNumber={0}
                data={segments}
                onStopSpinning={() => {}}
                customDesign={customDesign}
                isPro={true}
                size="large"
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Центральное изображение должно появиться в центре рулетки
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 