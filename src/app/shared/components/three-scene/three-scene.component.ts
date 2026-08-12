import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { skillGroups } from '../../../data/resume.data';
import type * as ThreeTypes from 'three';

/**
 * Full-page fixed Three.js background. A column of glowing skill-tag
 * particles drifts past the camera as the page scrolls, with subtle mouse
 * parallax. Only initialised in the browser; renders a single static frame
 * when reduced motion is preferred.
 */
@Component({
  selector: 'app-three-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'three-scene',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.css'],
})
export class ThreeSceneComponent implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private cleanup: (() => void) | null = null;
  private destroyed = false;
  private themeObserver: MutationObserver | null = null;
  private currentTheme = '';

  constructor() {
    afterNextRender(() => {
      void this.init().catch(() => undefined);
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.themeObserver?.disconnect();
    this.cleanup?.();
  }

  private async init(): Promise<void> {
    if (typeof WebGLRenderingContext === 'undefined') return;

    const THREE = await import('three');
    if (this.destroyed) return;

    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const start = (): void => this.createScene(THREE, canvas);

    start();
    this.currentTheme = document.documentElement.getAttribute('data-theme') ?? 'dark';

    if (!this.themeObserver) {
      this.themeObserver = new MutationObserver(() => {
        const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';
        if (theme === this.currentTheme || this.destroyed) return;
        this.currentTheme = theme;
        this.cleanup?.();
        start();
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }
  }

  private createScene(THREE: typeof import('three'), canvas: HTMLCanvasElement): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isLight = (document.documentElement.getAttribute('data-theme') ?? 'dark') === 'light';

    const cssVar = (name: string, fallback: string): string =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    const bg = cssVar('--bg', '#050816');
    const fogColor = Number.parseInt(bg.replace('#', ''), 16) || 0x050816;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(fogColor, 0.04);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const world = new THREE.Group();
    scene.add(world);

    const colors = ['--scene-1', '--scene-2', '--scene-3', '--scene-4', '--scene-5'].map((v) =>
      cssVar(v, '#22d3ee'),
    );

    const skillLabels: string[] = [];
    const ABBREV: Record<string, string> = { JAVASCRIPT: 'JS', TYPESCRIPT: 'TS' };
    for (const group of skillGroups) {
      for (const skill of group.skills) {
        const upper = skill.name.split(' ')[0].replace(/[^a-zA-Z+]/g, '').toUpperCase();
        const label = ABBREV[upper] ?? upper;
        if (label && !skillLabels.includes(label)) skillLabels.push(label);
      }
    }
    const pool = skillLabels.length ? skillLabels : ['ANGULAR', 'REACT', 'TYPESCRIPT', 'HTML', 'CSS'];

    const makeSpriteTexture = (label: string, color: string): ThreeTypes.CanvasTexture => {
      let fontSize = 30;
      let font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      const probe = document.createElement('canvas').getContext('2d');
      let textWidth = 200;
      if (probe) {
        while (fontSize > 26 && textWidth > 420) {
          fontSize -= 4;
          font = `700 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
          probe.font = font;
          textWidth = probe.measureText(label).width;
        }
      }
      const padding = Math.round(fontSize * 0.6);
      const width = Math.ceil(textWidth) + padding * 2;
      const height = Math.ceil(fontSize * 1.7);
      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(c);
      ctx.clearRect(0, 0, width, height);
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isLight) {
        ctx.fillStyle = color;
        ctx.fillText(label, width / 2, height / 2);
        ctx.globalAlpha = 0.14;
        ctx.fillText(label, width / 2, height / 2);
      } else {
        ctx.shadowColor = color;
        ctx.shadowBlur = fontSize * 0.1;
        ctx.fillStyle = color;
        ctx.fillText(label, width / 2, height / 2);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.28;
        ctx.fillText(label, width / 2, height / 2);
      }
      const texture = new THREE.CanvasTexture(c);
      texture.anisotropy = 4;
      return texture;
    };

    const sprites: ThreeTypes.Sprite[] = [];
    const textures: ThreeTypes.CanvasTexture[] = [];

    const SPACING = 13;
    const COUNT = 7;
    const spriteDefs: { normX: number; y: number; z: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const rawX = i % 2 === 0 ? (i * 1.7) % 6 - 2.4 : ((i + 1) * 2.2) % 6 - 3;
      spriteDefs.push({ normX: (rawX / 3) * 0.8, y: -i * SPACING + 2, z: (i % 3) * -3 - 2 });
    }

    for (let i = 0; i < COUNT; i++) {
      const def = spriteDefs[i];
      const label = pool[i % pool.length];
      const color = colors[i % colors.length];
      const texture = makeSpriteTexture(label, color);
      textures.push(texture);

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: isLight ? 0.85 + (i % 3) * 0.05 : 0.5 + (i % 3) * 0.14,
        depthWrite: false,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(0, def.y, def.z);
      const imgW = texture.image.width as number;
      const imgH = texture.image.height as number;
      const baseH = 1.05;
      sprite.scale.set(baseH * (imgW / imgH), baseH, 1);
      world.add(sprite);
      sprites.push(sprite);
    }

    const positionSprites = (): void => {
      const fovHalf = Math.tan((camera.fov * Math.PI) / 360);
      for (let i = 0; i < sprites.length; i++) {
        const def = spriteDefs[i];
        const halfW = fovHalf * (9 - def.z);
        const spriteHalfW = sprites[i].scale.x / 2;
        sprites[i].position.x = def.normX * Math.max(0, halfW - spriteHalfW - 0.3);
      }
    };

    const starCount = 420;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = Math.random() * -60;
      starPositions[i * 3 + 2] = -2 - Math.random() * 14;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: new THREE.Color(colors[0]),
        size: isLight ? 0.07 : 0.06,
        transparent: true,
        opacity: isLight ? 0.35 : 0.5,
        blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    world.add(stars);

    let scrollY = window.scrollY;
    let targetScroll = scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onScroll = (): void => {
      targetScroll = window.scrollY;
    };
    const onPointer = (event: PointerEvent): void => {
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      positionSprites();
    };
    resize();
    window.addEventListener('resize', resize);

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const render = (): void => {
      scrollY += (targetScroll - scrollY) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const progress = scrollY / maxScroll;
      world.position.y = scrollY * 0.22;
      world.rotation.z = progress * 0.35;
      world.rotation.x = mouseY * 0.12;
      world.rotation.y = mouseX * 0.22;

      camera.position.x = mouseX * 0.9;
      camera.position.y = mouseY * 0.5;

      renderer.render(scene, camera);
    };

    let raf = 0;
    if (reduceMotion) {
      render();
    } else {
      const tick = (): void => {
        render();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      for (const sprite of sprites) {
        sprite.material.dispose();
      }
      for (const texture of textures) {
        texture.dispose();
      }
      stars.geometry.dispose();
      (stars.material as ThreeTypes.Material).dispose();
      renderer.dispose();
    };
  }
}
