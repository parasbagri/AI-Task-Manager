import { NextResponse } from 'next/server';
import { enhanceTaskWithAI } from '@/lib/ai';
import { getUserIdFromRequest } from '@/lib/auth';
import { z } from 'zod';

const enhanceSchema = z.object({
  userInput: z.string().min(1)
});

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userInput } = enhanceSchema.parse(body);
    console.log('Received user input for AI enhancement:', userInput);

    const enhanced = await enhanceTaskWithAI(userInput);
    console.log('Enhanced task from AI:', enhanced);

    return NextResponse.json({ ...enhanced });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('AI enhance error:', error);
    return NextResponse.json({ error: 'Failed to enhance task' }, { status: 500 });
  }
}
