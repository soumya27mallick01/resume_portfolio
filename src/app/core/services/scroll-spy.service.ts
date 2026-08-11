import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { scrollToSection } from '../../utils/scroll';

/**
 * Tracks the section currently in view for scroll-spy navigation highlighting.
 * Uses a geometric "section top has passed a band line" test, which is robust
 * against oversized or pinned sections (e.g. the grouped Projects wrapper)
 * where intersection-ratio comparisons fail.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private initialized = false;
  private ticking = false;
  private handles = new Set<() => void>();

  readonly activeSection = signal('home');

  init(): void {
    if (this.initialized || !this.document) return;
    this.initialized = true;

    const onNavigation = (): void => {
      const fullUrl = this.router.parseUrl(this.router.url);
      const fragment = fullUrl.fragment;
      const path = fullUrl.toString().split('#')[0];

      if (path.startsWith('/blog/')) {
        this.activeSection.set('blog');
      } else if (path !== '' && path !== '/') {
        this.activeSection.set('home');
      }

      if (fragment) {
        window.setTimeout(() => this.scrollToSectionWhenReady(fragment), 0);
      }
    };

    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(onNavigation);
    onNavigation();

    const doc = this.document;

    const update = (): void => {
      if (this.ticking) return;
      this.ticking = true;
      window.requestAnimationFrame(() => {
        const band = window.innerHeight * 0.4;
        const sections = Array.from(
          doc.querySelectorAll<HTMLElement>(
            'section[id], [class~="section"][id], #home',
          ),
        );
        if (!sections.length) {
          this.ticking = false;
          return;
        }
        let current = 'home';
        for (const el of sections) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= band && rect.bottom > 0) {
            current = el.id || current;
          }
        }
        this.activeSection.set(current);
        this.ticking = false;
      });
    };

    const onScroll = (): void => update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    this.handles.add(() => window.removeEventListener('scroll', onScroll));
    this.handles.add(() => window.removeEventListener('resize', onScroll));
    update();
  }

  /** Flash-highlights the target section after a nav click so the user sees where they landed. */
  highlightSection(sectionId: string): void {
    const el = this.document.getElementById(sectionId);
    if (!el) return;
    el.classList.add('section--targeted');
    window.setTimeout(() => {
      el.classList.remove('section--targeted');
    }, 1600);
  }

  /**
   * Scrolls to a section once it is in the DOM. Used for cross-route
   * navigation (e.g. Back to Blog) where the lazy-loaded home page is not yet
   * rendered when the router finishes navigating. Polls until the section
   * exists, then smooth-scrolls with the navbar offset.
   */
  scrollToSectionWhenReady(sectionId: string): void {
    const tryScroll = (attempt: number): void => {
      const el = this.document.getElementById(sectionId);
      if (el) {
        this.highlightSection(sectionId);
        void this.scrollWhenSettled(sectionId);
        return;
      }
      if (attempt < 100) window.setTimeout(() => tryScroll(attempt + 1), 100);
    };
    tryScroll(0);
  }

  /**
   * Waits for the page layout to settle before scrolling. Lazy-loaded home
   * content (GSAP pinned sections, images, fonts) can push the target down
   * after it first appears in the DOM — scrolling immediately would land the
   * user on the section above. Once the position stops changing, scrolls and
   * verifies the section actually landed in view, re-scrolling if it drifted.
   */
  private async scrollWhenSettled(sectionId: string): Promise<void> {
    const position = (): number => {
      const el = this.document.getElementById(sectionId);
      if (!el) return -1;
      return el.getBoundingClientRect().top + window.scrollY;
    };
    let previous = position();
    for (let i = 0; i < 80; i++) {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
      const current = position();
      if (current >= 0 && Math.abs(current - previous) < 2) break;
      previous = current;
    }
    this.scrollAndVerify(sectionId, 0);
  }

  private scrollAndVerify(sectionId: string, attempt: number): void {
    if (attempt >= 2) return;
    scrollToSection(sectionId);
    window.setTimeout(() => {
      const el = this.document.getElementById(sectionId);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > 140 || rect.bottom < 0) {
        this.scrollAndVerify(sectionId, attempt + 1);
      }
    }, 1500);
  }

  /** Force the active section (e.g. on routes without scroll-spy sections). */
  setActive(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  destroy(): void {
    this.handles.forEach((remove) => remove());
    this.handles.clear();
    this.initialized = false;
  }
}