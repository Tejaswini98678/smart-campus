import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { studentId, status, subject } = await request.json()

    if (!studentId || !status || !subject) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        status,
        subject,
        date: new Date() // Prisma handles default now(), but we can specify
      }
    })

    return NextResponse.json({ message: 'Attendance marked', attendance })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}
