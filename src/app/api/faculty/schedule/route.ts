import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, subject, time, room, day } = await request.json()

    if (!facultyId || !subject || !time || !room || !day) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        facultyId,
        subject,
        time,
        room,
        day
      }
    })

    return NextResponse.json({ message: 'Schedule updated', scheduleItem })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}
