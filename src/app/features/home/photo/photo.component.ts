import { ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { profile } from '../../../data/resume.data';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

/**
 * 3D animated photo section. Drop your portrait at `public/assets/photo/profile.jpg`
 * and it renders inside the tilting frame; a styled initials fallback is shown
 * until the file exists.
 */
@Component({
  selector: 'app-photo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective, TiltDirective],
  host: {
    class: 'section',
    id: 'photo',
  },
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css'],
})
export class PhotoComponent {
  protected readonly profile = profile;
  protected readonly photoSrc = 'assets/photo/profile.png';
  protected readonly photoHint = 'assets/photo/profile.png';
  protected readonly photoOk = signal(true);
  protected readonly expanded = signal(false);

  protected readonly initials = profile.firstName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  /** Collapsed summary — cut at a sentence boundary so the ellipsis never lands mid-sentence. */
  protected readonly summaryPreview = ((): string => {
    const sentences = profile.summary.match(/[^.!?]+[.!?]+/g) ?? [profile.summary];
    return sentences.slice(0, 3).join(' ').trim();
  })();

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    afterNextRender(() => {
      if (this.photoOk()) {
        const img = new Image();
        img.onerror = () => this.photoOk.set(false);
        img.src = this.photoSrc;
      }
    });
  }

  protected onPhotoError(): void {
    this.photoOk.set(false);
  }
}
