import type {
  Achievement,
  BlogPost,
  Education,
  Experience,
  NavLink,
  Profile,
  Project,
  SkillGroup,
  Stat,
  Testimonial,
  TimelineItem,
} from '../models/resume.model';

/**
 * Single source of truth for all portfolio content.
 * Every fact below is sourced from SoumyaKumarMallick_Resume.pdf.
 * Items marked with "PLACEHOLDER" are not present in the resume and must be replaced.
 */
export const profile: Profile = {
  name: 'Soumya Kumar Mallick',
  firstName: 'Soumya Kumar',
  lastName: 'Mallick',
  title: 'Senior Frontend Developer',
  tagline: 'Angular & React.js | TypeScript | Enterprise Web Applications',
  roles: [
    'Senior Frontend Developer',
    'Angular Specialist',
    'React.js Developer',
    'TypeScript Enthusiast',
    'Enterprise UI Architect',
  ],
  summary:
    'Frontend Developer with 5+ years of experience designing, building, and optimizing enterprise-scale web applications using Angular, React.js, and TypeScript. Proven track record delivering a mission-critical payment module end-to-end for a Central Government (Ministry of Road Transport & Highways) platform, including secure payment gateway integration, transaction verification, and REST API integration. Skilled in reactive UI architecture, performance optimization, cross-browser compatibility, and leading development teams in Agile environments. Adept at translating complex business requirements into scalable, maintainable, and high-performance frontend solutions.',
  email: 'soumya27mallick01@gmail.com',
  emailHref: 'mailto:soumya27mallick01@gmail.com',
  location: 'India',
  linkedin: 'https://www.linkedin.com/in/soumya-kumar-mallick-07b5921b3/',
  github: 'https://github.com/soumya27mallick01',
  resumeUrl: 'assets/resume/SoumyaKumarMallick_Resume.pdf',
};

export const stats: Stat[] = [
  { value: 5, suffix: '+', label: 'Years of Experience' },
  { value: 4, suffix: '', label: 'Enterprise Applications' },
  { value: 3, suffix: '', label: 'Government Platforms' },
  { value: 20, suffix: '+', label: 'Technologies' },
];

