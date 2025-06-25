import { NextRequest, NextResponse } from 'next/server';
import { updateUserNameInDatabase } from '@/lib/updateUserName';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, name } = await request.json();
    
    if (!sessionId || !name) {
      return NextResponse.json(
        { error: 'Session ID and name are required' },
        { status: 400 }
      );
    }
    
    const updatedUser = await updateUserNameInDatabase(sessionId, name);
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user name:', error);
    return NextResponse.json(
      { error: 'Failed to update user name' },
      { status: 500 }
    );
  }
} 