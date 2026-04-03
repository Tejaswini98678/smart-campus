import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateEmbedding } from '@/lib/vectorCore';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        console.log('🔍 Starting Nexus Indexting...');
        const students = await prisma.user.findMany({ where: { role: 'student' } });
        const faculty = await prisma.user.findMany({ where: { role: 'faculty' } });
        const announcements = await prisma.announcement.findMany();

        const dataToIndex = [
            ...students.map(s => ({ id: s.id, type: 'student', text: `Student ${s.name}, Roll Number ${s.rollNumber}, Branch ${s.branch}, Dept ${s.dept}, Batch ${s.batch}, Mentor ${s.mentor}. Interested in academic excellence and campus synchronization.` })),
            ...faculty.map(f => ({ id: f.id, type: 'faculty', text: `Faculty ${f.name}, Department of ${f.dept}. Specialized in academic oversight and departmental management. Part of the Nexus Core faculty.` })),
            ...announcements.map(a => ({ id: a.id, type: 'announcement', text: `Announcement titled "${a.title}" by author. Content summary: ${a.content}. Targeted at ${a.audience}.` }))
        ];

        const index = [];
        for (const item of dataToIndex) {
            console.log(`📡 Indexing ${item.type}: ${item.text.substring(0, 30)}...`);
            const vector = await generateEmbedding(item.text);
            index.push({ ...item, vector });
        }

        const indexPath = path.join(process.cwd(), 'src/lib/vectors.json');
        fs.writeFileSync(indexPath, JSON.stringify(index));

        return NextResponse.json({ success: true, message: `Nexus Synchronized. Indexed ${index.length} entities.` });
    } catch (error) {
        console.error('Indexing Error:', error);
        return NextResponse.json({ error: 'Sync Failed' }, { status: 500 });
    }
}
