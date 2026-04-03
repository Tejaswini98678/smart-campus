import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import prisma from '@/lib/prisma';

async function getUser() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: { userId: user.id as string },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leaves);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { type, reason, startDate, endDate } = await req.json();

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.id as string,
        type,
        reason,
        startDate,
        endDate,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, leave });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}
