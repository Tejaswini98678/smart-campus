import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create JWT
    const token = await createToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    })

    const response = NextResponse.json({ 
      message: 'Nexus Synchronized', 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        dept: user.dept,
        branch: user.branch,
        rollNumber: user.rollNumber,
        batch: user.batch,
        mentor: user.mentor
      } 
    })

    // Set cookie
    response.cookies.set('nexus_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 2, // 2 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('LOGIN_ERROR:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
