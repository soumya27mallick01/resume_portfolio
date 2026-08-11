import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollProgressService } from '../../core/services/scroll-progress.service';

/** Thin gradient scroll-progress bar fixed to the top of the viewport. */
@Component({
  selector: 'app-scroll-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'scroll-progress',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './scroll-progress.component.html',
  styleUrls: ['./scroll-progress.component.css'],
})
export class ScrollProgressComponent {
  protected readonly progress = inject(ScrollProgressService).progress;
}
