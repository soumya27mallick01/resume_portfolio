import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'portfolio-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly prefersDark =
    isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  /** User-selected mode: dark | light | system */
  readonly mode = signal<ThemeMode>('dark');

  /** Resolved actual theme applied to the document */
  readonly resolved = computed<ResolvedTheme>(() => {
    const m = this.mode();
    if (m !== 'system') return m;
    return this.prefersDark?.matches ? 'dark' : 'light';
  });

  constructor() {
    this.prefersDark?.addEventListener('change', () => this.apply());
    const stored = this.readStored();
    if (stored) this.mode.set(stored);
    this.mode();
    effect(() => this.apply());
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* private mode */
      }
    }
  }

  toggle(): void {
    const order: ThemeMode[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(this.mode()) + 1) % order.length];
    this.setMode(next);
  }

  private readStored(): ThemeMode | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'dark' || value === 'light' || value === 'system' ? value : null;
    } catch {
      return null;
    }
  }

  private apply(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const theme = this.resolved();
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#050816' : '#ffffff');
    }
  }
}
