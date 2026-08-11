import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface IconDef {
  /** Path `d` attributes for stroke-style (lucide) icons. */
  paths?: string[];
  /** Fills for simple geometry icons. */
  fills?: string[];
  /** Whether the icon is a brand sprite symbol (fill-based). */
  brand?: boolean;
}

const BRAND_SPRITE = 'assets/icons/brands-sprite.svg';

const ICONS: Record<string, IconDef> = {
  home: { paths: ['M3 9.5 12 3l9 6.5', 'M5 10v10h5v-6h4v6h5V10'] },
  user: { paths: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8'] },
  zap: { paths: ['M13 2 3 14h8l-1 8 10-12h-8l1-8z'] },
  briefcase: { paths: ['M4 7h16v13H4z', 'M9 7V4h6v3', 'M4 12h16'] },
  folder: { paths: ['M3 7a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'] },
  trophy: { paths: ['M8 21h8', 'M12 17v4', 'M7 4h10v6a5 5 0 0 1-10 0z', 'M7 6H4a0 0 0 0 0 0 0v2a3 3 0 0 0 3 3', 'M17 6h3v2a3 3 0 0 1-3 3'] },
  sparkles: { paths: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z', 'M5 2l.7 1.6L7.3 4.3 5.7 5 5 6.6 4.3 5 2.7 4.3 4.3 3.6z'] },
  'file-text': { paths: ['M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z', 'M14 3v6h6', 'M9 13h6', 'M9 17h6'] },
  'graduation-cap': { paths: ['M2 9l10-5 10 5-10 5z', 'M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5', 'M22 9v5'] },
  quote: { paths: ['M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 3-2 4-4 5', 'M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6c0 3-2 4-4 5'] },
  book: { paths: ['M4 4a2 2 0 0 1 2-2h14v20H6a2 2 0 0 1-2-2z', 'M20 18H6a2 2 0 0 0-2 2', 'M8 7h8'] },
  mail: { paths: ['M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'm3 7 9 6 9-6'] },
  menu: { paths: ['M4 7h16', 'M4 12h16', 'M4 17h16'] },
  close: { paths: ['M6 6l12 12', 'M18 6 6 18'] },
  sun: { paths: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'] },
  moon: { paths: ['M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z'] },
  monitor: { paths: ['M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M8 20h8', 'M12 16v4'] },
  download: { paths: ['M12 3v12', 'm6 11 6 6 6-6', 'M4 21h16'] },
  'arrow-up': { paths: ['M12 19V5', 'm5 12 7-7 7 7'] },
  'arrow-right': { paths: ['M5 12h14', 'm13 6 6 6-6 6'] },
  'arrow-left': { paths: ['M19 12H5', 'm11 18-6-6 6-6'] },
  'chevron-down': { paths: ['m6 9 6 6 6-6'] },
  'chevron-right': { paths: ['m9 6 6 6-6 6'] },
  'external-link': { paths: ['M14 4h6v6', 'M20 4 11 13', 'M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6'] },
  github: { brand: true },
  linkedin: { brand: true },
  phone: { paths: ['M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'] },
  'map-pin': { paths: ['M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z', 'M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'] },
  angular: { brand: true },
  react: { brand: true },
  typescript: { brand: true },
  javascript: { brand: true },
  html5: { brand: true },
  css3: { brand: true },
  sass: { brand: true },
  tailwind: { brand: true },
  bootstrap: { brand: true },
  redux: { brand: true },
  docker: { brand: true },
  git: { brand: true },
  gitlab: { brand: true },
  postman: { brand: true },
  check: { paths: ['m4 12 5 5L20 6'] },
  copy: { paths: ['M9 9h11v11H9z', 'M5 15H4V4h11v1'] },
  search: { paths: ['m21 21-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'] },
  command: { paths: ['M9 6a3 3 0 1 1-3 3', 'M15 6a3 3 0 1 1 3 3', 'M9 18a3 3 0 1 1-3-3', 'M15 18a3 3 0 1 1 3-3', 'M12 6v12'] },
  code: { paths: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4', 'm14 4-4 16'] },
  shield: { paths: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'm9 12 2 2 4-4'] },
  database: { paths: ['M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z', 'M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6'] },
  layout: { paths: ['M4 4h16v16H4z', 'M4 9h16', 'M9 9v11'] },
  palette: { paths: ['M12 3a9 9 0 1 0 0 18c1.5 0 2.5-1.2 2-2.5-.4-1.2.5-2.5 2-2.5h1.5A3.5 3.5 0 0 0 21 12.5c0-5.2-4-9.5-9-9.5z', 'M7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M11 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M15 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'] },
  rocket: { paths: ['M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2', 'M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 8-6 10a22 22 0 0 1-4 3z', 'M9 12H4s.5-3 3-4', 'M12 15v5s3-.5 4-3'] },
  users: { paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'] },
  layers: { paths: ['m12 2 10 5-10 5L2 7z', 'm2 12 10 5 10-5', 'm2 17 10 5 10-5'] },
  activity: { paths: ['M22 12h-4l-3 8-6-16-3 8H2'] },
  clipboard: { paths: ['M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z', 'M8 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', 'M9 12h6', 'M9 16h4'] },
  flask: { paths: ['M10 2v6L4 18a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 18L14 8V2', 'M8.5 2h7', 'M7 14h10'] },
  chart: { paths: ['M4 20V10', 'M10 20V4', 'M16 20v-8', 'M22 20H2'] },
  smartphone: { paths: ['M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M11 18h2'] },
  'git-branch': { paths: ['M6 3v12', 'M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M6 21V15a9 9 0 0 1 9-9h3'] },
  anchor: { paths: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 2v20', 'M8 8l4-2 4 2', 'M6 16c2.5 1 5.5 1 8 0', 'M6 12h.01', 'M18 12h.01'] },
  send: { paths: ['m22 2-7 20-4-9-9-4z', 'M22 2 11 13'] },
  star: { paths: ['m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'] },
  calendar: { paths: ['M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z', 'M8 3v4', 'M16 3v4', 'M3 10h18'] },
  clock: { paths: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 7v5l3 2'] },
  eye: { paths: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'] },
  lock: { paths: ['M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z', 'M8 11V7a4 4 0 0 1 8 0v4'] },
  refresh: { paths: ['M21 12a9 9 0 1 1-2.6-6.4', 'M21 3v6h-6'] },
  alert: { paths: ['M12 3 2 21h20z', 'M12 10v5', 'M12 18h.01'] },
  wrench: { paths: ['M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z'] },
  terminal: { paths: ['m5 7 5 5-5 5', 'M12 17h7'] },
  cpu: { paths: ['M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z', 'M9 2v3', 'M15 2v3', 'M9 19v3', 'M15 19v3', 'M2 9h3', 'M2 15h3', 'M19 9h3', 'M19 15h3'] },
  globe: { paths: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M2 12h20', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'] },
  heart: { paths: ['M12 20s-7-4.6-9.5-8.5C.8 8.8 2.6 5 6 5c2 0 3.4 1.2 4.5 2.7L12 9l1.5-1.3C14.6 6.2 16 5 18 5c3.4 0 5.2 3.8 3.5 6.5C19 15.4 12 20 12 20z'] },
  'badge-check': { paths: ['M12 2l2.4 2.4 3.4-.5.5 3.4L21 9.7 19.7 12 21 14.3l-2.7 2.4-.5 3.4-3.4-.5L12 22l-2.4-2.4-3.4.5-.5-3.4L3 14.3 4.3 12 3 9.7l2.7-2.4.5-3.4 3.4.5z', 'm9 12 2 2 4-4'] },
  'trending-up': { paths: ['m3 17 6-6 4 4 8-8', 'M14 7h7v7'] },
  award: { paths: ['m12 15 3.5 2-1-4 3-2.5-4-.5-1.5-3.8L10.5 10l-4 .5 3 2.5-1 4z', 'M12 3a7 7 0 0 0-4 12.7V22l1.5-1 2.5 1 2.5-1 1.5 1v-6.3A7 7 0 0 0 12 3z'] },
  target: { paths: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'] },
  'pen-tool': { paths: ['M12 19l7-7-3.5-3.5a2.1 2.1 0 0 0-3 0L5 15v4z', 'm5 19 4.5-4.5', 'M15 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0z'] },
  'message-circle': { paths: ['M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.3A8.5 8.5 0 1 1 21 11.5z'] },
  'user-check': { paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'm16 11 2 2 4-4'] },
  lock2: { paths: ['M5 11h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z', 'M8 11V7a4 4 0 0 1 8 0v4'] },
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.brand]': 'isBrand',
    '[attr.role]': '"img"',
    '[attr.aria-hidden]': '"true"',
  },
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css'],
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<number | string>(20);

  protected readonly isBrand = computed(() => ICONS[this.name()]?.brand === true);

  protected readonly paths = computed(() => ICONS[this.name()]?.paths ?? []);

  protected readonly brandHref = computed(() => `${BRAND_SPRITE}#${this.name()}`);

  protected readonly isUnknown = computed(() => !ICONS[this.name()]);
}
