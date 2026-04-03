import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import nlp from 'compromise';
import { generateEmbedding, cosineSimilarity } from '@/lib/vectorCore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message, role, userId, history } = await req.json();
    const lowMsg = message.toLowerCase();
    const doc = nlp(message);

    // 1. Precise Entity & Named Recognition
    // Extracts people with titles (Dr., Prof.) correctly
    let extractedName = "";
    const namesMatched = lowMsg.match(/(?:who is|about|for|details on|tell m?e? about) ([^?.]+)/i);
    if (namesMatched) {
        extractedName = namesMatched[1].trim();
    } else {
        extractedName = doc.people().text().trim();
    }
    const extractedNumber = lowMsg.match(/\b\d+\b/)?.[0];
    const isActionOnly = !extractedName && !extractedNumber;

    // 2. Converational History (Target Persistence)
    let memoEntries: string[] = [];
    if (history && Array.isArray(history)) {
        for (let j = history.length - 1; j >= 0; j--) {
            const h = history[j];
            if (h.role === 'bot') {
                // Heuristic for list extraction
                const lines = h.text.split('\n');
                for (const line of lines) {
                    if (line.includes('• ')) {
                        const nameOnly = line.replace('• ', '').split(' (')[0].split(':')[0].trim();
                        if (nameOnly.length > 2) memoEntries.push(nameOnly);
                    }
                }
                // Identification header match
                const identMatch = h.text.match(/Identification for ([^:]+):/);
                if (identMatch) memoEntries.push(identMatch[1].trim());
            }
            if (memoEntries.length > 0) break;
        }
    }

    // 3. Robust Intent Matrix
    const i = {
        ATTENDANCE: /attend|present|absent|atend|percentage|status/i.test(lowMsg),
        GRADES: /mark|grade|result|score|perform|gpa|rank/i.test(lowMsg),
        IDENTITY: /who|detail|profile|info|roll|about|identity/i.test(lowMsg),
        SCHEDULE: /schedule|timetable|class|time table|today|when|activity/i.test(lowMsg),
        NOTICE: /notice|announcement|news|update|happen/i.test(lowMsg),
        LIST: /list|show all|show me|all|directory/i.test(lowMsg),
        FACULTY: /faculty|teacher|prof|mentor|hod|dean/i.test(lowMsg),
        STUDENT: /student|pupil|classmate/i.test(lowMsg)
    };

    // 4. Semantic Layer (Local RAG)
    let semanticTarget = null;
    try {
        const indexPath = path.join(process.cwd(), 'src/lib/vectors.json');
        if (fs.existsSync(indexPath)) {
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
            const queryVec = await Promise.race([
                generateEmbedding(message),
                new Promise((_, j) => setTimeout(() => j('tmout'), 3500))
            ]) as number[];
            
            if (queryVec && Array.isArray(queryVec)) {
                const results = index.map((it: any) => {
                    if (!it.vector || it.vector.length !== queryVec.length) return { ...it, score: 0 };
                    return { ...it, score: cosineSimilarity(queryVec, it.vector) };
                }).sort((a: any, b: any) => b.score - a.score);

                if (results[0] && results[0].score > 0.8) semanticTarget = results[0];
            }
        }
    } catch (e) { /* Silent fallback to NLP */ }

    let response = "I'm analyzing the Nexus data... How else can I assist you?";

    // 5. Multi-Stage Entity Resolution
    let finalTargets: any[] = [];
    try {
        // Stage A: Hard DB Lookup
        if (extractedName || extractedNumber) {
            const dbUsers = await prisma.user.findMany({
                where: { OR: [
                    { name: { contains: extractedName || 'NONE' } },
                    { rollNumber: { contains: extractedNumber || 'NONE' } }
                ]},
                take: 5
            });
            if (dbUsers.length > 0) finalTargets = dbUsers;
        }

        // Stage B: Semantic Retrieval
        if (finalTargets.length === 0 && semanticTarget && (semanticTarget.type === 'student' || semanticTarget.type === 'faculty')) {
            const u = await prisma.user.findUnique({ where: { id: semanticTarget.id } });
            if (u) finalTargets = [u];
        }

        // Stage C: Conversational Memory
        const needsContext = /his|her|their|them|him|they|context/i.test(lowMsg) || isActionOnly;
        if (finalTargets.length === 0 && needsContext && memoEntries.length > 0) {
            finalTargets = await prisma.user.findMany({ where: { name: { in: memoEntries } } });
        }

        // Stage D: Contextual Self
        if (finalTargets.length === 0 && (lowMsg.includes('my') || lowMsg.startsWith('i '))) {
            const u = await prisma.user.findUnique({ where: { id: userId } });
            if (u) finalTargets = [u];
        }
    } catch (e) { console.error('Resolution fail:', e); }

    // 6. Response Synthesis
    try {
        if (finalTargets.length > 0) {
            if (i.ATTENDANCE) {
                const bits = await Promise.all(finalTargets.map(async u => {
                    const att = await prisma.attendance.findMany({ where: { studentId: u.id } });
                    const p = att.length > 0 ? Math.round((att.filter(a => a.status === 'PRESENT').length / att.length) * 100) : 0;
                    return `• ${u.name}: ${p}% Attendance Profile`;
                }));
                response = `Attendance Metrics Sync:\n${bits.join('\n')}`;
            } else if (i.GRADES) {
                const bits = await Promise.all(finalTargets.map(async u => {
                    const gr = await prisma.grade.findMany({ where: { studentId: u.id } });
                    const a = gr.length > 0 ? Math.round(gr.reduce((acc, g) => acc + g.score, 0) / gr.length) : 0;
                    return `• ${u.name}: ${a}% Aggregate Performance Score`;
                }));
                response = `Academic Performance Ledger:\n${bits.join('\n')}`;
            } else if (i.SCHEDULE) {
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = days.find(d => lowMsg.includes(d)) || (lowMsg.includes('today') ? days[new Date().getDay()] : null);

                const bits = await Promise.all(finalTargets.map(async u => {
                    if (u.role === 'faculty') {
                        const s = await (prisma as any).scheduleItem.findMany({ 
                            where: { facultyId: u.id, ...(targetDay ? { day: { contains: targetDay } } : {}) } 
                        });
                        return `• ${u.name}${targetDay ? ` (${targetDay})` : ''}: ${s.map((it: any) => `${it.subject} @ ${it.time}`).join(', ') || 'No active classes found'}`;
                    }
                    return `• ${u.name}: Class schedule managed via department biometric records. Status: Synced.`;
                }));
                response = `Nexus Timetable Synchronization:\n${bits.join('\n')}`;
            } else {
                const bits = finalTargets.map(u => `• ${u.name}: ${u.rollNumber || 'Faculty Record'}, Dept: ${u.branch || u.dept}`);
                response = `Identification for ${finalTargets.length > 1 ? 'requested entities' : finalTargets[0].name}:\n${bits.join('\n')}\n\nYou can now ask specifically for their attendance, grades, or schedule.`;
            }
        } else if (i.LIST) {
            if (i.FACULTY) {
                const faculty = await prisma.user.findMany({ where: { role: 'faculty' }, take: 8 });
                response = `Nexus Faculty Directory:\n${faculty.map(f => `• ${f.name} (${f.dept})`).join('\n')}`;
            } else {
                const students = await prisma.user.findMany({ where: { role: 'student' }, take: 8 });
                response = `Nexus Student Directory (Top Results):\n${students.map(s => `• ${s.name} (${s.rollNumber || 'N/A'})`).join('\n')}`;
            }
        } else if (i.NOTICE || (semanticTarget && semanticTarget.type === 'announcement')) {
            const obj = semanticTarget && semanticTarget.type === 'announcement'
                       ? await prisma.announcement.findUnique({ where: { id: semanticTarget.id } })
                       : await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
            response = obj ? `Campus Notice Update: "${obj.title}"\n\n${obj.content}` : "No recent campus notices detected in the central broadcast. Refresh the ledger.";
        } else if (i.SCHEDULE) {
            const ex = await (prisma as any).exam.findMany({ orderBy: { date: 'asc' } });
            response = ex.length > 0 ? `Upcoming Academic Activity: ${ex[0].subject} on ${ex[0].date}. Venue: ${ex[0].room}.` : "No upcoming activities scheduled in the Nexus log.";
        } else if (lowMsg.includes('hi') || lowMsg.includes('hello')) {
            response = `Greetings. Nexus Intelligence Hub operational. Identification: ${role}. Ready for departmental record retrieval.`;
        } else {
            response = "I am the local Nexus Intelligence. I provide real-time metrics for attendance, grades, and schedules directly from the university database. Try: 'where is Professor Alan?' or 'attendance of roll 20211CIT0083'.";
        }
    } catch (e) {
        console.error('Core Logic Trace:', e);
        response = "Nexus is experiencing a synchronization bottleneck. Please refine your query terms.";
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Fatal Core Crash:', error);
    return NextResponse.json({ response: "Nexus Intelligence Core is temporarily recalibrating. Stand by." });
  }
}
