import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet)

    if (!rows.length) return NextResponse.json({ error: 'Empty spreadsheet' }, { status: 400 })

    const results = { created: 0, skipped: 0, errors: [] as string[] }
    const defaultPassword = await bcrypt.hash('student123', 10)

    for (const row of rows) {
      const email = String(row['Email'] || row['email'] || '').trim()
      const name = String(row['Name'] || row['name'] || '').trim()
      if (!email || !name) { results.skipped++; continue }

      try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) { results.skipped++; continue }

        await prisma.user.create({
          data: {
            email,
            name,
            password: row['Password'] ? await bcrypt.hash(String(row['Password']), 10) : defaultPassword,
            role: 'student',
            rollNumber: String(row['RollNumber'] || row['Roll Number'] || row['rollNumber'] || ''),
            branch: String(row['Branch'] || row['branch'] || ''),
            batch: String(row['Batch'] || row['batch'] || ''),
            mentor: String(row['Mentor'] || row['mentor'] || ''),
            dept: String(row['Dept'] || row['dept'] || row['Department'] || 'CSE'),
          }
        })
        results.created++
      } catch (e: any) {
        results.errors.push(`${email}: ${e.message}`)
      }
    }

    return NextResponse.json({
      message: `Import complete`,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors.slice(0, 5)
    })
  } catch (error) {
    console.error('BULK_UPLOAD_ERROR', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
