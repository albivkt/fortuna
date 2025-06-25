export interface PlanLimits {
  maxWheels: number;
  maxSegments: number;
  allowImages: boolean;
  allowWeights: boolean;
  allowCustomDesign: boolean;
  allowStatistics: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxWheels: 3,
    maxSegments: 6,
    allowImages: false,
    allowWeights: false,
    allowCustomDesign: false,
    allowStatistics: false,
  },
  PRO: {
    maxWheels: -1, // Безлимитно
    maxSegments: 20,
    allowImages: true,
    allowWeights: true,
    allowCustomDesign: true,
    allowStatistics: true,
  },
};

export const PLAN_PRICES = {
  PRO: {
    MONTHLY: 40000, // 400 рублей в копейках
    YEARLY: 400000, // 4000 рублей в копейках
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

export function isPlanActive(user: any): boolean {
  if (user.plan === 'FREE') return true;
  if (user.plan === 'PRO') {
    if (!user.planExpiresAt) return false;
    return new Date(user.planExpiresAt) > new Date();
  }
  return false;
}

export function getEffectivePlan(user: any): string {
  if (isPlanActive(user)) {
    return user.plan;
  }
  return 'FREE';
}

export async function checkWheelCreationLimits(userId: string, currentPlan: string): Promise<boolean> {
  const limits = getPlanLimits(currentPlan);
  
  if (limits.maxWheels === -1) return true; // Безлимитно
  
  const { prisma } = await import('./prisma');
  const wheelCount = await prisma.wheel.count({
    where: { userId }
  });
  
  return wheelCount < limits.maxWheels;
}

export function checkSegmentLimits(segmentCount: number, plan: string): boolean {
  const limits = getPlanLimits(plan);
  return segmentCount <= limits.maxSegments;
} 