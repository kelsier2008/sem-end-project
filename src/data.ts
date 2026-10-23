import type { Notice } from './types';

/** ISO timestamp `days` from today at a local time, so demo deadlines look live on first load. */
function at(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Placeholder links: example.com is reserved for documentation and never points to a real portal. */
const demoLink = (path: string) => `https://example.com/campusboard-demo/${path}`;

/**
 * Sample announcements for the prototype. They are fictional and use role titles instead of real people.
 * Generated once when no saved data exists; after that they are saved and age naturally.
 */
export function createDemoNotices(): Notice[] {
  return [
    {
      id: 'demo-01',
      title: 'Mid-semester examination timetable released',
      description: 'Mid-sem exams for all second- and third-year courses begin on the date shown. Seat numbers are listed by roll number.',
      content:
        'The mid-semester examination timetable for all second- and third-year courses is now available.\n\n• Exams start at 10:00 AM sharp. Be seated 15 minutes early.\n• Carry your college ID card and hall ticket to every paper.\n• Only non-programmable calculators are allowed.\n• Seat numbers are displayed outside each exam hall the day before.\n\nStudents with approved accommodations should confirm arrangements with the Examination Cell at least three days before their first paper.',
      category: 'Exams',
      department: 'Examination Cell',
      author: 'Controller of Examinations',
      publishedAt: at(-2, 10, 15),
      deadline: at(11, 10),
      priority: 'High',
      isRead: false,
      isStarred: true,
      isUserCreated: false,
      actionLink: { label: 'View timetable (demo link)', url: demoLink('exam-timetable') },
    },
    {
      id: 'demo-02',
      title: 'DBMS Assignment 3: ER diagrams and normalisation',
      description: 'Draw ER diagrams for the two case studies and normalise the schema up to 3NF. Handwritten submissions only.',
      content:
        'Assignment 3 covers Units 2 and 3.\n\n1. Draw complete ER diagrams for the Library and Hospital case studies shared in class.\n2. Convert each diagram into relational tables.\n3. Normalise both schemas up to Third Normal Form, showing each step.\n\nSubmit handwritten work in the DBMS lab. Late submissions will be marked out of half credit.',
      category: 'Assignments',
      department: 'Computer Engineering',
      author: 'Course Coordinator, DBMS',
      publishedAt: at(-4, 16, 40),
      deadline: at(2, 23, 59),
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-03',
      title: 'Technical festival registrations are open',
      description: 'Hackathon, robo-race, quiz and paper presentation. Teams of up to four can register until the date shown.',
      content:
        'Registrations for this year’s technical festival are now open to all departments.\n\nEvents: 24-hour hackathon, robo-race, technical quiz, paper presentation and a UI design sprint.\n\nTeams can have up to four members from any year. Each participant can join a maximum of two events. Registration desks are set up near the main canteen from 11 AM to 4 PM.',
      category: 'Events',
      department: 'Student Council',
      author: 'Tech Fest Committee',
      publishedAt: at(-1, 12, 5),
      deadline: at(9, 17),
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
      actionLink: { label: 'Register your team (demo link)', url: demoLink('techfest-registration') },
    },
    {
      id: 'demo-04',
      title: 'Semester fee payment reminder',
      description: 'Pay the semester fee before the deadline to avoid the late fine. Students who have already paid can ignore this.',
      content:
        'This is a reminder that the semester fee must be paid by the deadline shown.\n\nA late fine applies to payments made after the deadline. Keep the payment receipt; it is required for issuing hall tickets.\n\nFor scholarship or instalment cases, visit the Accounts Office between 10 AM and 1 PM on working days.',
      category: 'Fees',
      department: 'Accounts Office',
      author: 'Accounts Section',
      publishedAt: at(-6, 9, 30),
      deadline: at(1, 16),
      priority: 'High',
      isRead: false,
      isStarred: true,
      isUserCreated: false,
      actionLink: { label: 'Open payment page (demo link)', url: demoLink('fee-payment') },
    },
    {
      id: 'demo-05',
      title: 'Physics practical examination schedule',
      description: 'Practical exams are held batch-wise in Lab 2. Bring your signed journal and lab coat.',
      content:
        'Practical examinations for Engineering Physics will be conducted batch-wise in Lab 2.\n\n• Batch A: 9:30 AM to 12:30 PM\n• Batch B: 1:30 PM to 4:30 PM\n\nA journal signed by the lab in-charge is mandatory. Students without a signed journal will not be allowed to appear.',
      category: 'Exams',
      department: 'Physics Department',
      author: 'Lab In-charge',
      publishedAt: at(-1, 15, 20),
      deadline: at(6, 9, 30),
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-06',
      title: 'Workshop: Git and GitHub for beginners',
      description: 'A two-hour hands-on session on version control. Bring a laptop. Seats are limited to 60.',
      content:
        'Learn the basics of version control in a two-hour hands-on workshop.\n\nTopics: commits, branches, pull requests, resolving merge conflicts and publishing a project page.\n\nBring a laptop with Git installed. Seats are limited to 60 and are allotted first come, first served.',
      category: 'Events',
      department: 'Computer Engineering',
      author: 'Coding Club',
      publishedAt: at(-3, 18, 10),
      deadline: at(4, 18),
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
      actionLink: { label: 'Reserve a seat (demo link)', url: demoLink('git-workshop') },
    },
    {
      id: 'demo-07',
      title: 'Mini-project review 1: submit your synopsis',
      description: 'Upload a two-page synopsis with problem statement, scope and team roles before review 1.',
      content:
        'All mini-project teams must submit a synopsis before the first review.\n\nThe synopsis should be at most two pages and include:\n• Problem statement\n• Proposed solution and scope\n• Technology stack\n• Role of each team member\n\nTeams that do not submit will not be scheduled for review 1.',
      category: 'Assignments',
      department: 'Computer Engineering',
      author: 'Project Coordinator',
      publishedAt: at(-5, 11),
      deadline: at(0, 23, 59),
      priority: 'High',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-08',
      title: 'Library clearance required before hall tickets',
      description: 'Return all borrowed books or renew them. Hall tickets are issued only after library clearance.',
      content:
        'Students must return or renew all borrowed books before hall tickets are issued.\n\nOverdue books attract a fine per day as per library rules. Reference books issued for project work can be renewed once at the circulation desk.\n\nThe library stays open until 8 PM on weekdays during the clearance period.',
      category: 'Exams',
      department: 'Central Library',
      author: 'Librarian',
      publishedAt: at(-7, 10),
      deadline: at(8, 20),
      priority: 'Normal',
      isRead: true,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-09',
      title: 'Department seminar: Careers in AI and data',
      description: 'An industry speaker on roles, skills and internships in AI. Attendance is compulsory for third-year students.',
      content:
        'The department is hosting a seminar on careers in AI and data science.\n\nThe session covers common job roles, skills recruiters look for, and how to find internships. There will be a 20-minute Q&A at the end.\n\nVenue: Seminar Hall, second floor. Attendance is compulsory for third-year students and open to everyone else.',
      category: 'Events',
      department: 'Electronics & Telecom',
      author: 'Seminar Coordinator',
      publishedAt: at(-2, 14, 45),
      deadline: at(5, 14),
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-10',
      title: 'Scholarship application reminder',
      description: 'Eligible students should apply before the deadline. Keep income and caste certificates ready for verification.',
      content:
        'Applications for this year’s merit-cum-means scholarships are open.\n\nDocuments needed: previous year mark sheet, income certificate, fee receipt and bank passbook copy. Category certificates are required where applicable.\n\nAfter applying online, submit printed copies to the Scholarship Cell for verification within seven days.',
      category: 'Fees',
      department: 'Scholarship Cell',
      author: 'Scholarship Coordinator',
      publishedAt: at(-8, 13),
      deadline: at(14, 17),
      priority: 'High',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
      actionLink: { label: 'Read the guidelines (demo link)', url: demoLink('scholarship-guidelines') },
    },
    {
      id: 'demo-11',
      title: 'Re-examination form submission',
      description: 'The window for re-examination forms has closed. Late requests need approval from the Head of Department.',
      content:
        'The submission window for re-examination forms has now closed.\n\nStudents who missed the deadline for a valid reason must submit a written request with supporting documents, approved by the Head of Department, to the Examination Cell.',
      category: 'Exams',
      department: 'Examination Cell',
      author: 'Controller of Examinations',
      publishedAt: at(-12, 10),
      deadline: at(-2, 17),
      priority: 'Normal',
      isRead: true,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-12',
      title: 'Placement talk: slides and recording',
      description: 'Slides and the recording from last week’s placement orientation are now available.',
      content:
        'Thank you to everyone who attended the placement orientation.\n\nThe slides cover the placement calendar, eligibility rules and resume guidelines. The recording is available for students who could not attend.\n\nQuestions can be sent to the Training & Placement office.',
      category: 'Events',
      department: 'Training & Placement',
      author: 'Placement Officer',
      publishedAt: at(-9, 17),
      deadline: null,
      priority: 'Normal',
      isRead: true,
      isStarred: false,
      isUserCreated: false,
    },
    {
      id: 'demo-13',
      title: 'Revised hostel mess fee structure',
      description: 'The mess fee changes from next month. See the details for the updated monthly and semester plans.',
      content:
        'The hostel committee has revised the mess fee structure, effective from next month.\n\nMonthly and semester plans are both available. Students on the semester plan get two free guest meals per month.\n\nContact the hostel office for any queries.',
      category: 'Fees',
      department: 'Hostel Office',
      author: 'Hostel Warden',
      publishedAt: at(-3, 19, 30),
      deadline: null,
      priority: 'Normal',
      isRead: false,
      isStarred: false,
      isUserCreated: false,
    },
  ];
}
