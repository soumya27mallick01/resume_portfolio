import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollProgressService } from '../../core/services/scroll-progress.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { scrollToSection } from '../../utils/scroll';

/** Floating action buttons: back-to-top with progress ring. */
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

  protected scrollToTop(): void {
    scrollToSection('home');
  }
}
