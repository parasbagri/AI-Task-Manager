import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
});

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
      timeLogs: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const tasksWithTime = tasks.map(task => {
    const completedLogs = task.timeLogs.filter(log => log.endTime !== null);
    const activeLogs = task.timeLogs.filter(log => log.endTime === null);
    
    const totalTime = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const activeTimer = activeLogs.length > 0 
      ? activeLogs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]
      : null;
    
    return {
      ...task,
      timeLogs: completedLogs,
      totalTime,
      activeTimeLog: activeTimer ? {
        id: activeTimer.id,
        startTime: activeTimer.startTime
      } : null
    };
  });

  return NextResponse.json({ tasks: tasksWithTime });
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, status } = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || 'PENDING',
        userId
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
