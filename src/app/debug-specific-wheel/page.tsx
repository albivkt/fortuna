'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { CustomWheel } from '@/components/CustomWheel';

const GET_WHEEL = gql`
  query GetWheel($id: ID!) {
    wheel(id: $id) {
      id
      title
      segments {
        option
        style {
          backgroundColor
          textColor
        }
        image
        imagePosition {
          x
          y
        }
      }
      customDesign {
        backgroundColor
        borderColor
        textColor
        centerImage
      }
      user {
        id
        name
        plan
      }
      createdAt
    }
  }
`;

export default function DebugSpecificWheelPage() {
  const wheelId = 'cmc6uzui0001veqq1q4y1b6'; // ID рулетки из URL
  
  const { data: wheelData, loading, error } = useQuery(GET_WHEEL, {
    variables: { id: wheelId }
  });

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-red-500">Ошибка: {error.message}</div>;
  if (!wheelData?.wheel) return <div className="p-8">Рулетка не найдена</div>;

  const wheel = wheelData.wheel;

  // Преобразуем сегменты для отображения
  const wheelDisplayData = wheel.segments.map((segment: any) => ({
    option: segment.option,
    style: { 
      backgroundColor: segment.style.backgroundColor, 
      textColor: segment.style.textColor || 'white' 
    },
    image: segment.image || undefined,
    imagePosition: segment.imagePosition || { x: 0, y: 0 }
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Отладка рулетки: {wheel.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - данные */}
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="bg-gray-800/80 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Основная информация</h2>
              <div className="text-gray-300 space-y-2 text-sm">
                <p><strong>ID:</strong> {wheel.id}</p>
                <p><strong>Название:</strong> {wheel.title}</p>
                <p><strong>Владелец:</strong> {wheel.user.name} (ID: {wheel.user.id})</p>
                <p><strong>План владельца:</strong> <span className={wheel.user.plan === 'pro' ? 'text-yellow-400' : 'text-gray-400'}>{wheel.user.plan}</span></p>
                <p><strong>Создано:</strong> {new Date(wheel.createdAt).toLocaleString('ru-RU')}</p>
              </div>
            </div>

            {/* Кастомный дизайн */}
            <div className="bg-gray-800/80 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Кастомный дизайн</h2>
              {wheel.customDesign ? (
                <div className="space-y-4">
                  <pre className="bg-gray-700 p-4 rounded text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(wheel.customDesign, null, 2)}
                  </pre>
                  
                  {wheel.customDesign.centerImage && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Центральное изображение</h3>
                      <p className="text-xs text-gray-400 mb-2 break-all">
                        URL: {wheel.customDesign.centerImage}
                      </p>
                      <img 
                        src={wheel.customDesign.centerImage} 
                        alt="Центральное изображение" 
                        className="w-20 h-20 object-cover border rounded"
                        onLoad={() => console.log('✅ Центральное изображение preview загружено')}
                        onError={(e) => {
                          console.error('❌ Ошибка preview центрального изображения:', e);
                          e.currentTarget.style.border = '2px solid red';
                        }}
                      />
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const img = new Image();
                            img.onload = () => {
                              console.log(`✅ Тест загрузки: ${img.width}x${img.height}`);
                              alert(`Изображение загружается! Размер: ${img.width}x${img.height}`);
                            };
                            img.onerror = (err) => {
                              console.error('❌ Тест загрузки провален:', err);
                              alert('Изображение НЕ загружается!');
                            };
                            img.src = wheel.customDesign.centerImage;
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Тест загрузки
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">Кастомный дизайн не установлен</p>
              )}
            </div>

            {/* Сегменты */}
            <div className="bg-gray-800/80 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Сегменты</h2>
              <div className="space-y-2">
                {wheel.segments.map((segment: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: segment.style.backgroundColor }}
                    ></div>
                    <span className="text-white">{segment.option}</span>
                    {segment.image && (
                      <span className="text-blue-400 text-xs">[имеет изображение]</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая колонка - рулетка */}
          <div className="space-y-6">
            {/* Рулетка с правильным Pro статусом */}
            <div className="bg-gray-800/80 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                Рулетка с Pro статусом владельца ({wheel.user.plan})
              </h2>
              <div className="flex justify-center">
                <CustomWheel
                  mustStartSpinning={false}
                  prizeNumber={0}
                  data={wheelDisplayData}
                  onStopSpinning={() => {}}
                  customDesign={wheel.customDesign}
                  isPro={wheel.user.plan === 'pro'}
                  size="large"
                />
              </div>
            </div>

            {/* Рулетка без Pro статуса для сравнения */}
            <div className="bg-gray-800/80 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                Рулетка без Pro статуса (для сравнения)
              </h2>
              <div className="flex justify-center">
                <CustomWheel
                  mustStartSpinning={false}
                  prizeNumber={0}
                  data={wheelDisplayData}
                  onStopSpinning={() => {}}
                  customDesign={wheel.customDesign}
                  isPro={false}
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 bg-gray-800/80 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4">Инструкции для отладки</h2>
          <div className="text-gray-300 space-y-2 text-sm">
            <p>1. Откройте консоль браузера (F12)</p>
            <p>2. Посмотрите на логи с префиксом "🎯 CustomWheel:"</p>
            <p>3. Проверьте:</p>
            <ul className="ml-4 space-y-1">
              <li>- isPro = {wheel.user.plan === 'pro' ? 'true' : 'false'}</li>
              <li>- customDesign?.centerImage = {wheel.customDesign?.centerImage ? 'установлен' : 'не установлен'}</li>
              <li>- Загружается ли изображение</li>
              <li>- Рисуется ли изображение на canvas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 