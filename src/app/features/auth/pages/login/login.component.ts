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
    if (isPlatformBrowser(this.platformId)) {
      this.startSlider();
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
}
