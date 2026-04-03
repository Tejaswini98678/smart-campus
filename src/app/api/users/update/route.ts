import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, email, password, name, dept, branch, rollNumber, batch, mentor } = data

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (dept !== undefined) updateData.dept = dept
    if (branch !== undefined) updateData.branch = branch
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber
    if (batch !== undefined) updateData.batch = batch
    if (mentor !== undefined) updateData.mentor = mentor

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Do not return the hashed password in the response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ 
      message: 'Profile updated successfully', 
      user: userWithoutPassword 
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('UPDATE_PROFILE_ERROR:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
