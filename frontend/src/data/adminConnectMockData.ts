import { initialConnectTeachers, initialTeacherSubscribers } from '@/data/connectMockData';
import { HubFlag, HubSettings, Subscription, TeacherHub } from '@/types/lms';

const schoolId = 'sch_01';

export const initialTeacherHubs: TeacherHub[] = initialConnectTeachers.slice(0, 4).map((teacher, index) => ({
  id: `hub_${teacher.id}`,
  schoolId,
  teacherId: teacher.id,
  teacherName: teacher.name,
  subjects: [teacher.subject],
  subscriberCount: initialTeacherSubscribers.filter((subscriber) => subscriber.schoolId === schoolId && index === 0).length + teacher.studentsCount,
  postsThisMonth: [12, 9, 16, 7][index],
  status: 'active',
  recentActivity: index === 0 ? 'Posted a new calculus worksheet' : 'Hosted a live class'
}));

export const initialAdminSubscriptions: Subscription[] = initialTeacherSubscribers.map((subscriber, index) => ({
  id: subscriber.id,
  schoolId,
  teacherId: index % 2 === 0 ? 'ct_01' : 'ct_02',
  studentId: subscriber.studentId,
  studentName: subscriber.studentName,
  grade: subscriber.grade,
  subscribedDate: subscriber.subscribedDate,
  status: subscriber.status === 'expired' ? 'expired' : subscriber.status === 'pending_slip' ? 'pending' : 'active'
}));

export const initialHubFlags: HubFlag[] = [
  {
    id: 'flag_01',
    schoolId,
    teacherId: 'ct_01',
    teacherName: 'Ms. Kavitha Rajan',
    contentType: 'post',
    content: 'Post contains an external link requiring review.',
    createdAt: '2026-10-05 09:30',
    reason: 'External link',
    status: 'open'
  },
  {
    id: 'flag_02',
    schoolId,
    teacherId: 'ct_02',
    teacherName: 'Mr. Thuvaragan S.',
    contentType: 'message',
    content: 'Message reported by a student for inappropriate language.',
    createdAt: '2026-10-04 14:15',
    reason: 'Reported by student',
    status: 'open'
  }
];

export const initialHubSettings: HubSettings = {
  schoolId,
  enabled: true,
  approvalRequired: false,
  allowDirectMessages: true,
  maxSubscribersPerTeacher: undefined
};
