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
  if (!user || user.role !== 'HOD') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: { select: { name: true, role: true, rollNumber: true, dept: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leaves);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'HOD') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status } = await req.json();

    if (!['APPROVED', 'DENIED'].includes(status)) {
         return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, leave: updatedLeave });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update leave' }, { status: 500 });
  }
}
