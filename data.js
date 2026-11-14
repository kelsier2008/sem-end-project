/*
 * CampusBoard sample notices.
 *
 * Dates are written as offsets from "today" so the demo always looks current:
 *   published: [daysFromToday, "HH:MM"]
 *   deadline:  [daysFromToday, "HH:MM"]  (or null when there is no deadline)
 * app.js turns these into real dates the first time the app loads, or when
 * you press "Reset data" in Settings. All content is fictional.
 */
window.CAMPUSBOARD_SAMPLES = [
  {
    id: 's-mini-project',
    title: 'Mini-project review 1: submit your synopsis',
    summary: 'Upload a two-page synopsis with problem statement, scope and team roles before review 1.',
    body:
      'All third-year teams must submit a synopsis before the first mini-project review.\n\n' +
      'Your synopsis should be two pages and include:\n' +
      '• Problem statement and motivation\n' +
      '• Scope and expected outcomes\n' +
      '• Team members and their roles\n' +
      '• Tools and technologies you plan to use\n\n' +
      'Upload one PDF per team through the submission form. Late submissions will be reviewed only after all on-time teams.\n\n' +
      'Questions? Meet the project coordinator during office hours (Mon–Fri, 2–4 PM, Room 304).',
    category: 'Assignments',
    priority: 'high',
    department: 'Computer Engineering',
    author: 'Project Coordinator',
    published: [-5, '11:00'],
    deadline: [0, '23:59'],
    link: { label: 'Submission form', url: 'https://example.com/mini-project/synopsis' },
    read: false,
    starred: true,
  },
  {
    id: 's-semester-fee',
    title: 'Semester fee payment reminder',
    summary: 'Pay the even-semester tuition fee by tomorrow, 4:00 PM, to avoid a late fine.',
    body:
      'This is a reminder that the even-semester tuition fee is due tomorrow by 4:00 PM.\n\n' +
      'You can pay online through the student portal or at the accounts counter (Ground floor, Admin Building, 10 AM–4 PM).\n\n' +
      'A late fine of ₹50 per day applies after the deadline. Keep your payment receipt: you will need it to collect your hall ticket.\n\n' +
      'Students with an approved scholarship or instalment plan should check their balance on the portal before paying.',
    category: 'Fees',
    priority: 'high',
    department: 'Accounts Office',
    author: 'Accounts Section',
    published: [-6, '10:30'],
    deadline: [1, '16:00'],
    link: { label: 'Pay online', url: 'https://example.com/fees/pay' },
    read: false,
    starred: false,
  },
  {
    id: 's-dbms-assignment',
    title: 'DBMS Assignment 3: ER diagrams and normalisation',
    summary: 'Draw ER diagrams for the library case study and normalise the schema up to 3NF.',
    body:
      'Assignment 3 covers Units 2 and 3.\n\n' +
      '1. Draw a complete ER diagram for the library management case study shared in class.\n' +
      '2. Convert it into relational tables.\n' +
      '3. Normalise every table up to 3NF and explain each step.\n\n' +
      'Submit a single PDF on the course page. Hand-drawn diagrams are fine if they are scanned clearly.\n\n' +
      'This assignment carries 10 internal marks.',
    category: 'Assignments',
    priority: 'normal',
    department: 'Computer Engineering',
    author: 'DBMS Course Faculty',
    published: [-4, '15:00'],
    deadline: [2, '23:59'],
    link: { label: 'Course page', url: 'https://example.com/courses/dbms' },
    read: false,
    starred: false,
  },
  {
    id: 's-git-workshop',
    title: 'Workshop: Git and GitHub for beginners',
    summary: 'A hands-on session on version control: commits, branches, pull requests and your first GitHub repo.',
    body:
      'The Coding Club is running a two-hour, hands-on workshop for beginners.\n\n' +
      "What you'll learn:\n" +
      '• Why version control matters\n' +
      '• Commits, branches and merges\n' +
      '• Pushing to GitHub and opening a pull request\n\n' +
      'Venue: Lab 2, Computer Engineering block\n' +
      'Bring: a laptop with Git installed and a free GitHub account.\n\n' +
      'Seats are limited to 60. Register using the form.',
    category: 'Events',
    priority: 'normal',
    department: 'Computer Engineering',
    author: 'Coding Club',
    published: [-3, '18:00'],
    deadline: [4, '18:00'],
    link: { label: 'Register', url: 'https://example.com/coding-club/git-workshop' },
    read: true,
    starred: false,
  },
  {
    id: 's-ai-seminar',
    title: 'Department seminar: Careers in AI and data',
    summary: 'Alumni working in AI and data roles share how they got started and what recruiters look for.',
    body:
      'Join us for a seminar with three alumni now working as a data analyst, a machine learning engineer and a product manager.\n\n' +
      'Topics:\n' +
      '• Skills that matter for entry-level roles\n' +
      '• Building a portfolio while in college\n' +
      '• Internships and how to apply\n\n' +
      'Venue: Seminar Hall 1\n' +
      "Open to all years. Attendance counts towards the department's seminar requirement.",
    category: 'Events',
    priority: 'normal',
    department: 'Electronics & Telecom',
    author: 'Seminar Coordinator',
    published: [-2, '12:00'],
    deadline: [5, '14:00'],
    link: null,
    read: false,
    starred: false,
  },
  {
    id: 's-physics-practical',
    title: 'Physics practical examination schedule',
    summary: 'First-year practical exams start next week. Check your batch, slot and lab number.',
    body:
      'The first-year physics practical examination begins next week.\n\n' +
      'Batch A: 9:30 AM – 12:30 PM\n' +
      'Batch B: 1:30 PM – 4:30 PM\n\n' +
      'Report to the physics lab 15 minutes early with your journal signed by your lab teacher. Students without a completed journal will not be allowed to appear.\n\n' +
      'The detailed batch list is on the department notice board.',
    category: 'Exams',
    priority: 'normal',
    department: 'Physics Department',
    author: 'Lab In-charge',
    published: [-1, '16:00'],
    deadline: [6, '09:30'],
    link: { label: 'Batch list', url: 'https://example.com/physics/batches' },
    read: false,
    starred: false,
  },
  {
    id: 's-library-clearance',
    title: 'Library clearance required before hall tickets',
    summary: 'Return all borrowed books and clear any dues to get your end-semester hall ticket.',
    body:
      'Hall tickets for the end-semester exams will be issued only to students with library clearance.\n\n' +
      'To get cleared:\n' +
      '1. Return all borrowed books.\n' +
      '2. Pay any outstanding fines at the library counter.\n' +
      '3. Collect the clearance stamp on your no-dues form.\n\n' +
      'The library is open 9 AM – 8 PM on weekdays.',
    category: 'Exams',
    priority: 'normal',
    department: 'Central Library',
    author: 'Librarian',
    published: [-4, '10:00'],
    deadline: [8, '20:00'],
    link: null,
    read: false,
    starred: false,
  },
  {
    id: 's-tech-fest',
    title: 'Technical festival registrations are open',
    summary: "Register your team for coding, robotics and design events at this year's technical festival.",
    body:
      "Registrations for this year's technical festival are now open.\n\n" +
      'Events include a 24-hour hackathon, line-follower robotics, a UI design challenge and a quiz.\n\n' +
      'Teams can have 2–4 members. Each participant can join up to two events.\n\n' +
      'Registration closes when the festival opens. Early teams get priority for hackathon slots.',
    category: 'Events',
    priority: 'normal',
    department: 'Student Council',
    author: 'Tech Fest Committee',
    published: [-1, '11:00'],
    deadline: [9, '17:00'],
    link: { label: 'Register your team', url: 'https://example.com/techfest/register' },
    read: false,
    starred: false,
  },
  {
    id: 's-midsem-timetable',
    title: 'Mid-semester examination timetable released',
    summary: 'The mid-semester timetable for all branches is out. Exams start in under two weeks.',
    body:
      'The mid-semester examination timetable for all branches has been published.\n\n' +
      '• Exams are held in two sessions: 10:00 AM and 2:00 PM.\n' +
      '• Carry your college ID card to every paper.\n' +
      '• Seating arrangements are displayed one day before each exam.\n\n' +
      'Report any clash in your timetable to the examination cell within three days.',
    category: 'Exams',
    priority: 'high',
    department: 'Examination Cell',
    author: 'Controller of Exams',
    published: [-2, '13:00'],
    deadline: [11, '10:00'],
    link: { label: 'Download timetable', url: 'https://example.com/exams/midsem-timetable' },
    read: false,
    starred: true,
  },
  {
    id: 's-scholarship',
    title: 'Scholarship application reminder',
    summary: 'Submit or renew your scholarship application with income and marks documents.',
    body:
      'Eligible students must submit new or renewal scholarship applications on the scholarship portal.\n\n' +
      'Keep these ready:\n' +
      '• Income certificate (current financial year)\n' +
      '• Previous semester mark sheet\n' +
      '• Fee receipt\n' +
      '• Bank passbook (first page)\n\n' +
      'Incomplete applications will be rejected. The scholarship cell helps with forms every afternoon, 2–4 PM.',
    category: 'Fees',
    priority: 'high',
    department: 'Scholarship Cell',
    author: 'Scholarship Coordinator',
    published: [-8, '14:00'],
    deadline: [14, '17:00'],
    link: { label: 'Scholarship portal', url: 'https://example.com/scholarships' },
    read: false,
    starred: false,
  },
  {
    id: 's-mess-fee',
    title: 'Revised hostel mess fee structure',
    summary: 'Mess charges change from next month. See the new monthly rates for veg and non-veg plans.',
    body:
      'The hostel committee has revised the mess fee structure from next month.\n\n' +
      'Veg plan: ₹3,600 per month\n' +
      'Non-veg plan: ₹4,100 per month\n\n' +
      'The change reflects higher food costs. Residents can switch plans at the hostel office until the 25th of this month.\n\n' +
      'For questions, meet the warden in the hostel office, 6–7 PM.',
    category: 'Fees',
    priority: 'normal',
    department: 'Hostel Office',
    author: 'Hostel Warden',
    published: [-3, '09:00'],
    deadline: null,
    link: null,
    read: false,
    starred: false,
  },
  {
    id: 's-blood-donation',
    title: 'Blood donation camp in the main auditorium',
    summary: 'Donate blood and help save lives. Every donor gets an NSS participation certificate.',
    body:
      'The NSS unit, with the city blood bank, is holding a blood donation camp in the main auditorium.\n\n' +
      'Who can donate: students aged 18–60, weighing over 50 kg and in good health.\n\n' +
      'Eat a proper meal before donating and bring your college ID. Every donor gets a certificate and refreshments.',
    category: 'Events',
    priority: 'normal',
    department: 'NSS Unit',
    author: 'NSS Coordinator',
    published: [-9, '10:00'],
    deadline: [-2, '10:00'],
    link: null,
    read: true,
    starred: false,
  },
  {
    id: 's-seating-guidelines',
    title: 'Exam seating arrangement guidelines',
    summary: "How seat numbers work, what to carry and what isn't allowed in the exam hall.",
    body:
      'Please read these guidelines before every exam:\n\n' +
      '• Seat numbers are displayed outside each hall one day before the exam.\n' +
      '• Carry your ID card and hall ticket.\n' +
      '• Phones, smartwatches and notes must be left in your bag at the front of the hall.\n' +
      '• Arrive 15 minutes early. Entry closes 30 minutes after the paper starts.',
    category: 'Exams',
    priority: 'normal',
    department: 'Examination Cell',
    author: 'Exam Coordinator',
    published: [-7, '10:00'],
    deadline: null,
    link: null,
    read: true,
    starred: false,
  },
];
