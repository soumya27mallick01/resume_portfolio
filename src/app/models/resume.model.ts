/** Strongly-typed models describing the entire resume-driven content of the portfolio. */

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  tagline: string;
  roles: string[];
  summary: string;
  email: string;
  emailHref: string;
  location: string;
  linkedin: string;
  github: string;
  resumeUrl: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  location: string;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  current?: boolean;
}

export interface Project {
  name: string;
  tagline: string;
  category: string;
  period: string;
  overview: string;
  responsibilities: string[];
  features: string[];
  challenges: string;
  solutions: string;
  technologies: string[];
  demoUrl: string;
  githubUrl: string;
  accent: string;
}

export interface SkillGroup {
  title: string;
  description: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: number;
  icon: string;
}

export interface Achievement {
  icon: string;
  title: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  location: string;
  score?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  sample: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  body: string[];
  demo: boolean;
}

export interface NavLink {
  label: string;
  sectionId: string;
  icon: string;
}

export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
  icon: string;
}
