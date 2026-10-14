import {
  User,
  School,
  GradeLevel,
  SchoolClass,
  Subject,
  Course,
  Assignment,
  StudentSubmission,
  Quiz,
  Sport,
  SportsTeam,
  Fixture,
  Standing,
  Tournament,
  SchoolEvent,
  Announcement,
  LibraryResource,
  ExamItem,
  ExamTermResult
} from '@/types/lms';

export const mockUsers: Record<string, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Sathurjan K.',
    email: 'sathurjan@school.lk',
    role: 'student',
    grade: 'Grade 12',
    class: '12-Physical Science',
    schoolId: 'sch_01',
    schoolName: 'St. Michael High School'
  },
  teacher: {
    id: 'usr_teacher_01',
    name: 'Mr. Samantha Perera',
    email: 'samantha.p@school.lk',
    role: 'teacher',
    schoolId: 'sch_01',
    schoolName: 'St. Michael High School'
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. K. Rajasingham',
    email: 'principal@school.lk',
    role: 'admin',
    schoolId: 'sch_01',
    schoolName: 'St. Michael High School'
  },
  super_admin: {
    id: 'usr_super_admin_01',
    name: 'SaaS Platform Owner',
    email: 'director@limat.lk',
    role: 'super_admin',
    schoolId: 'global_platform',
    schoolName: 'LimaT Smart Book Multi-Tenant Platform'
  },
  parent: {
    id: 'usr_parent_01',
    name: 'Mrs. Priyadarshani Kulatunga',
    email: 'priya.k@gmail.com',
    role: 'parent',
    schoolId: 'sch_01',
    schoolName: 'St. Michael High School'
  }
};

export const initialSchools: School[] = [
  {
    id: 'sch_01',
    name: 'St. Michael High School',
    code: 'SMH-042',
    district: 'Colombo',
    province: 'Western',
    principal: 'Dr. K. Rajasingham',
    studentCount: 1420,
    teacherCount: 86
  },
  {
    id: 'sch_02',
    name: 'Hillwood Central College',
    code: 'HCC-108',
    district: 'Kandy',
    province: 'Central',
    principal: 'Mrs. D. Wickramasinghe',
    studentCount: 980,
    teacherCount: 62
  }
];

export const initialGrades: GradeLevel[] = [
  { id: 'grd_10', name: 'Grade 10', code: 'G10' },
  { id: 'grd_11', name: 'Grade 11 (O/L)', code: 'G11' },
  { id: 'grd_12', name: 'Grade 12 (A/L)', code: 'G12' }
];

export const initialClasses: SchoolClass[] = [
  {
    id: 'cls_12_sci',
    name: '12-Physical Science',
    gradeId: 'grd_12',
    gradeName: 'Grade 12 (A/L)',
    classTeacherId: 'usr_teacher_01',
    classTeacherName: 'Mr. Samantha Perera',
    studentCount: 38
  },
  {
    id: 'cls_12_bio',
    name: '12-Biological Science',
    gradeId: 'grd_12',
    gradeName: 'Grade 12 (A/L)',
    classTeacherId: 'usr_teacher_02',
    classTeacherName: 'Mrs. N. Gunasekara',
    studentCount: 42
  },
  {
    id: 'cls_11_a',
    name: '11-A',
    gradeId: 'grd_11',
    gradeName: 'Grade 11 (O/L)',
    classTeacherId: 'usr_teacher_03',
    classTeacherName: 'Mr. M. Faizal',
    studentCount: 40
  }
];

export const initialSubjects: Subject[] = [
  { id: 'sub_math', name: 'Combined Mathematics', code: 'CMATH-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-blue-600 to-indigo-700' },
  { id: 'sub_phy', name: 'Physics', code: 'PHY-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-cyan-600 to-blue-700' },
  { id: 'sub_chem', name: 'Chemistry', code: 'CHEM-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-emerald-600 to-teal-700' },
  { id: 'sub_ict', name: 'Information & Comm. Tech', code: 'ICT-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-purple-600 to-indigo-800' },
  { id: 'sub_bio', name: 'Biology', code: 'BIO-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-green-600 to-emerald-800' },
  { id: 'sub_eng', name: 'General English', code: 'ENG-12', gradeId: 'grd_12', gradeName: 'Grade 12 (A/L)', color: 'from-amber-600 to-orange-700' }
];

