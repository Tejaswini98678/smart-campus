import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { subject, date, time, room } = await req.json();
    if (!subject || !date || !time || !room) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const exam = await prisma.exam.create({
      data: { subject, date, time, room }
    });
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
