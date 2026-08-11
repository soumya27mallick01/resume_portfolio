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
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { scrollToSection } from '../../../utils/scroll';

interface CraftStep {
  icon: string;
  title: string;
  text: string;
}

interface CraftChip {
  label: string;
  icon: string;
  tone: string;
  top: string;
  left: string;
  delay: number;
}

const STEPS: CraftStep[] = [
  {
    icon: 'search',
    title: 'Discover',
    text: 'Requirements decoded, edge cases mapped, every ambiguity turned into a question worth asking.',
  },
  {
    icon: 'layers',
    title: 'Architect',
    text: 'Typed contracts, design tokens and component systems built to hold up for years.',
  },
  {
    icon: 'code',
    title: 'Build',
    text: 'Pixel-perfect Angular & React interfaces, animated with intent, tuned for 60fps.',
  },
  {
    icon: 'rocket',
    title: 'Polish',
    text: 'Lighthouse-verified performance, accessibility passes, and details users remember.',
  },
];

const STEP_SLOTS = ['discover', 'architect', 'build', 'polish'] as const;

const CHIPS: CraftChip[] = [
  { label: 'Angular 20', icon: 'angular', tone: 'red', top: '12%', left: '8%', delay: 0 },
  { label: 'TypeScript', icon: 'typescript', tone: 'blue', top: '54%', left: '6%', delay: 0.8 },
  { label: 'Three.js', icon: 'palette', tone: 'cyan', top: '18%', left: '78%', delay: 1.4 },
  { label: 'Tailwind', icon: 'tailwind', tone: 'cyan', top: '76%', left: '16%', delay: 0.4 },
  { label: 'GSAP', icon: 'activity', tone: 'green', top: '72%', left: '80%', delay: 1.9 },
];

/**
 * "Turning Complex Requirements into Premium Frontend Experiences" — a
 * bento-grid showcase section. The hero panel is a self-contained Three.js
 * scene of a glowing particle polyhedron that morphs through sphere → cube
 * → star shapes on a loop, wrapped in an orbiting particle ring. Scrolling
 * through the section spins it faster; the cursor tilts it. Rendering only
 * runs while the panel is near the viewport.
 */
@Component({
  selector: 'app-craft',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  host: {
    class: 'section',
    id: 'craft',
  },
  templateUrl: './craft.component.html',
  styleUrls: ['./craft.component.css'],
})
export class CraftComponent implements OnDestroy {
  protected readonly steps = STEPS;
  protected readonly STEP_SLOTS = STEP_SLOTS;
  protected readonly chips = CHIPS;

