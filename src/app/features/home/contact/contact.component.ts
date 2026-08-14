import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { profile } from '../../../data/resume.data';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { MailLinkDirective } from '../../../shared/directives/mail-link.directive';
import { environment } from '../../../../environments/environment';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

const MAP_LOCATION = 'New Delhi, India';
const MAP_ZOOM = 14;

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective, ReactiveFormsModule, MailLinkDirective],
  host: {
    class: 'section',
    id: 'contact',
  },
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  protected readonly profile = profile;
  protected readonly submitState = signal<SubmitState>('idle');

  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);
  protected readonly mapSrc: SafeResourceUrl = this.buildMapSrc();

  private buildMapSrc(): SafeResourceUrl {
    const url = environment.googleMapsApiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(environment.googleMapsApiKey)}&q=${encodeURIComponent(MAP_LOCATION)}&zoom=${MAP_ZOOM}`
      : `https://www.google.com/maps?q=${encodeURIComponent(MAP_LOCATION)}&z=${MAP_ZOOM}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    subject: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
  });

  protected showError(field: 'name' | 'email' | 'subject' | 'message'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitState.set('sending');
    const { name, email, subject, message } = this.form.getRawValue();

    if (environment.web3formsAccessKey) {
      this.http
        .post(environment.contactEndpoint, {
          access_key: environment.web3formsAccessKey,
          name,
          email,
          subject,
          message,
          _subject: `Portfolio message from ${name}`,
        })
        .subscribe({
          next: (response) =>
            this.submitState.set(response && (response as { success?: boolean }).success ? 'success' : 'error'),
          error: () => this.submitState.set('error'),
        });
      return;
    }

    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    const mailto = `${this.profile.emailHref}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;
    this.submitState.set('success');
  }

  protected resetForm(): void {
    this.form.reset();
    this.submitState.set('idle');
  }
}
