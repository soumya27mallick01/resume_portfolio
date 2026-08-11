import { Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';

@Directive({
  selector: '[appMailLink]',
})
export class MailLinkDirective implements OnInit {
  readonly mailHref = input.required<string>();

  private readonly el = inject(ElementRef<HTMLAnchorElement>);
  private mailto = '';

  ngOnInit(): void {
    this.el.nativeElement.href = this.mailHref().replace(/^mailto:/i, '');
    this.mailto = this.mailHref();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    window.location.href = this.mailto;
  }
}