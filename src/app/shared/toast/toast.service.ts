import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messages = new BehaviorSubject<ToastMessage[]>([]);
  private nextId = 1;

  messages$ = this.messages.asObservable();

  constructor(private ngZone: NgZone) {}

  showSuccess(message: string, duration: number = 5000): void {
    console.log('Showing success toast:', message);
    this.showMessage(message, 'success', duration);
  }

  showError(message: string, duration: number = 7000): void {
    console.log('Showing error toast:', message);
    this.showMessage(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 6000): void {
    console.log('Showing warning toast:', message);
    this.showMessage(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 5000): void {
    console.log('Showing info toast:', message);
    this.showMessage(message, 'info', duration);
  }

  private showMessage(message: string, type: ToastMessage['type'], duration: number): void {
    this.ngZone.run(() => {
      const toastMessage: ToastMessage = {
        id: this.nextId++,
        message,
        type,
        duration
      };

      console.log('Creating toast message:', toastMessage);

      const currentMessages = this.messages.value;
      const newMessages = [...currentMessages, toastMessage];
      
      console.log('Current messages:', currentMessages);
      console.log('New messages array:', newMessages);
      
      this.messages.next(newMessages);

      // Auto-remove after duration
      setTimeout(() => {
        this.ngZone.run(() => {
          console.log('Auto-removing toast message with id:', toastMessage.id);
          this.removeMessage(toastMessage.id);
        });
      }, duration);
    });
  }

  removeMessage(id: number): void {
    this.ngZone.run(() => {
      console.log('Removing message with id:', id);
      const currentMessages = this.messages.value;
      const filteredMessages = currentMessages.filter(msg => msg.id !== id);
      console.log('Messages after removal:', filteredMessages);
      this.messages.next(filteredMessages);
    });
  }

  clearAll(): void {
    this.ngZone.run(() => {
      console.log('Clearing all toast messages');
      this.messages.next([]);
    });
  }
} 