import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shimmering skeleton placeholder used with lazy-loaded sections. */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.css'],
})
export class SkeletonComponent {
  readonly height = input<string | number>('1.5rem');
  readonly width = input<string | number>('100%');
}
