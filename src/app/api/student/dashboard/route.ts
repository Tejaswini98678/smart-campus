import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    const [student, attendance, grades, schedule, announcements] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentId }, select: { examBlocked: true, name: true, rollNumber: true, branch: true, batch: true, mentor: true } }),
      prisma.attendance.findMany({ where: { studentId }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.grade.findMany({ where: { studentId }, orderBy: { date: 'desc' } }),
      prisma.scheduleItem.findMany({ orderBy: { time: 'asc' } }),
      prisma.announcement.findMany({
        where: { audience: { in: ['ALL', 'STUDENTS'] } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    return NextResponse.json({ attendance, grades, schedule, examBlocked: student?.examBlocked ?? false, announcements })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
