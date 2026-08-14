import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { skillGroups } from '../../../data/resume.data';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  host: {
    class: 'section',
    id: 'skills',
  },
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
  protected readonly skillGroups = skillGroups;
  protected readonly activeIndex = signal(0);
  protected readonly paused = signal(false);
  /** Narrow viewports show only the active card so coverflow cards can't overlap it. */
  protected readonly compact = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef<HTMLElement>);
  private inView = true;
  private timer: ReturnType<typeof setInterval> | null = null;
  private media: MediaQueryList | null = null;
  private readonly onCompactChange = (e: MediaQueryListEvent): void => this.compact.set(e.matches);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      this.media = window.matchMedia('(max-width: 760px)');
      this.compact.set(this.media.matches);
      this.media.addEventListener('change', this.onCompactChange);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const io = new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
      });
      io.observe(this.el.nativeElement);
      this.timer = setInterval(() => {
        if (!this.paused() && this.inView) this.next();
      }, 4500);
    });
  }

  ngOnDestroy(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.media?.removeEventListener('change', this.onCompactChange);
  }

  protected next(): void {
    this.activeIndex.update((i) => (i + 1) % this.skillGroups.length);
  }

  protected prev(): void {
    this.activeIndex.update((i) => (i - 1 + this.skillGroups.length) % this.skillGroups.length);
  }

  protected focus(i: number): void {
    this.activeIndex.set(i);
  }

  /** Wrapped distance of card `i` from the active card, within [-2, 2]. */
  private delta(i: number): number {
    const n = this.skillGroups.length;
    let d = i - this.activeIndex();
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  protected cardTransform(i: number): string {
    const d = this.delta(i);
    const base = 'translate(-50%, -50%)';
    if (this.compact()) return base;
    if (d === 0) return base + ' translateZ(0) rotateY(0deg) scale(1)';
    if (Math.abs(d) === 1) {
      // Push neighbors back and to the side so their surfaces stay clear of the
      // active card's text while still hinting at the carousel depth.
      return base + ` translateX(${d * 66}%) translateZ(-240px) rotateY(${-d * 46}deg) scale(0.88)`;
    }
    return base + ` translateX(${d * 125}%) translateZ(-420px) rotateY(${-d * 32}deg) scale(0.72)`;
  }

  protected cardOpacity(i: number): number {
    const a = Math.abs(this.delta(i));
    return this.compact() ? (a === 0 ? 1 : 0) : a === 0 ? 1 : a === 1 ? 0.18 : 0;
  }

  protected cardZ(i: number): number {
    return this.compact() ? (i === this.activeIndex() ? 10 : 1) : 10 - Math.abs(this.delta(i));
  }
}
