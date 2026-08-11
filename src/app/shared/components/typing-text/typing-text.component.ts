import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  input,
  signal,
} from '@angular/core';

/** Animated typing / deleting / cursor-blink text effect cycling through a list of phrases. */
@Component({
  selector: 'app-typing-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'typing-text',
  },
  templateUrl: './typing-text.component.html',
  styleUrls: ['./typing-text.component.css'],
})
export class TypingTextComponent {
  readonly phrases = input.required<string[]>();
  readonly typeSpeed = input(65, { transform: (v: number | string) => Number(v) });
  readonly deleteSpeed = input(35, { transform: (v: number | string) => Number(v) });
  readonly pause = input(1800, { transform: (v: number | string) => Number(v) });

  protected readonly value = signal('');

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.value.set(this.phrases()[0] ?? '');
        return;
      }
      this.loop(0, true);
    });
  }

  private loop(phraseIndex: number, typing: boolean): void {
    const phrases = this.phrases();
    if (phrases.length === 0) return;
    const phrase = phrases[phraseIndex % phrases.length];
    const current = this.value();

    if (typing) {
      if (current.length < phrase.length) {
        this.value.set(phrase.slice(0, current.length + 1));
        setTimeout(() => this.loop(phraseIndex, true), this.typeSpeed());
      } else {
        setTimeout(() => this.loop(phraseIndex, false), this.pause());
      }
    } else if (current.length > 0) {
      this.value.set(phrase.slice(0, current.length - 1));
      setTimeout(() => this.loop(phraseIndex, false), this.deleteSpeed());
    } else {
      this.loop(phraseIndex + 1, true);
    }
  }
}
