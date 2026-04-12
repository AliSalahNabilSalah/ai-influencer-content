import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const sessions = await prisma.influencerSession.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      brandName: true,
      platforms: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(sessions.map((s: typeof sessions[number]) => ({
    ...s,
    platforms: JSON.parse(s.platforms),
  })));
}
