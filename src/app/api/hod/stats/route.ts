import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [totalStudents, totalFaculty, totalCourses, totalAnnouncements] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'faculty' } }),
    prisma.course.count(),
    prisma.announcement.count(),
  ])

  // Students below 75% attendance & blocked
  const allStudents = await prisma.user.findMany({
    where: { role: 'student' },
    include: { attendance: true }
  })

  let lowAttendance = 0
  let blockedStudents = 0
  for (const s of allStudents) {
    if (s.examBlocked) blockedStudents++
    const total = s.attendance.length
    if (total > 0) {
      const present = s.attendance.filter((a: any) => a.status === 'PRESENT').length
      if ((present / total) * 100 < 75) lowAttendance++
    }
  }

  return NextResponse.json({ students: totalStudents, faculty: totalFaculty, courses: totalCourses, announcements: totalAnnouncements, blockedStudents, lowAttendance })
}