export const initialCourses: Course[] = [
  {
    id: 'crs_math_12',
    subjectId: 'sub_math',
    title: 'Combined Mathematics 12',
    code: 'CMATH-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Mr. Samantha Perera',
    gradeName: 'Grade 12 (A/L)',
    className: '12-Physical Science',
    bannerColor: 'bg-gradient-to-r from-indigo-600 to-blue-600',
    totalLessons: 12,
    completedLessons: 8,
    units: [
      {
        id: 'unt_m1',
        subjectId: 'sub_math',
        title: 'Unit 1: Functions, Polynomials & Real Numbers',
        order: 1,
        topics: [
          {
            id: 'top_m1_1',
            unitId: 'unt_m1',
            title: 'Topic 1.1: Quadratic Functions & Discriminant Theory',
            description: 'Roots nature, discriminant conditions, and graphical transformations.',
            order: 1,
            lessons: [
              {
                id: 'les_m1_1_1',
                topicId: 'top_m1_1',
                title: 'Lesson 1: Quadratic Equations & The Discriminant Delta',
                description: 'Deep dive into Δ > 0, Δ = 0, Δ < 0 and root bounds.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `A quadratic equation is given by ax² + bx + c = 0 where a ≠ 0.

Key Insights:
1. The Discriminant Δ = b² - 4ac governs the nature of roots.
2. If Δ > 0: Two distinct real roots exist.
3. If Δ = 0: Exactly one repeated (double) real root exists.
4. If Δ < 0: Conjugate complex roots with no real intersections on the x-axis.

Standard Form & Vertex:
f(x) = a(x - h)² + k where vertex (h, k) = (-b / (2a), -(b² - 4ac) / (4a)).

Practice Example:
Find the range of k such that 2x² + kx + 8 = 0 has distinct real roots.
Solution:
Δ = k² - 4(2)(8) = k² - 64 > 0
Therefore, k > 8 or k < -8.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Quadratic_Theory_Summary.pdf', size: '1.4 MB', type: 'PDF' },
                  { name: 'Lecture_SlideDeck_01.pptx', size: '4.8 MB', type: 'PPTX' }
                ]
              },
              {
                id: 'les_m1_1_2',
                topicId: 'top_m1_1',
                title: 'Lesson 2: Sign of Quadratic Expressions & Inequations',
                description: 'Solving f(x) > 0 and f(x) <= 0 using interval sign charts.',
                order: 2,
                status: 'published',
                contentType: 'slides',
                slidesCount: 14,
                contentBody: `Sign of ax² + bx + c:
When Δ < 0, the quadratic expression has the same sign as coefficient 'a' for all real x!
- If a > 0 and Δ < 0: ax² + bx + c is strictly positive for all x ∈ ℝ.
- If a < 0 and Δ < 0: ax² + bx + c is strictly negative for all x ∈ ℝ.

This fundamental theorem is frequently tested in A/L Combined Mathematics Part B.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Sign_Analysis_Cheatsheet.pdf', size: '820 KB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'unt_m2',
        subjectId: 'sub_math',
        title: 'Unit 2: Differential Calculus & Curve Sketching',
        order: 2,
        topics: [
          {
            id: 'top_m2_1',
            unitId: 'unt_m2',
            title: 'Topic 2.1: First Principles & Product/Quotient Rules',
            description: 'Derivative definition via limits and fundamental differentiation rules.',
            order: 1,
            lessons: [
              {
                id: 'les_m2_1_1',
                topicId: 'top_m2_1',
                title: 'Lesson 3: Differentiation from First Principles',
                description: 'Deriving dy/dx = lim_{h->0} [f(x+h) - f(x)] / h.',
                order: 1,
                status: 'published',
                contentType: 'video',
                videoUrl: 'https://youtube.com/watch?v=mock_calculus',
                contentBody: `Welcome to Differential Calculus. In this lesson, we prove the derivatives of sin(x), cos(x), and x^n from first principles.
Review the video segment above and ensure you work through the accompanying worksheet.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'First_Principles_Proof_Pack.pdf', size: '2.1 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_phy_12',
    subjectId: 'sub_phy',
    title: 'Physics 12',
    code: 'PHY-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Mr. Samantha Perera',
    gradeName: 'Grade 12 (A/L)',
    className: '12-Physical Science',
    bannerColor: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    totalLessons: 16,
    completedLessons: 11,
    units: [
      {
        id: 'unt_p1',
        subjectId: 'sub_phy',
        title: 'Unit 1: Measurement & Kinematics',
        order: 1,
        topics: [
          {
            id: 'top_p1_1',
            unitId: 'unt_p1',
            title: 'Topic 1.1: 2D Motion & Projectile Dynamics',
            description: 'Equations of uniform acceleration, horizontal projection, and parabolic trajectories.',
            order: 1,
            lessons: [
              {
                id: 'les_p1_1_1',
                topicId: 'top_p1_1',
                title: 'Lesson 1: Projectile Trajectory Equation & Maximum Range',
                description: 'y = x tan(θ) - (g x²) / (2 u² cos²(θ)) derivation.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `Motion in two dimensions under constant gravitational acceleration g directed downwards.

Key Equations:
1. Horizontal velocity: u_x = u cos(θ) [Constant]
2. Vertical velocity: v_y = u sin(θ) - gt
3. Time of flight: T = (2 u sin(θ)) / g
4. Maximum Height: H_max = (u² sin²(θ)) / (2g)
5. Horizontal Range: R = (u² sin(2θ)) / g
   - Range is maximized at launch angle θ = 45°.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Projectile_Motion_Formulas.pdf', size: '1.1 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_chem_12',
    subjectId: 'sub_chem',
    title: 'Chemistry 12',
    code: 'CHEM-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Dr. K. Arulnesan',
    gradeName: 'Grade 12 (A/L)',
    className: '12-Physical Science',
    bannerColor: 'bg-gradient-to-r from-emerald-600 to-teal-700',
    totalLessons: 14,
    completedLessons: 9,
    units: [
      {
        id: 'unt_c1',
        subjectId: 'sub_chem',
        title: 'Unit 1: Atomic Structure & Chemical Periodicity',
        order: 1,
        topics: [
          {
            id: 'top_c1_1',
            unitId: 'unt_c1',
            title: 'Topic 1.1: Quantum Model & Electronic Configuration',
            description: 'Orbitals, Hund’s rule, Pauli exclusion, and Aufbau principle.',
            order: 1,
            lessons: [
              {
                id: 'les_c1_1_1',
                topicId: 'top_c1_1',
                title: 'Lesson 1: Quantum Numbers & Atomic Orbital Shapes',
                description: 'Principal (n), azimuthal (l), magnetic (m), and spin (s) quantum numbers.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `Atomic Structure and Orbitals:
Electrons in an atom occupy specific energy states defined by four quantum numbers:
1. Principal Quantum Number (n = 1, 2, 3...) - determines shell size and principal energy level.
2. Angular Momentum Quantum Number (l = 0 to n-1) - determines the shape of the orbital (s, p, d, f).
3. Magnetic Quantum Number (ml = -l to +l) - determines spatial orientation.
4. Electron Spin Quantum Number (ms = +1/2, -1/2) - direction of intrinsic spin.

Aufbau Principle:
Electrons fill lower-energy orbitals first before occupying higher-energy orbitals (1s → 2s → 2p → 3s → 3p → 4s → 3d).`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Quantum_Mechanics_Summary.pdf', size: '1.6 MB', type: 'PDF' }
                ]
              },
              {
                id: 'les_c1_1_2',
                topicId: 'top_c1_1',
                title: 'Lesson 2: Periodic Trends in First Ionization Energy',
                description: 'Effective nuclear charge, shielding effect, and successive IE jumps.',
                order: 2,
                status: 'published',
                contentType: 'slides',
                slidesCount: 16,
                contentBody: `Periodic Variation in Ionization Energy:
Across a Period (Left to Right):
- Nuclear charge increases while screening remains approximately constant.
- Effective nuclear charge increases, atomic radius decreases, and first ionization energy generally increases.
- Anomalies exist at Group 2 to Group 13 (s² vs s²p¹) and Group 15 to Group 16 (half-filled p³ stability).`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'IE_Trends_Graphs.pdf', size: '940 KB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'unt_c2',
        subjectId: 'sub_chem',
        title: 'Unit 2: Chemical Equilibrium & Gaseous Reactions',
        order: 2,
        topics: [
          {
            id: 'top_c2_1',
            unitId: 'unt_c2',
            title: 'Topic 2.1: Dynamic Equilibrium & Le Chatelier’s Law',
            description: 'Equilibrium constants Kc, Kp and response to pressure, volume, temperature shifts.',
            order: 1,
            lessons: [
              {
                id: 'les_c2_1_1',
                topicId: 'top_c2_1',
                title: 'Lesson 3: Quantitative Equilibrium: Calculating Kc and Kp',
                description: 'ICE tables and stoichiometric calculations in homogeneous gaseous systems.',
                order: 1,
                status: 'published',
                contentType: 'video',
                videoUrl: 'https://youtube.com/watch?v=mock_equilibrium',
                contentBody: `Chemical Equilibrium:
For a general reversible reaction aA + bB ⇌ cC + dD:
Kc = [C]^c [D]^d / ([A]^a [B]^b)
Kp = (P_C)^c (P_D)^d / ((P_A)^a (P_B)^b)

Relation: Kp = Kc (RT)^Δn where Δn = (c + d) - (a + b).
Temperature is the ONLY factor that alters the numerical value of equilibrium constants.`,
                completedByStudentIds: [],
                attachments: [
                  { name: 'Equilibrium_Worksheet_Advanced.pdf', size: '1.2 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_ict_12',
    subjectId: 'sub_ict',
    title: 'Information & Communication Tech 12',
    code: 'ICT-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Eng. M. Tharindu',
    gradeName: 'Grade 12 (A/L)',
    className: '12-Physical Science & ICT',
    bannerColor: 'bg-gradient-to-r from-purple-600 to-indigo-800',
    totalLessons: 12,
    completedLessons: 7,
    units: [
      {
        id: 'unt_ict1',
        subjectId: 'sub_ict',
        title: 'Unit 1: Digital Logic Design & Boolean Algebra',
        order: 1,
        topics: [
          {
            id: 'top_ict1_1',
            unitId: 'unt_ict1',
            title: 'Topic 1.1: Combinational Logic & Karnaugh Maps',
            description: 'Sum of Products (SOP), Product of Sums (POS), and 4-variable K-Map minimization.',
            order: 1,
            lessons: [
              {
                id: 'les_ict1_1_1',
                topicId: 'top_ict1_1',
                title: 'Lesson 1: Logic Gates, Universal Gates & De Morgan’s Laws',
                description: 'Implementing NAND and NOR equivalent networks.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `Digital Logic Fundamentals:
Universal Gates:
NAND and NOR gates are universal gates because any basic boolean function (AND, OR, NOT) can be constructed entirely using only NAND or only NOR gates.

De Morgan’s Laws:
1. NOT (A AND B) = (NOT A) OR (NOT B)  -> (A . B)' = A' + B'
2. NOT (A OR B) = (NOT A) AND (NOT B)  -> (A + B)' = A' . B'

Karnaugh Maps (K-Map):
- 2x2, 2x4, and 4x4 grids arranged using Gray code sequence (00, 01, 11, 10).
- Grouping adjacent 1s in powers of 2 (1, 2, 4, 8, 16) eliminates redundant literals.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Digital_Logic_CheatSheet.pdf', size: '1.3 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'unt_ict2',
        subjectId: 'sub_ict',
        title: 'Unit 2: Python Programming & Algorithms',
        order: 2,
        topics: [
          {
            id: 'top_ict2_1',
            unitId: 'unt_ict2',
            title: 'Topic 2.1: Python Control Structures & Modular Programming',
            description: 'Conditional execution, iterative loops, functions, and list handling.',
            order: 1,
            lessons: [
              {
                id: 'les_ict2_1_1',
                topicId: 'top_ict2_1',
                title: 'Lesson 2: Algorithm Implementation with Python Lists and Dictionaries',
                description: 'Data structures, linear search, and binary search implementation.',
                order: 1,
                status: 'published',
                contentType: 'slides',
                slidesCount: 18,
                contentBody: `Python Algorithms & Data Structures:
Searching Algorithms:
1. Linear Search:
   - Time Complexity: O(n) worst/average case, O(1) best case.
   - Works on both sorted and unsorted sequences.

2. Binary Search:
   - Pre-condition: Array must be sorted in ascending or descending order.
   - Divide-and-conquer approach: compares target with midpoint.
   - Time Complexity: O(log n).

Python Example:
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Python_Lab_Notebook.py', size: '45 KB', type: 'CODE' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_bio_12',
    subjectId: 'sub_bio',
    title: 'Biology 12',
    code: 'BIO-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Mrs. Niranjala Dias',
    gradeName: 'Grade 12 (A/L)',
    className: '12-Biological Science',
    bannerColor: 'bg-gradient-to-r from-green-600 to-emerald-800',
    totalLessons: 18,
    completedLessons: 12,
    units: [
      {
        id: 'unt_b1',
        subjectId: 'sub_bio',
        title: 'Unit 1: Chemical & Cellular Basis of Life',
        order: 1,
        topics: [
          {
            id: 'top_b1_1',
            unitId: 'unt_b1',
            title: 'Topic 1.1: Cell Ultrastructure & Membrane Dynamics',
            description: 'Electron microscopic structure of eukaryotic organelles and transport mechanisms.',
            order: 1,
            lessons: [
              {
                id: 'les_b1_1_1',
                topicId: 'top_b1_1',
                title: 'Lesson 1: Fluid Mosaic Model & Active vs Passive Transport',
                description: 'Phospholipid bilayer, integral proteins, osmosis, and sodium-potassium pumps.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `Cell Membrane Architecture:
Proposed by Singer and Nicolson (1972), the Fluid Mosaic Model describes the plasma membrane as:
- A dynamic phospholipid bilayer with hydrophilic heads facing outwards and hydrophobic fatty acid tails pointing inwards.
- Integral and peripheral proteins embedded throughout, creating a mosaic pattern.
- Cholesterol molecules providing stability and regulating membrane fluidity.

Transport Across Membranes:
1. Simple Diffusion: Movement of non-polar substances down concentration gradient without ATP.
2. Facilitated Diffusion: Channel and carrier proteins assisting polar molecules (glucose, ions).
3. Active Transport: Movement against concentration gradient requiring ATP hydrolysis (e.g. Na+/K+ ATPase pump: 3 Na+ out, 2 K+ in).`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Cell_Biology_Diagrams.pdf', size: '2.8 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'unt_b2',
        subjectId: 'sub_bio',
        title: 'Unit 2: Plant Form, Photosynthesis & Physiology',
        order: 2,
        topics: [
          {
            id: 'top_b2_1',
            unitId: 'unt_b2',
            title: 'Topic 2.1: Light Reactions & Calvin Cycle in Photosynthesis',
            description: 'Photosystems I & II, photophosphorylation, Rubisco and C4 adaptations.',
            order: 1,
            lessons: [
              {
                id: 'les_b2_1_1',
                topicId: 'top_b2_1',
                title: 'Lesson 2: Photolysis of Water & Non-Cyclic Electron Flow',
                description: 'Z-scheme electron transport generating ATP and NADPH + H+.',
                order: 1,
                status: 'published',
                contentType: 'slides',
                slidesCount: 15,
                contentBody: `Light Dependent Reactions:
Location: Thylakoid membrane of chloroplasts.
1. Light absorption by chlorophyll pigments in Antenna Complex.
2. Reaction center P680 of Photosystem II (PS II) is excited.
3. Photolysis of water: 2H₂O → 4H⁺ + 4e⁻ + O₂ catalyzed by Oxygen-Evolving Complex.
4. Electron flow down cytochrome b6f complex generates proton gradient across thylakoid lumen.
5. Chemiosmotic ATP synthesis via ATP synthase (CF0-CF1 complex).
6. Reduction of NADP⁺ to NADPH at Photosystem I (P700).`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Photosynthesis_Pathways.pdf', size: '1.9 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_eng_12',
    subjectId: 'sub_eng',
    title: 'General English 12',
    code: 'ENG-12',
    teacherId: 'usr_teacher_01',
    teacherName: 'Ms. Rachel Fernando',
    gradeName: 'Grade 12 (A/L)',
    className: '12-All Streams',
    bannerColor: 'bg-gradient-to-r from-amber-600 to-orange-700',
    totalLessons: 10,
    completedLessons: 6,
    units: [
      {
        id: 'unt_e1',
        subjectId: 'sub_eng',
        title: 'Unit 1: Academic Writing & Formal Communication',
        order: 1,
        topics: [
          {
            id: 'top_e1_1',
            unitId: 'unt_e1',
            title: 'Topic 1.1: Argumentative Essay Construction & Thesis Formulation',
            description: 'Synthesizing claims, counter-arguments, evidence citation, and concluding reflections.',
            order: 1,
            lessons: [
              {
                id: 'les_e1_1_1',
                topicId: 'top_e1_1',
                title: 'Lesson 1: Structuring High-Scoring Academic Essays for National Exams',
                description: 'Cohesive devices, transitional expressions, and paragraph cohesion.',
                order: 1,
                status: 'published',
                contentType: 'rich_text',
                contentBody: `Academic Essay Writing for G.C.E. A/L:
Key Pillars of an Effective Academic Essay:
1. Introductory Paragraph:
   - Hook statement capturing the reader's interest.
   - Background context framing the core debate.
   - Strong Thesis Statement clearly defining the position and key argument points.

2. Body Paragraph Structure (PEEL Method):
   - Point: Topic sentence announcing the main focus of the paragraph.
   - Explanation: Elaboration on how and why this point holds validity.
   - Evidence / Example: Empirical data, case studies, or reasoned illustrations.
   - Link: Transition connecting back to the thesis and preparing the next paragraph.

3. Concluding Paragraph:
   - Restate the thesis in fresh phrasing.
   - Synthesize the overarching synthesis without introducing new unsubstantiated points.
   - Final thought-provoking remark or future outlook.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Academic_Writing_Toolkit.pdf', size: '890 KB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'unt_e2',
        subjectId: 'sub_eng',
        title: 'Unit 2: Critical Reading & Contextual Comprehension',
        order: 2,
        topics: [
          {
            id: 'top_e2_1',
            unitId: 'unt_e2',
            title: 'Topic 2.1: Reading Comprehension Strategies for Examination Passages',
            description: 'Skimming, scanning, inferring tone, authorial bias, and vocabulary in context.',
            order: 1,
            lessons: [
              {
                id: 'les_e2_1_1',
                topicId: 'top_e2_1',
                title: 'Lesson 2: Skimming, Scanning & Contextual Word Inferences',
                description: 'Techniques to quickly dissect 800+ word academic passages in timed conditions.',
                order: 1,
                status: 'published',
                contentType: 'slides',
                slidesCount: 12,
                contentBody: `Comprehension Mastery:
1. Skimming: Rapid reading to grasp the overarching theme, tone, and main thesis.
2. Scanning: Targeted searching for specific dates, names, figures, and defined terms.
3. Deciphering Unknown Vocabulary:
   - Root words, prefixes, and suffixes.
   - Context clues: contrast words (whereas, conversely), cause and effect indicators, and appositives.`,
                completedByStudentIds: ['usr_student_01'],
                attachments: [
                  { name: 'Comprehension_Passage_Pack_01.pdf', size: '1.4 MB', type: 'PDF' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg_01',
    courseId: 'crs_math_12',
    subjectName: 'Combined Mathematics',
    title: 'Problem Set 01: Quadratic Inequations & Roots Nature',
    instructions: 'Solve all 5 questions given in the attachment. Show step-by-step discriminant analysis and attach your handwritten scan or PDF answer.',
    topicName: 'Topic 1.1: Quadratic Functions',
    maxMarks: 100,
    dueDate: '2026-10-06 23:59',
    status: 'published',
    attachmentName: 'Assignment_01_Quadratic_Problems.pdf',
    submissionsCount: 34,
    pendingReviewCount: 1
  },
  {
    id: 'asg_02',
    courseId: 'crs_phy_12',
    subjectName: 'Physics',
    title: 'Lab Report: Determination of g Using Free Fall Apparatus',
    instructions: 'Upload your completed practical analysis, uncertainty calculations, and percentage error discussion.',
    topicName: 'Topic 1.1: Kinematics',
    maxMarks: 50,
    dueDate: '2026-10-10 18:00',
    status: 'published',
    attachmentName: 'Free_Fall_Experiment_Guidelines.pdf',
    submissionsCount: 28,
    pendingReviewCount: 4
  }
];

export const initialSubmissions: StudentSubmission[] = [
  {
    id: 'sub_01',
    assignmentId: 'asg_01',
    assignmentTitle: 'Problem Set 01: Quadratic Inequations & Roots Nature',
    studentId: 'usr_student_01',
    studentName: 'Sathurjan K.',
    submittedAt: '2026-10-01 14:32',
    status: 'result_released',
    textContent: 'Completed all 5 problems. Question 3 required splitting into two cases for k > 8 and k < -8 with proper domain restrictions.',
    fileAttachmentName: 'Sathurjan_Math_Assignment_01.pdf',
    marksObtained: 94,
    maxMarks: 100,
    teacherFeedback: 'Outstanding analytical work! Very clear interval sign table in question 3. Watch the boundary conditions in question 5.',
    markedAt: '2026-10-02 09:15'
  },
  {
    id: 'sub_02',
    assignmentId: 'asg_02',
    assignmentTitle: 'Lab Report: Determination of g Using Free Fall Apparatus',
    studentId: 'usr_student_01',
    studentName: 'Sathurjan K.',
    submittedAt: '2026-10-02 16:45',
    status: 'submitted',
    textContent: 'Attached practical record with graph of h vs t². Slope calculated to 4.905 m/s², yielding g = 9.81 m/s² with 1.2% experimental uncertainty.',
    fileAttachmentName: 'Physics_FreeFall_Report_Final.pdf',
    maxMarks: 50
  },
  {
    id: 'sub_03',
    assignmentId: 'asg_01',
    assignmentTitle: 'Problem Set 01: Quadratic Inequations & Roots Nature',
    studentId: 'usr_student_02',
    studentName: 'Kasun Bandara',
    submittedAt: '2026-10-01 17:10',
    status: 'submitted',
    textContent: 'Completed questions 1 through 4. Question 5 attempted on page 3 of PDF.',
    fileAttachmentName: 'Kasun_Quadratic_Answers.pdf',
    maxMarks: 100
  }
];

export const initialQuizzes: Quiz[] = [
  {
    id: 'qz_01',
    courseId: 'crs_math_12',
    subjectName: 'Combined Mathematics',
    title: 'Speed Quiz: Quadratic Discriminant & Root Theorems',
    instructions: '10-minute speed evaluation. 3 Questions covering Δ rules and real-valued polynomials.',
    durationMinutes: 10,
    dueDate: '2026-10-08 23:59',
    status: 'published',
    totalQuestions: 3,
    totalMarks: 30,
    userAttempt: {
      status: 'available'
    },
    questions: [
      {
        id: 'q1',
        questionText: 'For what condition does the quadratic equation ax² + bx + c = 0 (a ≠ 0) possess two distinct real roots?',
        type: 'mcq',
        options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'b² - 2ac ≥ 0'],
        correctAnswer: 0,
        explanation: 'A strictly positive discriminant (b² - 4ac > 0) guarantees two unequal real roots.',
        marks: 10
      },
      {
        id: 'q2',
        questionText: 'If a > 0 and the discriminant Δ < 0, the quadratic expression ax² + bx + c is strictly positive for all real x.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'When Δ < 0, the parabola does not touch or cross the x-axis and lies entirely above the axis because a > 0.',
        marks: 10
      },
      {
        id: 'q3',
        questionText: 'What is the sum of the roots of the quadratic equation 3x² - 12x + 7 = 0?',
        type: 'mcq',
        options: ['-4', '4', '7/3', '-12'],
        correctAnswer: 1,
        explanation: 'By Vieta’s formulas, sum of roots = -b / a = -(-12) / 3 = 4.',
        marks: 10
      }
    ]
  }
];

export const initialSports: Sport[] = [
  { id: 'sp_cricket', name: 'Cricket', category: 'Team Sport', iconName: 'Trophy', activeTeamsCount: 3 },
  { id: 'sp_rugby', name: 'Rugby Football', category: 'Contact Sport', iconName: 'Flame', activeTeamsCount: 2 },
  { id: 'sp_athletics', name: 'Track & Field Athletics', category: 'Athletics', iconName: 'Zap', activeTeamsCount: 4 },
  { id: 'sp_swimming', name: 'Aquatics & Swimming', category: 'Water Sport', iconName: 'Activity', activeTeamsCount: 2 }
];

export const initialTeams: SportsTeam[] = [
  {
    id: 'tm_cricket_1st',
    sportId: 'sp_cricket',
    sportName: 'Cricket',
    name: 'Under-17 First XI Cricket Team',
    coachId: 'usr_teacher_01',
    coachName: 'Mr. Samantha Perera',
    playersCount: 16,
    status: 'active',
    trainingSchedule: 'Mon, Wed, Fri (3:30 PM - 5:30 PM) at Main Grounds',
    players: [
      { id: 'p1', name: 'Sathurjan K.', position: 'All-Rounder / Vice Captain', grade: 'Grade 12' },
      { id: 'p2', name: 'Dishan Fernando', position: 'Opening Batsman', grade: 'Grade 11' },
      { id: 'p3', name: 'Tharindu Silva', position: 'Wicket Keeper', grade: 'Grade 11' },
      { id: 'p4', name: 'Mahesh Kumara', position: 'Fast Bowler', grade: 'Grade 12' }
    ]
  },
  {
    id: 'tm_rugby_snr',
    sportId: 'sp_rugby',
    sportName: 'Rugby Football',
    name: 'Senior Rugby Lions Squad',
    coachId: 'usr_teacher_03',
    coachName: 'Mr. M. Faizal',
    playersCount: 22,
    status: 'active',
    trainingSchedule: 'Tue, Thu (3:45 PM - 6:00 PM) at College Arena',
    players: [
      { id: 'p5', name: 'Kavindu Senanayake', position: 'Fly Half / Captain', grade: 'Grade 12' },
      { id: 'p6', name: 'Roshan Silva', position: 'Prop', grade: 'Grade 12' }
    ]
  }
];

export const initialFixtures: Fixture[] = [
  {
    id: 'fix_01',
    teamId: 'tm_cricket_1st',
    sportName: 'Cricket',
    homeTeam: 'Lions Cricket Academy (Senior XI)',
    awayTeam: 'Trinity Sports Academy',
    date: '2026-10-04',
    time: '09:30 AM',
    venue: 'City Sports Oval',
    competitionName: 'All-Island Inter-Academy Tier 1 Tournament',
    status: 'scheduled'
  },
  {
    id: 'fix_02',
    teamId: 'tm_cricket_1st',
    sportName: 'Cricket',
    homeTeam: 'Lions Cricket Academy',
    awayTeam: 'Royal Titans Academy',
    date: '2026-09-24',
    time: '10:00 AM',
    venue: 'Colombo Colts Grounds',
    competitionName: 'Provincial Group Stage',
    status: 'completed',
    result: {
      homeScore: '248/6 (50 ov)',
      awayScore: '210 all out (46.2 ov)',
      outcome: 'Lions Academy Won by 38 runs',
      recordedAt: '2026-09-24 17:30'
    }
  },
  {
    id: 'fix_03',
    teamId: 'tm_rugby_snr',
    sportName: 'Rugby Football',
    homeTeam: 'Lions Rugby Club',
    awayTeam: 'Kingswood Academy',
    date: '2026-10-12',
    time: '04:00 PM',
    venue: 'City Stadium Arena',
    competitionName: 'Youth Rugby League 2026',
    status: 'scheduled'
  }
];

export const initialStandings: Standing[] = [
  { id: 'st_01', sportName: 'Cricket', teamName: 'Lions Cricket Academy', played: 6, won: 5, drawn: 0, lost: 1, points: 28 },
  { id: 'st_02', sportName: 'Cricket', teamName: 'Trinity Sports Academy', played: 6, won: 4, drawn: 1, lost: 1, points: 24 },
  { id: 'st_03', sportName: 'Cricket', teamName: 'Royal Titans Academy', played: 6, won: 3, drawn: 0, lost: 3, points: 18 },
  { id: 'st_04', sportName: 'Cricket', teamName: 'Apex Sports Club', played: 6, won: 1, drawn: 1, lost: 4, points: 8 }
];

export const initialTournaments: Tournament[] = [
  {
    id: 'tr_01',
    name: 'All-Island Inter-Academy Tier 1 Cricket Championship 2026',
    sportId: 'sp_cricket',
    sportName: 'Cricket',
    category: 'Under-19 Division 1',
    format: 'group_stage_knockout',
    startDate: '2026-09-20',
    endDate: '2026-10-28',
    venue: 'Colombo Colts Grounds & City Sports Oval',
    organizer: 'Sri Lanka Inter-Academy Cricket Association',
    teamsCount: 8,
    participatingTeams: [
      'Lions Cricket Academy',
      'Trinity Sports Academy',
      'Royal Titans Academy',
      'Apex Warriors',
      'St. Joseph Academy',
      'Southern Titans',
      'Central Eagles',
      'Pioneer Sports Club'
    ],
    status: 'ongoing',
    trophyTitle: 'National Challenge Trophy',
    description: 'Premier 50-over tournament featuring top 8 academy teams across the island with live scorecard updates and provincial playoff brackets.',
    currentRound: 'Quarter Finals',
    rules: '50 overs per side, ICC white-ball rules, DLS calculation in effect for rain delays.'
  },
  {
    id: 'tr_02',
    name: 'President’s Trophy Inter-Club Rugby Knockout 2026',
    sportId: 'sp_rugby',
    sportName: 'Rugby Football',
    category: 'Under-19 Senior XV',
    format: 'knockout',
    startDate: '2026-10-15',
    endDate: '2026-11-04',
    venue: 'City Stadium Arena / Sugathadasa Stadium',
    organizer: 'Sri Lanka Youth Rugby Football Union',
    teamsCount: 8,
    participatingTeams: [
      'Lions Rugby Club',
      'Kingswood Academy',
      'Isipathana Youth',
      'Trinity Academy 1st XV',
      'Peters Sports Club',
      'Royal Titans 1st XV',
      'Wesley Club',
      'Southern Sea Hawks'
    ],
    status: 'upcoming',
    trophyTitle: 'President’s Gold Shield',
    description: 'The pinnacle of youth club rugby knockouts. Winner proceeds to the All-Island Inter-Academy final.',
    currentRound: 'Round of 8 (Quarter-Finals)',
    rules: '35 minutes per half, 10 min extra time in knockout draws, followed by sudden-death drop kicks.'
  },
  {
    id: 'tr_03',
    name: 'Provincial Inter-Academy Aquatics & Swimming Gala 2026',
    sportId: 'sp_swimming',
    sportName: 'Aquatics & Swimming',
    category: 'Under-15, U-17, U-19',
    format: 'league',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    venue: 'Sugathadasa National Aquatic Complex',
    organizer: 'Western Province Aquatics Association',
    teamsCount: 12,
    participatingTeams: [
      'Lions Aquatic Academy',
      'Royal Titans Swim Squad',
      'Metropolitan Swim Club',
      'Coastal Dolphins',
      'Apex Aquatic Club',
      'Gateway International'
    ],
    status: 'registration_open',
    trophyTitle: 'Provincial Challenge Shield',
    description: '3-day aquatic championship featuring freestyle, breaststroke, backstroke, butterfly, and medley relays across all age brackets.',
    currentRound: 'Team Registration Open',
    rules: 'FINA standard electronic timing and false-start sensors.'
  },
  {
    id: 'tr_04',
    name: 'National Inter-Academy Athletics Track & Field Championship 2026',
    sportId: 'sp_athletics',
    sportName: 'Track & Field Athletics',
    category: 'All Island Senior',
    format: 'league',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    venue: 'Mahinda Rajapaksa International Stadium, Diyagama',
    organizer: 'National Athletic Association',
    teamsCount: 24,
    participatingTeams: [
      'Lions Sports Academy',
      'Maris Sports Club',
      'Central Track Club',
      'Southern Striders'
    ],
    status: 'completed',
    trophyTitle: 'National Championship Trophy',
    description: 'National track and field meet crowning the best academy athletic team in Sri Lanka.',
    champion: 'Lions Sports Academy (148 Points)',
    runnerUp: 'Maris Sports Club (132 Points)',
    rules: 'World Athletics standard rules with certified photo-finish camera technology.'
  }
];

export const initialEvents: SchoolEvent[] = [
  {
    id: 'evt_01',
    title: 'Annual Inter-House Sports & Athletic Meet 2026',
    description: 'Track and field events, house parades, relay finals, and prize distribution. Attendance compulsory for all student houses.',
    date: '2026-10-16',
    time: '08:30 AM - 05:00 PM',
    venue: 'National Sports Complex & Athletic Grounds',
    organizer: 'Physical Education & Sports Committee',
    capacity: 2000,
    registeredCount: 1240,
    audience: 'all',
    status: 'published',
    isRegisteredByCurrentUser: true
  },
  {
    id: 'evt_02',
    title: 'Young Inventors National Science & AI Exhibition',
    description: 'Interactive STEM pavilions, robotics showcase, coding hackathon finals, and prototype demos.',
    date: '2026-10-22',
    time: '09:00 AM - 03:30 PM',
    venue: 'College Main Auditorium & Science Labs',
    organizer: 'Science Society & ICT Club',
    capacity: 450,
    registeredCount: 310,
    audience: 'students',
    status: 'published',
    isRegisteredByCurrentUser: false
  },
  {
    id: 'evt_03',
    title: 'Term 2 Academic Review & Career Counseling Summit',
    description: 'One-on-one parent-teacher consultations and university guidance for Advanced Level students.',
    date: '2026-11-05',
    time: '08:00 AM - 01:00 PM',
    venue: 'Senior Academic Wing',
    organizer: 'Academic Guidance Council',
    capacity: 600,
    registeredCount: 420,
    audience: 'grade_12',
    status: 'published',
    isRegisteredByCurrentUser: true
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_01',
    title: 'Quadratic Equations & Complex Numbers — Chapter 5 Vault Notes',
    message: 'New masterclass notes uploaded: 20 exam-targeted practice problems with complete step-by-step solutions are now available in your Study Vault. Remember to review before Saturday\'s live paper discussion! 📊',
    publishedAt: '2 hours ago',
    authorName: 'Dr. Samantha Perera',
    authorRole: 'Tutor',
    targetAudience: 'Target A/L Batch',
    priority: 'normal'
  },
  {
    id: 'ann_04',
    title: '2024 Provincial Model Paper Analysis & Step-by-Step Breakdown',
    message: 'Full step-by-step video breakdown (45 mins) is now live in your Study Vault. Review all marked questions before this Saturday\'s live session! 🎥',
    publishedAt: 'Yesterday',
    authorName: 'Dr. Samantha Perera',
    authorRole: 'Tutor',
    targetAudience: 'Revision Batch',
    priority: 'high'
  },
  {
    id: 'ann_02',
    title: 'Student Package Enrollment & Course Materials Notice',
    message: 'Students enrolled in active tutor packages can now access downloadable lecture slides, recorded lesson archives, and weekly practice worksheets directly from their Tutor Connect page.',
    publishedAt: '2 days ago',
    authorName: 'Academic Support',
    authorRole: 'Platform Administrator',
    targetAudience: 'Students & Subscribers',
    priority: 'normal'
  },
  {
    id: 'ann_05',
    title: 'Scheduled Platform Maintenance: Sunday 01:00 AM - 03:00 AM GMT',
    message: 'The learning platform will undergo scheduled cloud server optimization and security enhancements this Sunday between 01:00 AM and 03:00 AM. Live classes during this 2-hour maintenance window should be rescheduled accordingly.',
    publishedAt: '3 days ago',
    authorName: 'DevOps & Infrastructure',
    authorRole: 'System Administrator',
    targetAudience: 'Platform-Wide (Everyone)',
    priority: 'normal'
  }
];

export const initialLibraryResources: LibraryResource[] = [
  // --- BOOKS ---
  {
    id: 'lib_bk_01',
    title: 'Advanced Level Combined Mathematics: Mechanics & Calculus Comprehensive Guide',
    resourceType: 'book',
    subject: 'Combined Mathematics',
    author: 'Dr. K. Rajasingham',
    description: 'Complete curriculum coverage of statics, dynamics, differential calculus, and integral techniques with step-by-step worked past exam problems and graphical proofs.',
    category: 'Advanced Level',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '18.4 MB',
    pageCount: 480,
    uploadedDate: '2026-09-12',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 342,
    viewsCount: 1280,
    rating: 4.9,
    featured: true,
    tableOfContents: [
      { title: 'Chapter 1: Vectors & Equilibrium in 2D/3D', page: 12 },
      { title: 'Chapter 2: Kinematics of Particles in Linear Motion', page: 64 },
      { title: 'Chapter 3: Work, Energy, and Power Conservation', page: 128 },
      { title: 'Chapter 4: Circular Motion & Gravitational Fields', page: 198 },
      { title: 'Chapter 5: Differential Calculus & Curve Sketching', page: 270 },
      { title: 'Chapter 6: Definite Integrals and Area Computations', page: 360 },
      { title: 'Chapter 7: Model Exam Papers & Marking Keys', page: 440 }
    ],
    keyHighlights: [
      'Comprehensive theory and 350+ worked examples',
      'Covers 15 years of GCE Advanced Level past paper patterns',
      'Step-by-step vector mechanics diagrams with free-body breakdowns',
      'Includes calculus shortcuts and verification methods'
    ],
    sampleContent: [
      {
        chapterTitle: 'Chapter 1: Vectors & Equilibrium in 2D/3D',
        pageNumber: 12,
        text: 'A particle is in equilibrium under the action of coplanar forces if and only if the vector sum of all forces is zero, and the algebraic sum of the moments of all forces about any arbitrary point in the plane is zero. In Cartesian representation: ∑Fx = 0 and ∑Fy = 0. When three concurrent non-parallel forces act on a body in equilibrium, Lami\'s Theorem provides a direct relationship between magnitudes and opposing angles.'
      },
      {
        chapterTitle: 'Chapter 2: Kinematics of Particles in Linear Motion',
        pageNumber: 64,
        text: 'Uniformly accelerated rectilinear motion is governed by the fundamental kinematics equations: v = u + at, s = ut + 0.5at², and v² = u² + 2as. When acceleration is a function of time a(t), velocity and displacement must be determined through definite integration: v(t) = v(0) + ∫ a(t) dt. Special attention is required when analyzing velocity-time curves where the slope denotes acceleration and the area under the curve yields displacement.'
      },
      {
        chapterTitle: 'Chapter 5: Differential Calculus & Curve Sketching',
        pageNumber: 270,
        text: 'To systematically sketch rational algebraic functions y = f(x): first identify domain restrictions and vertical asymptotes where the denominator vanishes. Next, evaluate lim_{x→±∞} f(x) to determine horizontal or oblique asymptotes. Stationary points are determined by solving f\'(x) = 0. The nature of these points (local maximum, local minimum, or point of inflection) is verified via f\'\'(x).'
      }
    ]
  },
  {
    id: 'lib_bk_02',
    title: 'Fundamentals of Organic & Physical Chemistry: Theory & Practice',
    resourceType: 'book',
    subject: 'Chemistry',
    author: 'Prof. Anura Jayawardena',
    description: 'In-depth exposition of reaction mechanisms, thermodynamics, electrochemistry, and coordination complexes tailored for competitive pre-university examinations.',
    category: 'Advanced Level',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '24.6 MB',
    pageCount: 520,
    uploadedDate: '2026-09-08',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 285,
    viewsCount: 940,
    rating: 4.8,
    featured: true,
    tableOfContents: [
      { title: 'Chapter 1: Chemical Thermodynamics & Enthalpy Cycles', page: 15 },
      { title: 'Chapter 2: Chemical Kinetics & Rate Laws', page: 85 },
      { title: 'Chapter 3: Ionic Equilibrium and Buffer Solutions', page: 160 },
      { title: 'Chapter 4: Nucleophilic Substitution & Elimination Mechanisms', page: 245 },
      { title: 'Chapter 5: Carbonyl Compounds & Carboxylic Acid Derivatives', page: 340 },
      { title: 'Chapter 6: Transition Metals & Coordination Chemistry', page: 430 }
    ],
    keyHighlights: [
      'Electron-pushing arrow notation for all major organic mechanisms',
      'Complete Born-Haber cycle and Hess\'s Law calculation templates',
      'High-resolution crystal field splitting diagrams for d-block complexes',
      'Laboratory safety & practical titration data tables'
    ],
    sampleContent: [
      {
        chapterTitle: 'Chapter 3: Ionic Equilibrium and Buffer Solutions',
        pageNumber: 160,
        text: 'A buffer solution resists changes in hydronium ion concentration (pH) upon the addition of modest amounts of strong acid or base. In an acidic buffer containing weak acid HA and its conjugate base A⁻, the Henderson-Hasselbalch equation governs equilibrium: pH = pKa + log([A⁻]/[HA]). When strong acid H⁺ is introduced, conjugate base A⁻ consumes it according to A⁻ + H⁺ → HA, dampening pH shifts.'
      },
      {
        chapterTitle: 'Chapter 4: Nucleophilic Substitution Mechanisms',
        pageNumber: 245,
        text: 'Nucleophilic substitution proceeds primarily through either SN1 (unimolecular, two-step via carbocation intermediate) or SN2 (bimolecular, concerted single-step with backside attack). SN2 reactions exhibit Walden inversion of stereochemical configuration and are favored by primary alkyl halides in polar aprotic solvents. Conversely, SN1 reactions proceed with partial racemization and are favored by tertiary halides in polar protic solvents.'
      }
    ]
  },
  {
    id: 'lib_bk_03',
    title: 'Modern Physics: Waves, Quantum Phenomena & Relativity',
    resourceType: 'book',
    subject: 'Physics',
    author: 'Dr. H. M. Wickramasinghe',
    description: 'From wave interference and special relativity to photoelectric effect, De Broglie duality, and nuclear binding energy, with detailed experimental guides.',
    category: 'Reference & Handbook',
    coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80',
    fileType: 'EPUB',
    fileSize: '12.1 MB',
    pageCount: 390,
    uploadedDate: '2026-08-25',
    status: 'published',
    visibility: 'public',
    allowDownload: false, // Online reading only! Demonstrates permission handling
    downloadsCount: 0,
    viewsCount: 810,
    rating: 4.9,
    featured: false,
    tableOfContents: [
      { title: 'Chapter 1: Wave Superposition, Standing Waves & Resonance', page: 14 },
      { title: 'Chapter 2: Physical Optics: Young\'s Double Slit & Diffraction', page: 75 },
      { title: 'Chapter 3: Photoelectric Effect & Einstein\'s Photon Hypothesis', page: 150 },
      { title: 'Chapter 4: Bohr Model of Hydrogen & Line Spectra', page: 220 },
      { title: 'Chapter 5: Mass Defect, Binding Energy & Nuclear Reactions', page: 310 }
    ],
    keyHighlights: [
      'Digital interactive EPUB reader edition',
      'Step-by-step derivations of Einstein\'s photoelectric equation: hf = Φ + 0.5mv²_max',
      'Clear wave-particle duality experiments explained with real graphs',
      'Curated reading list and university entrance exam prep questions'
    ],
    sampleContent: [
      {
        chapterTitle: 'Chapter 3: Photoelectric Effect & Photon Hypothesis',
        pageNumber: 150,
        text: 'Classical wave theory failed to explain three pivotal observations of photoemission: the existence of a threshold frequency below which no electrons emerge regardless of intensity, the instantaneous emission of photoelectrons without measurable time lag, and the independence of maximum kinetic energy from light intensity. In 1905, Albert Einstein resolved this by proposing that electromagnetic radiation is quantized into discrete energy packets (photons) of magnitude E = hf.'
      }
    ]
  },
  {
    id: 'lib_bk_04',
    title: 'ICT & Computational Thinking: Python Algorithms & Database Design',
    resourceType: 'book',
    subject: 'Information Technology',
    author: 'Mr. Samantha Perera',
    description: 'Hands-on textbook covering algorithmic complexity, Python data structures, relational database normalization (1NF-BCNF), and network protocols.',
    category: 'STEM & Computing',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '15.2 MB',
    pageCount: 340,
    uploadedDate: '2026-09-18',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 412,
    viewsCount: 1450,
    rating: 4.9,
    featured: true,
    tableOfContents: [
      { title: 'Chapter 1: Asymptotic Notation & Big-O Algorithm Analysis', page: 10 },
      { title: 'Chapter 2: Data Structures: Stacks, Queues, Binary Trees & Hash Maps', page: 58 },
      { title: 'Chapter 3: Python Functional Programming & Recursion', page: 120 },
      { title: 'Chapter 4: Relational Databases, SQL Joins & Schema Normalization', page: 190 },
      { title: 'Chapter 5: OSI 7-Layer Architecture & TCP/IP Networking', page: 275 }
    ],
    keyHighlights: [
      'Over 80 Python 3 code snippets with execution traces',
      'Database normalization guide with practical ER diagram exercises',
      'Network subnetting and CIDR calculation cheat sheets'
    ],
    sampleContent: [
      {
        chapterTitle: 'Chapter 1: Asymptotic Notation & Big-O Algorithm Analysis',
        pageNumber: 10,
        text: 'Algorithmic efficiency is evaluated by analyzing how time and spatial requirements scale relative to input size n. We formalize this using Big-O notation: f(n) = O(g(n)) denotes that there exist positive constants c and n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀. Binary search operates in logarithmic time O(log n), whereas naive quadratic sorting algorithms like Bubble Sort scale as O(n²).'
      }
    ]
  },
  {
    id: 'lib_bk_05',
    title: 'English Literature: Critical Anthology & Analytical Commentary',
    resourceType: 'book',
    subject: 'English',
    author: 'Mrs. Charmaine De Silva',
    description: 'Comprehensive literary critique on Shakespearean drama, Romantic poetry, and 20th-century world prose with model essay frameworks.',
    category: 'Ordinary Level & A/L',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '8.5 MB',
    pageCount: 210,
    uploadedDate: '2026-09-01',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 198,
    viewsCount: 620,
    rating: 4.7,
    featured: false,
    tableOfContents: [
      { title: 'Chapter 1: Thematic Analysis of Shakespearean Tragedy', page: 8 },
      { title: 'Chapter 2: Romanticism: Nature, Solitude and the Sublime', page: 52 },
      { title: 'Chapter 3: Modern Short Fiction: Narrative Voice and Symbolism', page: 110 },
      { title: 'Chapter 4: Essay Structuring & Expository Argumentation', page: 170 }
    ],
    keyHighlights: [
      'Comparative character studies and motif tracking tables',
      'Band 9 model essays with examiner annotations and marking criteria'
    ],
    sampleContent: [
      {
        chapterTitle: 'Chapter 1: Thematic Analysis of Shakespearean Tragedy',
        pageNumber: 8,
        text: 'The tragic hero is distinguished not merely by high social station, but by an internal psychological fracture (hamartia) that inevitably precipitates catastrophic ruin. In Macbeth, the unchecked ambition catalyzed by the Weird Sisters\' prophecy collides with psychological guilt, manifesting in visceral auditory and visual hallucinations.'
      }
    ]
  },

  // --- TUTES / STUDY MATERIALS ---
  {
    id: 'lib_tut_01',
    title: 'Quadratic Equations, Polynomials & Remainder Theorem: Intensive Revision Tute',
    resourceType: 'tute',
    subject: 'Combined Mathematics',
    author: 'Mr. Samantha Perera',
    topic: 'Unit 1: Pure Mathematics - Polynomials & Algebra',
    description: '50 categorized practice problems, step-by-step polynomial division derivations, and past paper model answers with common student pitfalls.',
    category: 'Tute & Problem Pack',
    coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    pageCount: 32,
    uploadedDate: '2026-09-24',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 520,
    viewsCount: 1680,
    rating: 5.0,
    featured: true,
    keyHighlights: [
      'Comprehensive algebraic identity reference summary',
      'Vieta\'s root relations shortcuts for degree 2, 3, and 4 polynomials',
      '20 Advanced Level past questions with full step-by-step marking rubrics',
      'Common pitfalls breakdown (e.g. dividing by zero roots, sign errors)'
    ],
    sampleContent: [
      {
        chapterTitle: 'Topic Brief & Core Formula Sheet',
        pageNumber: 1,
        text: 'Remainder Theorem: When polynomial f(x) is divided by linear factor (x - a), the remainder is f(a). Factor Theorem: If f(a) = 0, then (x - a) is an exact factor of f(x). For quadratic equation ax² + bx + c = 0 with roots α and β: sum of roots α + β = -b/a, product of roots αβ = c/a. Difference of roots |α - β| = √( (α+β)² - 4αβ ) = √(b² - 4ac) / |a|.'
      },
      {
        chapterTitle: 'Worksheet Section: Advanced Drill Problems',
        pageNumber: 8,
        text: 'Problem 14: If the roots of equation x² - px + q = 0 differ by 1, prove that p² = 4q + 1. Solution: Let the roots be α and α + 1. Sum of roots: 2α + 1 = p  =>  α = (p - 1)/2. Product of roots: α(α + 1) = q. Substituting α: ((p-1)/2) * ((p+1)/2) = q  =>  (p² - 1)/4 = q  =>  p² = 4q + 1. Q.E.D.'
      }
    ]
  },
  {
    id: 'lib_tut_02',
    title: 'Rotational Dynamics, Moment of Inertia & Angular Momentum Tute',
    resourceType: 'tute',
    subject: 'Physics',
    author: 'Dr. H. M. Wickramasinghe',
    topic: 'Unit 3: Rotational Mechanics & Torque',
    description: 'Rigorous worked examples of parallel and perpendicular axis theorems, conservation of angular momentum, and rolling cylinders on inclined planes.',
    category: 'Tute & Problem Pack',
    coverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '4.5 MB',
    pageCount: 28,
    uploadedDate: '2026-09-26',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 395,
    viewsCount: 1120,
    rating: 4.9,
    featured: true,
    keyHighlights: [
      'Moment of inertia table for uniform rods, discs, solid spheres, and cylinders',
      'Parallel axis theorem: I = I_cm + Md²',
      'Kinetic energy of rolling bodies: K = 0.5mv² + 0.5Iω²',
      '15 exam-style problems with full free-body force equations'
    ],
    sampleContent: [
      {
        chapterTitle: 'Essential Principles of Rigid Body Dynamics',
        pageNumber: 1,
        text: 'Rotational analog of Newton\'s Second Law states that net external torque τ_ext = Iα = dL/dt, where I is the moment of inertia and α is the angular acceleration. If net external torque is zero, the total angular momentum L = Iω is strictly conserved. For pure rolling without slipping along an incline, the linear velocity v of the center of mass relates directly to angular speed by v = Rω.'
      }
    ]
  },
  {
    id: 'lib_tut_03',
    title: 'Chemical Equilibrium, Le Chatelier\'s Principle & Buffer Solutions Study Pack',
    resourceType: 'tute',
    subject: 'Chemistry',
    author: 'Prof. Anura Jayawardena',
    topic: 'Unit 5: Chemical Equilibrium & Ionic Solutions',
    description: 'Illustrated calculation techniques for Kc, Kp, solubility product Ksp, pH titration curves, and common-ion effect examination drills.',
    category: 'Study Material & Lab Notes',
    coverImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    pageCount: 24,
    uploadedDate: '2026-09-20',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 460,
    viewsCount: 1390,
    rating: 4.8,
    featured: false,
    keyHighlights: [
      'Step-by-step ICE (Initial, Change, Equilibrium) calculation grids',
      'Le Chatelier shift predictions for pressure, volume, temperature, and catalysts',
      'Acid-base titration curve sketches with indicator selection principles'
    ],
    sampleContent: [
      {
        chapterTitle: 'Unit 5 Master Summary & Calculation Grids',
        pageNumber: 1,
        text: 'The equilibrium constant Kc depends solely on temperature. For gaseous equilibria: Kp = Kc(RT)^Δn, where Δn is the difference in stoichiometric moles between products and reactants. Le Chatelier\'s Principle states that when an external constraint (temperature, pressure, or concentration) is applied to a dynamic system in equilibrium, the equilibrium position shifts in a direction that opposes the disturbance.'
      }
    ]
  },
  {
    id: 'lib_tut_04',
    title: 'Plant Physiology & Photosynthesis: High-Yield Revision Note',
    resourceType: 'tute',
    subject: 'Biology',
    author: 'Dr. Nirmala Senanayake',
    topic: 'Unit 4: Plant Nutrition & Bioenergetics',
    description: 'High-yield color diagrams, light vs dark reactions comparative tables, Z-scheme electron transport chain, and Calvin cycle mnemonics.',
    category: 'Study Material & Cheat Sheet',
    coverImage: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    pageCount: 18,
    uploadedDate: '2026-09-28',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 310,
    viewsCount: 970,
    rating: 4.9,
    featured: false,
    keyHighlights: [
      'Full Z-Scheme flow chart featuring Photosystem II & I',
      'Photolysis of water reaction breakdown: 2H₂O → 4H⁺ + 4e⁻ + O₂',
      'Comparison matrix: C3, C4, and CAM photosynthetic pathways'
    ],
    sampleContent: [
      {
        chapterTitle: 'Light Reactions & Photophosphorylation',
        pageNumber: 1,
        text: 'Photolysis occurs on the lumen side of the thylakoid membrane via the Oxygen Evolving Complex (OEC) associated with Photosystem II (P680). Light excitation elevates electrons through the primary acceptor, plastoquinone (PQ), cytochrome b6f complex, and plastocyanin (PC) to Photosystem I (P700). Proton accumulation in the thylakoid lumen establishes an electrochemical proton gradient utilized by CF₀-CF₁ ATP synthase.'
      }
    ]
  },
  {
    id: 'lib_tut_05',
    title: 'Relational Database Schema Design & SQL Optimization Handout',
    resourceType: 'tute',
    subject: 'Information Technology',
    author: 'Mr. Samantha Perera',
    topic: 'Unit 6: Database Management & SQL',
    description: 'Hands-on guide to 1NF, 2NF, 3NF, BCNF with real-world school management database schemas, entity relationship diagrams, and complex SQL joins.',
    category: 'Tute & Problem Pack',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '3.2 MB',
    pageCount: 22,
    uploadedDate: '2026-09-27',
    status: 'draft', // Draft status for Teacher management verification!
    visibility: 'class_only',
    allowDownload: true,
    downloadsCount: 15,
    viewsCount: 42,
    rating: 4.6,
    featured: false,
    keyHighlights: [
      '1NF, 2NF, 3NF formal criteria with side-by-side bad vs good tables',
      'SQL query templates for INNER, LEFT, RIGHT, and FULL OUTER joins',
      'Aggregate grouping, HAVING clause filters, and subquery examples'
    ],
    sampleContent: [
      {
        chapterTitle: 'Relational Database Normalization Guidelines',
        pageNumber: 1,
        text: 'A table is in First Normal Form (1NF) if all attributes contain atomic (indivisible) values and each record is unique. Second Normal Form (2NF) mandates 1NF plus the removal of partial dependencies—every non-prime attribute must depend upon the whole candidate key. Third Normal Form (3NF) requires 2NF plus the absence of transitive dependencies (non-key attributes determining other non-key attributes).'
      }
    ]
  },
  {
    id: 'lib_tut_06',
    title: 'Term 3 Model Examination Paper & Marking Scheme (Draft)',
    resourceType: 'tute',
    subject: 'Combined Mathematics',
    author: 'Mr. Samantha Perera',
    topic: 'Comprehensive Term 3 Model Exam',
    description: 'Confidential prototype examination paper with marking scheme for the upcoming second term national assessment.',
    category: 'Past Papers & Model Exams',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    pageCount: 16,
    uploadedDate: '2026-09-29',
    status: 'unpublished', // Unpublished status for Teacher management verification!
    visibility: 'private',
    allowDownload: false,
    downloadsCount: 0,
    viewsCount: 6,
    rating: 0,
    featured: false,
    keyHighlights: [
      'Prototype exam paper strictly for faculty review',
      'Allocated marks distribution: Part A (250 Marks) & Part B (750 Marks)'
    ],
    sampleContent: [
      {
        chapterTitle: 'Model Assessment Paper - Section A',
        pageNumber: 1,
        text: 'Question 1: Find the set of all real values of x satisfying |2x - 3| < x + 1. Question 2: Let f(x) = x³ - 3x² + kx + 12. If (x - 2) is a factor of f(x), compute the value of constant k and hence factorize f(x) completely into real linear factors.'
      }
    ]
  },

  // --- PAST PAPERS & OFFICIAL MARKING SCHEMES ---
  {
    id: 'lib_pp_01',
    title: '2025 G.C.E. Advanced Level Combined Mathematics (Paper I & II) + Official Marking Scheme',
    resourceType: 'past_paper',
    subject: 'Combined Mathematics',
    author: 'Department of Examinations, Sri Lanka',
    description: 'Complete 2025 National G.C.E. A/L Combined Mathematics Question Paper I (Pure Mathematics) and Paper II (Applied Mathematics) with certified step-by-step marking scheme, mark breakdowns, and model solutions.',
    category: 'G.C.E. Advanced Level Past Papers',
    year: 2025,
    medium: 'Trilingual',
    examType: 'G.C.E. Advanced Level',
    paperPart: 'Complete Set (Paper I + II)',
    hasMarkingScheme: true,
    markingSchemePages: 36,
    markingSchemeNotes: 'Certified by Chief Examiners Board with mark distributions for every line of working.',
    timeAllowedMinutes: 180,
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '8.6 MB',
    pageCount: 48,
    uploadedDate: '2026-09-10',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 1840,
    viewsCount: 5200,
    rating: 5.0,
    featured: true,
    keyHighlights: [
      'Official Department of Examinations certified paper & scheme',
      'Paper I: Pure Mathematics (Algebra, Calculus, Trigonometry)',
      'Paper II: Applied Mathematics (Mechanics, Statics, Probability)',
      'Full step-by-step rubric showing partial marks for derivations'
    ],
    sampleContent: [
      {
        chapterTitle: '2025 Combined Maths Paper I - Section A (Question 1)',
        pageNumber: 1,
        text: 'Question 1: Using the principle of mathematical induction, prove that 1² + 2² + 3² + ... + n² = n(n + 1)(2n + 1) / 6 for all positive integers n. [25 Marks]\n\nMarking Scheme Guide:\n- Base step: Check n = 1: LHS = 1² = 1; RHS = 1(2)(3)/6 = 1. (05 Marks)\n- Induction hypothesis: Assume true for n = k. (05 Marks)\n- Induction step: Prove for n = k + 1: Add (k + 1)² to both sides. Factor out (k + 1) cleanly to obtain (k + 1)(k + 2)(2k + 3) / 6. (12 Marks)\n- Final conclusion stating principle holds for all n ∈ ℤ⁺. (03 Marks)'
      },
      {
        chapterTitle: '2025 Combined Maths Paper II - Section A (Question 1)',
        pageNumber: 2,
        text: 'Question 1 (Mechanics): A particle of mass m is projected from a point O on horizontal ground with initial velocity u at an angle α to the horizontal. Assuming negligible air resistance, derive the maximum height H and horizontal range R. Show that when the range is maximum, R = 4H. [25 Marks]\n\nMarking Scheme Guide:\n- Vertical motion: v_y² = (u sin α)² - 2gH => H = u² sin² α / 2g. (08 Marks)\n- Time of flight: T = 2u sin α / g. (05 Marks)\n- Range: R = u cos α · T = u² sin 2α / g. (07 Marks)\n- Maximum range occurs at α = 45°. When α = 45°, sin² 45° = 1/2, H = u² / 4g; sin 90° = 1, R = u² / g. Hence R = 4H. (05 Marks)'
      }
    ]
  },
  {
    id: 'lib_pp_02',
    title: '2024 G.C.E. Advanced Level Physics (Paper I & II) + Official Scheme of Assessment',
    resourceType: 'past_paper',
    subject: 'Physics',
    author: 'Department of Examinations, Sri Lanka',
    description: '2024 National Examination Paper I (50 MCQs with analytical answers) and Paper II (Structured Essay & 4 Essay choices) with official marking guide and calculation formulas in Tamil medium.',
    category: 'G.C.E. Advanced Level Past Papers',
    year: 2024,
    medium: 'Tamil',
    examType: 'G.C.E. Advanced Level',
    paperPart: 'Complete Set (Paper I + II)',
    hasMarkingScheme: true,
    markingSchemePages: 32,
    markingSchemeNotes: 'Complete MCQ answer key with solution notes for every question.',
    timeAllowedMinutes: 180,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '7.4 MB',
    pageCount: 42,
    uploadedDate: '2026-08-25',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 1620,
    viewsCount: 4890,
    rating: 4.9,
    featured: true,
    keyHighlights: [
      '50 MCQ questions with exhaustive analytical derivations',
      'Structured essay questions on measurement instruments, waves, and thermodynamics',
      'Essay questions covering electromagnetism, electronics, and matter/radiation'
    ],
    sampleContent: [
      {
        chapterTitle: '2024 Physics Structured Essay (Question 1 - Mechanics)',
        pageNumber: 1,
        text: 'In an experiment to verify Hooke\'s law and measure Young\'s modulus of a copper wire using Searle\'s apparatus:\n(a) Why are two identical wires (reference and test wire) suspended from the same support?\nMarking Answer: To eliminate errors caused by thermal expansion of the wire and yielding of the ceiling support. [04 Marks]\n(b) State the function of the spirit level and micrometer screw gauge in the apparatus. [04 Marks]'
      }
    ]
  },
  {
    id: 'lib_pp_03',
    title: '2024 G.C.E. Advanced Level Chemistry (Paper I & II) + Comprehensive Marking Guide',
    resourceType: 'past_paper',
    subject: 'Chemistry',
    author: 'Department of Examinations, Sri Lanka',
    description: 'National examination question paper and certified marking scheme covering Inorganic, Organic, and Physical Chemistry calculations and structured lab questions.',
    category: 'G.C.E. Advanced Level Past Papers',
    year: 2024,
    medium: 'English',
    examType: 'G.C.E. Advanced Level',
    paperPart: 'Complete Set (Paper I + II)',
    hasMarkingScheme: true,
    markingSchemePages: 30,
    timeAllowedMinutes: 180,
    coverImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '6.8 MB',
    pageCount: 38,
    uploadedDate: '2026-08-20',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 1410,
    viewsCount: 3950,
    rating: 4.8,
    featured: false,
    keyHighlights: [
      'Physical chemistry thermodynamics and ionic equilibria calculation keys',
      'Organic multi-step reaction synthesis roadmaps with reagent conditions',
      'Inorganic qualitative cation/anion analysis flowcharts'
    ]
  },
  {
    id: 'lib_pp_04',
    title: '2023 G.C.E. Advanced Level Information & Communication Technology (ICT) + Marking Scheme',
    resourceType: 'past_paper',
    subject: 'Information Technology',
    author: 'Department of Examinations, Sri Lanka',
    description: 'Official 2023 A/L ICT Paper I (50 MCQs) and Paper II (Structured Python, Database, Networking, and HTML/CSS) with model answers and code rubrics.',
    category: 'G.C.E. Advanced Level Past Papers',
    year: 2023,
    medium: 'Trilingual',
    examType: 'G.C.E. Advanced Level',
    paperPart: 'Complete Set (Paper I + II)',
    hasMarkingScheme: true,
    markingSchemePages: 28,
    timeAllowedMinutes: 180,
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '5.9 MB',
    pageCount: 36,
    uploadedDate: '2026-08-10',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 1190,
    viewsCount: 3200,
    rating: 4.9,
    featured: false,
    keyHighlights: [
      'Python algorithm logic traces and code grading criteria',
      'Relational schema design and SQL query model solutions',
      'IP addressing, subnetting calculations, and network topology diagrams'
    ]
  },
  {
    id: 'lib_pp_05',
    title: '2025 Western Province Inter-School Term 2 Model Examination: Combined Mathematics',
    resourceType: 'past_paper',
    subject: 'Combined Mathematics',
    author: 'Western Province Department of Education',
    description: 'Provincial model examination paper set according to latest national syllabus specifications with full answer key and marking standards.',
    category: 'Provincial Model Papers',
    year: 2025,
    medium: 'Tamil',
    examType: 'Provincial Term Test',
    paperPart: 'Paper I (MCQ)',
    hasMarkingScheme: true,
    markingSchemePages: 16,
    timeAllowedMinutes: 120,
    coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    pageCount: 22,
    uploadedDate: '2026-09-18',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 940,
    viewsCount: 2450,
    rating: 4.7,
    featured: false,
    keyHighlights: [
      'Targeted for 2026 A/L batch revision',
      'Trigonometry and complex numbers high-yield questions',
      'Model marking rubrics for quick self-assessment'
    ]
  },
  {
    id: 'lib_pp_06',
    title: '2022 G.C.E. Advanced Level Combined Mathematics (Paper I & II) + Chief Evaluator Notes',
    resourceType: 'past_paper',
    subject: 'Combined Mathematics',
    author: 'Department of Examinations, Sri Lanka',
    description: 'Archived 2022 National Examination Paper with official mark distribution scheme and evaluator notes highlighting common student errors in vectors and calculus.',
    category: 'G.C.E. Advanced Level Past Papers',
    year: 2022,
    medium: 'English',
    examType: 'G.C.E. Advanced Level',
    paperPart: 'Complete Set (Paper I + II)',
    hasMarkingScheme: true,
    markingSchemePages: 34,
    timeAllowedMinutes: 180,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '7.8 MB',
    pageCount: 44,
    uploadedDate: '2026-07-15',
    status: 'published',
    visibility: 'public',
    allowDownload: true,
    downloadsCount: 1530,
    viewsCount: 4120,
    rating: 4.8,
    featured: false,
    keyHighlights: [
      'Comprehensive Pure & Applied complete paper set',
      'Chief Examiner review notes on frequent candidate pitfalls',
      'Alternative valid methods recognized in marking'
    ]
  }
];

export const initialExams: ExamItem[] = [
  {
    id: 'ex_math_term2',
    title: 'Term 2 Formal Assessment: Combined Mathematics (Pure & Applied)',
    subject: 'Combined Mathematics',
    grade: 'Grade 12',
    examType: 'term_final',
    date: '2026-10-14',
    time: '08:30 AM - 11:30 AM',
    durationMinutes: 180,
    hallName: 'Senior Examination Hall A (Main Campus)',
    seatNumber: 'Seat A-42',
    invigilator: 'Dr. K. Rajasingham / Mr. S. Wickramaratne',
    totalMarks: 1000,
    status: 'upcoming',
    candidateIndexNo: 'NWN-2026-12A-042',
    rules: [
      'Candidates must occupy their assigned seats 15 minutes prior to the commencement bell.',
      'Only blue or black ballpoint pens, geometric instruments, and approved stationery allowed.',
      'Programmable calculators and electronic communication devices are strictly forbidden.',
      'Candidate Index Slip (Hall Admission Pass) must remain displayed on the desk at all times.'
    ],
    parts: [
      {
        partName: 'Part A: Structured Mechanics & Calculus Problems',
        allocatedMarks: 250,
        description: 'Answer all 10 compulsory structured questions. Write answers in spaces provided.',
        questions: [
          {
            questionNo: 1,
            questionTitle: 'Polynomial Factorization & Remainder Theorem',
            marks: 25,
            text: 'Let f(x) = 2x³ - 5x² + ax + b. Given that (x - 2) is a factor and the remainder when divided by (x + 1) is 15, calculate the values of constants a and b.'
          },
          {
            questionNo: 2,
            questionTitle: 'Coplanar Forces & Equilibrium',
            marks: 25,
            text: 'Three coplanar forces of magnitudes P, 2P, and √3 P act at a point O in directions parallel to the sides of an equilateral triangle. Determine the magnitude and direction of their resultant.'
          },
          {
            questionNo: 3,
            questionTitle: 'Definite Integration & Area Under Curve',
            marks: 25,
            text: 'Evaluate the definite integral ∫ from 0 to π/4 of (tan x * sec² x) dx, and verify using substitution u = tan x.'
          }
        ]
      },
      {
        partName: 'Part B: In-depth Theoretical Derivations & Analytical Essays',
        allocatedMarks: 750,
        description: 'Select five questions only from Part B. Show complete derivations.',
        questions: [
          {
            questionNo: 4,
            questionTitle: 'Motion in a Vertical Circle with Variable Tension',
            marks: 150,
            text: 'A light inextensible string of length l has one end fixed at O and carries a particle of mass m at the other. If the particle is projected horizontally from its lowest position with speed u, find the tension T in the string when it makes an angle θ with the upward vertical.'
          },
          {
            questionNo: 5,
            questionTitle: 'Curve Sketching with Oblique Asymptotes & Stationary Points',
            marks: 150,
            text: 'For the rational function y = (x² + 2x - 3) / (x - 1), determine all intercepts, asymptotes, and coordinate locations of local extrema. Hence sketch the complete curve.'
          }
        ]
      }
    ]
  },
  {
    id: 'ex_phys_term2',
    title: 'Term 2 Formal Assessment: Advanced Physics (Theory & Structured)',
    subject: 'Physics',
    grade: 'Grade 12',
    examType: 'term_final',
    date: '2026-10-18',
    time: '08:30 AM - 11:30 AM',
    durationMinutes: 180,
    hallName: 'Senior Examination Hall A (Main Campus)',
    seatNumber: 'Seat A-42',
    invigilator: 'Dr. H. M. Wickramasinghe',
    totalMarks: 1000,
    status: 'upcoming',
    candidateIndexNo: 'NWN-2026-12A-042',
    rules: [
      'Read all instructions on page 1 of question paper before answering.',
      'Physical constants sheet provided on the back cover of the script.',
      'Clearly state all formulas before numerical computation.'
    ]
  },
  {
    id: 'ex_chem_term2',
    title: 'Term 2 Formal Assessment: Chemistry (Physical & Organic)',
    subject: 'Chemistry',
    grade: 'Grade 12',
    examType: 'term_final',
    date: '2026-10-21',
    time: '01:00 PM - 04:00 PM',
    durationMinutes: 180,
    hallName: 'Senior Chemistry Wing - Room 204',
    seatNumber: 'Seat C-18',
    invigilator: 'Prof. Anura Jayawardena',
    totalMarks: 1000,
    status: 'upcoming',
    candidateIndexNo: 'NWN-2026-12A-042',
    rules: [
      'Periodic table sheet supplied inside the exam booklet.',
      'Show curved-arrow electron pushing notations clearly for mechanism questions.'
    ]
  },
  {
    id: 'ex_ict_mock',
    title: 'National G.C.E. Advanced Level Model Exam: ICT & Computing',
    subject: 'Information Technology',
    grade: 'Grade 12',
    examType: 'national_model',
    date: '2026-10-25',
    time: '08:30 AM - 11:30 AM',
    durationMinutes: 180,
    hallName: 'Computer Engineering Complex - Lab 1',
    seatNumber: 'Terminal PC-14',
    invigilator: 'Mr. Samantha Perera',
    totalMarks: 100,
    status: 'upcoming',
    candidateIndexNo: 'NWN-2026-12A-042',
    rules: [
      'Computer screen monitoring is active during online theoretical submission.',
      'SQL schema diagrams must follow relational 3NF criteria.'
    ]
  }
];

export const initialExamTermResult: ExamTermResult = {
  id: 'res_term1_2026',
  termTitle: '2026 First Term Official Academic Evaluation (G.C.E. A/L)',
  candidateName: 'Sathurjan K.',
  indexNumber: 'NWN-2026-12A-042',
  zScore: 2.1480,
  districtRank: 14,
  islandRank: 128,
  gpa: 3.85,
  subjects: [
    {
      subjectName: 'Combined Mathematics',
      marksObtained: 89,
      maxMarks: 100,
      grade: 'A',
      rankInClass: 2,
      teacherRemark: 'Outstanding grasp of differential calculus and vector mechanics.'
    },
    {
      subjectName: 'Physics',
      marksObtained: 85,
      maxMarks: 100,
      grade: 'A',
      rankInClass: 4,
      teacherRemark: 'Strong analytical skills demonstrated in rotational dynamics and waves.'
    },
    {
      subjectName: 'Chemistry',
      marksObtained: 78,
      maxMarks: 100,
      grade: 'A',
      rankInClass: 7,
      teacherRemark: 'Good progress in ionic equilibrium. Pay closer attention to organic synthesis steps.'
    },
    {
      subjectName: 'Information Technology',
      marksObtained: 94,
      maxMarks: 100,
      grade: 'A',
      rankInClass: 1,
      teacherRemark: 'Top performer in Python programming and relational database design.'
    }
  ],
  principalRemark: 'Exemplary academic achievement. Eligible for National Olympiad and Merit Scholarship.',
  issuedDate: '2026-05-30'
};
