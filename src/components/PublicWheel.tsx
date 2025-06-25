import React, { useState } from 'react';
import { CustomWheel } from './CustomWheel';

interface WheelSegment {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
}

interface CustomDesign {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  centerImage?: string;
}

interface PublicWheelProps {
  segments: WheelSegment[];
  onSpin: (result: string) => Promise<void>;
  isSpinning: boolean;
  disabled: boolean;
  customDesign?: CustomDesign;
  isPro?: boolean;
}

export function PublicWheel({ segments, onSpin, isSpinning, disabled, customDesign, isPro = false }: PublicWheelProps) {
  const [mustStartSpinning, setMustStartSpinning] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = () => {
    if (disabled || isSpinning || segments.length === 0) return;

    const newPrizeNumber = Math.floor(Math.random() * segments.length);
    setPrizeNumber(newPrizeNumber);
    setMustStartSpinning(true);
  };

  const handleStopSpinning = async () => {
    setMustStartSpinning(false);
    const result = segments[prizeNumber]?.option || 'Неизвестно';
    await onSpin(result);
  };

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-80 h-80 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Нет сегментов для отображения</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="mb-8">
        <CustomWheel
          mustStartSpinning={mustStartSpinning}
          prizeNumber={prizeNumber}
          data={segments}
          onStopSpinning={handleStopSpinning}
          customDesign={customDesign}
          isPro={isPro}
          size="large"
        />
      </div>
      
      <button
        onClick={handleSpinClick}
        disabled={disabled || isSpinning || mustStartSpinning}
        className={`
          px-8 py-4 rounded-full font-bold text-lg transition-all duration-200
          ${disabled || isSpinning || mustStartSpinning
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 shadow-lg'
          }
        `}
      >
        {mustStartSpinning ? 'Крутится...' : isSpinning ? 'Обработка...' : 'Крутить рулетку!'}
      </button>
    </div>
  );
} 