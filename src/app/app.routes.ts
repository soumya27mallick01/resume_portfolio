import { Routes, withInMemoryScrolling, withViewTransitions } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Soumya Kumar Mallick — Senior Frontend Developer | Angular & React.js',
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent),
  },
  {
    path: 'offline',
    loadComponent: () =>
      import('./features/pages/offline/offline.component').then((m) => m.OfflineComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

export const routerFeatures = [
  withViewTransitions(),
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  }),
];