export const experience: Experience[] = [
  {
    company: 'Echt Tech Consultancy Services Pvt Ltd',
    position: 'Angular Developer',
    period: 'Sep 2025 – Present',
    location: 'New Delhi, India',
    current: true,
    summary:
      'Developing the NextGen eChallan platform for the Ministry of Road Transport & Highways (MoRTH), a Central Government initiative serving millions of citizens.',
    responsibilities: [
      'Developed the NextGen eChallan platform for MoRTH, spanning Manual Challan, Grievance Redressal, Vehicle History, Challan History, Role Management, Offence Management, Mobile Device Manager, Payment, and Dashboard modules.',
      'Independently designed and built the Payment Module end-to-end — payment initiation, gateway integration, transaction verification, receipt generation, and payment status tracking — fully integrated with the eChallan ecosystem.',
      'Developed the Dashboard Module, delivering consolidated, data-driven views of challan and payment activity for monitoring and decision-making.',
      'Implemented secure transaction flows and session management to safeguard sensitive payment data across the platform.',
      'Built and validated complex Reactive Forms with multi-field validation to ensure data integrity across citizen-facing workflows.',
      'Led a 7-person development team, driving scalable Angular architecture, conducting code reviews, and reducing development cycle time.',
      'Diagnosed and resolved production issues to maintain system stability and reliability for a live government platform.',
    ],
    technologies: ['Angular', 'TypeScript', 'RxJS', 'REST APIs', 'Docker', 'GitHub', 'HTML5', 'CSS3'],
    achievements: [
      'Led a 7-person development team',
      'Reduced development cycle time through embedded code-review practices',
    ],
  },
  {
    company: 'NetProphets Cyberworks Pvt Ltd',
    position: 'Senior Software Engineer',
    period: 'Sep 2023 – Aug 2025',
    location: 'New Delhi, India',
    summary:
      'Built and scaled NICSI-ERP, an in-house enterprise resource planning system managing customer and vendor operations via NICSI.',
    responsibilities: [
      'Built NICSI-ERP, an in-house enterprise resource planning system managing customer and vendor operations via NICSI, spanning multiple interrelated modules.',
      'Architected the migration of legacy modules to React.js, improving maintainability while preserving maximum system uptime.',
      'Delivered performance optimizations across the ERP application, improving page load speed and overall user experience.',
      'Built data visualization features using JS Chart to support resource allocation and data-driven decision-making.',
      'Coordinated with backend engineers to integrate RESTful APIs, improving the scalability of the client\u2019s digital infrastructure.',
      'Mentored junior developers on frontend best practices, improving team code quality and productivity.',
    ],
    technologies: ['React.js', 'Redux', 'TypeScript', 'JS Chart', 'Docker', 'GitLab', 'HTML5', 'TailwindCSS'],
    achievements: [
      'Architected legacy-to-React.js migration with maximum uptime',
      'Delivered performance and load-time improvements',
    ],
  },
  {
    company: 'Dev Information Technology Limited',
    position: 'Developer',
    period: 'May 2023 – Aug 2023',
    location: 'Kolkata, India',
    summary:
      'Developed the Marketing and Transport Module (MKTM) managing sales and transport operations for Cement Corporation of India (CCI).',
    responsibilities: [
      'Developed the Marketing and Transport Module (MKTM) to manage sales and transport operations for Cement Corporation of India (CCI), integrated with the broader CCI ERP ecosystem.',
      'Built robust, reusable Angular components for enterprise applications, improving system stability and reducing bug count.',
      'Delivered a dynamic, accessible frontend using Angular CLI 14, enhancing user interaction across the application.',
      'Participated in bi-weekly Scrum ceremonies focused on new feature integration and sprint planning.',
    ],
    technologies: ['Angular', 'TypeScript', 'JavaScript', 'JS Chart', 'HTML5', 'Bootstrap', 'CSS3'],
    achievements: ['Built reusable Angular components reducing bug count'],
  },
  {
    company: 'Velocis Systems Pvt Ltd',
    position: 'Developer',
    period: 'Jul 2021 – Apr 2023',
    location: 'Kolkata, India',
    summary:
      'Contributed to the Chennai Port Trust (ChPT) Port Operation Management System (POMS), an integrated platform overseeing end-to-end port operations.',
    responsibilities: [
      'Contributed to the Chennai Port Trust (ChPT) Port Operation Management System (POMS), an integrated platform overseeing end-to-end port operations.',
      'Built internal tools using Java Server Faces (JSF) and PostgreSQL to support operational workflows.',
      'Developed interactive UI components for client-facing applications, improving usability for operational staff.',
    ],
    technologies: ['JSF', 'PostgreSQL', 'JavaScript', 'HTML5', 'CSS3'],
    achievements: ['Improved usability for operational staff through interactive UI components'],
  },
];

