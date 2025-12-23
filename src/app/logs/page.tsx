import React from 'react';
import LogsClient from './LogsClient';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { headers } from 'next/headers';

// We need to mock the request object for getUserIdFromRequest since we are in a server component
// and getUserIdFromRequest expects a Request object.
// Alternatively, we can extract the token from cookies directly here.

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    redirect('/login');
  }

  const timeLogs = await prisma.timeLog.findMany({
    where: { userId: payload.userId },
    include: {
      task: { select: { id: true, title: true } }
    },
    orderBy: { startTime: 'desc' }
  });

  // Convert dates to strings for serialization
  const serializedTimeLogs = timeLogs.map(log => ({
    ...log,
    startTime: log.startTime.toISOString(),
    endTime: log.endTime ? log.endTime.toISOString() : null,
  }));

  return <LogsClient initialTimeLogs={serializedTimeLogs} />;
}
