import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ScrollProgressService } from '../../core/services/scroll-progress.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { navLinks } from '../../data/resume.data';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { scrollToSection } from '../../utils/scroll';

/**
 * Floating action button: back-to-top with progress ring, plus a live
 * "current section" chip that pops in with an animation each time the
 * scroll-spy moves to a new section.
 */
@Component({
  selector: 'app-floating-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'floating-actions',
  },
  templateUrl: './floating-actions.component.html',
  styleUrls: ['./floating-actions.component.css'],
})
export class FloatingActionsComponent {
  protected readonly progress = inject(ScrollProgressService);
  protected readonly ringOffset = inject(ScrollProgressService).progress;
  protected readonly activeSection = inject(ScrollSpyService).activeSection;

  protected readonly sectionLink = computed(
    () => navLinks.find((link) => link.sectionId === this.activeSection()) ?? null,
  );
  protected readonly sectionIcon = computed(() => this.sectionLink()?.icon ?? 'home');
  protected readonly sectionLabel = computed(() => {
    const label = this.sectionLink()?.label;
    return label && label !== 'Home' ? label : null;
  });

  protected readonly snap = signal(false);

  constructor() {
    effect(() => {
      this.activeSection();
      if (typeof window === 'undefined') return;
      this.snap.set(true);
      window.setTimeout(() => this.snap.set(false), 450);
    });
  }

  protected scrollToTop(): void {
    scrollToSection('home');
  }
}
