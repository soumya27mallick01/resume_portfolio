import { ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface TerminalLine {
  kind: 'cmd' | 'out' | 'blank';
  text: string;
}

interface RenderedLine {
  kind: 'cmd' | 'out' | 'blank';
  text: string;
}

const SCRIPT: TerminalLine[] = [
  { kind: 'cmd', text: 'whoami' },
  { kind: 'out', text: 'soumya-kumar-mallick — Senior Frontend Developer' },
  { kind: 'blank', text: '' },
  { kind: 'cmd', text: 'cat profile.json' },
  { kind: 'out', text: '{' },
  { kind: 'out', text: '  "name": "Soumya Kumar Mallick",' },
  { kind: 'out', text: '  "role": "Senior Frontend Developer",' },
  { kind: 'out', text: '  "stack": ["Angular", "React", "TypeScript"],' },
  { kind: 'out', text: '  "focus": "Enterprise UI",' },
  { kind: 'out', text: '  "status": "open to work"' },
  { kind: 'out', text: '}' },
  { kind: 'blank', text: '' },
  { kind: 'cmd', text: './ship --status' },
  { kind: 'out', text: 'done' },
  { kind: 'blank', text: '' },
];

const MAX_LINES = 12;

/** Self-typing terminal window. Commands are typed character-by-character, output prints, then it loops. */
@Component({
  selector: 'app-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-hidden]': '"true"',
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
  },
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css'],
})
export class TerminalComponent {
  protected readonly prompt = '➜ ~';
  protected readonly rendered = signal<RenderedLine[]>([]);
  protected readonly typing = signal<string | null>(null);
  protected readonly paused = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly lines = SCRIPT;
  private lineIndex = 0;
  private destroyed = false;
  private visible = true;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        this.rendered.set(this.lines.map((l) => ({ kind: l.kind, text: l.text })));
        return;
      }
      const io = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
      });
      io.observe(this.el.nativeElement);
      void this.play();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  private async play(): Promise<void> {
    while (!this.destroyed) {
      const line = this.lines[this.lineIndex];
      if (line.kind === 'cmd') {
        await this.typeCommand(line.text);
        this.pushLine('cmd', line.text);
        this.typing.set(null);
        await this.delay(420);
      } else if (line.kind === 'out') {
        this.pushLine('out', line.text);
        await this.delay(70 + Math.random() * 140);
      } else {
        this.pushLine('blank', '');
        await this.delay(200);
      }
      this.lineIndex = (this.lineIndex + 1) % this.lines.length;
      if (this.lineIndex === 0) {
        await this.delay(1600);
        this.rendered.set([]);
        await this.delay(300);
      }
    }
  }

  private pushLine(kind: RenderedLine['kind'], text: string): void {
    this.rendered.update((prev) => [...prev, { kind, text } as RenderedLine].slice(-MAX_LINES));
  }

  private async typeCommand(text: string): Promise<void> {
    for (let i = 0; i <= text.length; i++) {
      this.typing.set(text.slice(0, i));
      await this.delay(28 + Math.random() * 60);
    }
  }

  private async delay(ms: number): Promise<void> {
    const deadline = Date.now() + ms;
    while (!this.destroyed) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) return;
      if (this.paused() || !this.visible) {
        await this.wait(120);
      } else {
        await this.wait(Math.min(remaining, 50));
      }
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