export const projects: Project[] = [
  {
    name: 'NextGen eChallan',
    tagline: 'Citizen-facing traffic enforcement platform for the Ministry of Road Transport & Highways',
    category: 'Government Platform',
    period: 'Sep 2025 – Present',
    overview:
      'A Central Government initiative for MoRTH spanning Manual Challan, Grievance Redressal, Vehicle History, Challan History, Role Management, Offence Management, Mobile Device Manager, Payment, and Dashboard modules.',
    responsibilities: [
      'Developed platform modules serving citizens and enforcement authorities.',
      'Implemented secure transaction flows and session management.',
      'Built complex Reactive Forms with multi-field validation.',
      'Diagnosed and resolved production issues for a live government platform.',
    ],
    features: [
      'Manual Challan',
      'Grievance Redressal',
      'Vehicle & Challan History',
      'Role & Offence Management',
      'Mobile Device Manager',
      'Payment & Dashboard Modules',
    ],
    challenges:
      'Safeguarding sensitive payment data and maintaining stability across a high-traffic live government platform with complex multi-field citizen-facing forms.',
    solutions:
      'Secure transaction flows, session management, and validated Reactive Forms; production issue diagnosis and rapid resolution to sustain reliability.',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'REST APIs', 'Docker', 'GitHub'],
    demoUrl: '',
    githubUrl: '',
    accent: '#0891B2',
  },
  {
    name: 'NICSI-ERP',
    tagline: 'In-house enterprise resource planning system for customer and vendor operations',
    category: 'Enterprise ERP',
    period: 'Sep 2023 – Aug 2025',
    overview:
      'An in-house ERP managing customer and vendor operations via NICSI, spanning multiple interrelated modules — with a legacy-to-React migration and measurable performance gains.',
    responsibilities: [
      'Built and scaled an ERP managing customer and vendor operations.',
      'Architected legacy module migration to React.js with maximum uptime.',
      'Delivered performance optimizations improving page load speed.',
      'Built JS Chart data visualizations for resource allocation.',
      'Integrated RESTful APIs with backend engineers.',
    ],
    features: [
      'Customer & vendor operations',
      'Legacy-to-React.js migration',
      'JS Chart data visualization',
      'Performance-optimized modules',
    ],
    challenges:
      'Migrating legacy modules to React.js without downtime while preserving maximum system uptime on a live ERP.',
    solutions:
      'Phased, architecture-led migration with high maintainability, plus targeted performance optimizations and RESTful API integration.',
    technologies: ['React.js', 'Redux', 'TypeScript', 'JS Chart', 'Docker', 'GitLab', 'TailwindCSS'],
    demoUrl: '',
    githubUrl: '',
    accent: '#0891B2',
  },
  {
    name: 'CCI ERP — MKTM Module',
    tagline: 'Marketing and Transport Module for Cement Corporation of India',
    category: 'Government ERP',
    period: 'May 2023 – Aug 2023',
    overview:
      'The Marketing and Transport Module (MKTM) manages sales and transport operations for Cement Corporation of India (CCI), integrated with the broader CCI ERP ecosystem.',
    responsibilities: [
      'Developed sales and transport management workflows.',
      'Built robust, reusable Angular components reducing bug count.',
      'Delivered a dynamic, accessible frontend on Angular CLI 14.',
      'Participated in bi-weekly Scrum ceremonies and sprint planning.',
    ],
    features: [
      'Sales operations management',
      'Transport operations management',
      'Reusable enterprise Angular components',
    ],
    challenges: 'Delivering an accessible, dynamic frontend with reusable components under tight enterprise timelines.',
    solutions:
      'Reusable Angular component library on Angular CLI 14 with accessibility baked in, delivered through disciplined Scrum ceremonies.',
    technologies: ['Angular', 'TypeScript', 'JavaScript', 'JS Chart', 'HTML5', 'Bootstrap', 'CSS3'],
    demoUrl: '',
    githubUrl: '',
    accent: '#22D3EE',
  },
  {
    name: 'Port Operation Management System',
    tagline: 'Integrated platform for Chennai Port Trust (ChPT) end-to-end port operations',
    category: 'Government Platform',
    period: 'Jul 2021 – Apr 2023',
    overview:
      'An integrated platform overseeing end-to-end port operations for Chennai Port Trust, with internal tooling and client-facing interactive components.',
    responsibilities: [
      'Contributed to an integrated platform overseeing end-to-end port operations.',
      'Built internal tools using Java Server Faces (JSF) and PostgreSQL.',
      'Developed interactive UI components improving usability for operational staff.',
    ],
    features: [
      'End-to-end port operation workflows',
      'JSF + PostgreSQL internal tools',
      'Interactive operational UI components',
    ],
    challenges: 'Supporting complex, high-stakes port workflows with tooling that operational staff can use reliably.',
    solutions:
      'Purpose-built JSF and PostgreSQL internal tools paired with intuitive interactive UI components.',
    technologies: ['JSF', 'PostgreSQL', 'JavaScript', 'HTML5', 'CSS3'],
    demoUrl: '',
    githubUrl: '',
    accent: '#0E7490',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Frameworks & Libraries',
    description: 'Core application development with modern JavaScript frameworks.',
    skills: [
      { name: 'Angular', level: 95, icon: 'angular' },
      { name: 'React.js', level: 90, icon: 'react' },
      { name: 'TypeScript', level: 92, icon: 'typescript' },
      { name: 'JavaScript (ES6+)', level: 90, icon: 'javascript' },
    ],
  },
  {
    title: 'Markup & Styling',
    description: 'Pixel-perfect, responsive, and accessible user interfaces.',
    skills: [
      { name: 'HTML5', level: 95, icon: 'html5' },
      { name: 'CSS3', level: 92, icon: 'css3' },
      { name: 'SCSS', level: 88, icon: 'sass' },
      { name: 'TailwindCSS', level: 85, icon: 'tailwind' },
      { name: 'Bootstrap', level: 85, icon: 'bootstrap' },
    ],
  },
  {
    title: 'State Management',
    description: 'Reactive, predictable state across enterprise applications.',
    skills: [
      { name: 'Redux', level: 85, icon: 'redux' },
      { name: 'NgRx', level: 85, icon: 'layers' },
      { name: 'RxJS', level: 88, icon: 'activity' },
      { name: 'Reactive Forms', level: 90, icon: 'clipboard' },
      { name: 'Component-Based Architecture', level: 92, icon: 'layout' },
    ],
  },
  {
    title: 'Testing',
    description: 'Confidence through automated unit testing.',
    skills: [
      { name: 'Jasmine', level: 80, icon: 'shield' },
      { name: 'Karma', level: 80, icon: 'flask' },
    ],
  },
  {
    title: 'Tools & Workflow',
    description: 'Professional development workflow and delivery tooling.',
    skills: [
      { name: 'Docker', level: 75, icon: 'docker' },
      { name: 'Git', level: 90, icon: 'git' },
      { name: 'GitHub', level: 90, icon: 'github' },
      { name: 'GitLab', level: 85, icon: 'gitlab' },
      { name: 'Postman', level: 85, icon: 'postman' },
      { name: 'JS Chart', level: 82, icon: 'chart' },
    ],
  },
];

