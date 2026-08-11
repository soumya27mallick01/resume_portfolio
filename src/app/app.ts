import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollSpyService } from './core/services/scroll-spy.service';
import { ScrollProgressService } from './core/services/scroll-progress.service';
import { ConnectivityService } from './core/services/connectivity.service';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { ThreeSceneComponent } from './shared/components/three-scene/three-scene.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { FloatingActionsComponent } from './layout/floating-actions/floating-actions.component';
import { CommandPaletteComponent } from './layout/command-palette/command-palette.component';
import { LoadingScreenComponent } from './layout/loading-screen/loading-screen.component';
import { ScrollProgressComponent } from './layout/scroll-progress/scroll-progress.component';
import { CustomCursorComponent } from './shared/components/custom-cursor/custom-cursor.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    FloatingActionsComponent,
    CommandPaletteComponent,
    LoadingScreenComponent,
    ScrollProgressComponent,
    CustomCursorComponent,
    ThreeSceneComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly connectivity = inject(ConnectivityService);

  constructor() {
    const scrollSpy = inject(ScrollSpyService);
    const progress = inject(ScrollProgressService);
    const connectivity = inject(ConnectivityService);
    const smoothScroll = inject(SmoothScrollService);

    afterNextRender(() => {
      progress.init();
      connectivity.init();
      scrollSpy.init();
      smoothScroll.init();
    });
  }
}
