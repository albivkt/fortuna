import React from 'react';
import dynamic from 'next/dynamic';

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

interface WheelData {
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
}

interface CustomWheelProps {
  mustStartSpinning: boolean;
  prizeNumber: number;
  data: WheelData[];
  onStopSpinning: () => void;
  customDesign?: CustomDesign;
  isPro?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  containerClassName?: string;
}

export function CustomWheel({
  mustStartSpinning,
  prizeNumber,
  data,
  onStopSpinning,
  customDesign,
  isPro = false,
  size = 'medium',
  className = '',
  containerClassName = ''
}: CustomWheelProps) {
  const sizeConfig = {
    small: {
      outerBorderWidth: 4,
      innerBorderWidth: 2,
      radiusLineWidth: 1,
      fontSize: 10,
      textDistance: 35,
      spinDuration: 0.5
    },
    medium: {
      outerBorderWidth: 6,
      innerBorderWidth: 3,
      radiusLineWidth: 1,
      fontSize: 12,
      textDistance: 45,
      spinDuration: 0.5
    },
    large: {
      outerBorderWidth: 8,
      innerBorderWidth: 4,
      radiusLineWidth: 2,
      fontSize: 16,
      textDistance: 60,
      spinDuration: 0.8
    }
  };

  const config = sizeConfig[size];
  const backgroundColor = isPro && customDesign?.backgroundColor ? customDesign.backgroundColor : 'transparent';
  const borderColor = isPro && customDesign?.borderColor ? customDesign.borderColor : '#ffffff';

  return (
    <div 
      className={`p-4 rounded-xl transition-all duration-300 ${containerClassName}`}
      style={{ backgroundColor }}
    >
      <div className={className}>
        <Wheel
          mustStartSpinning={mustStartSpinning}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={onStopSpinning}
          outerBorderColor={borderColor}
          outerBorderWidth={config.outerBorderWidth}
          innerBorderColor={borderColor}
          innerBorderWidth={config.innerBorderWidth}
          radiusLineColor={borderColor}
          radiusLineWidth={config.radiusLineWidth}
          fontSize={config.fontSize}
          textDistance={config.textDistance}
          spinDuration={config.spinDuration}
        />
      </div>
    </div>
  );
} 