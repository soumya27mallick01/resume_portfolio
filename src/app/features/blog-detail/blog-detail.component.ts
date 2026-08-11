import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { blogPosts } from '../../data/resume.data';
import { SeoService } from '../../core/services/seo.service';
import { ScrollSpyService } from '../../core/services/scroll-spy.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-blog-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RevealDirective],
  host: {
    class: 'blog-detail section',
  },
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
})
export class BlogDetailComponent {
  protected readonly post = signal<typeof blogPosts[number] | undefined>(undefined);
  protected readonly date = signal('');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly scrollSpy = inject(ScrollSpyService);

  protected backToBlog(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/']);
    this.scrollSpy.scrollToSectionWhenReady('blog');
  }

  constructor() {
    this.scrollSpy.setActive('blog');
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const found = blogPosts.find((p) => p.slug === slug);
    this.post.set(found);
    if (found) {
      this.date.set(
        new Date(found.date + 'T00:00:00').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      );
      this.seo.update({
        title: `${found.title} — Soumya Kumar Mallick`,
        description: found.excerpt,
        keywords: found.tags,
      });
    }
  }
}
