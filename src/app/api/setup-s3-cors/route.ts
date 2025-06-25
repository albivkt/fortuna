import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const S3_CONFIG = {
  endpoint: 'https://s3.twcstorage.ru',
  region: 'ru-1',
  credentials: {
    accessKeyId: 'I6XD2OR7YO2ZN6L6Z629',
    secretAccessKey: '9xCOoafisG0aB9lJNvdLO1UuK73fBvMcpHMdijrJ',
  },
  forcePathStyle: true,
};

const BUCKET_NAME = '617774af-gifty';

export async function POST() {
  try {
    const s3Client = new S3Client(S3_CONFIG);

    const corsConfiguration = {
      CORSRules: [
        {
          AllowedOrigins: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600
        }
      ]
    };

    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    });

    await s3Client.send(command);

    console.log('✅ CORS настроен для bucket:', BUCKET_NAME);

    return NextResponse.json({
      success: true,
      message: 'CORS успешно настроен для S3 bucket',
      bucket: BUCKET_NAME,
      corsRules: corsConfiguration.CORSRules
    });

  } catch (error) {
    console.error('❌ Ошибка настройки CORS:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка настройки CORS',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
} 