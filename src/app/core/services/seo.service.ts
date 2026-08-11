import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface SeoOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: string;
  url?: string;
}

/** Central place for per-route SEO: title, meta description, Open Graph and Twitter cards. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(options: SeoOptions): void {
    const fullTitle = options.title;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: options.description });

    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:type', content: options.type ?? 'website' });
    if (options.image) this.meta.updateTag({ property: 'og:image', content: options.image });
    if (options.url) this.meta.updateTag({ property: 'og:url', content: options.url });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({ name: 'twitter:description', content: options.description });
    if (options.image) this.meta.updateTag({ name: 'twitter:image', content: options.image });

    if (options.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: options.keywords.join(', ') });
    }
  }
}
