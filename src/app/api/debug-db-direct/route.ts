import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Direct database check started');
    
    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            wheels: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Получаем все рулетки
    const wheels = await prisma.wheel.findMany({
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Группируем рулетки по пользователям
    const wheelsByUser = wheels.reduce((acc, wheel) => {
      if (!acc[wheel.userId]) {
        acc[wheel.userId] = [];
      }
      acc[wheel.userId].push(wheel);
      return acc;
    }, {} as Record<string, any[]>);
    
    const result = {
      timestamp: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalWheels: wheels.length,
        tempUsers: users.filter(u => u.email.includes('@fortuna.local')).length,
        realUsers: users.filter(u => !u.email.includes('@fortuna.local')).length
      },
      users: users.map(user => ({
        ...user,
        wheels: wheelsByUser[user.id] || []
      })),
      recentWheels: wheels.slice(0, 10)
    };
    
    console.log('✅ Database check completed:', result.summary);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Database check error:', error);
    return NextResponse.json(
      { error: 'Database check failed', details: error },
      { status: 500 }
    );
  }
} 