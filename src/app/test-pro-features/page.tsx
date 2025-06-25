'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, createUser } from '@/lib/user';
import { useWheel } from '@/lib/graphql/hooks';
import { CustomWheel } from '@/components/CustomWheel';

export default function TestProFeaturesPage() {
  const [user, setUser] = useState<any>(null);
  const [wheelId, setWheelId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  // Получаем пользователя
  useEffect(() => {
    const currentUser = getCurrentUser() || createUser();
    setUser(currentUser);
    console.log('👤 Current user:', currentUser);
  }, []);

  // Хук для получения рулетки
  const { data: wheelData, loading, error, refetch } = useWheel(wheelId || '', {
    skip: !wheelId
  });

  const handleTestWheel = async () => {
    if (!wheelId) {
      alert('Введите ID рулетки');
      return;
    }

    try {
      const result = await refetch();
      console.log('🎯 Wheel data:', result.data);
      setTestResult(result.data);
    } catch (err) {
      console.error('❌ Error:', err);
      setTestResult({ error: err });
    }
  };

  const handleUpgradeToPro = () => {
    if (user) {
      const updatedUser = { ...user, plan: 'pro' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ User upgraded to PRO:', updatedUser);
    }
  };

  const handleDowngradeToFree = () => {
    if (user) {
      const updatedUser = { ...user, plan: 'free' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('⬇️ User downgraded to FREE:', updatedUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Тест PRO функций</h1>

        {/* Информация о пользователе */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Текущий пользователь</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Имя:</strong> {user?.name}</p>
            <p><strong>План:</strong> <span className={user?.plan === 'pro' ? 'text-yellow-400' : 'text-gray-400'}>{user?.plan}</span></p>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={handleUpgradeToPro}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400"
            >
              Upgrade to PRO
            </button>
            <button
              onClick={handleDowngradeToFree}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500"
            >
              Downgrade to FREE
            </button>
          </div>
        </div>

        {/* Тест рулетки */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Тест рулетки</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={wheelId}
              onChange={(e) => setWheelId(e.target.value)}
              placeholder="Введите ID рулетки"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            <button
              onClick={handleTestWheel}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Тест'}
            </button>
          </div>

          {error && (
            <div className="text-red-400 mb-4">
              Ошибка: {error.message}
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Результат:</h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-green-400 text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>

              {testResult.wheel && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Предварительный просмотр рулетки:</h3>
                  <div className="flex justify-center">
                    <CustomWheel
                      mustStartSpinning={false}
                      prizeNumber={0}
                      data={testResult.wheel.segments || []}
                      onStopSpinning={() => {}}
                      customDesign={testResult.wheel.customDesign}
                      isPro={user?.plan === 'pro' || (testResult.wheel.user?.id === user?.id && testResult.wheel.user?.plan === 'pro')}
                      size="medium"
                    />
                  </div>
                  <div className="mt-4 text-center text-gray-300">
                    <p>isPro: {String(user?.plan === 'pro' || (testResult.wheel.user?.id === user?.id && testResult.wheel.user?.plan === 'pro'))}</p>
                    <p>User plan: {user?.plan}</p>
                    <p>Wheel owner plan: {testResult.wheel.user?.plan}</p>
                    <p>Is owner: {String(testResult.wheel.user?.id === user?.id)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Инструкции */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Инструкции</h2>
          <div className="text-gray-300 space-y-2">
            <p>1. Сначала создайте рулетку в дашборде</p>
            <p>2. Скопируйте ID рулетки из URL (например: http://localhost:3000/dashboard/edit/ID)</p>
            <p>3. Вставьте ID в поле выше и нажмите "Тест"</p>
            <p>4. Проверьте, что customDesign загружается правильно</p>
            <p>5. Попробуйте переключить план пользователя и посмотреть на изменения</p>
          </div>
        </div>
      </div>
    </div>
  );
} 