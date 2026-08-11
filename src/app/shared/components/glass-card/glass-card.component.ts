import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Frosted-glass card with a soft gradient glow and hover lift. */
@Component({
  selector: 'app-glass-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'glass-card',
    '[class.glass-card--interactive]': 'interactive()',
    '[class.glass-card--hoverable]': 'hoverable()',
  },
  templateUrl: './glass-card.component.html',
})
export class GlassCardComponent {
  readonly interactive = input(false);
  readonly hoverable = input(true);
}
