import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);

  const timeLog = await prisma.timeLog.findFirst({
    where: {
      id: logId,
      userId
    }
  });

  if (!timeLog) {
    return NextResponse.json({ error: 'Time log not found' }, { status: 404 });
  }

  await prisma.timeLog.delete({
    where: { id: logId }
  });

  return NextResponse.json({ success: true });
}
