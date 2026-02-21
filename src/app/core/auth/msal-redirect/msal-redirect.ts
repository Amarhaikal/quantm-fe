import { Component, OnInit, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-msal-redirect',
  imports: [],
  template: `<div
    style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;"
  >
    Completing login...
  </div>`,
  styles: ``,
})
export class MsalRedirectComponent implements OnInit {
  private msalService = inject(MsalService);

  ngOnInit() {
    this.msalService.handleRedirectObservable().subscribe({
      next: () => {
        // MSAL automatically processes the redirect hash from the URL
        // When using loginPopup, the parent window listens for this token
      },
      error: (err) => {
        console.error('Error during MSAL redirect processing:', err);
      },
    });
  }
}
