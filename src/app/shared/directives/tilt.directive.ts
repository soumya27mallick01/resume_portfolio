import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  signal,
  ChangeDetectorRef,
} from '@angular/core';

@Directive({
  selector: '[appTilt]',
  host: {
    '[style.transform]': 'tiltTransform()',
    '[style.transition]': 'transitionStyle()',
    '[style.transform-style]': '"preserve-3d"',
    '[style.will-change]': '"transform"',
  },
})
export class TiltDirective {
  readonly maxTilt = input(8, { transform: (v: number | string) => Number(v) });

  protected readonly tiltTransform = signal('');
  protected readonly transitionStyle = signal('transform 0.2s ease-out');

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private enabled = false;
  private hovering = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      this.enabled =
        window.matchMedia('(pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!this.enabled) return;
      const native = this.el.nativeElement;
      native.addEventListener('mousemove', this.onMove);
      native.addEventListener('mouseenter', this.onEnter);
      native.addEventListener('mouseleave', this.onLeave);
    });
  }

  private readonly onEnter = (): void => {
    this.hovering = true;
    this.transitionStyle.set('transform 0.15s ease-out');
    this.cdr.markForCheck();
  };

  private readonly onMove = (event: MouseEvent): void => {
    if (!this.hovering) return;
    const { left, top, width, height } = this.el.nativeElement.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    const rotateY = x * this.maxTilt() * 2;
    const rotateX = -y * this.maxTilt() * 2;
    this.tiltTransform.set(
      'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.03, 1.03, 1.03)',
    );
    this.cdr.markForCheck();
  };

  private readonly onLeave = (): void => {
    this.hovering = false;
    this.tiltTransform.set('');
    this.transitionStyle.set('transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)');
    this.cdr.markForCheck();
  };
}