import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    include: {
      attendance: true,
      grades: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  const courses = await prisma.course.findMany();
  const courseMap = courses.reduce((acc: any, c: any) => {
    acc[c.title.toLowerCase()] = c.credits;
    acc[c.code.toLowerCase()] = c.credits;
    return acc;
  }, {});

  const enriched = students.map((s: any) => {
    const total = s.attendance.length
    const present = s.attendance.filter((a: any) => a.status === 'PRESENT').length
    
    // Compute CGPA via 10-point credit-weighted scale
    let gpa = null;
    if (s.grades && s.grades.length > 0) {
      let totalPoints = 0;
      let totalCredits = 0;
      s.grades.forEach((g: any) => {
        const credits = courseMap[g.subject.toLowerCase()] || 3; // Fallback to 3 credits
        let points = 0;
        if (g.score >= 90) points = 10;
        else if (g.score >= 80) points = 9;
        else if (g.score >= 70) points = 8;
        else if (g.score >= 60) points = 7;
        else if (g.score >= 50) points = 6;
        else points = 0;
        
        totalPoints += points * credits;
        totalCredits += credits;
      });
      gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null;
    }
    
    return {
      id: s.id, name: s.name, email: s.email, rollNumber: s.rollNumber,
      branch: s.branch, batch: s.batch, mentor: s.mentor,
      examBlocked: s.examBlocked,
      attendancePct: total > 0 ? Math.round((present / total) * 100) : 100,
      gpa,
      grades: s.grades
    }
  })
  return NextResponse.json(enriched)
}

export async function POST(req: Request) {
  const { name, email, password, rollNumber, branch, batch, mentor, dept } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const { default: bcrypt } = await import('bcryptjs')
  const hashed = await bcrypt.hash(password, 10)
  const student = await prisma.user.create({
    data: { name, email, password: hashed, role: 'student', rollNumber, branch, batch, mentor, dept: dept || 'CSE' }
  })
  return NextResponse.json({ id: student.id, name: student.name, email: student.email }, { status: 201 })
}
