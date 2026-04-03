import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { studentId, blocked } = await req.json()
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })
  // Use raw update to bypass type checking for new fields
  const updated = await (prisma.user.update as any)({
    where: { id: studentId },
    data: { examBlocked: Boolean(blocked) }
  })
  return NextResponse.json({ id: updated.id, examBlocked: updated.examBlocked })
}

// Bulk block/unblock students
export async function PUT(req: Request) {
  const { threshold = 75, mode = 'block' } = await req.json()
  
  if (mode === 'unblock') {
    await (prisma.user.updateMany as any)({
      where: { role: 'student' },
      data: { examBlocked: false }
    })
    return NextResponse.json({ unblocked: true })
  }

  const students = await prisma.user.findMany({
    where: { role: 'student' },
    include: { attendance: true }
  })
  const toBlock = students.filter((s: any) => {
    const total = s.attendance.length
    if (total === 0) return false
    const present = s.attendance.filter((a: any) => a.status === 'PRESENT').length
    return (present / total) * 100 < threshold
  })
  if (toBlock.length === 0) return NextResponse.json({ blocked: 0 })
  await (prisma.user.updateMany as any)({
    where: { id: { in: toBlock.map((s: any) => s.id) } },
    data: { examBlocked: true }
  })
  return NextResponse.json({ blocked: toBlock.length })
}