export const achievements: Achievement[] = [
  {
    icon: 'zap',
    title: 'Payment Module, Shipped End-to-End',
    description:
      'Sole frontend developer responsible for designing and shipping the Payment Module of a Central Government platform — from architecture through production.',
  },
  {
    icon: 'users',
    title: 'Led a 7-Member Team',
    description:
      'Led a 7-member Angular development team, embedding code-review practices that reduced development time.',
  },
  {
    icon: 'git-branch',
    title: 'Legacy-to-React.js Migration',
    description:
      'Drove a legacy-to-React.js migration that improved maintainability while sustaining maximum uptime for a live ERP system.',
  },
  {
    icon: 'rocket',
    title: 'Performance Improvements',
    description:
      'Delivered measurable performance and load-time improvements across two separate enterprise applications.',
  },
];

export const education: Education[] = [
  {
    degree: 'Master in Computer Application',
    institution: 'Vidyasagar University',
    period: 'Sep 2017 – Sep 2020',
    location: 'Medinipur, India',
    score: 'Marks: 75.80%',
  },
  {
    degree: 'Bachelor of Computer Application',
    institution: 'JIS College of Engineering',
    period: 'Jul 2014 – Aug 2017',
    location: 'Kalyani, India',
    score: 'DGPA: 7.96 / 10',
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Sample Testimonial — Project Lead',
    role: 'Government Platform (sample)',
    text: 'Soumya delivered a complex payment module end-to-end with remarkable ownership. Security, reliability, and clean code were evident at every stage.',
    sample: true,
  },
  {
    name: 'Sample Testimonial — Engineering Manager',
    role: 'Enterprise ERP (sample)',
    text: 'The React.js migration he architected kept our live ERP at maximum uptime while dramatically improving maintainability and performance.',
    sample: true,
  },
  {
    name: 'Sample Testimonial — Product Owner',
    role: 'eChallan Initiative (sample)',
    text: 'A reliable senior frontend developer who leads by example — code reviews, mentoring, and production stability all improved under his leadership.',
    sample: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'building-enterprise-angular-applications',
    title: 'Building Enterprise-Grade Angular Applications',
    excerpt:
      'Architecture patterns, signals, and component design that keep large Angular applications scalable and maintainable.',
    category: 'Angular',
    date: '2026-05-10',
    readTime: '6 min read',
    tags: ['Angular', 'Architecture', 'Signals'],
    demo: true,
    body: [
      'Enterprise Angular applications demand more than component libraries — they demand deliberate architecture. Over 5+ years building government and enterprise platforms, a few principles consistently separate maintainable codebases from legacy traps.',
      'Start with a domain-driven folder structure. Keep features isolated, shared code in shared modules, and models as the single source of truth. When business requirements change — and they always do — you want to touch one file, not ten.',
      'Embrace signals for local and global state. Angular signals make state flow explicit and predictable, and combined with OnPush change detection they keep performance predictable even as the component tree grows.',
      'Write reactive forms for anything data-driven. Multi-field validation on citizen-facing workflows is far easier to reason about with typed form models and explicit validators.',
      'Finally, invest in code review culture. Reviewing is where architecture debates happen and where junior developers learn. It is the cheapest performance optimization available to a team.',
    ],
  },
  {
    slug: 'angular-to-react-migration-lessons',
    title: 'From Angular to React: Lessons from a Legacy Migration',
    excerpt:
      'How we migrated legacy ERP modules to React.js while sustaining maximum uptime on a live system.',
    category: 'React',
    date: '2025-08-02',
    readTime: '5 min read',
    tags: ['React', 'Migration', 'TypeScript'],
    demo: true,
    body: [
      'Migrating a live ERP to React.js is a marathon, not a sprint. The critical constraint was uptime — end users could not wait while we rebuilt their tools.',
      'We migrated module by module behind feature flags, keeping the legacy system authoritative until each replacement passed parity checks. TypeScript gave us the confidence to refactor aggressively.',
      'Redux provided predictable state that mirrored the business model, while a shared component library kept UI consistent across old and new surfaces.',
      'The result was a codebase that was easier to maintain, faster to extend, and measurably quicker to load — with zero downtime for the operations relying on it.',
    ],
  },
  {
    slug: 'mastering-typescript-scalable-frontends',
    title: 'Mastering TypeScript for Scalable Frontend Codebases',
    excerpt:
      'Types are the documentation that never goes stale — patterns for modeling complex domains with TypeScript.',
    category: 'TypeScript',
    date: '2025-05-19',
    readTime: '5 min read',
    tags: ['TypeScript', 'Best Practices'],
    demo: true,
    body: [
      'TypeScript is where scalable frontend codebases are won or lost. Strong typing is a safety net that lets teams move fast without breaking things.',
      'Model your domain first. A payment transaction is not a loosely-typed object — it has a lifecycle, states, and invariants. Explicit unions and discriminated types turn impossible states into compile errors.',
      'Prefer inference when it is obvious, and be explicit where it matters — especially at API boundaries where JSON arrives untyped.',
      'Treat strict mode as non-negotiable. The small cost of writing types is repaid many times over in refactoring safety and onboarding speed.',
    ],
  },
  {
    slug: 'frontend-architecture-government-platforms',
    title: 'Frontend Architecture Patterns for Government Platforms',
    excerpt:
      'Reliability, accessibility, and security patterns for public-sector web platforms that millions rely on.',
    category: 'Architecture',
    date: '2025-03-08',
    readTime: '7 min read',
    tags: ['Architecture', 'Accessibility', 'Security'],
    demo: true,
    body: [
      'Government platforms carry unique responsibilities: millions of users, strict accessibility mandates, and security requirements where a mistake is not a bug but a breach.',
      'Security starts in the frontend: session management, secure transaction flows, and never trusting client-side data without server validation. For payment flows, every step from initiation to verification must be traceable.',
      'Accessibility is non-negotiable — keyboard navigation, semantic structure, and screen-reader support are core features, not polish items.',
      'Performance is a public service. On constrained connections, every kilobyte matters. Lazy loading, deferred sections, and lean bundles are standard practice, not optimization afterthoughts.',
    ],
  },
  {
    slug: 'performance-optimization-enterprise-dashboards',
    title: 'Performance Optimization Strategies for Enterprise Dashboards',
    excerpt:
      'Measurable techniques that improved load time and user experience across two enterprise applications.',
    category: 'Performance',
    date: '2024-12-15',
    readTime: '6 min read',
    tags: ['Performance', 'Angular', 'React'],
    demo: true,
    body: [
      'Dashboards are where performance goes to die — dozens of charts, tables, and live-updating widgets all competing for the main thread.',
      'Measure first. If you cannot point at a number, you cannot claim an improvement. Lighthouse budgets and real-user monitoring make performance a tracked metric, not a feeling.',
      'Cut the initial payload: lazy-loaded routes, deferred below-the-fold sections, and tree-shaken bundles. Then make updates cheap with OnPush rendering and memoized selectors.',
      'Virtualize long lists, throttle expensive subscriptions, and never render what is not visible. Across two enterprise applications these patterns delivered measurable load-time improvements.',
    ],
  },
];

