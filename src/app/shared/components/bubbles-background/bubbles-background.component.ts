import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import type * as ThreeTypes from 'three';
import { skillGroups } from '../../../data/resume.data';
import { createWebGLRenderer, webglAvailable } from '../../../utils/webgl';

interface BubbleState {
  mesh: ThreeTypes.Mesh;
  material: ThreeTypes.ShaderMaterial;
  baseScale: number;
  speed: number;
  driftAmp: number;
  driftFreq: number;
  phase: number;
  spinAxis: ThreeTypes.Vector3;
  spinSpeed: number;
}

interface LabelState {
  sprite: ThreeTypes.Sprite;
  texture: ThreeTypes.CanvasTexture;
  y: number;
  laneX: number;
  flow: number;
  bobSpeed: number;
  bobAmp: number;
  driftFreq: number;
  driftAmp: number;
  phase: number;
}

/** Vertical span of the field — much taller than the viewport so wraps are invisible. */
const FIELD_MIN = -11.5;
const FIELD_MAX = 11.5;
const FIELD_SPAN = FIELD_MAX - FIELD_MIN;

const VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Water bubbles: translucent glass spheres with a fresnel rim and two
 * wandering specular glints, drifting slowly upward with a wobble. The fresnel
 * silhouette keeps them looking like real bubbles instead of solid orbs while
 * staying cheap enough for a full-page fixed background. Renders a single
 * static frame under reduced motion.
 */
const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

    // Two fixed light directions; the bubble spins in object space so the
    // glints wander across the surface like light refracting through water.
    vec3 g1 = normalize(vec3(0.55, 0.75, 0.35));
    vec3 g2 = normalize(vec3(-0.6, -0.4, 0.7));
    float glint1 = pow(max(dot(N, g1), 0.0), 80.0);
    float glint2 = pow(max(dot(N, g2), 0.0), 140.0);

    float body = 0.10 * (1.0 - fresnel);
    float rim = fresnel;
    vec3 col = uColor * (body + rim * 0.85) + vec3(1.0) * (glint1 * 0.95 + glint2 * 0.55);
    gl_FragColor = vec4(col, uOpacity * (0.2 + fresnel * 1.1));
  }
