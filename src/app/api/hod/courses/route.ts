import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { faculty: { select: { name: true, email: true } } },
    orderBy: { semester: 'asc' }
  })
  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  const { code, title, credits, semester, facultyId } = await req.json()
  if (!code || !title) return NextResponse.json({ error: 'Code and title required' }, { status: 400 })
  const course = await prisma.course.create({
    data: { code, title, credits: credits || 3, semester: semester || 1, facultyId: facultyId || null }
  })
  return NextResponse.json(course, { status: 201 })
}
