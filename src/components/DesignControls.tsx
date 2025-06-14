import React from 'react';

interface DesignControlsProps {
  customDesign: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
  setCustomDesign: (design: { backgroundColor: string; borderColor: string; textColor: string }) => void;
  isPro?: boolean;
  showProMessage?: boolean;
}

export function DesignControls({ 
  customDesign, 
  setCustomDesign, 
  isPro = false, 
  showProMessage = true 
}: DesignControlsProps) {
  if (!isPro && showProMessage) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Цвет фона рулетки
        </label>
        <div className="flex space-x-2">
          <input
            type="color"
            value={customDesign.backgroundColor === 'transparent' ? '#ffffff' : customDesign.backgroundColor}
            onChange={(e) => setCustomDesign({...customDesign, backgroundColor: e.target.value})}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <button
            onClick={() => setCustomDesign({...customDesign, backgroundColor: 'transparent'})}
            className={`px-3 py-2 text-sm rounded border ${
              customDesign.backgroundColor === 'transparent' 
                ? 'bg-gray-200 border-gray-400' 
                : 'bg-white border-gray-300'
            } hover:bg-gray-100`}
          >
            Прозрачный
          </button>
        </div>
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
      
      <button
        onClick={() => setCustomDesign({
          backgroundColor: 'transparent',
          borderColor: '#ffffff',
          textColor: '#ffffff'
        })}
        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        Сбросить к стандартным
      </button>
    </div>
  );
} 