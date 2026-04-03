import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, name, role, dept, branch, rollNumber, batch, mentor } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        dept,
        branch,
        rollNumber,
        batch,
        mentor
      }
    })

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 })
  } catch (error: any) {
    console.error('SIGNUP_ERROR:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already registered. Please use a different email.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
