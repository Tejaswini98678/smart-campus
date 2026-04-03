import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.course.update({
    where: { id },
    data: { title: body.title, credits: body.credits, semester: body.semester, facultyId: body.facultyId || null }
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
