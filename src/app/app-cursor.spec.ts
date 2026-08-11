import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { App } from './app';
import { routes } from './app.routes';

describe('App cursor integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations(),
      ],
    }).compileComponents();
  });

  it('activates the custom cursor inside the full app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const cursor = document.querySelector('app-custom-cursor') as HTMLElement;
    expect(cursor).toBeTruthy('cursor host element must exist');
    expect(cursor.style.display).toBe('block');
    expect(document.documentElement.classList.contains('cursor-custom')).toBeTrue();

    const dot = cursor.querySelector('.cursor-dot') as HTMLElement;
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 250, clientY: 150 }));
    expect(dot.style.left).toBe('250px');
    expect(dot.style.top).toBe('150px');
  });
});