  protected goTo(event: Event): void {
    event.preventDefault();
    scrollToSection('projects');
  }

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private disposed = false;
  private cleanup: (() => void) | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      const canvas = this.el.nativeElement.querySelector(
        '.bento-stage__canvas',
      ) as HTMLCanvasElement | null;
      const stage = this.el.nativeElement.querySelector('.bento-stage') as HTMLElement | null;
      if (!canvas || !stage) return;
      this.cleanup = this.initScene(canvas, stage);
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  /**
   * Self-contained Three.js scene: a shared-buffer particle polyhedron that
   * morphs sphere → cube → star on a loop (wireframe shell + additive glow
   * points), an orbiting particle ring and a counter-rotating core.
   * Scroll through the section spins it faster; the cursor tilts it. The
   * rAF loop only runs while the stage is near the viewport.
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

    void (async () => {
      const THREE = await import('three');
      if (this.disposed || !canvas.isConnected) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cssVar = (name: string, fallback: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      const accent = cssVar('--accent', '#22d3ee');
      const accentBright = cssVar('--accent-bright', '#67e8f9');
      const purple = cssVar('--accent-purple', '#67e8f9');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);
      camera.position.set(0, 0.2, 7.8);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);

      const world = new THREE.Group();
      scene.add(world);

      /* ---------- Morphing particle polyhedron ---------- */
      const morphGeometry = new THREE.IcosahedronGeometry(1.35, 6);
      const base = morphGeometry.attributes['position'].array as Float32Array;
      const count = base.length / 3;
      const dirs = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const x = base[i * 3];
        const y = base[i * 3 + 1];
        const z = base[i * 3 + 2];
        const len = Math.hypot(x, y, z) || 1;
        dirs[i * 3] = x / len;
        dirs[i * 3 + 1] = y / len;
        dirs[i * 3 + 2] = z / len;
      }
      const positions = new Float32Array(base.length);
      const posAttr = new THREE.BufferAttribute(positions, 3);
      morphGeometry.setAttribute('position', posAttr);

      type Pose = (x: number, y: number, z: number) => number;
      const sphere: Pose = () => 1;
      const cube: Pose = (x, y, z) =>
        1 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z), 0.0001);
      const star: Pose = (x, y, z) =>
        1 +
        0.45 * Math.abs(Math.sin(3 * Math.atan2(y, x)) * Math.sin(3 * Math.acos(z)));
      const POSES: Pose[] = [sphere, cube, star];
      const POSE_DURATION = 5.5;
      const BLEND = 1.4;

      const morphMesh = new THREE.Mesh(
        morphGeometry,
        new THREE.MeshBasicMaterial({
          color: accent,
          wireframe: true,
          transparent: true,
          opacity: 0.32,
        }),
      );
      world.add(morphMesh);

      const morphPoints = new THREE.Points(
        morphGeometry,
        new THREE.PointsMaterial({
          color: accentBright,
          size: 0.05,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      world.add(morphPoints);

      /* ---------- Counter-rotating core ---------- */
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 1),
        new THREE.MeshBasicMaterial({
          color: accentBright,
          wireframe: true,
          transparent: true,
          opacity: 0.6,
        }),
      );
      world.add(core);

      /* ---------- Orbiting particle ring ---------- */
      const RING_COUNT = 240;
      const ringPositions = new Float32Array(RING_COUNT * 3);
      for (let i = 0; i < RING_COUNT; i++) {
        const a = (i / RING_COUNT) * Math.PI * 2;
        const r = 2.5 + Math.sin(i * 1.7) * 0.12;
        ringPositions[i * 3] = Math.cos(a) * r;
        ringPositions[i * 3 + 1] = Math.sin(a * 3) * 0.1;
        ringPositions[i * 3 + 2] = Math.sin(a) * r;
      }
      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
      const ring = new THREE.Points(
        ringGeometry,
        new THREE.PointsMaterial({
          color: purple,
          size: 0.045,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      world.add(ring);

      const updateMorph = (t: number): void => {
        const cycle = t / POSE_DURATION;
        const idx = Math.floor(cycle) % POSES.length;
        const local = cycle - Math.floor(cycle);
        const blend = Math.min(Math.max((local - (1 - BLEND / POSE_DURATION)) / (BLEND / POSE_DURATION), 0), 1);
        const eased = blend * blend * (3 - 2 * blend);
        const poseA = POSES[idx];
        const poseB = POSES[(idx + 1) % POSES.length];
        const pulse = 1 + Math.sin(t * 0.8) * 0.045;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
          const dx = dirs[i * 3];
          const dy = dirs[i * 3 + 1];
          const dz = dirs[i * 3 + 2];
          const r = (poseA(dx, dy, dz) * (1 - eased) + poseB(dx, dy, dz) * eased) * pulse;
          arr[i * 3] = dx * r;
          arr[i * 3 + 1] = dy * r;
          arr[i * 3 + 2] = dz * r;
        }
        posAttr.needsUpdate = true;
      };

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

      const render = (time: number): void => {
        const t = time * 0.001;
        const rect = stage.getBoundingClientRect();
        const span = rect.height + window.innerHeight;
        const progress = Math.min(Math.max((window.innerHeight * 0.7 - rect.top) / span, 0), 1);
        const boost = 1 + progress * 2.2;

        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        updateMorph(t);

        morphMesh.rotation.x = t * 0.14 * boost;
        morphMesh.rotation.y = t * 0.22 * boost + progress * 4.5;
        morphPoints.rotation.copy(morphMesh.rotation);

        core.rotation.x = -t * 0.6;
        core.rotation.y = t * 0.8;
        ring.rotation.x = -0.35 + Math.sin(t * 0.3) * 0.08;
        ring.rotation.y = t * 0.16;

        world.rotation.y += (mouseX * 0.42 - world.rotation.y) * 0.05;
        world.rotation.x += (-mouseY * 0.3 - world.rotation.x) * 0.05;

        camera.position.x = mouseX * 0.42;
        camera.position.y = 0.2 + mouseY * 0.26 + Math.sin(t * 0.4) * 0.12;
        camera.lookAt(0, 0, 0);

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
    })();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      viewportObserver?.disconnect();
      removePointer?.();
      renderer?.dispose();
    };
  }
}
