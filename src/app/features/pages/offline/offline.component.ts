import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-offline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink],
  host: {
    class: 'error-page',
  },
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.css'],
})
export class OfflineComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: 'Offline — Soumya Kumar Mallick',
      description: 'You are currently offline. Connect to the internet to continue browsing.',
    });
  }

  protected retry(): void {
    window.location.reload();
  }
}
