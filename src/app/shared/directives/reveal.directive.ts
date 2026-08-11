import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  signal,
} from '@angular/core';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'zoom';

@Directive({
  selector: '[appReveal]',
  host: {
    '[class.is-revealed]': 'revealed()',
    '[attr.appReveal]': 'direction()',
  },
})
export class RevealDirective implements AfterViewInit {
  readonly direction = input<RevealDirection>('up');
  readonly delay = input(0, { transform: (v: number | string) => Number(v) });
  readonly threshold = input(0.15, { transform: (v: number | string) => Number(v) });

  protected readonly revealed = signal(false);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    const native = this.el.nativeElement;
    native.style.transitionDelay = this.delay() + 'ms';

    const reveal = (): void => {
      this.revealed.set(true);
      this.cdr.markForCheck();
    };

    if (!isPlatformBrowser(this.platformId)) {
      reveal();
      return;
    }
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: this.threshold(), rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(native);
  }
}