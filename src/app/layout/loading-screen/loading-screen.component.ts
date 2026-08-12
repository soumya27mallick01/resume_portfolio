import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type * as ThreeTypes from 'three';

interface CurtainPanel {
  side: 1 | -1;
  positionX: number;
  width: number;
  posAttr: ThreeTypes.BufferAttribute;
  colorAttr: ThreeTypes.BufferAttribute;
}

/**
 * Full-screen loading overlay built around a Three.js theatre curtain: two
 * solid fabric panels (pleated folds, gradient sheen, soft lighting) veil the
 * page while the SM brand loads. When ready the curtains part from the
 * centre — the seam edges curl back first and the panels cascade outward in
 * a staggered sweep, then the overlay fades out. Renders a static frame
 * under reduced motion and falls back to a plain overlay when WebGL is
 * unavailable.
 */
@Component({
  selector: 'app-loading-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  host: {
    class: 'loading-screen',
    '[class.loading-screen--webgl]': 'webgl()',
    '[class.loading-screen--revealing]': 'revealing()',
    '[class.loading-screen--revealed]': 'revealed()',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css'],
})
export class LoadingScreenComponent implements OnDestroy {
  protected readonly pct = signal(0);
  protected readonly webgl = signal(false);
  protected readonly revealing = signal(false);
  protected readonly revealed = signal(false);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private disposed = false;
  private cleanup: (() => void) | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      this.runCounter();

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        window.setTimeout(() => this.finish(true), 700);
        return;
      }

      const canvas = this.el.nativeElement.querySelector(
        '.loading-screen__canvas',
      ) as HTMLCanvasElement | null;
      if (!canvas || typeof WebGLRenderingContext === 'undefined') {
        window.setTimeout(() => this.finish(true), 700);
        return;
      }

      this.cleanup = this.initCurtain(canvas);
      window.setTimeout(() => this.reveal(), 2000);
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  private runCounter(): void {
    const start = performance.now();
    const step = (now: number): void => {
      const p = Math.min((now - start) / 900, 1);
      this.pct.set(Math.round(p * 100));
      if (p < 1 && !this.disposed) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private reveal(): void {
    if (this.disposed || this.revealing() || this.revealed()) return;
    this.revealing.set(true);
    window.setTimeout(() => this.finish(false), 800);
  }

  private finish(immediate: boolean): void {
    if (this.disposed) return;
    this.revealing.set(true);
    window.setTimeout(() => {
      this.revealed.set(true);
      window.setTimeout(() => this.cleanup?.(), 800);
    }, immediate ? 150 : 0);
  }

  /**
   * Theatre curtain built from two solid, finely-tessellated fabric panels.
   * Each vertex is displaced every frame: slow vertical pleat folds across
   * the whole panel, a flowing wave along the centre seam edge, and during
   * the reveal a cascading outward slide (seam columns leave first) plus a
   * backward curl on the opening edge. A canvas texture provides the fabric
   * gradient and faint vertical weave, lights give the folds depth, and a
   * layer of accent sparkle dust drifts in front and is carried away with
   * the curtains.
   */
  private initCurtain(canvas: HTMLCanvasElement): () => void {
    if (typeof WebGLRenderingContext === 'undefined') return () => undefined;

    let raf = 0;
    let renderer: {
      setClearColor(color: number, alpha: number): void;
      setSize(width: number, height: number, updateStyle: boolean): void;
      render(scene: unknown, camera: unknown): void;
      dispose(): void;
    } | null = null;
    const disposers: (() => void)[] = [];
    let removeResize: (() => void) | null = null;

    void (async () => {
      const THREE = await import('three');
      if (this.disposed || !canvas.isConnected) return;

      const cssVar = (name: string, fallback: string): string =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      const accent = cssVar('--accent', '#22d3ee');
      const accentBright = cssVar('--accent-bright', '#67e8f9');
      const purple = cssVar('--accent-purple', '#06b6d4');
      const s2 = cssVar('--surface-2', '#0b1128');
      const s3 = cssVar('--surface-3', '#16224f');

      const hexToRgb01 = (hex: string): [number, number, number] => {
        const n = Number.parseInt(hex.replace('#', ''), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      };
      const baseTop = hexToRgb01(s3);
      const baseBottom = hexToRgb01(s2);
      const sparkColors = [hexToRgb01(accent), hexToRgb01(accentBright), hexToRgb01(purple)];

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
      camera.position.z = 1;

      const renderer3 = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer3.setClearColor(0x000000, 0);
      renderer = renderer3;

      const fabricTexture = (): ThreeTypes.CanvasTexture => {
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 128;
        texCanvas.height = 512;
        const ctx = texCanvas.getContext('2d')!;
        const toCss = (value: string, fallback: string): string => {
          if (!value) return fallback;
          if (/^(#|rgb|hsl|oklch|color\()/i.test(value)) return value;
          return fallback;
        };
        const top = toCss(s3, 'rgb(22, 34, 79)');
        const bottom = toCss(s2, 'rgb(11, 17, 40)');
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, top);
        grad.addColorStop(0.55, bottom);
        grad.addColorStop(1, bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 512);
        for (let x = 0; x < 128; x += 16) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(x, 0, 2, 512);
        }
        for (let y = 0; y < 512; y += 40) {
          ctx.fillStyle = 'rgba(120,170,255,0.06)';
          ctx.fillRect(0, y, 128, 14);
        }
        const tex = new THREE.CanvasTexture(texCanvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
      };
      const fabric = fabricTexture();
      disposers.push(() => fabric.dispose());

      let panels: CurtainPanel[] = [];
      let panelSprites: ThreeTypes.Mesh[] = [];
      let sparkPosAttr: ThreeTypes.BufferAttribute | null = null;
      let sparkOffsets: Float32Array | null = null;
      let sparkMap: number[] = [];
      let nx = 0;
      let ny = 0;
      let cellW = 0;
      let cellH = 0;
      let panelH = 0;
      let wPx = 0;
      let hPx = 0;
      let revealStart = 0;

      const build = (): void => {
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        wPx = w * dpr;
        hPx = h * dpr;
        canvas.width = wPx;
        canvas.height = hPx;
        renderer3.setSize(wPx, hPx, false);
        camera.left = -wPx / 2;
        camera.right = wPx / 2;
        camera.top = hPx / 2;
        camera.bottom = -hPx / 2;
        camera.updateProjectionMatrix();

        for (const m of panelSprites) {
          scene.remove(m);
          (m.geometry as ThreeTypes.BufferGeometry).dispose();
        }
        panelSprites = [];

        nx = 44;
        ny = 56;
        const margin = wPx * 0.06 + 20;
        const halfW = wPx / 2;
        const panelW = halfW + margin * 2;
        panelH = hPx;

        for (let p = 0; p < 2; p++) {
          const side: 1 | -1 = p === 0 ? -1 : 1;
          const positionX = (side * -wPx) / 4;

          const colors = new Float32Array((nx + 1) * (ny + 1) * 3);
          for (let gy = 0; gy <= ny; gy++) {
            const v = gy / ny;
            const jitter = Math.random() * 0.05 - 0.025;
            const r = baseTop[0] + (baseBottom[0] - baseTop[0]) * v + jitter;
            const g = baseTop[1] + (baseBottom[1] - baseTop[1]) * v + jitter;
            const b = baseTop[2] + (baseBottom[2] - baseTop[2]) * v + jitter;
            for (let gx = 0; gx <= nx; gx++) {
              const i = (gy * (nx + 1) + gx) * 3;
              colors[i] = r;
              colors[i + 1] = g;
              colors[i + 2] = b;
            }
          }

          const geo = new THREE.PlaneGeometry(panelW, panelH, nx, ny);
          geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          const mat = new THREE.MeshPhongMaterial({
            map: fabric,
            vertexColors: true,
            transparent: true,
            opacity: 0.97,
            depthWrite: false,
            side: THREE.DoubleSide,
            shininess: 40,
            specular: new THREE.Color(0x223344),
            emissive: new THREE.Color(0x070b18),
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(positionX, 0, 0);
          scene.add(mesh);
          panelSprites.push(mesh);
          disposers.push(() => {
            geo.dispose();
            mat.dispose();
          });

          panels.push({
            side,
            positionX,
            width: panelW,
            posAttr: geo.attributes['position'] as ThreeTypes.BufferAttribute,
            colorAttr: geo.attributes['color'] as ThreeTypes.BufferAttribute,
          });
        }

        cellW = panelW / nx;
        cellH = panelH / ny;

        const sparkCount = 170;
        const sparkPositions = new Float32Array(sparkCount * 3);
        const sparkColorsArr = new Float32Array(sparkCount * 3);
        const offsets = new Float32Array(sparkCount * 2);
        const map: number[] = [];
        for (let k = 0; k < sparkCount; k++) {
          offsets[k * 2] = Math.random() * wPx - wPx / 2;
          offsets[k * 2 + 1] = Math.random() * hPx - hPx / 2;
          map.push(k);
          const s = sparkColors[Math.floor(Math.random() * sparkColors.length)];
          sparkColorsArr[k * 3] = s[0];
          sparkColorsArr[k * 3 + 1] = s[1];
          sparkColorsArr[k * 3 + 2] = s[2];
        }
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
        sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColorsArr, 3));
        const sparkPoints = new THREE.Points(
          sparkGeo,
          new THREE.PointsMaterial({
            size: 3.2 * dpr,
            vertexColors: true,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: false,
          }),
        );
        scene.add(sparkPoints);
        panelSprites.push(sparkPoints as unknown as ThreeTypes.Mesh);
        disposers.push(() => {
          sparkGeo.dispose();
          (sparkPoints.material as ThreeTypes.Material).dispose();
        });
        sparkPosAttr = sparkGeo.attributes['position'] as ThreeTypes.BufferAttribute;
        sparkOffsets = offsets;
        sparkMap = map;
      };

      build();

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      key.position.set(wPx * 0.25, hPx * 0.6, 400);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x88aaff, 0.55);
      fill.position.set(-wPx * 0.3, -hPx * 0.2, 300);
      scene.add(fill);
      const rim = new THREE.PointLight(0x67e8f9, 3000, wPx * 0.6, 2);
      rim.position.set(0, hPx * 0.25, 260);
      scene.add(rim);
      disposers.push(() => {
        ambient.dispose();
        key.dispose();
        fill.dispose();
        rim.dispose();
      });

      const onResize = (): void => {
        if (this.revealing()) return;
        panels = [];
build();

        renderer3.render(scene, camera);
        this.webgl.set(true);
        window.setTimeout(() => this.reveal(), 650);
      };
      window.addEventListener('resize', onResize);
      removeResize = () => window.removeEventListener('resize', onResize);

      const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);

      const render = (time: number): void => {
        const t = time * 0.001;
        const now = performance.now();
        const revealing = this.revealing();
        if (revealing && !revealStart) revealStart = now;

        for (const panel of panels) {
          const pos = panel.posAttr.array as Float32Array;
          for (let gy = 0; gy <= ny; gy++) {
            const yLocal = -panelH / 2 + gy * cellH;
            const v = gy / ny;
            const pleat = Math.sin(yLocal * 0.0045 + t * 0.9) * 6;
            for (let gx = 0; gx <= nx; gx++) {
              const gxRatio = gx / nx;
              const edgeMask = Math.min(1, Math.max(0, (gxRatio - 0.82) / 0.18));
              const xLocal = -panel.width / 2 + gx * cellW;
              const worldX = panel.positionX + xLocal;

              let x = xLocal + pleat;
              let z = 0;

              if (revealing) {
                const delay = (Math.abs(worldX) / Math.max(wPx / 2, 1)) * 280;
                const prog = Math.min(Math.max((now - revealStart - delay) / 620, 0), 1);
                const ease = easeOutCubic(prog);
                const travel = wPx / 2 + panel.width / 2 + 60;
                x += panel.side * travel * ease;
                x += Math.sin(yLocal * 0.012 + t * 2.4) * 26 * edgeMask * ease;
                z = -ease * 24 * edgeMask + Math.sin(yLocal * 0.012 + t * 1.6) * 10 * edgeMask * (0.35 + 0.65 * ease);
                x += Math.sin(yLocal * 0.0045 + t * 2.2) * 8 * ease * edgeMask;
              } else {
                z = Math.sin(yLocal * 0.012 + t * 1.6) * 8 * edgeMask;
                x += Math.sin(yLocal * 0.012 + t * 1.9) * 4 * edgeMask;
              }

              const i = (gy * (nx + 1) + gx) * 3;
              pos[i] = x;
              pos[i + 1] = yLocal;
              pos[i + 2] = z;
            }
          }
          panel.posAttr.needsUpdate = true;
        }
        fabric.offset.y = -t * 0.012;

        const sparkArr = sparkPosAttr!.array as Float32Array;
        for (let k = 0; k < sparkMap.length; k++) {
          let sx = sparkOffsets![k * 2];
          let sy = sparkOffsets![k * 2 + 1];
          sy += 0.35 * dpr;
          if (sy > hPx / 2) sy -= hPx;
          if (revealing) {
            const delay = (Math.abs(sx) / Math.max(wPx / 2, 1)) * 280;
            const prog = Math.min(Math.max((now - revealStart - delay) / 620, 0), 1);
            const ease = easeOutCubic(prog);
            sx += Math.sign(sx || 1) * (wPx / 2 + 80) * ease;
          }
          sparkArr[k * 3] = sx;
          sparkArr[k * 3 + 1] = sy;
          sparkArr[k * 3 + 2] = 0;
          sparkOffsets![k * 2] = sx;
          sparkOffsets![k * 2 + 1] = sy;
        }
        sparkPosAttr!.needsUpdate = true;

        renderer3.render(scene, camera);
      };

      const tick = (time: number): void => {
        if (this.disposed) return;
        render(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelAnimationFrame(raf);
      removeResize?.();
      for (const dispose of disposers) dispose();
      renderer?.dispose();
    };
  }
}