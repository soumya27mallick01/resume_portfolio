/**
 * WebGL helpers for the decorative Three.js scenes.
 *
 * Some environments expose `WebGLRenderingContext` but still fail to create a
 * usable context (headless captures, VMs, remote desktops, GPU blocklists).
 * When that happens, THREE.WebGLRenderer logs a "Error creating WebGL context"
 * console error for every attempt, which floods DevTools on load.
 */

/** Returns true when a plain WebGL context can be created in this browser. */
export function webglAvailable(): boolean {
  if (typeof document === 'undefined' || typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

/**
 * Creates a THREE.WebGLRenderer without letting THREE spam the console when
 * context creation fails (high-performance contexts can be denied even when a
 * plain probe succeeds). Returns the renderer, or null when WebGL is unusable.
 */
export function createWebGLRenderer<T>(factory: () => T): T | null {
  const originalError = console.error;
  try {
    console.error = () => undefined;
    const renderer = factory();
    return renderer;
  } catch {
    return null;
  } finally {
    console.error = originalError;
  }
}
