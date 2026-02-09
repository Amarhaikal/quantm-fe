import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../components/header/header.component';
import { MenuService } from '../../core/services/menu.service';
import { Sidemenu } from '../components/sidemenu/sidemenu';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, Sidemenu],
  templateUrl: './main-layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  public menuService = inject(MenuService);
  private router = inject(Router);

  userData = signal<{ name: string; username: string; profile_image_url: string } | null>(null);
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
