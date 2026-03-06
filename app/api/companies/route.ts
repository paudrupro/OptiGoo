import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const searchRunId = searchParams.get('searchRunId');
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 20);

  const filters = {
    minReviews: searchParams.get('minReviews'),
    maxReviews: searchParams.get('maxReviews'),
    minRating: searchParams.get('minRating'),
    maxRating: searchParams.get('maxRating'),
    withWebsite: searchParams.get('withWebsite'),
    withPhone: searchParams.get('withPhone'),
    minScore: searchParams.get('minScore'),
    category: searchParams.get('category'),
    city: searchParams.get('city')
  };

  const where: Record<string, unknown> = {};
  if (searchRunId) where.searchRunId = searchRunId;

  if (filters.minReviews || filters.maxReviews) {
    where.reviewsCount = {
      gte: filters.minReviews ? Number(filters.minReviews) : undefined,
      lte: filters.maxReviews ? Number(filters.maxReviews) : undefined
    };
  }

  if (filters.minRating || filters.maxRating) {
    where.rating = {
      gte: filters.minRating ? Number(filters.minRating) : undefined,
      lte: filters.maxRating ? Number(filters.maxRating) : undefined
    };
  }

  if (filters.withWebsite === 'true') where.website = { not: null };
  if (filters.withWebsite === 'false') where.website = null;
  if (filters.withPhone === 'true') where.phone = { not: null };
  if (filters.withPhone === 'false') where.phone = null;
  if (filters.minScore) where.opportunityScore = { gte: Number(filters.minScore) };
  if (filters.category) where.category = { contains: filters.category, mode: 'insensitive' };
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

  const [total, rows] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy: { opportunityScore: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return NextResponse.json({ total, page, pageSize, rows });
}
