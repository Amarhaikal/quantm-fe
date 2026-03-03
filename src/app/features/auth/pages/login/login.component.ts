import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { TranslocoPipe } from '@ngneat/transloco';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Password,
    Button,
    FloatLabel,
    NgOptimizedImage,
    TranslocoPipe,
  ],
  providers: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private msalService = inject(MsalService);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  slides = [
    {
      image: '/assets/images/login-slide-1.png',
      title: 'login.slides.slide1.title',
      description: 'login.slides.slide1.description',
    },
    {
      image: '/assets/images/login-slide-2.png',
      title: 'login.slides.slide2.title',
      description: 'login.slides.slide2.description',
    },
    {
      image: '/assets/images/login-slide-3.png',
      title: 'login.slides.slide3.title',
      description: 'login.slides.slide3.description',
    },
    {
      image: '/assets/images/login-slide-4.png',
      title: 'login.slides.slide4.title',
      description: 'login.slides.slide4.description',
    },
  ];

  currentSlideIndex = signal(0);
  currentSlide = computed(() => this.slides[this.currentSlideIndex()]);

  private intervalId: any;

  ngOnInit() {
    console.log('deployed 12:59 pm');

    if (isPlatformBrowser(this.platformId)) {
      this.startSlider();

      // If we're returning from a Microsoft redirect, show loading immediately
      // before MSAL even gets a chance to process the token, because that
      // process plus the backend API call can take 1-2 seconds combined.
      if (window.location.hash && window.location.hash.includes('code=')) {
        this.loading.set(true);
      }

      // Listen for returning redirect from Microsoft Login
      this.msalService.handleRedirectObservable().subscribe({
        next: (result) => {
          if (result && result.idToken && !this.authService.msalRedirectProcessed) {
            this.authService.msalRedirectProcessed = true;
            this.loading.set(true);
            this.authService.loginWithMicrosoft(result.idToken).subscribe({
              next: () => {
                this.loading.set(false);
                this.router.navigate(['/']);
              },
              error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(
                  err.error?.message || 'Microsoft login failed at backend. Please try again.',
                );
              },
            });
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set('Microsoft login was cancelled or failed.');
          console.error('MSAL Redirect Error:', error);
        },
      });

      // Force clear any stuck interaction-in-progress state from previous failed logins
      // Only do this if we are not currently processing a redirect (hash is empty)
      if (!window.location.hash || !window.location.hash.includes('code=')) {
        try {
          // Different versions of MSAL store this differently, try both main methods
          const msalInstance = this.msalService.instance as any;
          if (msalInstance.browserStorage) {
            msalInstance.browserStorage.setInteractionInProgress(false);
          } else if (msalInstance.browserCacheManager) {
            msalInstance.browserCacheManager.setInteractionInProgress(false);
          } else {
            // Fallback: manually clear the local storage keys if internal API isn't accessible
            Object.keys(localStorage).forEach((key) => {
              if (key.includes('interaction_status')) {
                localStorage.removeItem(key);
              }
            });
          }
        } catch (e) {
          console.warn('Could not clear MSAL interaction status on init', e);
        }
      }
    }
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  startSlider() {
    this.intervalId = setInterval(() => {
      this.currentSlideIndex.update((index) => (index + 1) % this.slides.length);
    }, 4000);
  }

  stopSlider() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      const { username, password } = this.loginForm.value;

      this.authService.login({ username, password }).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Invalid credentials. Please try again.');
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  loginWithMicrosoft() {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Using loginRedirect instead of loginPopup to avoid cross-origin popup blockers
    // and browser url hash stripping conflicts!
    this.msalService
      .loginRedirect({
        scopes: ['user.read'],
        prompt: 'select_account',
      })
      .subscribe({
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set('Failed to initialize Microsoft login redirect.');
          console.error(error);
        },
      });
  }
}
