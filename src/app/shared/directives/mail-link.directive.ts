import { Directive, ElementRef, inject, input, OnInit } from '@angular/core';

@Directive({
  selector: '[appMailLink]',
})
export class MailLinkDirective implements OnInit {
  readonly mailHref = input.required<string>();

  private readonly el = inject(ElementRef<HTMLAnchorElement>);

  ngOnInit(): void {
    this.el.nativeElement.href = this.mailHref();
  }
}