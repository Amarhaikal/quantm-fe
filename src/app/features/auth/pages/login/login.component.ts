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
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Password,
    Button,
    FloatLabel,
    ToastModule,
    NgOptimizedImage,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = signal(false);

  slides = [
    {
      image: '/assets/images/login-slide-1.png',
      title: 'Empowering Your Financial Growth',
      description: 'Manage your loans with ease and precision using our advanced digital platform.',
    },
    {
      image: '/assets/images/login-slide-2.png',
      title: 'Secure & Reliable',
      description: 'Your financial data is protected with industry-leading security standards.',
    },
    {
      image: '/assets/images/login-slide-3.png',
      title: 'Smart Analytics',
      description: 'Gain insights into your portfolio with our powerful reporting tools.',
    },
    {
      image: '/assets/images/login-slide-4.png',
      title: 'Fast & Efficient',
      description: 'Streamline your workflow with our automated loan processing system.',
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
      const { username, password } = this.loginForm.value;

      this.authService.login({ username, password }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: err.error?.message || 'Invalid credentials',
          });
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
