import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'button[appMagnetic], a[appMagnetic]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.transform]': 'transform()',
    '[style.transition]': 'transitionStyle()',
    '[style.will-change]': '"transform"',
  },
  templateUrl: './magnetic-button.component.html',
})
export class MagneticButtonDirective {
  readonly strength = input(0.3, { transform: (v: number | string) => Number(v) });

  protected readonly transform = signal('');
  protected readonly transitionStyle = signal('');

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    afterNextRender(() => {
      if (
        !window.matchMedia('(pointer: fine)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }
      const native = this.el.nativeElement;
      native.addEventListener('mousemove', this.onMove);
      native.addEventListener('mouseleave', this.onLeave);
    });
  }

  private readonly onMove = (event: MouseEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * this.strength();
    const y = (event.clientY - rect.top - rect.height / 2) * this.strength();
    this.transform.set('translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)');
    this.transitionStyle.set('');
    this.cdr.markForCheck();
  };

  private readonly onLeave = (): void => {
    this.transitionStyle.set('transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)');
    this.transform.set('');
    this.cdr.markForCheck();
  };
}