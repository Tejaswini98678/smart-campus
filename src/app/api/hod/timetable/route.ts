import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await prisma.scheduleItem.findMany({
    include: { faculty: { select: { name: true } } },
    orderBy: [{ day: 'asc' }, { time: 'asc' }]
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { facultyId, subject, time, room, day, period } = await req.json()
  if (!subject || !room || !day) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  // Find first faculty if not provided
  let fid = facultyId
  if (!fid) {
    const f = await prisma.user.findFirst({ where: { role: 'faculty' } })
    fid = f?.id
  }
  if (!fid) return NextResponse.json({ error: 'No faculty found' }, { status: 400 })
  const t = time || (period ? `Period ${period}` : 'TBD')
  const item = await (prisma as any).scheduleItem.create({ data: { facultyId: fid, subject, time: t, room, day, period: period ?? null } })
  return NextResponse.json(item, { status: 201 })
}
