import React, { useRef, useEffect, useState, useMemo } from 'react';

interface WheelData {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
  image?: string;
  imagePosition?: { x: number; y: number }; // Позиция изображения в сегменте
}

interface CustomDesign {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  centerImage?: string;
}

interface CustomWheelProps {
  mustStartSpinning: boolean;
  prizeNumber: number;
  data: WheelData[];
  onStopSpinning: (actualWinnerIndex?: number) => void;
  customDesign?: CustomDesign;
  isPro?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  containerClassName?: string;
  onImagePositionChange?: (segmentIndex: number, position: { x: number; y: number }) => void;
  isEditable?: boolean;
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
  containerClassName = '',
  onImagePositionChange,
  isEditable = false
}: CustomWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [images, setImages] = useState<{ [key: number]: HTMLImageElement }>({});
  const [centerImage, setCenterImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSegment, setDragSegment] = useState<number>(-1);
  
  // Ref для сохранения финальной позиции рулетки
  const finalRotationRef = useRef<number>(0);

  // Функция для определения победителя на основе финальной позиции рулетки
  const getWinnerFromRotation = (rotation: number, segmentsCount: number) => {
    // Нормализуем угол к диапазону [0, 2π]
    const normalizedRotation = ((rotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    
    // Угол на сегмент
    const anglePerSegment = (Math.PI * 2) / segmentsCount;
    
    // Стрелка указывает вверх (угол 3π/2 в нормализованных координатах)
    const pointerAngle = (3 * Math.PI / 2);
    
    // Вычисляем относительный угол от стрелки
    let relativeAngle = (pointerAngle - normalizedRotation + (Math.PI * 2)) % (Math.PI * 2);
    
    // Определяем номер сегмента
    let segmentIndex = Math.floor(relativeAngle / anglePerSegment);
    
    // Проверяем, не находимся ли мы очень близко к границе сегмента
    const segmentProgress = (relativeAngle % anglePerSegment) / anglePerSegment;
    
    // Если мы очень близко к следующему сегменту (в пределах 1% от размера сегмента)
    if (segmentProgress > 0.99) {
      segmentIndex = (segmentIndex + 1) % segmentsCount;
      console.log(`🎯 getWinnerFromRotation: Скорректировали на границе сегмента`);
    }
    
    // Убеждаемся, что индекс в правильном диапазоне
    segmentIndex = Math.max(0, Math.min(segmentIndex, segmentsCount - 1));
    
    console.log(`🎯 getWinnerFromRotation: rotation=${rotation.toFixed(4)}, normalized=${normalizedRotation.toFixed(4)}, relativeAngle=${relativeAngle.toFixed(4)}, segmentProgress=${segmentProgress.toFixed(4)}, segmentIndex=${segmentIndex}`);
    
    return segmentIndex;
  };

  // Восстанавливаем сохраненную позицию при изменении данных
  useEffect(() => {
    if (finalRotationRef.current !== 0 && !isSpinning) {
      console.log('🔄 CustomWheel: Восстанавливаем сохраненную позицию:', finalRotationRef.current);
      setCurrentRotation(finalRotationRef.current);
    }
  }, [data, isSpinning]);

  const sizeConfig = {
    small: { radius: 120, fontSize: 11, textDistance: 80 },
    medium: { radius: 160, fontSize: 13, textDistance: 100 },
    large: { radius: 200, fontSize: 15, textDistance: 130 }
  };

  const config = sizeConfig[size];
  const backgroundColor = isPro && customDesign?.backgroundColor ? customDesign.backgroundColor : 'transparent';
  const borderColor = isPro && customDesign?.borderColor ? customDesign.borderColor : '#ffffff';

  // Стабилизируем зависимости для useEffect
  const renderDeps = useMemo(() => {
    const deps = {
      data,
      currentRotation,
      images,
      config,
      borderColor,
      isPro: Boolean(isPro),
      centerImage: centerImage || null
    };
    
    console.log('🎯 CustomWheel: renderDeps обновлен, centerImage =', deps.centerImage ? 'загружено' : 'null');
    
    return deps;
  }, [data, currentRotation, images, config, borderColor, isPro, centerImage]);

  // Функция для попытки загрузки через прокси API
  const tryProxyLoad = (imageUrl: string, index: number, newImages: { [key: number]: HTMLImageElement }, resolve: () => void) => {
    console.log(`🔄 CustomWheel: Попытка загрузки через прокси API для сегмента ${index}`);
    
    // Создаем прокси URL
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    console.log(`🔗 CustomWheel: Прокси URL:`, proxyUrl);
    
    const img3 = new Image();
    img3.crossOrigin = 'anonymous'; // Теперь можно использовать CORS, так как прокси добавляет заголовки
    
    img3.onload = () => {
      console.log(`✅ CustomWheel: Изображение сегмента ${index} загружено через прокси`);
      console.log(`📏 CustomWheel: Размеры изображения ${index} через прокси:`, img3.width, 'x', img3.height);
      console.log(`🎉 CustomWheel: Полная функциональность восстановлена для сегмента ${index}`);
      newImages[index] = img3;
      resolve();
    };
    
    img3.onerror = (error) => {
      logImageError(error, `Ошибка загрузки изображения ${index} через прокси API`, {
        'Оригинальный URL': imageUrl,
        'Прокси URL': proxyUrl,
        'img3 src': img3.src, // Убираем точку из ключа
        'img3.complete': img3.complete
      });
      
      console.log(`❌ CustomWheel: Все попытки загрузки изображения сегмента ${index} исчерпаны`);
      resolve(); // Игнорируем ошибки загрузки
    };
    
    img3.src = proxyUrl;
  };

  // Утилита для безопасного логирования ошибок изображений
  const logImageError = (error: string | Event, context: string, additionalInfo?: Record<string, any>) => {
    console.group(`❌ CustomWheel: ${context}`);
    
    if (additionalInfo) {
      Object.entries(additionalInfo).forEach(([key, value]) => {
        // Всегда используем console.log для безопасности, чтобы избежать ошибок Next.js
        console.log(`${key}:`, value);
      });
    }
    
    if (typeof error === 'string') {
      console.log(`Error:`, error); // Изменено на console.log
    } else if (error instanceof Event) {
      console.log(`Event type:`, error.type); // Изменено на console.log
      console.log(`Event target:`, error.target); // Изменено на console.log
      console.log(`Event currentTarget:`, error.currentTarget); // Изменено на console.log
      console.log(`Event bubbles:`, error.bubbles); // Изменено на console.log
      console.log(`Event cancelable:`, error.cancelable); // Изменено на console.log
      
      if (error instanceof ErrorEvent) {
        console.log(`Error message:`, error.message); // Изменено на console.log
        console.log(`Error filename:`, error.filename); // Изменено на console.log
        console.log(`Error lineno:`, error.lineno); // Изменено на console.log
        console.log(`Error colno:`, error.colno); // Изменено на console.log
        console.log(`Error error:`, error.error); // Изменено на console.log
      }
      
      // Дополнительная информация о target, если это HTMLImageElement
      if (error.target instanceof HTMLImageElement) {
        const img = error.target;
        console.log(`Image src:`, img.src);
        console.log(`Image complete:`, img.complete);
        console.log(`Image naturalWidth:`, img.naturalWidth);
        console.log(`Image naturalHeight:`, img.naturalHeight);
        console.log(`Image width:`, img.width);
        console.log(`Image height:`, img.height);
        console.log(`Image crossOrigin:`, img.crossOrigin);
      }
    }
    
    console.groupEnd();
  };

  // Загружаем изображения
  useEffect(() => {
    const loadImages = async () => {
      console.group('🔄 CustomWheel: Начинаем загрузку изображений');
      console.log('Общее количество сегментов:', data.length);
      console.log('Сегменты с изображениями:', data.filter(s => s.image).length);
      console.log('Состояние вращения:', isSpinning);
      console.log('Текущий поворот:', currentRotation);
      console.table(data.map((s, i) => ({ 
        index: i, 
        hasImage: !!s.image, 
        imageUrl: s.image?.substring(0, 100) + (s.image && s.image.length > 100 ? '...' : ''),
        imageLength: s.image?.length || 0
      })));
      console.groupEnd();
      
      const newImages: { [key: number]: HTMLImageElement } = {};
      
      const imagePromises = data.map((segment, index) => {
        if (segment.image) {
          console.group(`🖼️ CustomWheel: Загружаем изображение для сегмента ${index}`);
          console.log('URL:', segment.image);
          console.log('Тип URL:', typeof segment.image);
          console.log('Длина URL:', segment.image.length);
          console.log('Валидный HTTP URL:', segment.image.startsWith('http'));
          console.log('Валидный HTTPS URL:', segment.image.startsWith('https'));
          console.log('Валидный data URL:', segment.image.startsWith('data:'));
          console.log('Пустой URL:', segment.image.trim() === '');
          console.log('Первые 200 символов:', segment.image.substring(0, 200));
          console.groupEnd();
          
          return new Promise<void>((resolve) => {
            // Сначала пробуем загрузить БЕЗ CORS (обычно работает лучше)
            const img = new Image();
            
            img.onload = () => {
              console.log(`✅ CustomWheel: Изображение сегмента ${index} загружено успешно`);
              console.log(`📏 CustomWheel: Размеры изображения ${index}:`, img.width, 'x', img.height);
              console.log(`📏 CustomWheel: Natural размеры изображения ${index}:`, img.naturalWidth, 'x', img.naturalHeight);
              newImages[index] = img;
              resolve();
            };
            
            img.onerror = (error) => {
              logImageError(error, `Ошибка загрузки изображения сегмента ${index} без CORS`, {
                'URL изображения': segment.image,
                'img src': img.src,
                'img.complete': img.complete,
                'img.naturalWidth': img.naturalWidth,
                'img.naturalHeight': img.naturalHeight
              });
              
              // Попробуем загрузить С CORS
              console.log(`🔄 CustomWheel: Пробуем загрузить изображение ${index} с CORS...`);
              const img2 = new Image();
              img2.crossOrigin = 'anonymous';
              
              img2.onload = () => {
                console.log(`✅ CustomWheel: Изображение сегмента ${index} загружено с CORS`);
                console.log(`📏 CustomWheel: Размеры изображения ${index} с CORS:`, img2.width, 'x', img2.height);
                newImages[index] = img2;
                resolve();
              };
              
              img2.onerror = (error2) => {
                logImageError(error2, `Ошибка загрузки изображения ${index} с CORS`, {
                  'URL изображения': segment.image,
                  'img2 src': img2.src,
                  'img2.complete': img2.complete
                });
                
                // Последняя попытка - попробуем через прокси API
                console.log(`🔄 CustomWheel: Последняя попытка - пробуем через прокси API...`);
                tryProxyLoad(segment.image!, index, newImages, resolve);
              };
              
              img2.src = segment.image!;
            };
            
            img.src = segment.image!;
          });
        }
        return Promise.resolve();
      });

      await Promise.all(imagePromises);
      
      console.log('🏁 CustomWheel: Загрузка изображений завершена. Загружено изображений:', Object.keys(newImages).length);
      console.log('🏁 CustomWheel: Загруженные изображения:', Object.keys(newImages).map(key => ({ 
        segmentIndex: key, 
        imageSize: `${newImages[parseInt(key)].width}x${newImages[parseInt(key)].height}` 
      })));
      
      setImages(newImages);
    };

    // Только сбрасываем изображения, НЕ сбрасываем поворот рулетки
    setImages({});
    loadImages();
  }, [data]);

  // Загружаем центральное изображение
  useEffect(() => {
    console.log('🎯 CustomWheel: useEffect для центрального изображения вызван');
    console.log('🎯 CustomWheel: isPro =', isPro);
    console.log('🎯 CustomWheel: customDesign =', customDesign);
    console.log('🎯 CustomWheel: customDesign?.centerImage =', customDesign?.centerImage);
    
    if (isPro && customDesign?.centerImage && customDesign.centerImage.trim() !== '') {
      console.log('🎯 CustomWheel: Загружаем центральное изображение:', customDesign.centerImage);
      
      const loadCenterImage = () => {
        return new Promise<void>((resolve) => {
          // Если это data URI, загружаем напрямую
          if (customDesign.centerImage!.startsWith('data:')) {
            console.log('🎯 CustomWheel: Обнаружен data URI, загружаем напрямую');
            const img = new Image();
            img.onload = () => {
              console.log('✅ CustomWheel: Центральное изображение (data URI) загружено:', img.width, 'x', img.height);
              setCenterImage(img);
              resolve();
            };
            img.onerror = (error) => {
              console.error('❌ CustomWheel: Ошибка загрузки data URI:', error);
              setCenterImage(null);
              resolve();
            };
            img.src = customDesign.centerImage!;
            return;
          }
          
          // Сначала пробуем загрузить БЕЗ CORS
          const img = new Image();
          
          img.onload = () => {
            console.log('✅ CustomWheel: Центральное изображение загружено:', img.width, 'x', img.height);
            setCenterImage(img);
            resolve();
          };
          
          img.onerror = (error) => {
            console.log('🔄 CustomWheel: Ошибка загрузки центрального изображения без CORS, пробуем с CORS...');
            
            // Попробуем загрузить С CORS
            const img2 = new Image();
            img2.crossOrigin = 'anonymous';
            
            img2.onload = () => {
              console.log('✅ CustomWheel: Центральное изображение загружено с CORS:', img2.width, 'x', img2.height);
              setCenterImage(img2);
              resolve();
            };
            
            img2.onerror = (error2) => {
              console.log('🔄 CustomWheel: Ошибка загрузки центрального изображения с CORS, пробуем через прокси...');
              
              // Последняя попытка - попробуем через прокси API
              const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(customDesign.centerImage!)}`;
              console.log('🔗 CustomWheel: Прокси URL для центрального изображения:', proxyUrl);
              
              const img3 = new Image();
              img3.crossOrigin = 'anonymous';
              
              img3.onload = () => {
                console.log('✅ CustomWheel: Центральное изображение загружено через прокси:', img3.width, 'x', img3.height);
                setCenterImage(img3);
                resolve();
              };
              
              img3.onerror = (error3) => {
                console.error('❌ CustomWheel: Все попытки загрузки центрального изображения не удались:', error3);
                console.log('🔄 CustomWheel: Пробуем загрузить резервное изображение...');
                
                // Последняя попытка - используем встроенное резервное изображение
                const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzAwN2JmZiIgLz4KICA8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCI+Rk9SVFVOQTWVOVUE8L3RleHQ+Cjwvc3ZnPgo=';
                
                const img4 = new Image();
                img4.onload = () => {
                  console.log('✅ CustomWheel: Резервное центральное изображение загружено:', img4.width, 'x', img4.height);
                  setCenterImage(img4);
                  resolve();
                };
                
                img4.onerror = (error4) => {
                  console.error('❌ CustomWheel: Даже резервное изображение не удалось загрузить:', error4);
                  setCenterImage(null);
                  resolve();
                };
                
                img4.src = fallbackImage;
              };
              
              img3.src = proxyUrl;
            };
            
            img2.src = customDesign.centerImage!;
          };
          
          img.src = customDesign.centerImage!;
        });
      };
      
      loadCenterImage();
    } else {
      console.log('🎯 CustomWheel: Центральное изображение не загружается - условие не выполнено');
      setCenterImage(null);
    }
  }, [isPro, customDesign?.centerImage]);

  // Функция для получения координат мыши относительно canvas
  const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Функция для определения, в каком сегменте находится точка
  const getSegmentAtPoint = (x: number, y: number, centerX: number, centerY: number) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > renderDeps.config.radius) return -1;
    
    let angle = Math.atan2(dy, dx) - renderDeps.currentRotation;
    if (angle < 0) angle += Math.PI * 2;
    
    const anglePerSegment = (Math.PI * 2) / renderDeps.data.length;
    const segmentIndex = Math.floor(angle / anglePerSegment);
    
    return segmentIndex >= 0 && segmentIndex < renderDeps.data.length ? segmentIndex : -1;
  };

  // Обработчики мыши для перетаскивания изображений
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable || isSpinning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mousePos = getMousePos(canvas, e.nativeEvent);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const segmentIndex = getSegmentAtPoint(mousePos.x, mousePos.y, centerX, centerY);
    
    if (segmentIndex >= 0 && renderDeps.data[segmentIndex].image) {
      setIsDragging(true);
      setDragSegment(segmentIndex);
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable || isSpinning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mousePos = getMousePos(canvas, e.nativeEvent);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    if (isDragging && dragSegment >= 0) {
      // Вычисляем новую позицию изображения
      const segmentAngle = (dragSegment * (Math.PI * 2) / renderDeps.data.length) + renderDeps.currentRotation + (Math.PI / renderDeps.data.length);
      const dx = mousePos.x - centerX;
      const dy = mousePos.y - centerY;
      
      // Преобразуем в локальные координаты сегмента
      const localX = dx * Math.cos(-segmentAngle) - dy * Math.sin(-segmentAngle);
      const localY = dx * Math.sin(-segmentAngle) + dy * Math.cos(-segmentAngle);
      
      // Нормализуем позицию (-1 до 1)
      const normalizedX = Math.max(-1, Math.min(1, localX / (renderDeps.config.radius * 0.5)));
      const normalizedY = Math.max(-1, Math.min(1, localY / (renderDeps.config.radius * 0.5)));
      
      if (onImagePositionChange) {
        onImagePositionChange(dragSegment, { x: normalizedX, y: normalizedY });
      }
    } else {
      // Проверяем, находится ли курсор над изображением
      const segmentIndex = getSegmentAtPoint(mousePos.x, mousePos.y, centerX, centerY);
      if (segmentIndex >= 0 && renderDeps.data[segmentIndex].image) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragSegment(-1);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    }
  };

  // Отрисовка рулетки
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = renderDeps.config.radius;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем сегменты
    const anglePerSegment = (Math.PI * 2) / renderDeps.data.length;
    
    renderDeps.data.forEach((segment, index) => {
      const startAngle = index * anglePerSegment + renderDeps.currentRotation;
      const endAngle = startAngle + anglePerSegment;

      // Рисуем сегмент
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Заливка сегмента
      if (segment.image && renderDeps.images[index]) {
        console.log(`🎨 CustomWheel: Рисуем изображение для сегмента ${index}`, { 
          imageUrl: segment.image, 
          imageLoaded: !!renderDeps.images[index],
          imagePosition: segment.imagePosition,
          imageWidth: renderDeps.images[index]?.width,
          imageHeight: renderDeps.images[index]?.height
        });
        
        ctx.save();
        ctx.clip();
        
        // Получаем позицию изображения (по умолчанию центр)
        const imagePos = segment.imagePosition || { x: 0, y: 0 };
        
        // Вычисляем размеры и позицию для правильного заполнения сегмента
        const img = renderDeps.images[index];
        const segmentCenterAngle = startAngle + anglePerSegment / 2;
        
        // Размер изображения должен покрывать весь сегмент
        const imgRadius = radius * 1.2;
        
        // Базовая позиция в центре сегмента
        const baseX = centerX + Math.cos(segmentCenterAngle) * (radius * 0.5);
        const baseY = centerY + Math.sin(segmentCenterAngle) * (radius * 0.5);
        
        // Применяем смещение от пользователя
        const offsetX = imagePos.x * radius * 0.3;
        const offsetY = imagePos.y * radius * 0.3;
        
        const finalX = baseX + offsetX - imgRadius / 2;
        const finalY = baseY + offsetY - imgRadius / 2;
        
        // Рисуем изображение с поворотом
        ctx.save();
        ctx.translate(baseX + offsetX, baseY + offsetY);
        ctx.rotate(segmentCenterAngle + Math.PI / 2);
        ctx.drawImage(img, -imgRadius / 2, -imgRadius / 2, imgRadius, imgRadius);
        ctx.restore();
        
        ctx.restore();
      } else if (segment.image && !renderDeps.images[index]) {
        console.log(`⏳ CustomWheel: Изображение для сегмента ${index} еще загружается`);
        // Обычная заливка цветом пока изображение загружается
        ctx.fillStyle = segment.style.backgroundColor;
        ctx.fill();
      } else {
        // Обычная заливка цветом
        ctx.fillStyle = segment.style.backgroundColor;
        ctx.fill();
      }

      // Обводка сегмента
      ctx.strokeStyle = renderDeps.borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Рисуем текст
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      
      ctx.fillStyle = segment.style.textColor;
      ctx.font = `${renderDeps.config.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Добавляем тень для лучшей читаемости
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(segment.option, renderDeps.config.textDistance, 0);
      ctx.restore();
    });

    // Рисуем стрелку указатель
    ctx.save();
    ctx.translate(centerX, centerY - radius - 10);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -20);
    ctx.lineTo(15, -20);
    ctx.closePath();
    ctx.fillStyle = renderDeps.borderColor;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Рисуем центральное изображение (PRO функция)
    console.log('🎯 CustomWheel: Проверяем центральное изображение');
    console.log('🎯 CustomWheel: renderDeps.isPro =', renderDeps.isPro);
    console.log('🎯 CustomWheel: renderDeps.centerImage =', renderDeps.centerImage);
    
    if (renderDeps.isPro && renderDeps.centerImage) {
      console.log('🎯 CustomWheel: Рисуем центральное изображение');
      console.log('🎯 CustomWheel: centerX =', centerX, 'centerY =', centerY, 'radius =', radius);
      
      ctx.save();
      
      // Размер центрального изображения (60% от радиуса для тестирования)
      const centerImageSize = radius * 0.6;
      console.log('🎯 CustomWheel: centerImageSize =', centerImageSize);
      
      // ВРЕМЕННО: Убираем маску для тестирования
      // ctx.beginPath();
      // ctx.arc(centerX, centerY, centerImageSize / 2, 0, Math.PI * 2);
      // ctx.clip();
      
      // Рисуем изображение в центре
      const imageX = centerX - centerImageSize / 2;
      const imageY = centerY - centerImageSize / 2;
      console.log('🎯 CustomWheel: Рисуем изображение в позиции x =', imageX, 'y =', imageY, 'size =', centerImageSize);
      
      ctx.drawImage(
        renderDeps.centerImage,
        imageX,
        imageY,
        centerImageSize,
        centerImageSize
      );
      
      ctx.restore();
      
      // Добавляем круглую обводку для центрального изображения
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerImageSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = renderDeps.borderColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      
      console.log('🎯 CustomWheel: Центральное изображение отрисовано');
    }

  }, [renderDeps]);

  // Запуск анимации вращения
  useEffect(() => {
    if (mustStartSpinning && !isSpinning) {
      setIsSpinning(true);
      
      console.log(`🎯 CustomWheel: Начинаем вращение для приза ${prizeNumber}`);
      console.log(`🎯 CustomWheel: Название приза: "${data[prizeNumber]?.option}"`);
      console.log(`🎯 CustomWheel: Всего сегментов: ${data.length}`);
      console.log(`🎯 CustomWheel: Текущая позиция: ${currentRotation}`);
      
      // Вычисляем финальный угол для нужного сегмента
      const anglePerSegment = (Math.PI * 2) / data.length;
      
      // ИСПРАВЛЕННЫЙ РАСЧЕТ: Позиционируем сегмент точно под стрелкой
      // Стрелка указывает вверх (угол 3π/2 или -π/2)
      // Нужно, чтобы ЦЕНТР выбранного сегмента был точно под стрелкой
      
      // Угол центра сегмента в "нулевой" позиции (когда рулетка не повернута)
      const segmentCenterAngle = (prizeNumber * anglePerSegment) + (anglePerSegment / 2);
      
      // Добавляем небольшую случайность в пределах ±10% от размера сегмента
      // чтобы рулетка не останавливалась в одном и том же месте
      const randomOffset = (Math.random() - 0.5) * anglePerSegment * 0.2; // ±10% от размера сегмента
      
      // Целевой угол поворота: чтобы центр сегмента был под стрелкой (вверху)
      // Стрелка находится в позиции -π/2 (или 3π/2), поэтому:
      const targetAngle = (-Math.PI / 2) - segmentCenterAngle + randomOffset;
      
      const spins = 5; // Количество полных оборотов
      
      // Добавляем текущую позицию к финальному углу
      const finalRotation = currentRotation + (Math.PI * 2 * spins) + targetAngle;
      
      console.log(`🎯 CustomWheel: Угол на сегмент: ${anglePerSegment}`);
      console.log(`🎯 CustomWheel: Угол центра сегмента: ${segmentCenterAngle}`);
      console.log(`🎯 CustomWheel: Случайное смещение: ${randomOffset} (${(randomOffset / anglePerSegment * 100).toFixed(1)}% от сегмента)`);
      console.log(`🎯 CustomWheel: Целевой угол: ${targetAngle}`);
      console.log(`🎯 CustomWheel: Финальный поворот: ${finalRotation}`);
      console.log(`🎯 CustomWheel: Разница поворота: ${finalRotation - currentRotation}`);
      
      // Анимация
      const duration = 3000; // 3 секунды
      const startTime = Date.now();
      const startRotation = currentRotation;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для замедления в конце
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newRotation = startRotation + (finalRotation - startRotation) * easeOut;
        setCurrentRotation(newRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          // Сохраняем финальную позицию рулетки
          setCurrentRotation(finalRotation);
          finalRotationRef.current = finalRotation;
          
          // Определяем реального победителя на основе финальной позиции
          const actualWinner = getWinnerFromRotation(finalRotation, data.length);
          console.log(`🎯 CustomWheel: Анимация завершена, финальная позиция: ${finalRotation}`);
          console.log(`🎯 CustomWheel: Ожидаемый победитель: ${prizeNumber} (${data[prizeNumber]?.option})`);
          console.log(`🎯 CustomWheel: Реальный победитель: ${actualWinner} (${data[actualWinner]?.option})`);
          
          // Теперь actualWinner должен всегда совпадать с prizeNumber
          if (actualWinner !== prizeNumber) {
            console.log(`⚠️ CustomWheel: ВНИМАНИЕ! Расхождение: ожидали ${prizeNumber}, получили ${actualWinner}`);
          } else {
            console.log(`✅ CustomWheel: Победитель определен правильно!`);
          }
          
          onStopSpinning(actualWinner);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [mustStartSpinning, isSpinning, prizeNumber, data.length, currentRotation, onStopSpinning, getWinnerFromRotation]);

  const canvasSize = config.radius * 2 + 60; // Добавляем место для стрелки

  return (
    <div 
      className={`p-4 rounded-xl transition-all duration-300 ${containerClassName}`}
      style={{ backgroundColor }}
    >
      <div className={`flex justify-center ${className}`}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="drop-shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
} 