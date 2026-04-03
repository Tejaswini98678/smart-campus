import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SmartCampus database...');

  // Clean slate
  await prisma.announcement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.user.deleteMany();


  // Hash passwords
  const studentPass = await bcrypt.hash('student123', 12);
  const facultyPass = await bcrypt.hash('faculty123', 12);
  const hodPass = await bcrypt.hash('hod123', 12);

  // ─── HOD ────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'dean@smartcampus.edu',
      password: hodPass,
      name: 'Dean Mitchell',
      role: 'hod',
      dept: 'CSE',
    },
  });

  // ─── Faculty ────────────────────────────────────────────────
  const faculty1 = await prisma.user.create({
    data: {
      email: 'jane@smartcampus.edu',
      password: facultyPass,
      name: 'Dr. Jane Smith',
      role: 'faculty',
      dept: 'CSE',
    },
  });

  await prisma.user.create({
    data: {
      email: 'alan@smartcampus.edu',
      password: facultyPass,
      name: 'Prof. Alan Turing',
      role: 'faculty',
      dept: 'CSE',
    },
  });

  // ─── Schedule ───────────────────────────────────────────────
  await prisma.scheduleItem.createMany({
    data: [
      { facultyId: faculty1.id, subject: 'Machine Learning', time: '10:00 AM', room: 'B-201', day: 'Monday' },
      { facultyId: faculty1.id, subject: 'Web Development', time: '02:00 PM', room: 'C-402', day: 'Wednesday' },
      { facultyId: faculty1.id, subject: 'Database Systems', time: '11:00 AM', room: 'A-105', day: 'Friday' },
    ],
  });

  // ─── Students ───────────────────────────────────────────────
  const students = [
    {
      email: 'sharath@smartcampus.edu',
      name: 'M SHARATH',
      rollNumber: '20211CIT0083',
      branch: 'B.Tech CSE',
      batch: '2021-2025',
      mentor: 'Dr. Jane Smith',
    },
    {
      email: 'vinay@smartcampus.edu',
      name: 'BABU VINAY N',
      rollNumber: '20211CIT0097',
      branch: 'B.Tech CSE',
      batch: '2021-2025',
      mentor: 'Dr. Jane Smith',
    },
    {
      email: 'chethan@smartcampus.edu',
      name: 'CHETHANRAJ B R',
      rollNumber: '20211CIT0154',
      branch: 'B.Tech CSE',
      batch: '2021-2025',
      mentor: 'Prof. Alan Turing',
    },
  ];

  for (const s of students) {
    const student = await prisma.user.create({
      data: {
        email: s.email,
        password: studentPass,
        name: s.name,
        role: 'student',
        dept: 'CSE',
        branch: s.branch,
        rollNumber: s.rollNumber,
        batch: s.batch,
        mentor: s.mentor,
      },
    });

    // Grades — 6 subjects
    await prisma.grade.createMany({
      data: [
        { studentId: student.id, subject: 'Machine Learning', score: 88 },
        { studentId: student.id, subject: 'Web Development', score: 92 },
        { studentId: student.id, subject: 'Database Systems', score: 85 },
        { studentId: student.id, subject: 'Computer Networks', score: 79 },
        { studentId: student.id, subject: 'Operating Systems', score: 91 },
        { studentId: student.id, subject: 'Software Engineering', score: 94 },
      ],
    });

    // Attendance — 30 days, ~80-90% present
    const attendanceData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const status = Math.random() > 0.15 ? 'PRESENT' : 'ABSENT';
      attendanceData.push({ studentId: student.id, date, status, subject: 'Machine Learning' });
    }
    await prisma.attendance.createMany({ data: attendanceData });
  }

  // ─── Courses ────────────────────────────────────────────────
  const hod = await prisma.user.findFirst({ where: { role: 'hod' } });
  await prisma.course.createMany({
    data: [
      { code: 'CS301', title: 'Machine Learning', credits: 4, semester: 5 },
      { code: 'CS302', title: 'Web Development', credits: 3, semester: 5 },
      { code: 'CS303', title: 'Database Systems', credits: 3, semester: 4 },
      { code: 'CS401', title: 'Computer Networks', credits: 3, semester: 6 },
      { code: 'CS402', title: 'Operating Systems', credits: 4, semester: 4 },
      { code: 'CS403', title: 'Software Engineering', credits: 3, semester: 6 },
    ]
  });

  // ─── Announcements ──────────────────────────────────────────
  if (hod) {
    await prisma.announcement.createMany({
      data: [
        { title: 'End Semester Exams — Schedule Released', content: 'End semester exams for all branches start from May 2nd. Hall tickets will be distributed in class.', audience: 'STUDENTS', authorId: hod.id },
        { title: 'Internal Assessment Marks Submission', content: 'All faculty are requested to submit IA marks by April 20th via the portal.', audience: 'FACULTY', authorId: hod.id },
        { title: 'Campus Annual Day 2026', content: 'Annual Day celebrations are scheduled for April 15th. All students and faculty are encouraged to participate.', audience: 'ALL', authorId: hod.id },
      ]
    });
  }

  console.log('✅ Seeded successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  🎓 Student  — sharath@smartcampus.edu  /  student123');
  console.log('  👨‍🏫 Faculty  — jane@smartcampus.edu     /  faculty123');
  console.log('  🛡️  HOD      — dean@smartcampus.edu     /  hod123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
