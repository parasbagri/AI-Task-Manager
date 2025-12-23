import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { z } from 'zod';

const createTimeLogSchema = z.object({
  taskId: z.number().int(),
  startTime: z.string().datetime()
});

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timeLogs = await prisma.timeLog.findMany({
    where: { userId },
    include: {
      task: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });

  return NextResponse.json({ timeLogs });
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { taskId, startTime } = createTimeLogSchema.parse(body);

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        userId,
        startTime: new Date(startTime)
      }
    });

    return NextResponse.json({ timeLog }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Time log creation error:', error);
    return NextResponse.json({ error: 'Failed to create time log' }, { status: 500 });
  }
}
