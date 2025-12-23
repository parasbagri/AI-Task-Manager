import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import dayjs from 'dayjs';

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const targetDate = dateParam ? dayjs(dateParam) : dayjs();
  const startOfDay = targetDate.startOf('day').toDate();
  const endOfDay = targetDate.endOf('day').toDate();

  const allTasks = await prisma.task.findMany({
    where: { userId },
    include: {
      timeLogs: {
        where: {
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          endTime: { not: null }
        }
      }
    }
  });

  const activeTimeLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      endTime: null
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true
        }
      }
    }
  });

  const timeLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      endTime: { not: null }
    },
    include: {
      task: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  const totalTime = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = new Set(activeTimeLogs.map(log => log.task.id)).size;
  const pendingTasks = allTasks.filter(t => t.status === 'PENDING').length;

  const tasksWorkedOn = [...new Set(timeLogs.map(log => log.task.id))];

  return NextResponse.json({
    date: targetDate.format('YYYY-MM-DD'),
    totalTime,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    tasksWorkedOn: tasksWorkedOn.length,
    activeTimers: activeTimeLogs.map(log => ({
      id: log.id,
      taskId: log.task.id,
      taskTitle: log.task.title,
      startTime: log.startTime,
      elapsedTime: Math.floor((new Date().getTime() - new Date(log.startTime).getTime()) / 1000)
    })),
    timeLogs: timeLogs.map(log => ({
      id: log.id,
      taskTitle: log.task.title,
      startTime: log.startTime,
      endTime: log.endTime,
      duration: log.duration
    }))
  });
}
