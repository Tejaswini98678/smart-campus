import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const allFaculty = await prisma.user.findMany({
    where: { role: 'faculty' },
    orderBy: { createdAt: 'desc' }
  })
  // Load courses separately to avoid relation include issues
  const allCourses = await prisma.course.findMany({
    select: { id: true, title: true, code: true, facultyId: true }
  })
  return NextResponse.json(allFaculty.map(f => ({
    id: f.id, name: f.name, email: f.email, dept: f.dept,
    courses: allCourses.filter(c => c.facultyId === f.id).map(c => c.title)
  })))
}

export async function POST(req: Request) {
  const { name, email, password, dept } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const hashed = await bcrypt.hash(password, 10)
  const faculty = await prisma.user.create({
    data: { name, email, password: hashed, role: 'faculty', dept: dept || 'CSE' }
  })
  return NextResponse.json({ id: faculty.id, name: faculty.name }, { status: 201 })
}
