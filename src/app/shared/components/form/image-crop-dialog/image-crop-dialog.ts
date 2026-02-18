import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonComponent } from '../../button/button';

@Component({
  selector: 'lib-image-crop-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ImageCropperComponent, TranslocoPipe, ButtonComponent],
  templateUrl: './image-crop-dialog.html',
  styleUrl: './image-crop-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCropDialog {
  visible = signal<boolean>(false);
  imageChangedEvent = signal<Event | null>(null);
  croppedImage = signal<SafeUrl>('');
  croppedBlob = signal<Blob | null>(null);
  isLoading = signal<boolean>(false);

  onSave = output<Blob>();
  onCancel = output<void>();

  constructor(private sanitizer: DomSanitizer) {}

  open(event: Event) {
    this.imageChangedEvent.set(event);
    this.visible.set(true);
    this.isLoading.set(true);
  }

  close() {
    this.visible.set(false);
    this.imageChangedEvent.set(null);
    this.croppedImage.set('');
    this.croppedBlob.set(null);
    this.onCancel.emit();
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage.set(this.sanitizer.bypassSecurityTrustUrl(event.objectUrl));
    }
    if (event.blob) {
      this.croppedBlob.set(event.blob);
    }
  }

  imageLoaded(image: LoadedImage) {
    this.isLoading.set(false);
  }

  cropperReady() {
    this.isLoading.set(false);
  }

  loadImageFailed() {
    this.isLoading.set(false);
    this.close();
  }

  save() {
    const blob = this.croppedBlob();
    if (blob) {
      this.onSave.emit(blob);
      this.close();
    }
  }
}
