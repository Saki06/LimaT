import { initialCourses, initialSubjects } from '@/data/mockData';
import { AdminDirectoryUser, AdminStaffRecord, AdminSubjectRecord } from '@/types/lms';

const schoolId = 'sch_01';

export const initialAdminStaff: AdminStaffRecord[] = [
  {
    id: 'staff_teacher_01',
    schoolId,
    name: 'Mr. Samantha Perera',
    email: 'samantha.p@school.lk',
    role: 'teacher',
    subjects: ['Combined Mathematics', 'Physics'],
    classes: ['12-Physical Science'],
    status: 'active',
    workload: 78,
    phone: '+94 71 234 5678',
    staffId: 'SMH-T-001',
    gender: 'male',
    joiningDate: '2022-01-10',
    qualification: 'BSc in Mathematics',
    medium: 'english'
  },
  {
    id: 'staff_teacher_02',
    schoolId,
    name: 'Mrs. N. Gunasekara',
    email: 'n.gunasekara@school.lk',
    role: 'teacher',
    subjects: ['Biology'],
    classes: ['12-Biological Science'],
    status: 'on_leave',
    workload: 52,
    phone: '+94 77 456 1234',
    staffId: 'SMH-T-002',
    gender: 'female',
    joiningDate: '2021-06-14',
    qualification: 'BSc in Biology',
    medium: 'english'
  },
  {
    id: 'staff_coach_01',
    schoolId,
    name: 'Mr. M. Faizal',
    email: 'm.faizal@school.lk',
    role: 'coach',
    sport: 'Cricket',
    teams: ['Under-17 First XI'],
    status: 'active',
    workload: 64,
    phone: '+94 76 345 6789',
    staffId: 'SMH-C-001',
    gender: 'male',
    joiningDate: '2023-02-01',
    certification: 'Level 2 Cricket Coaching',
    availability: 'Weekdays after 3:00 PM'
  },
  {
    id: 'staff_coach_02',
    schoolId,
    name: 'Ms. R. Fernando',
    email: 'r.fernando@school.lk',
    role: 'coach',
    sport: 'Athletics',
    teams: ['Junior Athletics'],
    status: 'active',
    workload: 43,
    phone: '+94 75 987 6543',
    staffId: 'SMH-C-002',
    gender: 'female',
    joiningDate: '2024-01-08',
    certification: 'National Athletics License',
    availability: 'Monday, Wednesday and Friday'
  },
  {
    id: 'staff_teacher_03',
    schoolId,
    name: 'Mr. D. Wijesinghe',
    email: 'd.wijesinghe@school.lk',
    staffId: 'SMH-T-003',
    role: 'teacher',
    subjects: ['Chemistry'],
    classes: ['Grade 11-A'],
    status: 'active',
    workload: 68,
    phone: '+94 78 222 3344',
    gender: 'male',
    joiningDate: '2020-08-17',
    qualification: 'BEd in Science',
    medium: 'sinhala'
  },
  {
    id: 'staff_coach_03',
    schoolId,
    name: 'Mr. A. Perera',
    email: 'a.perera@school.lk',
    staffId: 'SMH-C-003',
    role: 'coach',
    sport: 'Rugby',
    teams: ['Under-19 Rugby'],
    status: 'on_leave',
    workload: 57,
    phone: '+94 79 555 6677',
    gender: 'male',
    joiningDate: '2022-03-21',
    certification: 'Level 1 Rugby Coaching',
    availability: 'Tuesday and Thursday after 3:00 PM'
  }
];

export const initialAdminSubjects: AdminSubjectRecord[] = initialSubjects.map((subject) => {
  const course = initialCourses.find((item) => item.subjectId === subject.id);
  return {
    id: subject.id,
    schoolId,
    name: subject.name,
    code: subject.code,
    grades: [subject.gradeName],
    medium: 'english',
    assignedTeacherIds: course ? [course.teacherId] : [],
    assignedTeacherNames: course ? [course.teacherName] : [],
    units: course?.units ?? []
  };
});

export const initialAdminDirectory: AdminDirectoryUser[] = [
  {
    id: 'usr_student_01',
    schoolId,
    name: 'Sathurjan K.',
    email: 'sathurjan@school.lk',
    role: 'student',
    grade: 'Grade 12',
    className: '12-Physical Science',
    status: 'active',
    phone: '+94 70 111 2233'
  },
  {
    id: 'usr_teacher_01',
    schoolId,
    name: 'Mr. Samantha Perera',
    email: 'samantha.p@school.lk',
    role: 'teacher',
    status: 'active',
    phone: '+94 71 234 5678'
  },
  {
    id: 'usr_admin_01',
    schoolId,
    name: 'Dr. K. Rajasingham',
    email: 'principal@school.lk',
    role: 'admin',
    status: 'active',
    phone: '+94 72 333 4455'
  },
  {
    id: 'staff_coach_01',
    schoolId,
    name: 'Mr. M. Faizal',
    email: 'm.faizal@school.lk',
    role: 'coach',
    status: 'active',
    phone: '+94 76 345 6789'
  }
];
