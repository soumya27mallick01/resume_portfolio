import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { ScrollSpyService } from '../../../core/services/scroll-spy.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink],
  host: {
    class: 'error-page',
  },
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly scrollSpy = inject(ScrollSpyService);

  protected goToContact(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
    this.scrollSpy.scrollToSectionWhenReady('contact');
  }

  constructor() {
    this.seo.update({
      title: 'Page Not Found — Soumya Kumar Mallick',
      description: 'The page you are looking for does not exist.',
    });
  }
}
