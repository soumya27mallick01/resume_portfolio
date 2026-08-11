import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, PLATFORM_ID, afterNextRender, inject } from '@angular/core';

/** Material-style ripple on pointer-down inside the host element. */
@Directive({
  selector: '[appRipple]',
  host: {
    '[style.position]': '"relative"',
    '[style.overflow]': '"hidden"',
  },
})
export class RippleDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      this.el.nativeElement.addEventListener('pointerdown', (event: PointerEvent) => {
        if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = this.el.nativeElement.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.el.nativeElement.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }
}
