'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, currentImage, disabled = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const onButtonClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const removeImage = () => {
    if (disabled) return;
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      
      {preview ? (
        <div className="relative">
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          {!disabled && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <div className="space-y-2">
            <svg
              className={`mx-auto h-12 w-12 ${
                disabled ? 'text-gray-300' : 'text-gray-400'
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm">
              {disabled ? (
                <p className="text-gray-400">Доступно в PRO версии</p>
              ) : (
                <>
                  <p className="text-gray-600">
                    <span className="font-medium text-blue-600">Нажмите для выбора</span> или перетащите изображение
                  </p>
                  <p className="text-gray-400">PNG, JPG, GIF до 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 