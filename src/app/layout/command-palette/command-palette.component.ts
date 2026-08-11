import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { navLinks, profile } from '../../data/resume.data';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface PaletteItem {
  type: 'section' | 'action';
  label: string;
  hint: string;
  icon: string;
  sectionId?: string;
  routerLink?: string;
  action?: () => void;
}

/** Command palette (Ctrl/Cmd+K): search and jump to sections or run actions. */
@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'command-palette',
    '[class.command-palette--open]': 'open()',
  },
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.css'],
})
export class CommandPaletteComponent {
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly highlighted = signal(0);
  protected readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly items: PaletteItem[] = [
    ...navLinks.map((link) => ({
      type: 'section' as const,
      label: link.label,
      hint: 'Section',
      icon: link.icon,
      sectionId: link.sectionId,
    })),
    { type: 'action', label: 'Toggle theme', hint: 'Action', icon: 'sun', action: () => this.themeService.toggle() },
    { type: 'action', label: 'Set dark theme', hint: 'Action', icon: 'moon', action: () => this.themeService.setMode('dark') },
    { type: 'action', label: 'Set light theme', hint: 'Action', icon: 'monitor', action: () => this.themeService.setMode('light') },
    { type: 'action', label: 'Download resume', hint: 'Action', icon: 'download', action: () => this.downloadResume() },
    { type: 'action', label: 'Blog', hint: 'Page', icon: 'book', routerLink: '/blog/building-enterprise-angular-applications' },
  ];

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const list = q
      ? this.items.filter(
          (i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q),
        )
      : this.items;
    if (this.highlighted() >= list.length) this.highlighted.set(0);
    return list;
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('app:open-command-palette', () => {
        this.open.set(true);
        this.highlighted.set(0);
        this.query.set('');
      });
      window.addEventListener('keydown', (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          this.open.update((v) => !v);
          this.highlighted.set(0);
          this.query.set('');
        } else if (event.key === 'Escape') {
          this.open.set(false);
        }
      });
    }
  }

  protected move(delta: number, event: Event): void {
    event.preventDefault();
    const list = this.filtered();
    this.highlighted.update((i) => (i + delta + list.length) % list.length);
  }

  protected select(index: number, event?: Event): void {
    event?.preventDefault();
    const item = this.filtered()[index];
    if (!item) return;
    this.close();
    if (item.sectionId) {
      if (item.sectionId === 'home') scrollToTop();
      else scrollToSection(item.sectionId);
    } else if (item.routerLink) {
      this.router.navigateByUrl(item.routerLink);
    } else {
      item.action?.();
    }
  }

  protected close(): void {
    this.open.set(false);
  }

  private downloadResume(): void {
    const a = document.createElement('a');
    a.href = profile.resumeUrl;
    a.download = 'SoumyaKumarMallick_Resume.pdf';
    a.click();
  }
}
