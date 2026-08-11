import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { HeroComponent } from './hero/hero.component';
import { ProjectsComponent } from './projects/projects.component';
import { PhotoComponent } from './photo/photo.component';
import { SkillsComponent } from './skills/skills.component';
import { CraftComponent } from './craft/craft.component';
import { EducationComponent } from './education/education.component';
import { BlogComponent } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    PhotoComponent,
    SkillsComponent,
    CraftComponent,
    ProjectsComponent,
    EducationComponent,
    BlogComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: 'Soumya Kumar Mallick — Senior Frontend Developer | Angular & React.js',
      description:
        'Senior Frontend Developer with 5+ years building enterprise and government platforms. Angular, React.js, TypeScript, payment gateways, and performance optimization.',
      keywords: [
        'Soumya Kumar Mallick',
        'Angular Developer',
        'React Developer',
        'Frontend Developer',
        'TypeScript',
        'eChallan',
        'Enterprise Web Applications',
      ],
    });
  }
}
