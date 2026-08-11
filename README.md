# resume_portfolio
A modern, high-performance personal portfolio built with Angular 20 — featuring resume-driven content, smooth scrolling, 3D visuals, a command palette, and full PWA + SSR support.
✨ Features
- Sections: Hero (Home), Profile, Skills, Craft, Projects, Education, Blog, Contact — navigation driven by a scroll-spy with animated navbar indicator.
- Smooth scrolling with Lenis and GSAP ScrollTrigger (pinned scrollytelling project cards).
- 3D visuals with Three.js — animated gyroscopic rings, particle scenes and a three.js background scene.
- Command palette (⌘K) for quick navigation across the site.
- Theming — dark / light / system modes with persistence.
- Custom cursor, magnetic buttons, tilt effects, reveal-on-scroll animations and a typing hero.
- Blog — detail pages for articles with SEO meta management.
- Contact form with validation and success/error states.
- PWA — installable with offline support, service worker and manifest.
- SSR + prerendering for fast first paint and SEO.
- Fully responsive with a mobile navigation menu.

- 🛠️ Tech Stack
Layer	Technology
Framework -	Angular 20 (standalone components, signals, new control flow)
Language -	TypeScript ~5.9
Styling -	SCSS (dark/light themes, glassmorphism)
Animations -	GSAP 3 + ScrollTrigger
Smooth scroll -	Lenis
3D graphics -	Three.js
PWA	- Angular Service Worker
SSR -	Angular Universal / @angular/ssr + Express
Tests -	Karma + Jasmine

🚀 Getting Started
# Install dependencies
npm install

# Development server → http://localhost:4200
npm start

# Production build (output in dist/)
npm run build

# Run unit tests
npm test

# Serve the SSR build
npm run serve:ssr:angularApp

⚙️ Configuration
Most content lives in src/app/data/resume.data.ts — profile, experience, projects, skills, education, testimonials and blog posts are all driven from there, so you can update your information in one place.
Social links, SEO meta and JSON-LD structured data are configured in src/index.html.

🌐 Deployment
The app supports static hosting (prerendered routes) or Node SSR (dist/angularApp/server/server.mjs). Standard Angular deployments work with any static host; ensure the service worker and PWA assets (public/) are served with the build output.
