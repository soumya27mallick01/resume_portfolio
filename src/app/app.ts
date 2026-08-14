import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ScrollSpyService } from './core/services/scroll-spy.service';
import { ScrollProgressService } from './core/services/scroll-progress.service';
import { ConnectivityService } from './core/services/connectivity.service';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { BubblesBackgroundComponent } from './shared/components/bubbles-background/bubbles-background.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { FloatingActionsComponent } from './layout/floating-actions/floating-actions.component';
import { CommandPaletteComponent } from './layout/command-palette/command-palette.component';
import { LoadingScreenComponent } from './layout/loading-screen/loading-screen.component';
import { ScrollProgressComponent } from './layout/scroll-progress/scroll-progress.component';
import { CustomCursorComponent } from './shared/components/custom-cursor/custom-cursor.component';

const AS_PATH_KEY = 'as-path';

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
    BubblesBackgroundComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly connectivity = inject(ConnectivityService);

  constructor() {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const scrollSpy = inject(ScrollSpyService);
    const progress = inject(ScrollProgressService);
    const connectivity = inject(ConnectivityService);
    const smoothScroll = inject(SmoothScrollService);

    afterNextRender(() => {
      // 404.html on GitHub Pages stashes the requested deep link in
      // sessionStorage before redirecting to the SPA root. Navigate once the
      // initial route has settled so this can't race the router's first nav.
      if (isPlatformBrowser(platformId)) {
        const asPath = sessionStorage.getItem(AS_PATH_KEY);
        if (asPath) {
          sessionStorage.removeItem(AS_PATH_KEY);
          void router.navigateByUrl(asPath).catch(() => undefined);
        }
      }
      progress.init();
      connectivity.init();
      scrollSpy.init();
      smoothScroll.init();
    });
  }
}
