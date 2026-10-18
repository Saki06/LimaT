import { PrismaClient, Role, TenantStatus, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing records (optional, in order of dependencies)
  await prisma.sportsRegistration.deleteMany();
  await prisma.sportsEvent.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Tenants (Schools)
  const tenant1 = await prisma.tenant.create({
    data: {
      slug: 'apex-academy',
      name: 'Apex Academy Global',
      domain: 'apex.lms.edu',
      status: TenantStatus.ACTIVE,
      plan: 'ENTERPRISE',
      settings: { theme: 'navy-gold', timezone: 'Asia/Colombo' },
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      slug: 'springfield-science',
      name: 'Springfield Science Institute',
      domain: 'springfield.lms.edu',
      status: TenantStatus.ACTIVE,
      plan: 'PRO',
      settings: { theme: 'emerald-teal', timezone: 'Asia/Colombo' },
    },
  });

  console.log(`✅ Tenants created: ${tenant1.name}, ${tenant2.name}`);

  // 2. Create Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'superadmin@apex.edu',
      passwordHash,
      role: Role.SUPER_ADMIN,
      firstName: 'Chief',
      lastName: 'Administrator',
      avatarUrl: '/images/tutor_brush_portrait.jpg',
    },
  });

  // 3. Create Teacher & TeacherProfile
  const teacherUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'teacher@apex.edu',
      passwordHash,
      role: Role.TEACHER,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      avatarUrl: '/images/tutor_brush_portrait.jpg',
      teacherProfile: {
        create: {
          employeeNo: 'FAC-2026-08',
          specialization: 'Advanced Physics & AI',
        },
      },
    },
    include: { teacherProfile: true },
  });

  // 4. Create Parent & ParentProfile
  const parentUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'parent@apex.edu',
      passwordHash,
      role: Role.PARENT,
      firstName: 'Robert',
      lastName: 'Morgan',
      avatarUrl: '/images/parent_brush_portrait.jpg',
      parentProfile: {
        create: {
          phoneNumber: '+94 77 123 4567',
        },
      },
    },
    include: { parentProfile: true },
  });

  // 5. Create Student & StudentProfile (linked to parent)
  const studentUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'student@apex.edu',
      passwordHash,
      role: Role.STUDENT,
      firstName: 'Alex',
      lastName: 'Morgan',
      avatarUrl: '/images/student_brush_portrait.jpg',
      studentProfile: {
        create: {
          studentIdNo: 'STU-9904',
          gradeLevel: 'Grade 12-A',
          section: 'Physical Sciences',
          guardianId: parentUser.parentProfile?.id,
        },
      },
    },
    include: { studentProfile: true },
  });

  console.log('✅ Users & Profiles created (SuperAdmin, Teacher, Parent, Student)');

  // 6. Create Course
  if (teacherUser.teacherProfile) {
    const course = await prisma.course.create({
      data: {
        tenantId: tenant1.id,
        teacherId: teacherUser.teacherProfile.id,
        title: 'Quantum Mechanics & Modern Physics',
        code: 'PHY-301',
        description: 'Comprehensive study of wave-particle duality and Schrödinger equations.',
        enrollments: {
          create: {
            studentId: studentUser.studentProfile!.id,
            grade: 92.5,
          },
        },
      },
    });
    console.log(`✅ Course created: ${course.title}`);
  }

  // 7. Create Sports Events
  const sportsEvent1 = await prisma.sportsEvent.create({
    data: {
      tenantId: tenant1.id,
      title: 'Inter-House Cricket Championship 2026',
      sportType: 'Cricket',
      venue: 'Main Oval Ground',
      startDate: new Date('2026-11-15T09:00:00Z'),
      status: EventStatus.UPCOMING,
      registrations: {
        create: {
          userId: studentUser.id,
          jerseyNumber: 7,
          roleInTeam: 'All-Rounder',
          status: 'CONFIRMED',
          notes: 'Team Captain',
        },
      },
    },
  });

  const sportsEvent2 = await prisma.sportsEvent.create({
    data: {
      tenantId: tenant1.id,
      title: 'Annual Track & Field Meet 2026',
      sportType: 'Athletics',
      venue: 'National Sports Complex',
      startDate: new Date('2026-12-01T08:30:00Z'),
      status: EventStatus.UPCOMING,
    },
  });

  console.log(`✅ Sports events created: ${sportsEvent1.title}, ${sportsEvent2.title}`);

  // 8. Create Announcement
  await prisma.announcement.create({
    data: {
      tenantId: tenant1.id,
      title: 'Mid-Term Examination Schedule Published',
      content: 'All faculty and students are requested to check the revised timetable on the LMS portal.',
      targetRole: Role.STUDENT,
      isPinned: true,
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
