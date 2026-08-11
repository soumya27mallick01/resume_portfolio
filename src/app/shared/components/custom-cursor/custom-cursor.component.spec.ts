import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomCursorComponent } from './custom-cursor.component';

describe('CustomCursorComponent', () => {
  let fixture: ComponentFixture<CustomCursorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCursorComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(CustomCursorComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.classList.remove('cursor-custom');
  });

  it('activates the custom cursor (html class + host visible)', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(document.documentElement.classList.contains('cursor-custom')).toBeTrue();
    expect(host.style.display).toBe('block');
  });

  it('moves the dot and ring to the pointer position', () => {
    const dot = fixture.nativeElement.querySelector('.cursor-dot') as HTMLElement;
    expect(dot).toBeTruthy();
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 400, clientY: 300 }));
    expect(dot.style.left).toBe('400px');
    expect(dot.style.top).toBe('300px');
  });

  it('expands the dot when hovering interactive elements', () => {
    const host = fixture.nativeElement as HTMLElement;
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, relatedTarget: btn }));
    expect(host.classList.contains('cursor-hovering')).toBeTrue();
    btn.remove();
  });
});
