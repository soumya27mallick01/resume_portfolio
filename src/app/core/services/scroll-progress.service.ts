import { Injectable, signal } from '@angular/core';

/** Scroll progress across the whole page, as a 0–100 number (rAF-throttled). */
@Injectable({ providedIn: 'root' })
export class ScrollProgressService {
  readonly progress = signal(0);
  readonly scrolledPastThreshold = signal(false);
  private ticking = false;

  init(): void {
    this.onScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  destroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const value = max > 0 ? (window.scrollY / max) * 100 : 0;
      this.progress.set(value);
      this.scrolledPastThreshold.set(window.scrollY > window.innerHeight * 0.8);
      this.ticking = false;
    });
  };
}
