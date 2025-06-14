'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ColorPickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

// Функция для конвертации HSV в RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Функция для конвертации RGB в HEX
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Функция для конвертации HEX в RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

export default function ColorPicker({ 
  isOpen, 
  position, 
  currentColor, 
  onColorChange, 
  onClose 
}: ColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [hexInput, setHexInput] = useState(currentColor);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);

  // Обновляем внутреннее состояние при изменении currentColor
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  // Обработчик клика вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Обработчик выбора цвета в основной области
  const handleColorAreaClick = useCallback((event: React.MouseEvent) => {
    if (!colorAreaRef.current) return;
    
    const rect = colorAreaRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newSaturation = x / rect.width;
    const newBrightness = 1 - (y / rect.height);
    
    setSaturation(Math.max(0, Math.min(1, newSaturation)));
    setBrightness(Math.max(0, Math.min(1, newBrightness)));
    
    const [r, g, b] = hsvToRgb(hue, newSaturation, newBrightness);
    const newColor = rgbToHex(r, g, b);
    onColorChange(newColor);
    setHexInput(newColor);
  }, [hue, onColorChange]);

  // Обработчик выбора оттенка
  const handleHueClick = useCallback((event: React.MouseEvent) => {
    if (!hueBarRef.current) return;
    
    const rect = hueBarRef.current.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const newHue = (y / rect.height) * 360;
    
    setHue(Math.max(0, Math.min(360, newHue)));
    
    const [r, g, b] = hsvToRgb(newHue, saturation, brightness);
    const newColor = rgbToHex(r, g, b);
    onColorChange(newColor);
    setHexInput(newColor);
  }, [saturation, brightness, onColorChange]);

  // Обработчик изменения HEX
  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onColorChange(value);
    }
  };

  if (!isOpen) return null;

  const [r, g, b] = hsvToRgb(hue, saturation, brightness);
  const currentRgb = `rgb(${r}, ${g}, ${b})`;

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-64"
      style={{
        left: Math.min(position.x, window.innerWidth - 280),
        top: Math.min(position.y, window.innerHeight - 320),
      }}
    >
      <div className="space-y-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Выбор цвета</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Основная область выбора цвета */}
        <div className="flex space-x-3">
          {/* Градиентная область */}
          <div
            ref={colorAreaRef}
            onClick={handleColorAreaClick}
            className="relative w-40 h-32 cursor-crosshair rounded border border-gray-300"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
            }}
          >
            {/* Указатель текущего цвета */}
            <div
              className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
              style={{
                left: `${saturation * 100}%`,
                top: `${(1 - brightness) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Полоса оттенков */}
          <div
            ref={hueBarRef}
            onClick={handleHueClick}
            className="relative w-4 h-32 cursor-pointer rounded border border-gray-300"
            style={{
              background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          >
            {/* Указатель текущего оттенка */}
            <div
              className="absolute w-full h-1 border border-white shadow-md pointer-events-none"
              style={{
                top: `${(hue / 360) * 100}%`,
                transform: 'translateY(-50%)'
              }}
            />
          </div>
        </div>

        {/* RGB значения */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="bg-gray-100 px-2 py-1 rounded">{r}</div>
            <div className="text-gray-600 mt-1">R</div>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 px-2 py-1 rounded">{g}</div>
            <div className="text-gray-600 mt-1">G</div>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 px-2 py-1 rounded">{b}</div>
            <div className="text-gray-600 mt-1">B</div>
          </div>
        </div>

        {/* HEX ввод */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            HEX
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="#000000"
          />
        </div>

        {/* Превью */}
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
          <div className="text-xs text-gray-600">
            Текущий цвет: {currentColor}
          </div>
        </div>
      </div>
    </div>
  );
} 