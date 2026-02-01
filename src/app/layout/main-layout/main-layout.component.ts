import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styles: [],
})
export class MainLayoutComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = signal<{ name: string; username: string } | null>(null);

  ngOnInit() {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.userData.set(response.data);
        }
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
      },
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
