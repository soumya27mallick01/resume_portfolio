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
import { RouterLink } from '@angular/router';
import { blogPosts } from '../../../data/resume.data';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import type * as ThreeTypes from 'three';
import { webglAvailable, createWebGLRenderer } from '../../../utils/webgl';

interface BlogChip {
  label: string;
  tone: string;
  top: string;
  left: string;
  delay: number;
}

const CHIPS: BlogChip[] = [
  { label: 'Angular', tone: 'red', top: '14%', left: '10%', delay: 0 },
  { label: 'React', tone: 'cyan', top: '22%', left: '72%', delay: 0.9 },
  { label: 'TypeScript', tone: 'blue', top: '66%', left: '8%', delay: 0.4 },
  { label: 'Performance', tone: 'green', top: '74%', left: '74%', delay: 1.5 },
];

/**
 * "Writing & Insights" — an editorial bento. The left panel is a
 * self-contained Three.js scene: a gyroscopic set of glowing rings with a
 * star core and orbiting particles. The right column is a modern numbered
 * article index. Rendering only runs while the panel is near the viewport.
 */
@Component({
  selector: 'app-blog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective, RouterLink],
  host: {
    class: 'section',
    id: 'blog',
  },
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnDestroy {
  protected readonly posts = blogPosts;
  protected readonly chips = CHIPS;

  protected readonly avgReadTime = this.computeAvgReadTime();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private disposed = false;
  private cleanup: (() => void) | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      const canvas = this.el.nativeElement.querySelector(
        '.blog-stage__canvas',
      ) as HTMLCanvasElement | null;
      const stage = this.el.nativeElement.querySelector('.blog-stage') as HTMLElement | null;
      if (!canvas || !stage) return;
      this.cleanup = this.initScene(canvas, stage);
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  protected formattedDate(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  protected pad(v: number): string {
    return String(v).padStart(2, '0');
  }

  private computeAvgReadTime(): string {
    const minutes = this.posts.reduce((sum, post) => {
      const value = Number.parseInt(post.readTime, 10);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
    return this.posts.length ? Math.round(minutes / this.posts.length).toString() : '0';
  }

  /**
   * Gyroscopic Three.js scene: three thin neon rings on independent axes, a
   * star core of octahedron + additive points, a tilted orbit halo ring and
   * a faint particle shell. Cursor tilts the whole gyroscope.
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
      const purple = cssVar('--accent-purple', '#67e8f9');

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 40);
      camera.position.set(0, 0.1, 8);

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

      const group = new THREE.Group();
      group.scale.setScalar(1.15);
      scene.add(group);

      /* Neon gyroscopic rings */
      const ringDefs = [
        { radius: 1.3, tilt: [0.2, 0, 0], color: accent, speed: 0.55 },
        { radius: 1.55, tilt: [1.45, 0.55, 0.2], color: accentBright, speed: -0.4 },
        { radius: 1.8, tilt: [-1.05, 0.85, 0.35], color: purple, speed: 0.3 },
      ];
      const rings: {
        mesh: ThreeTypes.Mesh;
        baseX: number;
        baseY: number;
        baseZ: number;
        speed: number;
      }[] = [];

      for (const def of ringDefs) {
        const geo = new THREE.TorusGeometry(def.radius, 0.014, 8, 160);
        const mesh = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({
            color: def.color,
            transparent: true,
            opacity: 0.85,
          }),
        );
        mesh.rotation.set(def.tilt[0], def.tilt[1], def.tilt[2]);
        group.add(mesh);
        rings.push({ mesh, baseX: def.tilt[0], baseY: def.tilt[1], baseZ: def.tilt[2], speed: def.speed });
        disposers.push(() => {
          geo.dispose();
          (mesh.material as ThreeTypes.Material).dispose();
        });
      }

      /* ---------- Star core ---------- */
      const coreGeo = new THREE.OctahedronGeometry(0.5, 1);
      const core = new THREE.Mesh(
        coreGeo,
        new THREE.MeshBasicMaterial({ color: accentBright, wireframe: true, transparent: true, opacity: 0.75 }),
      );
      group.add(core);

      const corePoints = new THREE.Points(
        new THREE.SphereGeometry(0.42, 10, 10),
        new THREE.PointsMaterial({
          color: accent,
          size: 0.04,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(corePoints);

      /* ---------- Inner orbit halo ---------- */
      const haloCount = 260;
      const haloPositions = new Float32Array(haloCount * 3);
      for (let i = 0; i < haloCount; i++) {
        const a = (i / haloCount) * Math.PI * 2;
        const r = 1.02;
        haloPositions[i * 3] = Math.cos(a) * r;
        haloPositions[i * 3 + 1] = Math.sin(a * 2) * 0.06;
        haloPositions[i * 3 + 2] = Math.sin(a) * r;
      }
      const haloGeo = new THREE.BufferGeometry();
      haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
      const halo = new THREE.Points(
        haloGeo,
        new THREE.PointsMaterial({
          color: accent,
          size: 0.05,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(halo);

      /* ---------- Faint particle shell ---------- */
      const SHELL = 320;
      const shellPositions = new Float32Array(SHELL * 3);
      for (let i = 0; i < SHELL; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 2.7;
        shellPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        shellPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        shellPositions[i * 3 + 2] = Math.cos(phi) * r;
      }
      const shellGeo = new THREE.BufferGeometry();
      shellGeo.setAttribute('position', new THREE.BufferAttribute(shellPositions, 3));
      const shell = new THREE.Points(
        shellGeo,
        new THREE.PointsMaterial({
          color: purple,
          size: 0.03,
          transparent: true,
          opacity: 0.32,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(shell);

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
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        for (const def of rings) {
          def.mesh.rotation.x = def.baseX + Math.sin(t * def.speed) * 0.35;
          def.mesh.rotation.y = def.baseY + t * def.speed * 0.3;
          def.mesh.rotation.z = def.baseZ;
        }
        core.rotation.x = -t * 0.5;
        core.rotation.y = t * 0.7;
        corePoints.rotation.y = -t * 0.4;
        halo.rotation.y = t * 0.25;
        halo.rotation.x = Math.sin(t * 0.3) * 0.2;
        shell.rotation.y = -t * 0.03;

        group.rotation.y += (mouseX * 0.5 - group.rotation.y) * 0.05;
        group.rotation.x += (-mouseY * 0.35 - group.rotation.x) * 0.05;

        camera.position.x = mouseX * 0.4;
        camera.position.y = mouseY * 0.3 + Math.sin(t * 0.4) * 0.1;
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