import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const templateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['email', 'sms']),
  subject: z.string().optional(),
  body: z.string().min(5)
});

export async function GET() {
  const templates = await prisma.messageTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const parsed = templateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const template = await prisma.messageTemplate.create({ data: parsed.data });
  return NextResponse.json({ template });
}
