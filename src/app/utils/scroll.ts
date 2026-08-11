import type Lenis from 'lenis';

let lenis: Lenis | null = null;

/** Internal — SmoothScrollService registers the active Lenis instance here. */
export function registerSmoothScroll(instance: Lenis | null): void {
  lenis = instance;
}

const NAVBAR_HEIGHT = 72;

export function smoothScrollTo(top: number): void {
  if (lenis) lenis.scrollTo(top, { duration: 1.1 });
  else window.scrollTo({ top, behavior: 'smooth' });
}

/** Smooth-scroll to a section by id, accounting for the fixed navbar height. */
export function scrollToSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;
  if (lenis) lenis.resize();
  const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
  smoothScrollTo(top);
}

export function scrollToTop(): void {
  smoothScrollTo(0);
}
