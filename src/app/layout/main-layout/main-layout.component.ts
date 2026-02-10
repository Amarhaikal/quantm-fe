import { Component, OnInit, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from '../components/header/header.component';
import { MenuService } from '../../core/services/menu.service';
import { CodeTypeService } from '../../core/services/code-type.service';
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
  private codeTypeService = inject(CodeTypeService);
  private router = inject(Router);

  userData = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return null;
    return {
      name: user.fullname,
      username: user.username,
      profile_image_url: user.profile_image_url ?? '',
    };
  });

  ngOnInit() {
    // Load code types on initialization
    this.codeTypeService.loadCodeTypes();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
