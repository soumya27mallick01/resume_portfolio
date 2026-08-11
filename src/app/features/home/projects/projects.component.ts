import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { projects } from '../../../data/resume.data';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import type gsapModule from 'gsap';

const MAX_TECH = 4;

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/**
 * "Enterprise Systems I've Built" — a GSAP pinned scrollytelling card stack.
 * Cards sit fanned in a pile; scrolling peels the top card off while the
 * deck closes up, handing the stage to the next system. Each card carries
 * its period and computed tenure. Falls back to a plain stacked list under
 * reduced motion.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent],
  host: {
    class: 'section',
    id: 'projects',
  },
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnDestroy {
  protected readonly projects = projects;
  protected readonly bars = [40, 70, 55, 85, 62, 92, 48, 76, 58, 88, 66, 45];
  protected readonly maxTech = MAX_TECH;

  protected readonly activeIndex = signal(0);
  protected readonly expanded = signal<number | null>(null);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private disposed = false;
  private cleanup: (() => void) | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      this.cleanup = this.initPin();
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  protected toggleExpand(i: number): void {
    this.expanded.update((v) => (v === i ? null : i));
  }

  protected pad(v: number): string {
    return String(v).padStart(2, '0');
  }

  /** Human-friendly tenure for a "Mon YYYY – Mon YYYY | Present" period. */
  protected tenure(period: string): string {
    const parts = period.split('\u2013').map((s) => s.trim());
    if (parts.length < 2) return '';
    const parse = (part: string): Date | null => {
      if (/^present$/i.test(part)) return new Date();
      const match = part.match(/^([A-Za-z]{3,}) (\d{4})$/);
      const month = match ? MONTHS[match[1]] : undefined;
      if (!match || month === undefined) return null;
      return new Date(Date.UTC(Number(match[2]), month, 1));
    };
    const start = parse(parts[0]);
    const end = parse(parts[1]);
    if (!start || !end || end.getTime() < start.getTime()) return '';
    const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1;
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (years > 0 && rest > 0) return `${years} yr${years > 1 ? 's' : ''} ${rest} mo${rest > 1 ? 's' : ''}`;
    if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`;
    return `${months} mo${months > 1 ? 's' : ''}`;
  }

  /**
   * Pinned scrollytelling card stack: the section host is pinned while the
   * deck plays. Cards sit fanned in a pile — each deeper card peeks below the
   * one above it. Scrolling peels the top card off (it lifts and fades as the
   * deck closes up around it), handing the stage to the next system. Scroll
   * position drives the active index. Falls back to a plain stacked list
   * under reduced motion.
   */
  private initPin(): () => void {
    const pin = this.el.nativeElement.querySelector('.proj-pin') as HTMLElement | null;
    const track = this.el.nativeElement.querySelector('.proj-pin__track') as HTMLElement | null;
    const slides = Array.from(track?.querySelectorAll<HTMLElement>('.proj-slide') ?? []);
    const count = slides.length;
    if (!pin || !track || count < 2) return () => undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;

    pin.classList.add('proj-pin--pinned');

    let cleanup: (() => void) | null = null;
    let active = true;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (this.disposed || !active) {
        pin.classList.remove('proj-pin--pinned');
        return;
      }
      gsap.registerPlugin(ScrollTrigger);

      const gap = Math.min(44, Math.max(26, Math.round(window.innerHeight * 0.045)));
      const slot = (j: number): Record<string, string> => ({
        y: `${j * gap}px`,
        scale: String(1 - j * 0.055),
      });

      slides.forEach((card, j) => {
        gsap.set(card, { ...slot(j), zIndex: count - j, autoAlpha: 1 });
      });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const last = count - 1;
            const idx = self.progress >= 1 ? last : Math.round(self.progress * last);
            this.activeIndex.set(idx);
          },
        },
      });

      if (!timeline.scrollTrigger) {
        pin.classList.remove('proj-pin--pinned');
        cleanup = null;
        return;
      }

      for (let i = 0; i < count - 1; i++) {
        timeline
          .to(
            slides[i],
            {
              autoAlpha: 0.05,
              y: `-${gap * 2.3}px`,
              scale: 0.9,
              duration: 0.55,
              ease: 'power3.in',
            },
            i,
          )
          .to(
            slides.slice(i + 1),
            {
              y: (_index: number, target: HTMLElement) => {
                const j = slides.indexOf(target);
                return `${(j - i - 1) * gap}px`;
              },
              scale: (_index: number, target: HTMLElement) => String(1 - (slides.indexOf(target) - i - 1) * 0.055),
              duration: 1.05,
              ease: 'power2.inOut',
            },
            i,
          );
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());

      cleanup = () => {
        active = false;
        timeline.scrollTrigger?.kill();
        timeline.kill();
        pin.classList.remove('proj-pin--pinned');
      };
    });

    return () => {
      cleanup?.();
    };
  }
}