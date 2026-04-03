import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  return NextResponse.json(announcements)
}

export async function POST(req: Request) {
  const { title, content, audience, authorId } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  const ann = await prisma.announcement.create({
    data: { title, content, audience: audience || 'ALL', authorId: authorId || 'hod' }
  })
  return NextResponse.json(ann, { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ message: 'Announcement deleted' })
}
