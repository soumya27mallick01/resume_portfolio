import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { navLinks, profile } from '../../data/resume.data';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { MailLinkDirective } from '../../shared/directives/mail-link.directive';
import type * as ThreeTypes from 'three';
import { webglAvailable, createWebGLRenderer } from '../../utils/webgl';

/**
 * Full-width Three.js background for the footer: an aurora wave ocean — a
 * particle surface spanning the whole footer that undulates with layered
 * sine waves (circular ripples, horizontal bands and a slow swell), tinted
 * by depth and brightened on its crests. The cursor shifts the wave centre
 * and tilts the world. Rendering only runs while the footer is near the
 * viewport.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, MailLinkDirective],
  host: {
    class: 'footer',
  },
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnDestroy {
  protected readonly profile = profile;
  protected readonly navLinks = navLinks;
  protected readonly year = new Date().getFullYear();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private disposed = false;
  private cleanup: (() => void) | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      const canvas = this.el.nativeElement.querySelector(
        '.footer__scene',
      ) as HTMLCanvasElement | null;
      const stage = this.el.nativeElement.querySelector(
        '.footer__scene-wrap',
      ) as HTMLElement | null;
      if (!canvas || !stage) return;
      this.cleanup = this.initScene(canvas, stage);
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  protected goTo(sectionId: string, event: Event): void {
    event.preventDefault();
    scrollToSection(sectionId);
  }

  protected scrollToTop(): void {
    scrollToTop();
  }

  /**
   * Aurora wave ocean: a grid of particles covering the full footer surface
   * undulates with stacked sine layers — a circular ripple radiating from
   * the (cursor-shifted) centre, horizontal banding and a slow depth swell.
   * Vertex colours run purple→accent across depth and brighten towards the
   * crests, giving the surface an aurora glow.
   */
  private initScene(canvas: HTMLCanvasElement, stage: HTMLElement): () => void {
    if (typeof WebGLRenderingContext === 'undefined') return () => undefined;

    let raf = 0;
    let running = false;
    let renderer: {
      setClearColor(color: number, alpha: number): void;
      setSize(width: number, height: number, updateStyle: boolean): void;
      render(scene: unknown, camera: unknown): void;
      dispose(): void;
    } | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let viewportObserver: IntersectionObserver | null = null;
    let removePointer: (() => void) | null = null;
    const disposers: (() => void)[] = [];

    void (async () => {
      const THREE = await import('three');
      if (this.disposed || !canvas.isConnected) return;
      if (!webglAvailable()) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cssVar = (name: string, fallback: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      const accent = cssVar('--accent', '#22d3ee');
      const accentBright = cssVar('--accent-bright', '#67e8f9');
      const purple = cssVar('--accent-purple', '#06b6d4');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
      camera.position.set(0, 0.7, 6.8);

      const createdRenderer = createWebGLRenderer(() => new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }));
      if (!createdRenderer) {
        /* WebGL unavailable — the decorative scene is skipped without errors */
        return;
      }
      createdRenderer.setClearColor(0x000000, 0);
      renderer = createdRenderer;

      const world = new THREE.Group();
      scene.add(world);

      /* ---------- Colour helpers (0..1) ---------- */
      const hexToRgb01 = (hex: string): [number, number, number] => {
        const n = Number.parseInt(hex.replace('#', ''), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      };
      const cAccent = hexToRgb01(accent);
      const cBright = hexToRgb01(accentBright);
      const cPurple = hexToRgb01(purple);

      /* ---------- Aurora wave field ---------- */
      const COLS = 76;
      const ROWS = 26;
      const SPAN_X = 22;
      const SPAN_Z = 5.6;
      const Z_MIN = -4.6;
      const waveCount = COLS * ROWS;
      const wavePositions = new Float32Array(waveCount * 3);
      const waveColors = new Float32Array(waveCount * 3);
      const baseColors = new Float32Array(waveCount * 3);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          const x = -SPAN_X / 2 + (c / (COLS - 1)) * SPAN_X;
          const z = Z_MIN + (r / (ROWS - 1)) * SPAN_Z;
          wavePositions[i * 3] = x;
          wavePositions[i * 3 + 1] = 0;
          wavePositions[i * 3 + 2] = z;
          const zNorm = (z - Z_MIN) / SPAN_Z;
          baseColors[i * 3] = cPurple[0] + (cAccent[0] - cPurple[0]) * zNorm;
          baseColors[i * 3 + 1] = cPurple[1] + (cAccent[1] - cPurple[1]) * zNorm;
          baseColors[i * 3 + 2] = cPurple[2] + (cAccent[2] - cPurple[2]) * zNorm;
        }
      }

      const waveGeo = new THREE.BufferGeometry();
      waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
      waveGeo.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));
      const wave = new THREE.Points(
        waveGeo,
        new THREE.PointsMaterial({
          size: 0.075,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      world.add(wave);
      disposers.push(() => {
        waveGeo.dispose();
        (wave.material as ThreeTypes.Material).dispose();
      });

      /* ---------- Drifting star dust ---------- */
      const DUST = 240;
      const dustPositions = new Float32Array(DUST * 3);
      for (let i = 0; i < DUST; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 20;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
        dustPositions[i * 3 + 2] = -2.5 - Math.random() * 5.5;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({
          color: accentBright,
          size: 0.03,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      world.add(dust);
      disposers.push(() => {
        dustGeo.dispose();
        (dust.material as ThreeTypes.Material).dispose();
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = (): void => {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (!width || !height) return;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        renderer!.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      const onPointer = (event: PointerEvent): void => {
        const rect = stage.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };
      stage.addEventListener('pointermove', onPointer, { passive: true });
      removePointer = () => stage.removeEventListener('pointermove', onPointer);

      const updateWave = (t: number): void => {
        mouseX += (targetX - mouseX) * 0.06;
        mouseY += (targetY - mouseY) * 0.06;
        const cx = mouseX * 3;
        const cz = -1.6 + mouseY * 1.4;

        const pos = wavePositions;
        const cols = waveColors;
        for (let i = 0; i < waveCount; i++) {
          const x = pos[i * 3];
          const z = pos[i * 3 + 2];
          const dx = x - cx;
          const dz = z - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const y =
            Math.sin(dist * 0.55 - t * 1.7) * 0.4 +
            Math.sin(x * 0.32 + t * 0.85) * 0.26 +
            Math.sin(z * 0.6 - t * 1.25) * 0.2 +
            Math.sin(x * 0.11 + z * 0.17 + t * 0.5) * 0.32;
          pos[i * 3 + 1] = y;

          const heightNorm = Math.min(Math.max((y + 1.18) / 2.36, 0), 1);
          const k = heightNorm * 0.55;
          const bi = i * 3;
          cols[bi] = baseColors[bi] + (cBright[0] - baseColors[bi]) * k;
          cols[bi + 1] = baseColors[bi + 1] + (cBright[1] - baseColors[bi + 1]) * k;
          cols[bi + 2] = baseColors[bi + 2] + (cBright[2] - baseColors[bi + 2]) * k;
        }
        waveGeo.attributes['position'].needsUpdate = true;
        waveGeo.attributes['color'].needsUpdate = true;
      };

      const render = (time: number): void => {
        const t = time * 0.001;
        updateWave(t);

        world.rotation.y += (mouseX * 0.18 - world.rotation.y) * 0.04;
        camera.position.x = mouseX * 0.5;
        camera.position.y = 0.7 + mouseY * 0.25;
        camera.lookAt(0, -0.1, -1.5);

        renderer!.render(scene, camera);
      };

      if (reduceMotion) {
        render(0);
        return;
      }

      const tick = (time: number): void => {
        if (this.disposed) return;
        render(time);
        raf = requestAnimationFrame(tick);
      };
      viewportObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          if (visible && !running) {
            running = true;
            raf = requestAnimationFrame(tick);
          } else if (!visible && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        },
        { rootMargin: '150% 0px 150% 0px' },
      );
      viewportObserver.observe(stage);
    })().catch(() => undefined);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      viewportObserver?.disconnect();
      removePointer?.();
      for (const dispose of disposers) dispose();
      renderer?.dispose();
    };
  }
}