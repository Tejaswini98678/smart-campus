import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })

  const messageModel = (prisma as any).message || (prisma as any).Message
  const messages = await messageModel.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })
  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const { senderId, senderName, senderRole, content, roomId, fileData, fileName, fileType, isPriority } = await req.json()
  
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })
  if (!content?.trim() && !fileData) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const messageModel = (prisma as any).message || (prisma as any).Message
  const msg = await messageModel.create({
    data: { 
      senderId, 
      senderName, 
      senderRole, 
      content: content?.trim() || "", 
      roomId,
      fileData,
      fileName,
      fileType,
      isPriority: !!isPriority
    }
  })
  return NextResponse.json(msg, { status: 201 })
}
