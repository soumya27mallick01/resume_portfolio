import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type gsap from 'gsap';
import { registerSmoothScroll } from '../../utils/scroll';

/**
 * Global Lenis smooth-scroll integration.
 * Drives the real window scroll and keeps GSAP ScrollTrigger in sync.
 * Falls back to native scrolling when reduced motion is preferred.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private lenis: unknown = null;
  private disposed = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.lenis || this.disposed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    void import('lenis').then(({ default: Lenis }) => {
      if (this.disposed) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
        autoRaf: true,
        autoResize: true,
      });

      this.lenis = lenis;
      registerSmoothScroll(lenis);

      void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        lenis.on('scroll', () => ScrollTrigger.update());
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    });
  }

  stop(): void {
    if (this.lenis && 'stop' in (this.lenis as object)) {
      (this.lenis as { stop: () => void }).stop();
    }
  }

  /** Recompute Lenis dimensions after SPA route changes so scroll targets aren't clamped to stale limits. */
  refresh(): void {
    if (this.lenis && 'resize' in (this.lenis as object)) {
      (this.lenis as { resize: () => void }).resize();
    }
  }

  start(): void {
    if (this.lenis && 'start' in (this.lenis as object)) {
      (this.lenis as { start: () => void }).start();
    }
  }

  destroy(): void {
    this.disposed = true;
    registerSmoothScroll(null);
    if (this.lenis && 'destroy' in (this.lenis as object)) {
      (this.lenis as { destroy: () => void }).destroy();
    }
    this.lenis = null;
  }
}