export const navLinks: NavLink[] = [
  { label: 'Home', sectionId: 'home', icon: 'home' },
  { label: 'Profile', sectionId: 'photo', icon: 'user' },
  { label: 'Skills', sectionId: 'skills', icon: 'zap' },
  { label: 'Craft', sectionId: 'craft', icon: 'layers' },
  { label: 'Projects', sectionId: 'projects', icon: 'folder' },
  { label: 'Education', sectionId: 'education', icon: 'graduation-cap' },
  { label: 'Blog', sectionId: 'blog', icon: 'book' },
  { label: 'Contact', sectionId: 'contact', icon: 'mail' },
];

export const careerTimeline: TimelineItem[] = [
  {
    title: 'Angular Developer',
    subtitle: 'Echt Tech Consultancy Services Pvt Ltd',
    period: 'Sep 2025 – Present',
    description: 'Leading NextGen eChallan development for MoRTH, a Central Government platform.',
    icon: 'briefcase',
  },
  {
    title: 'Senior Software Engineer',
    subtitle: 'NetProphets Cyberworks Pvt Ltd',
    period: 'Sep 2023 – Aug 2025',
    description: 'NICSI-ERP with legacy-to-React.js migration and performance optimization.',
    icon: 'rocket',
  },
  {
    title: 'Developer',
    subtitle: 'Dev Information Technology Limited',
    period: 'May 2023 – Aug 2023',
    description: 'CCI ERP Marketing and Transport Module with reusable Angular components.',
    icon: 'code',
  },
  {
    title: 'Developer',
    subtitle: 'Velocis Systems Pvt Ltd',
    period: 'Jul 2021 – Apr 2023',
    description: 'Chennai Port Trust Port Operation Management System.',
    icon: 'anchor',
  },
];
