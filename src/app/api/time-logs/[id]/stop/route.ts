import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const timeLogId = parseInt(id);

  const existingLog = await prisma.timeLog.findFirst({
    where: {
      id: timeLogId,
      userId
    }
  });

  if (!existingLog) {
    return NextResponse.json({ error: 'Time log not found' }, { status: 404 });
  }

  if (existingLog.endTime) {
    return NextResponse.json({ error: 'Time log already stopped' }, { status: 400 });
  }

  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - new Date(existingLog.startTime).getTime()) / 1000);

  const timeLog = await prisma.timeLog.update({
    where: { id: timeLogId },
    data: {
      endTime,
      duration
    }
  });

  return NextResponse.json({ timeLog });
}
