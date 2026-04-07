import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await prisma.influencerSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...session,
    platforms: JSON.parse(session.platforms),
    brandSocials: JSON.parse(session.brandSocials),
    influencer: JSON.parse(session.influencer),
    result: session.result ? JSON.parse(session.result) : null,
  });
}
