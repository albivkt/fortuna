import { prisma } from './prisma';

export async function updateUserNameInDatabase(sessionId: string, newName: string) {
  try {
    const email = `temp_${sessionId}@gifty.local`;
    
    console.log('🔄 Updating user name in database:', { email, newName });
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name: newName }
    });
    
    console.log('✅ User name updated successfully:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('❌ Error updating user name:', error);
    
    // Если пользователь не найден, создаем его
    try {
      const email = `temp_${sessionId}@gifty.local`;
      const newUser = await prisma.user.create({
        data: {
          email,
          name: newName,
          plan: 'FREE'
        }
      });
      
      console.log('✅ New user created with name:', newUser);
      return newUser;
    } catch (createError) {
      console.error('❌ Error creating user:', createError);
      throw createError;
    }
  }
} 