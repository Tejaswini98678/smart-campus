import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { studentId, subject, score } = await request.json()

    if (!studentId || !subject || score === undefined) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        score: parseInt(score)
      }
    })

    return NextResponse.json({ message: 'Grade updated', grade })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 })
  }
}
