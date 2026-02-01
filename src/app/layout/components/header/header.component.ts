import { Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent {
  userData = input<{ name: string; username: string } | null>(null);
  logout = output<void>();

  onLogout() {
    this.logout.emit();
  }
}
