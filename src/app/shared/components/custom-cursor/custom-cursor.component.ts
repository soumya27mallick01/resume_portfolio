import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  type AfterViewInit,
} from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
}

/** Bubbly particle-trail cursor with elastic squish, trailing ring and attractive movement. */
@Component({
  selector: 'app-custom-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'custom-cursor',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './custom-cursor.component.html',
  styleUrls: ['./custom-cursor.component.css'],
})
export class CustomCursorComponent implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dot: HTMLElement | null = null;
  private ring: HTMLElement | null = null;
  private raf = 0;
  private x = 0;
  private y = 0;
  private ringX = 0;
  private ringY = 0;
  private lastX = 0;
  private lastY = 0;
  private speed = 0;
  private dirX = 0;
  private dirY = 0;
  private particles: Particle[] = [];
  private maxParticles = 60;
  private initialised = false;
  private scrollVelocity = 0;
  private lastScrollY = 0;
  private scrollY = 0;
  private targetScrollY = 0;

  constructor() {
    afterNextRender(() => this.init());
  }

  ngAfterViewInit(): void {
    this.init();
  }

  private init(): void {
    if (this.initialised || typeof window === 'undefined') return;
    this.initialised = true;

    const root = this.el.nativeElement;
    this.canvas = root.querySelector('.cursor-canvas');
    this.dot = root.querySelector('.cursor-dot');
    this.ring = root.querySelector('.cursor-ring');
    if (!this.canvas || !this.dot) return;

    const move = (e: MouseEvent): void => this.onMove(e.clientX, e.clientY);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('pointermove', move, { passive: true });

    const over = (e: MouseEvent): void => this.onOver(e);
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('pointerout', this.onOut, { passive: true });
    window.addEventListener('mouseout', this.onOut, { passive: true });
    window.addEventListener('resize', this.resizeCanvas, { passive: true });
    this.lastScrollY = window.scrollY;
    window.addEventListener('scroll', this.onScroll, { passive: true });

    root.style.display = 'block';
    document.documentElement.classList.add('cursor-custom');

    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.ringX = this.x;
    this.ringY = this.y;
    this.scrollY = window.scrollY;
    this.targetScrollY = this.scrollY;

    try {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.renderDot();
      this.raf = requestAnimationFrame(this.animate);
    } catch {
      this.renderDot();
    }
  }

  private readonly resizeCanvas = (): void => {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private renderDot(): void {
    if (!this.dot) return;
    this.dot.style.left = this.x + 'px';
    this.dot.style.top = this.y + 'px';
    // Speed scale: the bubble swells slightly with how fast the cursor moves.
    const speedScale = Math.min(1 + this.speed * 0.004, 1.3);
    // Scroll scale: small near the top, growing as you scroll down the page,
    // shrinking again as you scroll back up.
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, this.scrollY / maxScroll));
    const scrollScale = 1 + progress * 0.8;
    const scale = speedScale * scrollScale;
    // Liquid squish: the bubble elongates along the direction of travel.
    const stretch = Math.min(0.24, this.speed * 0.012);
    const sx = 1 + Math.abs(this.dirX) * stretch;
    const sy = 1 + Math.abs(this.dirY) * stretch;
    this.dot.style.setProperty('--cursor-scale', scale.toFixed(3));
    this.dot.style.setProperty('--cursor-squish-x', sx.toFixed(3));
    this.dot.style.setProperty('--cursor-squish-y', sy.toFixed(3));
  }

  private onMove(clientX: number, clientY: number): void {
    // The same handler is bound to pointermove + mousemove on several targets;
    // ignore duplicate deliveries so velocity isn't reset to zero mid-move.
    if (clientX === this.x && clientY === this.y) return;
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = clientX;
    this.y = clientY;
    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;
    const len = Math.hypot(dx, dy);
    this.speed = len;
    if (len > 0) {
      this.dirX = dx / len;
      this.dirY = dy / len;
    }

    this.renderDot();
    this.spawn();
  }

  private readonly onOver = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const interactive = target?.closest('a, button, [appTilt], [appMagnetic], input, textarea, select, [role="button"]');
    this.el.nativeElement.classList.toggle('cursor-hovering', Boolean(interactive));
  };

  private readonly onOut = (): void => {
    this.el.nativeElement.classList.remove('cursor-hovering');
  };

  /** Tracks scroll velocity (trail swell) and scroll position (bubble size). */
  private readonly onScroll = (): void => {
    const y = window.scrollY;
    const delta = y - this.lastScrollY;
    this.lastScrollY = y;
    this.targetScrollY = y;
    if (delta !== 0) {
      const target = Math.max(-6, Math.min(6, delta * 0.5));
      this.scrollVelocity += (target - this.scrollVelocity) * 0.5;
    }
  };

  private spawn(): void {
    if (this.particles.length >= this.maxParticles) return;
    const count = this.speed > 5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.6 + 0.1;
      this.particles.push({
        x: this.x + (Math.random() - 0.5) * 6,
        y: this.y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        radius: Math.random() * 2.5 + 1,
        opacity: 0.6,
        life: 1,
        maxLife: Math.random() * 35 + 25,
      });
    }
  }

  /** Larger, slower bubble emitted from the cursor while the page is scrolling. */
  private spawnScrollBubble(): void {
    if (this.particles.length >= this.maxParticles) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.12;
    this.particles.push({
      x: this.x + (Math.random() - 0.5) * 10,
      y: this.y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.4,
      radius: Math.random() * 2.4 + 1.6,
      opacity: 0.7,
      life: 1,
      maxLife: Math.random() * 45 + 35,
    });
  }

  private readonly animate = (): void => {
    if (!this.ctx || !this.canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#06b6d4';

    // Relax the cursor speed as it settles, then smooth the scroll position
    // so the bubble's size animates while scrolling instead of snapping.
    if (this.speed > 0) {
      this.speed *= 0.9;
      if (this.speed < 0.15) this.speed = 0;
    }
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;
    this.renderDot();

    // Decay scroll velocity; while scrolling down, stream bubbles from the
    // cursor, and while scrolling up, let the trail quiet down (no new spawns).
    this.scrollVelocity *= 0.9;
    if (Math.abs(this.scrollVelocity) < 0.05) this.scrollVelocity = 0;
    if (this.scrollVelocity > 0.4) {
      const n = Math.min(3, Math.ceil(this.scrollVelocity / 2));
      for (let i = 0; i < n; i++) this.spawnScrollBubble();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.012;
      p.vx *= 0.99;
      p.life -= 1 / p.maxLife;
      p.opacity = Math.max(0, p.life * 0.6);
      p.radius *= 0.995;

      if (p.life <= 0 || p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Bubble-style particle: faint glassy body, bright rim, tiny specular glint.
      const r = Math.max(0.4, p.radius);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = accent;
      this.ctx.globalAlpha = p.opacity * 0.25;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = accent;
      this.ctx.lineWidth = 1.1;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(p.x - r * 0.32, p.y - r * 0.35, r * 0.24, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = p.opacity * 0.9;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;

    if (this.ring) {
      this.ringX += (this.x - this.ringX) * 0.12;
      this.ringY += (this.y - this.ringY) * 0.12;
      this.ring.style.left = this.ringX.toFixed(1) + 'px';
      this.ring.style.top = this.ringY.toFixed(1) + 'px';
    }

    this.raf = requestAnimationFrame(this.animate);
  };
}
