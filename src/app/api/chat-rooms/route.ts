import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Ensure a default General room always exists
async function ensureGeneralRoom() {
  try {
    const chatRoomModel = (prisma as any).chatRoom || (prisma as any).ChatRoom
    if (!chatRoomModel) throw new Error("ChatRoom model not found on Prisma Client")

    let room = await chatRoomModel.findFirst({ where: { name: 'General', type: 'group' } })
    if (!room) {
      room = await chatRoomModel.create({ data: { name: 'General', type: 'group', participantIds: '' } })
    }
    return room
  } catch (e) {
    console.error("Error ensuring general room:", e)
    return null
  }
}

export async function GET() {
  await ensureGeneralRoom()
  const rooms = await (prisma as any).chatRoom.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(rooms)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('--- ChatRoom POST Body ---', body)
    const { type, name, participantIds, email, senderId } = body

    const userModel = prisma.user
    const chatRoomModel = (prisma as any).chatRoom || (prisma as any).ChatRoom

    if (!senderId) return NextResponse.json({ error: 'senderId required' }, { status: 400 })

    // Create DM via email
    if (email) {
      console.log('Resolving DM for email:', email)
      const recipient = await userModel.findUnique({ where: { email } })
      if (!recipient) return NextResponse.json({ error: 'User not found in Nexus Directory' }, { status: 404 })
      if (recipient.id === senderId) return NextResponse.json({ error: 'Deep protocol prevents self-connection' }, { status: 400 })

      const sortedIds = [senderId, recipient.id].sort().join(',')
      const existing = await chatRoomModel.findFirst({
        where: { type: 'dm', participantIds: sortedIds }
      })
      if (existing) return NextResponse.json(existing)

      const sender = await userModel.findUnique({ where: { id: senderId } })
      if (!sender) return NextResponse.json({ error: 'Authorized sender not found' }, { status: 404 })

      const newRoom = await chatRoomModel.create({
        data: {
          name: `${sender.name}, ${recipient.name}`,
          type: 'dm',
          participantIds: sortedIds
        }
      })
      return NextResponse.json(newRoom, { status: 201 })
    }

    // Standard room creation
    if (!name) return NextResponse.json({ error: 'Identifier (name) required' }, { status: 400 })

    const newRoom = await chatRoomModel.create({
      data: {
        name,
        type: type || 'group',
        participantIds: Array.isArray(participantIds) ? participantIds.join(',') : String(participantIds || senderId)
      }
    })
    return NextResponse.json(newRoom, { status: 201 })
  } catch (err: any) {
    console.error('CRITICAL ChatRoom API Error:', err)
    return NextResponse.json({ 
      error: 'Transmission Interrupted', 
      details: err.message,
      prismaKeys: Object.keys(prisma).filter(k => !k.startsWith('_')),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })

    const chatRoomModel = (prisma as any).chatRoom || (prisma as any).ChatRoom
    
    // Safety: Protect General room
    const room = await chatRoomModel.findUnique({ where: { id: roomId } })
    if (room?.name === 'General') {
      return NextResponse.json({ error: 'The Nexus Core (General) cannot be dismantled.' }, { status: 403 })
    }

    await chatRoomModel.delete({ where: { id: roomId } })
    
    return NextResponse.json({ success: true, message: 'Transmission history purged.' })
  } catch (err: any) {
    console.error('DELETE ChatRoom Error:', err)
    return NextResponse.json({ error: 'Purge operation failed', details: err.message }, { status: 500 })
  }
}
