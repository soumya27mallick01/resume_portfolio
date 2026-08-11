import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, signal } from '@angular/core';
import { navLinks } from '../../data/resume.data';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { ScrollProgressService } from '../../core/services/scroll-progress.service';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'navbar',
    '[class.navbar--scrolled]': 'scrolled()',
    '[class.navbar--open]': 'menuOpen()',
  },
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  protected readonly links = computed(() => navLinks);
  protected readonly themeModes: ThemeMode[] = ['dark', 'light', 'system'];

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly indicator = signal({ left: 0, width: 0, opacity: 0 });
  protected readonly active = inject(ScrollSpyService).activeSection;
  protected readonly scrollProgress = inject(ScrollProgressService).progress;

  private readonly themeService = inject(ThemeService);
  private readonly scrollSpy = inject(ScrollSpyService);
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'scroll',
        () => {
          this.scrolled.set(window.scrollY > 24);
        },
        { passive: true },
      );
      window.addEventListener('resize', this.syncIndicator);
      effect(() => {
        this.active();
        queueMicrotask(() => this.syncIndicator());
      });
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.syncIndicator);
    }
  }

  protected readonly themeMode = this.themeService.mode;
  protected readonly themeIcon = computed(() => {
    switch (this.themeService.mode()) {
      case 'dark':
        return 'moon';
      case 'light':
        return 'sun';
      default:
        return 'monitor';
    }
  });

  protected cycleTheme(): void {    this.themeService.toggle();
  }

  protected setTheme(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected openPalette(): void {
    window.dispatchEvent(new CustomEvent('app:open-command-palette'));
  }

  private readonly syncIndicator = (): void => {
    if (typeof window === 'undefined' || window.innerWidth < 1180) {
      this.indicator.set({ left: 0, width: 0, opacity: 0 });
      return;
    }
    const host = this.el.nativeElement;
    const links = Array.from(host.querySelectorAll('.navbar__link')) as HTMLElement[];
    const activeLink = links.find((link) => link.classList.contains('is-active'));
    const nav = host.querySelector('.navbar__links');
    if (!activeLink || !nav) {
      this.indicator.set({ left: 0, width: 0, opacity: 0 });
      return;
    }
    const linkRect = activeLink.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    this.indicator.set({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    });
  };

  protected goTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.scrollSpy.highlightSection(sectionId);
    if (sectionId === 'home') {
      scrollToTop();
      return;
    }
    scrollToSection(sectionId);
  }
}
