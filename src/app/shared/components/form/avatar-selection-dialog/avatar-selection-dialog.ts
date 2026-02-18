import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../../button/button';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'lib-avatar-selection-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonComponent, TranslocoPipe],
  templateUrl: './avatar-selection-dialog.html',
  styleUrl: './avatar-selection-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarSelectionDialog {
  visible = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  selectedAvatar = signal<string | null>(null);
  onSelect = output<Blob>();

  // Use the generated assets
  avatars = [
    'assets/images/avatars/avatar-1.png',
    'assets/images/avatars/avatar-2.png',
    'assets/images/avatars/avatar-3.png',
    'assets/images/avatars/avatar-4.png',
    'assets/images/avatars/avatar-5.jpg',
    'assets/images/avatars/avatar-6.jpg',
    'assets/images/avatars/avatar-7.jpg',
    'assets/images/avatars/avatar-8.jpg',
  ];

  open() {
    this.visible.set(true);
    this.selectedAvatar.set(null);
  }

  close() {
    this.visible.set(false);
  }

  selectAvatar(avatar: string) {
    this.selectedAvatar.set(avatar);
  }

  async save() {
    const avatar = this.selectedAvatar();
    if (!avatar) return;

    this.isLoading.set(true);
    try {
      const response = await fetch(avatar);
      const blob = await response.blob();
      this.onSelect.emit(blob);
      this.close();
    } catch (error) {
      console.error('Failed to convert avatar to blob', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
