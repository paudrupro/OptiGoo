import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';

export async function POST(req: NextRequest) {
  const { ids, mode, format } = (await req.json()) as {
    ids?: string[];
    mode: 'all' | 'filtered' | 'selected';
    format: 'csv' | 'json';
  };

  let companies;
  if (mode === 'selected' && ids && ids.length > 0) {
    companies = await prisma.company.findMany({ where: { id: { in: ids } } });
  } else {
    companies = await prisma.company.findMany();
  }

  if (format === 'json') {
    return NextResponse.json({ rows: companies });
  }

  const csv = stringify(companies, { header: true });
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="prospects.csv"'
    }
  });
}
