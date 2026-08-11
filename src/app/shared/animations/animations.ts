import { animate, style, transition, trigger } from '@angular/animations';

const SHARED_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function flyIn(direction: 'up' | 'down' | 'left' | 'right', distance = 40) {
  const offset =
    direction === 'up'
      ? { transform: 'translateY(' + distance + 'px)' }
      : direction === 'down'
        ? { transform: 'translateY(-' + distance + 'px)' }
        : direction === 'left'
          ? { transform: 'translateX(' + distance + 'px)' }
          : { transform: 'translateX(-' + distance + 'px)' };
  return trigger('flyIn', [
    transition(':enter', [style(offset), animate('0.7s ' + SHARED_EASE, style({ transform: 'translate(0, 0)' }))]),
  ]);
}

function scaleIn() {
  return trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.9)' }),
      animate('0.6s ' + SHARED_EASE, style({ opacity: 1, transform: 'scale(1)' })),
    ]),
  ]);
}

function fadeSlide() {
  return trigger('fadeSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(24px)' }),
      animate('0.5s ' + SHARED_EASE, style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('0.3s ease-in', style({ opacity: 0, transform: 'translateY(12px)' })),
    ]),
  ]);
}

export const animations = {
  flyIn,
  scaleIn,
  fadeSlide,
};
