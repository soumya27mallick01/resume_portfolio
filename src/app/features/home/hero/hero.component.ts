import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { profile, skillGroups, stats } from '../../../data/resume.data';
import { scrollToSection } from '../../../utils/scroll';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TypingTextComponent } from '../../../shared/components/typing-text/typing-text.component';
import { CounterComponent } from '../../../shared/components/counter/counter.component';
import { ParticlesComponent } from '../../../shared/components/particles/particles.component';
import { BlobBackgroundComponent } from '../../../shared/components/blob-background/blob-background.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { MagneticButtonDirective } from '../../../shared/components/magnetic-button/magnetic-button.component';
import { TiltDirective } from '../../../shared/directives/tilt.directive';
import { TerminalComponent } from '../../../shared/components/terminal/terminal.component';
import { MailLinkDirective } from '../../../shared/directives/mail-link.directive';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    TypingTextComponent,
    CounterComponent,
    ParticlesComponent,
    BlobBackgroundComponent,
    RevealDirective,
    MagneticButtonDirective,
    TiltDirective,
    TerminalComponent,
    MailLinkDirective,
  ],
  host: {
    class: 'hero',
    id: 'home',
  },
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  protected readonly profile = profile;
  protected readonly stats = stats;
  protected readonly nameLetters = this.buildNameLetters();
  protected readonly skillChips = this.buildSkillChips();

  private static readonly CHIP_COLORS = [
    'var(--accent)',
    '#818cf8',
    '#c084fc',
    '#34d399',
    '#fbbf24',
  ];

  private buildSkillChips(): { name: string; icon: string; angle: number; color: string }[] {
    const skills = skillGroups.flatMap((group) => group.skills);
    return skills.map((skill, index) => ({
      name: skill.name,
      icon: skill.icon,
      angle: (index / skills.length) * 360,
      color: HeroComponent.CHIP_COLORS[index % HeroComponent.CHIP_COLORS.length],
    }));
  }

  private buildNameLetters(): { char: string; gradient: boolean }[] {
    const lastNameStart = profile.name.length - profile.lastName.length;
    return [...profile.name].map((char, index) => ({
      char: char === ' ' ? '\u00A0' : char,
      gradient: index >= lastNameStart,
    }));
  }

  protected goTo(sectionId: string, event: Event): void {
    event.preventDefault();
    scrollToSection(sectionId);
  }
}
