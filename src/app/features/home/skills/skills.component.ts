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

  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef<HTMLElement>);
  private inView = true;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
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
    if (d === 0) return base + ' translateZ(0) rotateY(0deg) scale(1)';
    if (Math.abs(d) === 1) {
      return base + ` translateX(${d * 58}%) translateZ(-200px) rotateY(${-d * 42}deg) scale(0.9)`;
    }
    return base + ` translateX(${d * 125}%) translateZ(-380px) rotateY(${-d * 32}deg) scale(0.72)`;
  }

  protected cardOpacity(i: number): number {
    const a = Math.abs(this.delta(i));
    return a === 0 ? 1 : a === 1 ? 0.55 : 0;
  }

  protected cardZ(i: number): number {
    return 10 - Math.abs(this.delta(i));
  }
}