`;

/**
 * Full-page fixed Three.js background: rising water bubbles mixed with gently
 * floating skill-tag sprites (Angular, React, TS, HTML, CSS, …). The field is
 * a tall endless column — scrolling injects an upward surge so the bubbles
 * rush deeper into the page, and the whole field slowly recedes with scroll
 * depth. Theme changes re-tint the bubbles and rebuild the labels live.
 * Renders a single static frame when reduced motion is preferred.
 */
@Component({
  selector: 'app-bubbles-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bubbles-background',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './bubbles-background.component.html',
  styleUrls: ['./bubbles-background.component.css'],
})
export class BubblesBackgroundComponent implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private cleanup: (() => void) | null = null;
  private destroyed = false;
  private themeObserver: MutationObserver | null = null;

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
    if (!webglAvailable()) return;

    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const THREE = await import('three');
    if (this.destroyed || !canvas.isConnected) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const isLight = (): boolean =>
      (document.documentElement.getAttribute('data-theme') ?? 'dark') === 'light';
    const cssVar = (name: string, fallback: string): string =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    const accent = (): string => cssVar('--accent', isLight() ? '#0891b2' : '#22d3ee');
    const accentBright = (): string => cssVar('--accent-bright', isLight() ? '#06b6d4' : '#67e8f9');
    const accentPurple = (): string => cssVar('--accent-purple', isLight() ? '#4f46e5' : '#a5b4fc');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 40);
    camera.position.set(0, 0, 6);

    const renderer = createWebGLRenderer(
      () =>
        new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }),
    );
    if (!renderer) {
      /* WebGL unavailable — the background is skipped without errors */
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const world = new THREE.Group();
    scene.add(world);

    /* ---------- Skill labels ---------- */
    const labelPool = ((): string[] => {
      const labels: string[] = [];
      const ABBREV: Record<string, string> = { JAVASCRIPT: 'JS', TYPESCRIPT: 'TS' };
      for (const group of skillGroups) {
        for (const skill of group.skills) {
          const upper = skill.name.split(' ')[0].replace(/[^a-zA-Z+]/g, '').toUpperCase();
          const label = ABBREV[upper] ?? upper;
          if (label && !labels.includes(label)) labels.push(label);
        }
      }
      return labels.length ? labels : ['ANGULAR', 'REACT', 'TYPESCRIPT', 'HTML', 'CSS'];
    })();
    const sceneColors = ['--scene-1', '--scene-2', '--scene-3', '--scene-4', '--scene-5'].map((v) =>
      cssVar(v, '#22d3ee'),
    );

    const makeLabelTexture = (label: string, color: string, light: boolean): ThreeTypes.CanvasTexture => {
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
      // Single, unglowed pass — no shadow bloom or double-fill so the tags
      // read as faint floating text instead of neon glow.
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.82;
      ctx.fillText(label, width / 2, height / 2);
      ctx.globalAlpha = 1;
      const texture = new THREE.CanvasTexture(c);
      texture.anisotropy = 4;
      return texture;
    };

    const labels: LabelState[] = [];
    const LABEL_COUNT = 16;
    const labelDefs = Array.from({ length: LABEL_COUNT }, (_, i) => ({
      label: labelPool[i % labelPool.length],
      color: sceneColors[i % sceneColors.length],
      z: -2.6 - (i % 3) * 1.4,
    }));

    const buildLabels = (light: boolean): void => {
      for (const state of labels) {
        world.remove(state.sprite);
        state.texture.dispose();
        (state.sprite.material as ThreeTypes.SpriteMaterial).dispose();
      }
      labels.length = 0;

      // First pass: build every sprite and measure its world-space width so the
      // lanes can be spaced wider than the widest label.
      const created: {
        sprite: ThreeTypes.Sprite;
        texture: ThreeTypes.CanvasTexture;
        z: number;
        halfW: number;
      }[] = [];
      for (let i = 0; i < labelDefs.length; i++) {
        const def = labelDefs[i];
        const texture = makeLabelTexture(def.label, def.color, light);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: light ? 0.55 + (i % 3) * 0.05 : 0.3 + (i % 3) * 0.05,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        const sprite = new THREE.Sprite(material);
        const imgW = texture.image.width as number;
        const imgH = texture.image.height as number;
        const baseH = 0.9;
        sprite.scale.set(baseH * (imgW / imgH), baseH, 1);
        created.push({ sprite, texture, z: def.z, halfW: sprite.scale.x / 2 });
      }

      // Each label lives in its own horizontal lane, rows are evenly spaced, and
      // all labels flow upward at the same speed — so no two tags can ever cross.
      const LANES = Math.min(3, created.length);
      const perLane = Math.ceil(created.length / LANES);
      const maxHalfW = Math.max(...created.map((c) => c.halfW));
      const laneSpan = 2 * maxHalfW + 0.7;

      created.forEach((c, i) => {
        const lane = i % LANES;
        const row = Math.floor(i / LANES);
        const laneX = (lane - (LANES - 1) / 2) * laneSpan;
        const y = FIELD_MIN + (row + 0.5) * (FIELD_SPAN / perLane);
        c.sprite.position.set(laneX, y, c.z);
        world.add(c.sprite);
        labels.push({
          sprite: c.sprite,
          texture: c.texture,
          y,
          laneX,
          flow: 0.16,
          bobSpeed: 0.35 + Math.random() * 0.5,
          bobAmp: 0.08 + Math.random() * 0.08,
          driftFreq: 0.25 + Math.random() * 0.6,
          driftAmp: 0.1 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
        });
      });
    };

    /* ---------- Water bubbles ---------- */
    const bubblePool = [accent, accentBright, accentPurple];
    const bubbles: BubbleState[] = [];
    const bubbleGeometry = new THREE.SphereGeometry(1, 32, 24);

    const worldHalfW = (): number => (window.innerWidth / window.innerHeight) * 4.2;
    const area = window.innerWidth * window.innerHeight;
    const count = Math.max(30, Math.min(110, Math.round(area / 14000)));

    for (let i = 0; i < count; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(bubblePool[i % bubblePool.length]()) },
          uOpacity: { value: isLight() ? 0.5 : 0.78 },
        },
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(bubbleGeometry, material);
      mesh.position.set(
        (Math.random() * 2 - 1) * worldHalfW(),
        FIELD_MIN + Math.random() * FIELD_SPAN,
        -7 + Math.random() * 4.5,
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(0.035 + Math.random() * 0.26);
      world.add(mesh);
      bubbles.push({
        mesh,
        material,
        baseScale: mesh.scale.x,
        speed: 0.35 + Math.random() * 0.9,
        driftAmp: 0.15 + Math.random() * 0.35,
        driftFreq: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        spinSpeed: 0.1 + Math.random() * 0.4,
      });
    }

    /* ---------- Setup ---------- */
    buildLabels(isLight());

    const resize = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

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

    const applyTheme = (): void => {
      const light = isLight();
      bubbles.forEach((b, i) => {
        b.material.uniforms['uColor'].value.set(bubblePool[i % bubblePool.length]());
        b.material.uniforms['uOpacity'].value = light ? 0.5 : 0.78;
      });
      buildLabels(light);
    };
    this.themeObserver = new MutationObserver(() => applyTheme());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const wrap = (y: number): number => {
      if (y > FIELD_MAX) return y - FIELD_SPAN;
      if (y < FIELD_MIN) return y + FIELD_SPAN;
      return y;
    };

    let lastTime = 0;
    const render = (time: number): void => {
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
      lastTime = time;
      const t = time * 0.001;

      scrollY += (targetScroll - scrollY) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // While scrolling, the leftover scroll delta surges the field upward so
      // the bubbles rush deep into the page; idle drift is a gentle rise.
      const surge = Math.max(-250, Math.min(250, targetScroll - scrollY)) * 0.18;

      for (const b of bubbles) {
        const y = wrap(b.mesh.position.y + (b.speed + surge) * dt);
        b.mesh.position.y = y;
        b.mesh.position.x += Math.sin(t * b.driftFreq + b.phase) * b.driftAmp * dt;
        b.mesh.rotateOnWorldAxis(b.spinAxis, b.spinSpeed * dt);
        const breathe = 1 + Math.sin(t * b.speed * 0.8 + b.phase) * 0.06;
        b.mesh.scale.setScalar(b.baseScale * breathe);
      }

      for (const s of labels) {
        s.y = wrap(s.y + (s.flow + surge * 0.5) * dt);
        s.sprite.position.y = s.y + Math.sin(t * s.bobSpeed + s.phase) * s.bobAmp;
        // Oscillate around the lane center instead of accumulating, so tags
        // stay inside their lane and never drift into a neighbour.
        s.sprite.position.x = s.laneX + Math.sin(t * s.driftFreq + s.phase) * s.driftAmp;
      }

      // Slow Z-recede with scroll depth keeps the field feeling far away.
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, scrollY / maxScroll);
      world.position.z = -scrollY * 0.0005;
      world.rotation.z = progress * 0.15;
      world.rotation.y += (mouseX * 0.08 - world.rotation.y) * 0.05;
      world.rotation.x += (-mouseY * 0.06 - world.rotation.x) * 0.05;
      camera.position.x = mouseX * 0.35;
      camera.position.y = mouseY * 0.25;

      renderer.render(scene, camera);
    };

    let raf = 0;
    if (reduceMotion) {
      render(0);
    } else {
      const tick = (time: number): void => {
        if (this.destroyed) return;
        render(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', resize);
      bubbleGeometry.dispose();
      for (const b of bubbles) b.material.dispose();
      for (const s of labels) {
        s.texture.dispose();
        (s.sprite.material as ThreeTypes.SpriteMaterial).dispose();
      }
      renderer.dispose();
    };
  }
}
