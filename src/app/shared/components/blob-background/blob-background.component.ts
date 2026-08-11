import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Purely decorative 3D morphing gradient blobs + rotating cube & rings behind content. */
@Component({
  selector: 'app-blob-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'blob-background',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './blob-background.component.html',
  styleUrls: ['./blob-background.component.css'],
})
export class BlobBackgroundComponent {
  readonly opacity = input(0.35);
}
