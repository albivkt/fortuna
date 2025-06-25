import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Проверяем все переменные окружения...');
    
    // Получаем все переменные окружения
    const allEnvVars = process.env;
    
    // Фильтруем только нужные нам переменные
    const relevantVars = {
      // S3 переменные
      S3_REGION: process.env.S3_REGION,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      
      // Другие важные переменные
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
    };

    // Создаем безопасную версию для отправки клиенту
    const safeVars = {
      S3_REGION: relevantVars.S3_REGION ? 'SET' : 'MISSING',
      S3_BUCKET: relevantVars.S3_BUCKET ? 'SET' : 'MISSING',
      S3_ACCESS_KEY_ID: relevantVars.S3_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      S3_SECRET_ACCESS_KEY: relevantVars.S3_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      S3_ENDPOINT: relevantVars.S3_ENDPOINT ? 'SET' : 'MISSING',
      NODE_ENV: relevantVars.NODE_ENV || 'MISSING',
      JWT_SECRET: relevantVars.JWT_SECRET ? 'SET' : 'MISSING',
      DATABASE_URL: relevantVars.DATABASE_URL ? 'SET' : 'MISSING',
    };

    // Показываем первые символы для S3 переменных (для отладки)
    const debugVars = {
      S3_REGION: relevantVars.S3_REGION || 'MISSING',
      S3_BUCKET: relevantVars.S3_BUCKET || 'MISSING',
      S3_ACCESS_KEY_ID: relevantVars.S3_ACCESS_KEY_ID ? 
        relevantVars.S3_ACCESS_KEY_ID.substring(0, 8) + '***' : 'MISSING',
      S3_SECRET_ACCESS_KEY: relevantVars.S3_SECRET_ACCESS_KEY ? 
        relevantVars.S3_SECRET_ACCESS_KEY.substring(0, 8) + '***' : 'MISSING',
      S3_ENDPOINT: relevantVars.S3_ENDPOINT || 'MISSING',
    };

    console.log('📋 Переменные окружения (безопасно):', safeVars);
    console.log('🔍 S3 переменные (отладка):', debugVars);

    // Подсчитываем количество всех переменных окружения
    const totalEnvVars = Object.keys(allEnvVars).length;
    
    // Проверяем, все ли S3 переменные установлены
    const s3VarsSet = [
      relevantVars.S3_REGION,
      relevantVars.S3_BUCKET,
      relevantVars.S3_ACCESS_KEY_ID,
      relevantVars.S3_SECRET_ACCESS_KEY,
      relevantVars.S3_ENDPOINT,
    ].every(Boolean);

    const missingS3Vars = [];
    if (!relevantVars.S3_REGION) missingS3Vars.push('S3_REGION');
    if (!relevantVars.S3_BUCKET) missingS3Vars.push('S3_BUCKET');
    if (!relevantVars.S3_ACCESS_KEY_ID) missingS3Vars.push('S3_ACCESS_KEY_ID');
    if (!relevantVars.S3_SECRET_ACCESS_KEY) missingS3Vars.push('S3_SECRET_ACCESS_KEY');
    if (!relevantVars.S3_ENDPOINT) missingS3Vars.push('S3_ENDPOINT');

    return NextResponse.json({
      success: s3VarsSet,
      message: s3VarsSet ? 'Все S3 переменные установлены' : 'Некоторые S3 переменные отсутствуют',
      totalEnvironmentVariables: totalEnvVars,
      s3ConfigComplete: s3VarsSet,
      missingS3Variables: missingS3Vars,
      environmentVariables: safeVars,
      s3VariablesDebug: debugVars,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Ошибка проверки переменных окружения:', error);
    return NextResponse.json({
      success: false,
      error: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
    }, { status: 500 });
  }
} 