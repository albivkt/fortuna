'use client';

import { useState, useEffect } from 'react';
import { CustomWheel } from '@/components/CustomWheel';
import { DesignControls } from '@/components/DesignControls';
import { createWheelData, defaultDesign } from '@/lib/designUtils';

const testSegments = [
  { id: '1', text: 'Приз 1', color: '#EC4899' },
  { id: '2', text: 'Приз 2', color: '#3B82F6' },
  { id: '3', text: 'Приз 3', color: '#EF4444' },
  { id: '4', text: 'Приз 4', color: '#10B981' },
  { id: '5', text: 'Приз 5', color: '#F59E0B' },
  { id: '6', text: 'Приз 6', color: '#8B5CF6' },
];

export default function TestDesignPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [customDesign, setCustomDesign] = useState(defaultDesign);
  const [isPro, setIsPro] = useState(true);

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * testSegments.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
  };

  const wheelData = createWheelData(testSegments, customDesign, isPro);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Тестирование дизайна рулеток
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Настройки дизайна */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Настройки дизайна</h2>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPro}
                  onChange={(e) => setIsPro(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">PRO режим</span>
              </label>
            </div>

            <DesignControls
              customDesign={customDesign}
              setCustomDesign={setCustomDesign}
              isPro={isPro}
              showProMessage={true}
            />
          </div>

          {/* Рулетки разных размеров */}
          <div className="lg:col-span-2 space-y-8">
            {/* Большая рулетка */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Большая рулетка
              </h3>
              <div className="flex flex-col items-center space-y-4">
                <CustomWheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleStopSpinning}
                  customDesign={customDesign}
                  isPro={isPro}
                  size="large"
                />
                <button
                  onClick={handleSpinClick}
                  disabled={mustSpin}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {mustSpin ? 'Крутится...' : 'Крутить колесо!'}
                </button>
              </div>
            </div>

            {/* Средние рулетки */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Средняя рулетка
                </h3>
                <div className="flex flex-col items-center space-y-4">
                  <CustomWheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    onStopSpinning={handleStopSpinning}
                    customDesign={customDesign}
                    isPro={isPro}
                    size="medium"
                    className="scale-75 origin-center"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Маленькая рулетка
                </h3>
                <div className="flex flex-col items-center space-y-4">
                  <CustomWheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    onStopSpinning={handleStopSpinning}
                    customDesign={customDesign}
                    isPro={isPro}
                    size="small"
                    className="scale-50 origin-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о текущих настройках */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Текущие настройки</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Фон:</span>
              <div className="flex items-center space-x-2 mt-1">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: customDesign.backgroundColor === 'transparent' ? '#f3f4f6' : customDesign.backgroundColor }}
                ></div>
                <span className="text-gray-600">
                  {customDesign.backgroundColor === 'transparent' ? 'Прозрачный' : customDesign.backgroundColor}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Границы:</span>
              <div className="flex items-center space-x-2 mt-1">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: customDesign.borderColor }}
                ></div>
                <span className="text-gray-600">{customDesign.borderColor}</span>
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Текст:</span>
              <div className="flex items-center space-x-2 mt-1">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: customDesign.textColor }}
                ></div>
                <span className="text-gray-600">{customDesign.textColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 