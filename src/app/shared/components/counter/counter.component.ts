import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { easeOutExpo } from '../../../utils/ease';

/** Animated number that counts up from 0 when scrolled into view. */
@Component({
  selector: 'app-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'counter',
    '[attr.aria-live]': '"polite"',
  },
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
})
export class CounterComponent {
  readonly value = input.required<number>();
  readonly suffix = input('');
  readonly duration = input(1600, { transform: (v: number | string) => Number(v) });

  protected readonly display = computed(() => this.current() + this.suffix());

  private readonly current = signal(0);
  private readonly el = inject(ElementRef<HTMLElement>);
  private started = false;

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.current.set(this.value());
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !this.started) {
            this.started = true;
            this.animate();
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(this.el.nativeElement);
    });
  }

  private animate(): void {
    const start = performance.now();
    const from = 0;
    const to = this.value();
    const duration = this.duration();
    const tick = (now: number): void => {
      const t = Math.min((now - start) / duration, 1);
      this.current.set(Math.round(from + (to - from) * easeOutExpo(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
